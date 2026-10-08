const BURN_DURATION = 1500;
const EASE_OUT_CUBIC = (t: number) => 1 - Math.pow(1 - t, 3);

const EMEBER = "255, 130, 40";
const CHAR = "12, 8, 4";

let active: (() => void) | null = null;

function cancelActive() {
  if (active) {
    active();
    active = null;
  }
}

function spawnSpark(cx: number, cy: number, r: number) {
  const angle = Math.random() * Math.PI * 2;
  const el = document.createElement("span");
  el.className = "tdc-burn-spark";
  const size = 2 + Math.random() * 3;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.left = `${cx + Math.cos(angle) * r}px`;
  el.style.top = `${cy + Math.sin(angle) * r}px`;
  el.style.background = `rgb(${EMEBER})`;
  document.body.appendChild(el);
  const outX = Math.cos(angle) * (40 + Math.random() * 110);
  const outY = Math.sin(angle) * (40 + Math.random() * 110) - 10;
  el.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      {
        transform: `translate(${outX}px, ${outY}px) scale(0.1)`,
        opacity: 0,
      },
    ],
    {
      duration: 500 + Math.random() * 500,
      easing: "cubic-bezier(0.16, 0.84, 0.36, 1)",
    }
  ).onfinish = () => el.remove();
}

function spawnSmoke(cx: number, cy: number, r: number) {
  const angle = Math.PI + Math.random() * Math.PI;
  const size = 18 + Math.random() * 22;
  const el = document.createElement("span");
  el.className = "tdc-burn-smoke";
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.left = `${cx + Math.cos(angle) * r - size / 2}px`;
  el.style.top = `${cy + Math.sin(angle) * r - size / 2}px`;
  el.style.background = `rgb(${CHAR})`;
  document.body.appendChild(el);
  el.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 0 },
      {
        transform: `translate(${(Math.random() - 0.5) * 80}px, ${-60 - Math.random() * 90}px) scale(${2.4 + Math.random()})`,
        opacity: 0.4,
      },
      {
        transform: `translate(${(Math.random() - 0.5) * 140}px, ${-140 - Math.random() * 120}px) scale(${3.4 + Math.random()})`,
        opacity: 0,
      },
    ],
    { duration: 1300 + Math.random() * 700, easing: "ease-out" }
  ).onfinish = () => el.remove();
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

  let r = 6;
  const cx = x;
  const cy = y;
  overlay.style.setProperty("--burn", `${r}px`);
  overlay.style.setProperty("--ox", `${cx}px`);
  overlay.style.setProperty("--oy", `${cy}px`);
  const mask =
    "radial-gradient(circle var(--burn) at var(--ox) var(--oy), transparent 0, transparent calc(var(--burn) - 0.5px), #000 calc(var(--burn) - 0.5px))";
  overlay.style.maskImage = mask;
  overlay.style.webkitMaskImage = mask;

  const rim = doc.createElement("div");
  rim.className = "tdc-burn-rim";
  rim.style.width = `${r * 2}px`;
  rim.style.height = `${r * 2}px`;
  rim.style.left = `${cx - r}px`;
  rim.style.top = `${cy - r}px`;

  overlay.appendChild(page);
  overlay.appendChild(rim);
  doc.body.appendChild(overlay);

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
  let lastSmoke = 0;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    overlay.remove();
    active = null;
  };
  active = dispose;

  const step = (now: number) => {
    if (disposed) return;
    const p = Math.min(1, (now - start) / duration);
    r = 6 + (maxR - 6) * EASE_OUT_CUBIC(p);

    overlay.style.setProperty("--burn", `${r}px`);
    rim.style.width = `${r * 2}px`;
    rim.style.height = `${r * 2}px`;
    rim.style.left = `${cx - r}px`;
    rim.style.top = `${cy - r}px`;

    if (now - lastSpark > 90) {
      spawnSpark(cx, cy, r);
      if (Math.random() < 0.5) spawnSpark(cx, cy, r);
      lastSpark = now;
    }
    if (now - lastSmoke > 220 && r > 40) {
      spawnSmoke(cx, cy, r);
      lastSmoke = now;
    }

    if (p < 1) raf = requestAnimationFrame(step);
    else dispose();
  };
  raf = requestAnimationFrame(step);
}