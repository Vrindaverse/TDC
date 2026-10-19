/**
 * Lazy gsap loader.
 *
 * `gsap` (and its plugin tree) is a heavy dependency — 6.4 MB installed, with
 * 20+ plugins in `dist/`. The two interactive components that use it
 * (`DotGrid`, `TargetCursor`) render on every page, so importing gsap at
 * module scope drags the whole bundle into the initial client chunk.
 *
 * This helper defers the import to first interaction. The first call awaits
 * the module, registers InertiaPlugin once, and caches the resolved gsap
 * instance. Subsequent calls return the same promise. Components call it
 * inside event handlers or async effects, never at module scope or during
 * render.
 */
let gsapPromise: Promise<typeof import("gsap")["gsap"]> | null = null;
let inertiaRegistered = false;

export async function getGsap() {
  if (!gsapPromise) {
    gsapPromise = (async () => {
      const { gsap } = await import("gsap");
      if (!inertiaRegistered) {
        const { InertiaPlugin } = await import("gsap/InertiaPlugin");
        gsap.registerPlugin(InertiaPlugin);
        inertiaRegistered = true;
      }
      return gsap;
    })();
  }
  return gsapPromise;
}