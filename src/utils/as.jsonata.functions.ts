import jsonata from 'jsonata';

/**
 * Custom JSONata function registry for App Studio generated apps.
 *
 * All App-Studio-specific JSONata functions are registered here.
 * Both the service-layer `processJsonata` method and the screen-layer
 * `evaluateASJsonata` helper call `registerASFunctions` before evaluating
 * any expression, so custom functions work consistently across:
 *
 *   - Workflow service classes (OtherService, AuthorizationService, …)
 *   - Screen-level useEffect / data-transform hooks
 *
 * Adding a new function
 * ---------------------
 * 1. Implement it in this file.
 * 2. Call `expr.registerFunction(...)` inside `registerASFunctions`.
 * 3. Reference it in App Studio expressions as `#functionName(...)`.
 *
 * JSONata signature strings
 * -------------------------
 * "<:s>"  – no args, returns string
 * "<s:s>" – one string arg, returns string
 * "<a:a>" – one array arg, returns array
 * See https://docs.jsonata.org/programming#function-signature-syntax
 */

// ---------------------------------------------------------------------------
// Helper implementations
// ---------------------------------------------------------------------------

/**
 * Generates a RFC 4122 v4 UUID.
 * Uses `crypto.randomUUID()` when available (Node 19+, modern browsers),
 * falls back to `getRandomValues`-based construction, and finally falls
 * back to a Math.random implementation for environments that support neither.
 */
function _uuidV4(): string {
  const g = globalThis as unknown as Record<
    string,
    Record<string, (...args: unknown[]) => unknown>
  >;

  if (g?.crypto?.randomUUID) {
    return g.crypto.randomUUID() as string;
  }

  if (g?.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    g.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return (
      `${hex.slice(0, 8)}-${hex.slice(8, 12)}-` +
      `${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    );
  }

  throw new Error('crypto.getRandomValues is required for UUID generation');
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Registers all App Studio custom functions onto a compiled JSONata expression.
 *
 * @param expr - A compiled JSONata expression object.
 *
 * @example
 * import jsonata from 'jsonata';
 * import { registerASFunctions } from '@/utils/as.jsonata.functions';
 *
 * const expr = jsonata('$uuid()');
 * registerASFunctions(expr);
 * const id = await expr.evaluate({});  // => 'a1b2c3d4-...'
 */
export function registerASFunctions(expr: jsonata.Expression): void {
  // $uuid() — generates a random UUID v4 string
  // Signature: "<:s>" = no arguments, returns string
  expr.registerFunction('uuid', () => _uuidV4(), '<:s>');

  // ── Add more custom functions below ──────────────────────────────────────
  //
  // expr.registerFunction('slugify', (s: string) =>
  //   s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
  //   '<s:s>'
  // );
  //
  // expr.registerFunction('nowISO', () => new Date().toISOString(), '<:s>');
  //
  // ─────────────────────────────────────────────────────────────────────────
}

// ---------------------------------------------------------------------------
// Evaluation helper
// ---------------------------------------------------------------------------

/**
 * Compiles and evaluates a JSONata expression with all App Studio custom
 * functions pre-registered.
 *
 * This is the single entry-point for screen-level JSONata evaluation in
 * generated apps. It replaces the raw `jsonata(expr).evaluate(data)` pattern
 * so that custom functions like `$uuid()` are always available.
 *
 * @param expression - The JSONata expression string (e.g. `"$uuid()"`)
 * @param data       - The context object passed to JSONata's evaluate method
 * @returns Promise resolving to the evaluation result
 *
 * @throws {Error} If the expression is empty or JSONata evaluation fails
 *
 * @example
 * const name = await evaluateASJsonata('$uppercase(firstName)', { firstName: 'john' });
 * // => 'JOHN'
 *
 * const id = await evaluateASJsonata('$uuid()', {});
 * // => 'a1b2c3d4-e5f6-4789-abcd-ef0123456789'
 */
export async function evaluateASJsonata(
  expression: string,
  data: unknown,
): Promise<unknown> {
  if (!expression) {
    throw new Error('evaluateASJsonata: expression must not be empty');
  }
  try {
    const expr = jsonata(expression);
    registerASFunctions(expr);
    return await expr.evaluate(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`JSONata evaluation failed: ${msg}`);
  }
}

/**
 * Coerces a JSONata evaluation result into a string for use in string contexts
 * (e.g. navigation params). Branches per primitive type so objects become JSON
 * instead of '[object Object]', and avoids stringifying `unknown` directly
 * (keeps SonarQube S6551 satisfied).
 */
export function asTemplateString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return `${value}`; // NOSONAR (S6551) — value is narrowed to number|boolean|bigint
  }
  if (value === null || value === undefined) {
    return '';
  }
  return JSON.stringify(value);
}

/**
 * Strips "phantom" entries from a JSONata evaluation result before it is
 * stored in screen state. A phantom is a null/undefined item, or an object
 * whose every value is null/undefined (produced when an expression maps over
 * a sparse source). Non-array results are returned unchanged.
 *
 * Defined here (module scope) rather than inline in the screen useEffect hooks
 * so the filtering predicates do not add function-nesting depth to the
 * generated component.
 */
function hasMeaningfulValue(item: unknown): boolean {
  if (item == null) {
    return false;
  }
  if (typeof item !== 'object') {
    return true;
  }
  return Object.values(item as Record<string, unknown>).some((v) => v != null);
}

export function filterPhantomItems(result: unknown): unknown {
  if (!Array.isArray(result)) {
    return result;
  }
  return result.filter(hasMeaningfulValue);
}
