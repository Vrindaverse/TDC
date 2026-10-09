const BURN_DURATION = 1500;
const EDGE_FEATHER = 6;
const EASE_OUT_CUBIC = (t: number) => 1 - Math.pow(1 - t, 3);

let active: (() => void) | null = null;
const particles = new Set<HTMLElement>();

function release() {
  for (const el of particles) {
    el.getAnimations().forEach((a) => a.cancel());
    el.remove();
  }
  particles.clear();
}

function track(el: HTMLElement) {
  particles.add(el);
  return el;
}

function center(el: HTMLElement, x: number, y: number, size: number) {
  el.style.left = `${x - size / 2}px`;
  el.style.top = `${y - size / 2}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
}

function settle(el: HTMLElement) {
  return () => {
    el.remove();
    particles.delete(el);
  };
}

function spawnFlash(cx: number, cy: number) {
  const size = 110;
  const el = track(document.createElement("span"));
  el.className = "tdc-burn-flash";
  center(el, cx, cy, size);
  el.animate(
    [
      { transform: "scale(0.35)", opacity: 0.95 },
      { transform: "scale(2.6)", opacity: 0 },
    ],
    { duration: 430, easing: "ease-out", fill: "forwards" }
  ).onfinish = settle(el);
}

function spawnSpark(cx: number, cy: number, r: number) {
  const angle = Math.random() * Math.PI * 2;
  const size = 4 + Math.random() * 3;
  const el = track(document.createElement("span"));
  el.className = "tdc-burn-spark";
  center(el, cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, size);
  const outX = Math.cos(angle) * (36 + Math.random() * 110);
  const outY = Math.sin(angle) * (36 + Math.random() * 110) + 14 * Math.random();
  el.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      {
        transform: `translate(${outX}px, ${outY}px) scale(0.15)`,
        opacity: 0,
      },
    ],
    {
      duration: 520 + Math.random() * 480,
      easing: "cubic-bezier(0.16, 0.84, 0.36, 1)",
      fill: "forwards",
    }
  ).onfinish = settle(el);
}

function spawnCinder(cx: number, cy: number, r: number) {
  const angle = Math.PI + Math.random() * Math.PI;
  const size = 5 + Math.random() * 5;
  const el = track(document.createElement("span"));
  el.className = "tdc-burn-cinder";
  center(el, cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, size);
  const sway = (Math.random() - 0.5) * 90;
  const rise = 70 + Math.random() * 110;
  el.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 0.9 },
      {
        transform: `translate(${sway * 0.4}px, ${-rise * 0.55}px) scale(0.9)`,
        opacity: 0.6,
      },
      {
        transform: `translate(${sway}px, ${-rise}px) scale(0.5)`,
        opacity: 0,
      },
    ],
    {
      duration: 1600 + Math.random() * 1100,
      easing: "ease-out",
      fill: "forwards",
    }
  ).onfinish = settle(el);
}

function spawnSmoke(cx: number, cy: number, r: number) {
  const angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.7;
  const size = 26 + Math.random() * 30;
  const el = track(document.createElement("span"));
  el.className = "tdc-burn-smoke";
  center(el, cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, size);
  const sway = (Math.random() - 0.5) * 110;
  const rise = 90 + Math.random() * 120;
  el.animate(
    [
      { transform: "translate(0, 0) scale(0.6)", opacity: 0.55 },
      {
        transform: `translate(${sway * 0.5}px, ${-rise * 0.5}px) scale(1.3)`,
        opacity: 0.45,
      },
      {
        transform: `translate(${sway}px, ${-rise}px) scale(1.9)`,
        opacity: 0,
      },
    ],
    {
      duration: 1500 + Math.random() * 800,
      easing: "ease-out",
      fill: "forwards",
    }
  ).onfinish = settle(el);
}

export interface BurnTransitionOptions {
  x: number;
  y: number;
  duration?: number;
  /** Run at the instant the frozen overlay is in place — flip the theme here. */
  onFlip?: () => void;
}

export function burnThemeTransition({
  x,
  y,
  duration = BURN_DURATION,
  onFlip,
}: BurnTransitionOptions) {
  cancelActive();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onFlip?.();
    return;
  }

  const doc = document;
  const rootEl = doc.documentElement;

  /* Freeze the OLD theme before the caller flips it: inline the resolved
     CSS custom properties plus the theme class/attribute onto the overlay
     root, so everything nested resolves to the pre-toggle values. */
  const srcComputed = window.getComputedStyle(rootEl);
  const page = doc.body.cloneNode(true) as HTMLElement;
  page.setAttribute("aria-hidden", "true");

  const overlay = doc.createElement("div");
  overlay.id = "tdc-burn-overlay";
  overlay.setAttribute("inert", "");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:60;pointer-events:none;overflow:hidden;background:var(--background);";
  overlay.classList.add(rootEl.classList.contains("dark") ? "dark" : "light");
  const dataTheme = rootEl.getAttribute("data-theme");
  if (dataTheme) overlay.setAttribute("data-theme", dataTheme);
  overlay.style.colorScheme = srcComputed.colorScheme;
  for (let i = 0; i < srcComputed.length; i++) {
    const name = srcComputed.item(i);
    if (name && name.startsWith("--")) {
      overlay.style.setProperty(name, srcComputed.getPropertyValue(name));
    }
  }

  const baseR = 6;
  const cx = x;
  const cy = y;
  overlay.style.setProperty("--burn", `${baseR}px`);
  overlay.style.setProperty("--ox", `${cx}px`);
  overlay.style.setProperty("--oy", `${cy}px`);
  const mask =
    `radial-gradient(circle var(--burn) at var(--ox) var(--oy), ` +
    `transparent 0, ` +
    `transparent calc(var(--burn) - ${EDGE_FEATHER}px), ` +
    `rgba(0, 0, 0, 0.55) calc(var(--burn) - ${EDGE_FEATHER / 2}px), ` +
    `#000 var(--burn))`;
  overlay.style.maskImage = mask;
  overlay.style.webkitMaskImage = mask;

  /* Ember rim riding the hole edge: outer glow, charred core, hot inner line. */
  const rim = doc.createElement("div");
  rim.className = "tdc-burn-rim";
  for (const cls of ["tdc-burn-glow", "tdc-burn-core", "tdc-burn-emberline"]) {
    const layer = doc.createElement("div");
    layer.className = cls;
    rim.appendChild(layer);
  }

  /* Scorched-paper tint just ahead of the flame (masked with the overlay). */
  const scorch = doc.createElement("div");
  scorch.className = "tdc-burn-scorch";

  overlay.appendChild(page);
  overlay.appendChild(rim);
  overlay.appendChild(scorch);
  doc.body.appendChild(overlay);

  spawnFlash(cx, cy);

  onFlip?.();

  const maxR =
    Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    ) + 24;

  const start = performance.now();
  let disposed = false;
  let raf = 0;
  let lastSpark = 0;
  let lastCinder = 0;
  let lastSmoke = 0;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    overlay.remove();
    release();
    active = null;
  };
  active = dispose;

  const step = (now: number) => {
    if (disposed) return;
    const p = Math.min(1, (now - start) / duration);

    /* Breathing + jitter make the flame feel alive. */
    const breath = 1 + 0.006 * Math.sin(now / 150);
    const jx = cx + (Math.random() - 0.5) * 2.4;
    const jy = cy + (Math.random() - 0.5) * 2.4;
    const r = Math.max(
      10,
      (6 + (maxR - 6) * EASE_OUT_CUBIC(p)) * breath
    );

    overlay.style.setProperty("--burn", `${r}px`);
    overlay.style.setProperty("--ox", `${jx}px`);
    overlay.style.setProperty("--oy", `${jy}px`);

    rim.style.width = `${r * 2}px`;
    rim.style.height = `${r * 2}px`;
    rim.style.left = `${jx - r}px`;
    rim.style.top = `${jy - r}px`;

    const scorchPad = 30;
    const s = r + scorchPad;
    scorch.style.width = `${s * 2}px`;
    scorch.style.height = `${s * 2}px`;
    scorch.style.left = `${jx - s}px`;
    scorch.style.top = `${jy - s}px`;

    if (now - lastSpark > 85) {
      spawnSpark(jx, jy, r);
      if (Math.random() < 0.55) spawnSpark(jx, jy, r);
      lastSpark = now;
    }
    if (now - lastCinder > 210 && r > 70) {
      spawnCinder(jx, jy, r);
      lastCinder = now;
    }
    if (now - lastSmoke > 280 && r > 50) {
      spawnSmoke(jx, jy, r);
      lastSmoke = now;
    }

    if (p < 1) raf = requestAnimationFrame(step);
    else dispose();
  };
  raf = requestAnimationFrame(step);
}

function cancelActive() {
  if (active) {
    active();
    active = null;
  }
}