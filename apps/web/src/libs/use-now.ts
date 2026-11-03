import { useSyncExternalStore } from "react";

/** When the page was loaded; fixed so that every render agrees on it. */
const loadedAt = Date.now();

/** The time only changes on reload, so there is nothing to subscribe to. */
const subscribe = () => () => {};

/**
 * The current time for text that depends on it, such as "3 days ago", in a prerendered island.
 * Hydration uses `renderedAt`, the prerender time the HTML was built with, and the browser's time
 * replaces it right after, so the text is current without a hydration mismatch.
 */
export const useNow = (renderedAt: number): number =>
  useSyncExternalStore(
    subscribe,
    () => loadedAt,
    () => renderedAt,
  );
