# Exy's sprite frames

`src/components/Exy.tsx` reads this folder by exact filename — nothing scans
the directory, so names have to match.

## What's here

```
walk-side-1.png  … walk-side-7.png     walking to the RIGHT   (408x232)
walk-front-1.png … walk-front-7.png    walking toward you     (140x227)
sit.png                                idle + corner sprite   (140x227)
growl.mp3                              plays once when he's woken
```

Cut from three phone clips with `ffmpeg` + `rembg`, and **`sit.png` is a
standing frame, not a sitting one** — there was no sitting footage. It shares
the front cycle's canvas so he doesn't change size when he stops.

## Two things that are load-bearing

**Seven frames, not six.** His real gait measured 21 frames at 60fps, and 21
divides evenly by 7. Six would have meant 3.5-frame spacing — a cycle that
stutters at two of its six steps. `WALK_FRAMES` in `Exy.tsx` matches.

**He faces RIGHT in the files.** The source clip has him walking right-to-left,
so the frames were mirrored on the way out. Walking left is these same frames
flipped again in CSS, which is what `CYCLE.flip` does.

## Still missing

**The back cycle** (`walk-back-1.png` … `walk-back-7.png`, walking away). That
shot was dropped as too awkward to get. Until it exists, `CYCLE.up` in
`Exy.tsx` points "walking up the page" at the side frames — side-on is
directionally neutral, where a front-facing dog travelling away reads as
moonwalking. Add the seven files and change that one entry.

**A bark.** `growl.mp3` is standing in. Drop `bark.mp3` here and change
`WAKE_SOUND` in `Exy.tsx`.

## Re-cutting frames

If you reshoot, the pipeline that produced these was:

1. `ffmpeg -i clip.mov -vf "select='between(n,LO,HI)'" -fps_mode passthrough f%03d.png`
2. `rembg p -m isnet-general-use in_dir out_dir`
   — **`isnet-general-use`, not the default `u2net`.** u2net treated the wall
   outlet as a second subject and fused it onto his tail, which no
   largest-component filter could split.
3. Find the gait period by silhouette autocorrelation, take `period / 7`
   spacing, scale each frame against a *linear fit* of bbox height rather than
   its own height — that removes the drift from him walking toward the camera
   while keeping the natural bob.

Requirements that can't be worked around: transparent PNGs, and identical
canvas size within a cycle.
