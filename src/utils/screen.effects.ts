import { useEffect } from 'react';

// Minimal shape of the navigation object used by these effects — accepts the
// real React Navigation prop without importing the library type here.
type NavigationLike = {
  setParams: (params: Record<string, unknown>) => void;
};

/**
 * Clears the screen's header actions on mount.
 *
 * Every generated screen runs the identical effect
 * `useEffect(() => navigation.setParams({ headerActions: '' }), [navigation])`.
 * Extracting it into this shared hook removes that repeated block from every
 * screen while preserving the exact behaviour (same effect body, same
 * `[navigation]` dependency).
 */
export function useClearHeaderActions(navigation: NavigationLike): void {
  useEffect(() => {
    navigation.setParams({
      headerActions: '',
    });
  }, [navigation]);
}
