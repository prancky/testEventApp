/**
 * AUTO-GENERATED extension runtime — do not edit (rewritten every build).
 *
 * Resolves an extension slot to its implementation and invokes it:
 *   - Expo web (designer preview) -> emulator implementation (mock/placeholder).
 *   - Native device              -> native implementation (real SDK).
 *
 * Bindings + registry are user-owned (src/extensions/{bindings,registry}.ts) and survive
 * regeneration. The extension returns a typed result; the generated screen owns navigation
 * and appData. Lifecycle callbacks are optional.
 */
import { Platform } from 'react-native';
import { extensionBindings } from '@/extensions/bindings';
import { extensionRegistry } from '@/extensions/registry';

export type ExtensionCallbacks = {
  onStatusChange?: (status: any) => void;
  onProgress?: (progress: any) => void;
  onCancel?: () => void;
};

export async function runExtensionSlot<I = any, O = any>(
  slotId: string,
  input: I,
  callbacks?: ExtensionCallbacks,
): Promise<O | undefined> {
  const binding = (extensionBindings as any)?.[slotId];
  if (!binding) {
    console.warn(`[extensions] no binding registered for slot "${slotId}"`);
    return undefined;
  }

  const implId = Platform.OS === 'web' ? binding.emulator : binding.native;
  const registry = (extensionRegistry as any) || {};
  const fn =
    registry[implId] ??
    (binding.fallback ? registry[binding.fallback] : undefined);

  if (typeof fn !== 'function') {
    console.warn(
      `[extensions] no implementation "${implId}" for slot "${slotId}" (Platform.OS=${Platform.OS})`,
    );
    return undefined;
  }

  try {
    return await fn(input, callbacks);
  } catch (error) {
    console.warn(`[extensions] slot "${slotId}" threw:`, error);
    return undefined;
  }
}
