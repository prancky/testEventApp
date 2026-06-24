/**
 * Custom Function Registry
 *
 * AUTO-GENERATED — This file is created by the App Studio generator.
 * Custom function implementation files (e.g. DashboardFunctions.ts)
 * live alongside this file and are never overwritten during regeneration.
 *
 * @module CustomFunctions
 */

/**
 * Registry mapping function names to their implementations.
 *
 * To register a custom function:
 * 1. Create a file like `DashboardFunctions.ts` in this folder
 * 2. Export a class with static async methods
 * 3. Import and register the methods here
 *
 * @example
 * import { DashboardFunctions } from './DashboardFunctions';
 * export const CustomFunctionRegistry: Record<string, Function> = {
 *   'DashboardFunctions.handleManageBooks': DashboardFunctions.handleManageBooks,
 * };
 */
import { DashboardFunctions } from './DashboardFunctions';
import { SumsubFunctions } from './SumsubFunctions';

export const CustomFunctionRegistry: Record<string, Function> = {
  'DashboardFunctions.handleManageBooks': DashboardFunctions.handleManageBooks,
  'SumsubFunctions.handleSumsubVerification':
    SumsubFunctions.handleSumsubVerification,
};

/**
 * Get a custom function by its fully qualified name.
 *
 * @param functionName - Function name in 'ClassName.methodName' format
 * @returns The function reference, or undefined if not found
 */
export function getCustomFunction(functionName: string): Function | undefined {
  const fn = CustomFunctionRegistry[functionName];
  if (!fn) {
    console.warn(`Custom function not found: ${functionName}`);
    console.warn('Available functions:', Object.keys(CustomFunctionRegistry));
  }
  return fn;
}

/**
 * Execute a custom function with standardized error handling.
 *
 * All custom functions receive (navigation, variables, params?) and
 * return a Promise.
 *
 * @param functionName - Function name in 'ClassName.methodName' format
 * @param navigation - React Navigation instance
 * @param variables - App global variables (globalData)
 * @param params - Optional event-specific parameters
 * @returns Promise resolving to the function's return value
 * @throws Error if the function is not found or throws during execution
 */
export async function executeCustomFunction(
  functionName: string,
  navigation: any,
  variables: any,
  params?: any,
): Promise<any> {
  console.log(`Executing custom function: ${functionName}`);

  const fn = getCustomFunction(functionName);
  if (!fn) {
    const error = `Custom function not found: ${functionName}`;
    console.error(error);
    throw new Error(error);
  }

  try {
    const startTime = Date.now();
    const result = await fn(navigation, variables, params);
    const duration = Date.now() - startTime;
    console.log(`Completed ${functionName} in ${duration}ms`);
    return result;
  } catch (error: any) {
    console.error(`Error in ${functionName}:`, error);
    throw error;
  }
}
