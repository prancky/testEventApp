/**
 * AUTO-GENERATED app-data store — do not edit (rewritten every build).
 *
 * A simple nested-path store used by generated screens to publish and read app data
 * (e.g. extension results). Write with setAppData('a.b', value); read with getAppData('a.b')
 * or the reactive useAppData('a.b') hook.
 */
import { useSyncExternalStore } from 'react';

let store: Record<string, any> = {};
const listeners = new Set<() => void>();

export function setAppData(path: string, value: any): void {
  const keys = path.split('.');
  const next: Record<string, any> = { ...store };
  let cur: any = next;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] || {}) };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  store = next;
  listeners.forEach((l) => l());
}

export function getAppData(path?: string): any {
  if (!path) return store;
  return path
    .split('.')
    .reduce((acc: any, k) => (acc == null ? acc : acc[k]), store);
}

export function useAppData<T = any>(path?: string): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => getAppData(path),
    () => getAppData(path),
  );
}
