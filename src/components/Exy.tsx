"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Exy — Bradley's dog, as a controllable character.
 *
 * He sits in the corner until clicked. Click him and he wakes up: WASD walks
 * him anywhere on the page, and his frames swap to match the direction he's
 * heading. Click again (or press Escape) and he sits back down.
 *
 * This is a real mechanic rather than decoration, which is the only reason it
 * belongs on a site whose brief bans ornamental motion: nothing here moves
 * unless a key is held. It's the same category as the planned bhop gate.
 *
 * ## The frames
 *
 * Cut from phone clips of the real dog, in `public/exy/`:
 *
 *   walk-front-1.png … walk-front-7.png   (walking toward the viewer)
 *   walk-side-1.png  … walk-side-7.png    (walking to the RIGHT)
 *   sit.png                               (idle, and the corner sprite)
 *   growl.mp3
 *
 * **There is no back cycle** — that shot was dropped, so `CYCLE` maps walking
 * up the page onto the side frames. See the note there.
 *
 * One side cycle covers both directions: walking left is the right-facing
 * cycle mirrored with `scaleX(-1)`, which is why `CYCLE` carries `flip`. The
 * source clip has him walking right-to-left, so the PNGs were mirrored on the
 * way out — **he faces RIGHT in the files.**
 *
 * Every frame in a cycle shares one canvas size, and `sit.png` shares the
 * front canvas so he doesn't resize when he stops walking. That matters more
 * than image quality: inconsistent crops make him appear to jitter and rescale
 * as he moves, which reads as a bug rather than as rough art.
 */

/**
 * Where the frames live, and how many there are per cycle.
 *
 * **Seven, not six, because his real gait measured 21 frames at 60fps** and 21
 * divides evenly by 7. Six would have needed 3.5-frame spacing, i.e. a cycle
 * that stutters slightly at two of its six steps.
 */
const ASSETS = "/exy";
const WALK_FRAMES = 7;

/** Rendered height in px. The art is 2x this, which is all a 2x display uses. */
const SPRITE_PX = 104;

/** Walking speed, px per second. */
const SPEED = 190;

/**
 * Frames per second of the walk cycle.
 *
 * Not a taste value — it's the one that stops his feet sliding. A walk cycle
 * has to advance at the rate the character actually travels, or he moonwalks
 * (too slow) or skates (too fast).
 *
 * Measured off the source clip: one gait cycle is 21 frames at 60fps (0.35s),
 * during which he covers ~0.70 of his own body length. Rendered here his body
 * is ~150px, so a cycle should carry him ~105px; at SPEED that takes 0.55s,
 * and 7 frames in 0.55s is ~13fps.
 *
 * **So this is tied to SPEED and to the sprite's proportions.** Change either
 * and re-derive it, or the feet start to slip.
 */
const WALK_FPS = 13;

/**
 * What he says when woken.
 *
 * A growl, because that's the recording Bradley had — the bark is still to
 * come. Named as a constant rather than inlined so swapping it is one edit and
 * so the filename doesn't claim to be a sound it isn't.
 */
const WAKE_SOUND = "growl.mp3";

/** Keys, lowercased. Arrow keys are deliberately not bound — they scroll. */
const KEY_DIRECTION: Record<string, "up" | "down" | "left" | "right"> = {
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

type Heading = "up" | "down" | "left" | "right";

/** Which cycle each heading uses, and whether it's mirrored. */
const CYCLE: Record<Heading, { name: "front" | "side"; flip: boolean }> = {
  /*
   * Walking up the page is walking away from the viewer, which wants a back
   * cycle — and there isn't one, because that clip was dropped as too awkward
   * to shoot.
   *
   * Side is the stand-in rather than front. A front-facing dog moving up the
   * page reads as moonwalking, because he'd be looking straight at you while
   * travelling away; side-on is directionally neutral and just reads as
   * moving. Shoot the back cycle and this becomes `{ name: "back" }` plus the
   * seven files.
   */
  up: { name: "side", flip: false },
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
     * Best-effort. Browsers block audio without a user gesture, but this only
     * ever runs from a click, so the catch is for a missing file rather than
     * for autoplay policy — a 404 on the mp3 shouldn't throw.
     */
    void new Audio(`${ASSETS}/${WAKE_SOUND}`).play().catch(() => {});
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
