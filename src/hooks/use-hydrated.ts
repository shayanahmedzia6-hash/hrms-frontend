"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
/** Returns false during SSR and the first hydration pass; true on the client. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
