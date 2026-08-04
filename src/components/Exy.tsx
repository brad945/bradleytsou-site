"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Exy — Bradley's dog, as a controllable character.
 *
 * He sits in the corner until clicked. Click him and he wakes up: WASD walks
 * him anywhere on the page, and his frames swap to match the direction he's
 * heading. Click again (or press Escape) and he sits back down.
 *
 * **NOT wired into app/page.tsx yet** — same holding pattern as Comments.tsx.
 * He needs the frames below to exist in `public/exy/` first; without them he'd
 * render as a column of broken images. Uncomment the import in page.tsx once
 * they're in.
 *
 * This is a real mechanic rather than decoration, which is the only reason it
 * belongs on a site whose brief bans ornamental motion: nothing here moves
 * unless a key is held. It's the same category as the planned bhop gate.
 *
 * ## What the assets have to be
 *
 * In `public/exy/`, PNGs **with transparency** — a photo with its background
 * still attached renders as a rectangle sliding over the page:
 *
 *   walk-front-1.png … walk-front-6.png   (walking toward the viewer)
 *   walk-back-1.png  … walk-back-6.png    (walking away)
 *   walk-side-1.png  … walk-side-6.png    (walking to the RIGHT)
 *   sit.png                               (idle, and the corner sprite)
 *   bark.mp3
 *
 * Only one side cycle is needed. Walking left is the right-facing cycle
 * mirrored with `scaleX(-1)`, which is why `FACING` exists below.
 *
 * Every frame must share the same pixel dimensions and framing. Inconsistent
 * crops are the single most likely thing to look wrong: the dog appears to
 * jitter and resize as he walks, and it reads as a bug rather than as bad art.
 */

/** Where the frames live, and how many there are per cycle. */
const ASSETS = "/exy";
const WALK_FRAMES = 6;

/** Rendered height in px. Source art should be ~3x this to stay sharp at 2x. */
const SPRITE_PX = 104;

/** Walking speed, px per second. */
const SPEED = 190;

/** Frames per second of the walk cycle. Under ~6 he moonwalks. */
const WALK_FPS = 9;

/** Keys, lowercased. Arrow keys are deliberately not bound — they scroll. */
const KEY_DIRECTION: Record<string, "up" | "down" | "left" | "right"> = {
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

type Heading = "up" | "down" | "left" | "right";

/** Which cycle each heading uses, and whether it's mirrored. */
const CYCLE: Record<Heading, { name: "front" | "back" | "side"; flip: boolean }> =
  {
    // Walking "up" the page is walking away from the viewer.
    up: { name: "back", flip: false },
    down: { name: "front", flip: false },
    right: { name: "side", flip: false },
    left: { name: "side", flip: true },
  };

export default function Exy() {
  const [awake, setAwake] = useState(false);
  const [frame, setFrame] = useState(1);
  const [heading, setHeading] = useState<Heading>("down");
  const [walking, setWalking] = useState(false);

  /*
   * Position lives in a ref, not state: it changes every animation frame, and
   * putting it in state would re-render the tree ~60x a second. The ref drives
   * a transform written straight to the node instead.
   */
  const pos = useRef({ x: 0, y: 0 });
  const node = useRef<HTMLDivElement>(null);
  const held = useRef(new Set<string>());
  const raf = useRef<number | null>(null);
  const lastTick = useRef(0);
  const frameClock = useRef(0);

  /** Keeps him fully on screen regardless of how the window is resized. */
  const clamp = useCallback(() => {
    const w = SPRITE_PX;
    pos.current.x = Math.min(Math.max(pos.current.x, 0), window.innerWidth - w);
    pos.current.y = Math.min(Math.max(pos.current.y, 0), window.innerHeight - w);
  }, []);

  const wake = useCallback(() => {
    // Start him where the corner sprite was, so he doesn't teleport on waking.
    pos.current = {
      x: 24,
      y: window.innerHeight - SPRITE_PX - 24,
    };
    clamp();
    setAwake(true);

    /*
     * Bark is best-effort. Browsers block audio without a user gesture, but
     * this only ever runs from a click, so the catch is for a missing file
     * rather than for autoplay policy — a 404 on the mp3 shouldn't throw.
     */
    void new Audio(`${ASSETS}/bark.mp3`).play().catch(() => {});
  }, [clamp]);

  const sleep = useCallback(() => {
    setAwake(false);
    setWalking(false);
    held.current.clear();
  }, []);

  /* Key handling. Only while awake, and never while typing. */
  useEffect(() => {
    if (!awake) return;

    function isTyping(target: EventTarget | null) {
      const el = target as HTMLElement | null;
      if (!el) return false;
      return (
        el.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)
      );
    }

    function onDown(event: KeyboardEvent) {
      if (event.key === "Escape") return sleep();
      if (isTyping(event.target)) return;

      const key = event.key.toLowerCase();
      if (!(key in KEY_DIRECTION)) return;
      // Only once the key is a movement key — otherwise this would swallow
      // every shortcut on the page while he's out.
      event.preventDefault();
      held.current.add(key);
    }

    function onUp(event: KeyboardEvent) {
      held.current.delete(event.key.toLowerCase());
    }

    /*
     * A held key whose keyup lands while the tab is hidden is never released,
     * so he'd walk forever on return. Dropping everything on blur fixes it.
     */
    function onBlur() {
      held.current.clear();
    }

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [awake, sleep]);

  /* The loop. */
  useEffect(() => {
    if (!awake) return;

    function tick(now: number) {
      const dt = lastTick.current ? (now - lastTick.current) / 1000 : 0;
      lastTick.current = now;

      let dx = 0;
      let dy = 0;
      if (held.current.has("w")) dy -= 1;
      if (held.current.has("s")) dy += 1;
      if (held.current.has("a")) dx -= 1;
      if (held.current.has("d")) dx += 1;

      const moving = dx !== 0 || dy !== 0;

      if (moving) {
        // Normalise, or holding two keys makes him 41% faster on the diagonal.
        const len = Math.hypot(dx, dy);
        pos.current.x += (dx / len) * SPEED * dt;
        pos.current.y += (dy / len) * SPEED * dt;
        clamp();

        /*
         * Left/right wins over up/down when both are held: a side-on dog
         * reads as diagonal movement far better than a front-on one does.
         */
        const next: Heading =
          dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
        setHeading((current) => (current === next ? current : next));

        frameClock.current += dt;
        const step = 1 / WALK_FPS;
        if (frameClock.current >= step) {
          frameClock.current %= step;
          setFrame((f) => (f % WALK_FRAMES) + 1);
        }
      } else {
        frameClock.current = 0;
      }

      setWalking((was) => (was === moving ? was : moving));

      if (node.current) {
        node.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }

      raf.current = requestAnimationFrame(tick);
    }

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      lastTick.current = 0;
    };
  }, [awake, clamp]);

  /* Keep him on screen when the window is resized. */
  useEffect(() => {
    if (!awake) return;
    function onResize() {
      clamp();
      if (node.current) {
        node.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [awake, clamp]);

  const cycle = CYCLE[heading];
  const src = walking
    ? `${ASSETS}/walk-${cycle.name}-${frame}.png`
    : `${ASSETS}/sit.png`;

  /* Asleep: a small sitting sprite in the corner, waiting to be clicked. */
  if (!awake) {
    return (
      <button
        type="button"
        onClick={wake}
        aria-label="Wake up Exy"
        title="Exy"
        className="fixed bottom-6 left-6 z-30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- frames swap
            every ~110ms; routing each through the image optimiser would add a
            request per frame for no benefit on an already-tiny PNG. */}
        <img
          src={`${ASSETS}/sit.png`}
          alt="Exy, sitting"
          height={SPRITE_PX * 0.7}
          style={{ height: SPRITE_PX * 0.7, width: "auto" }}
        />
      </button>
    );
  }

  return (
    <div
      ref={node}
      className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform"
    >
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- see above. */}
        <img
          src={src}
          alt="Exy"
          height={SPRITE_PX}
          onClick={sleep}
          style={{
            height: SPRITE_PX,
            width: "auto",
            cursor: "pointer",
            // Mirrored for the left-facing walk — one side cycle covers both.
            transform: cycle.flip ? "scaleX(-1)" : undefined,
            // Nearest-neighbour keeps hand-cut frames crisp rather than mushy.
            imageRendering: "auto",
          }}
        />
        {!walking && (
          <span className="label text-[9px] text-muted/70">WASD</span>
        )}
      </div>
    </div>
  );
}
