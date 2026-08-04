# Exy's sprite frames

Drop the files here. `src/components/Exy.tsx` reads this folder by exact
filename — nothing scans the directory, so the names have to match.

Until every file below exists, Exy stays parked: the import and the `<Exy />`
line in `src/app/page.tsx` are commented out, because a missing frame renders
as a broken image rather than as nothing.

## Files

```
walk-front-1.png … walk-front-6.png    walking toward the viewer
walk-back-1.png  … walk-back-6.png     walking away
walk-side-1.png  … walk-side-6.png     walking to the RIGHT
sit.png                                idle, and the corner sprite
bark.mp3                               plays once when he's woken
```

**Only one side cycle.** Walking left is the right-facing cycle mirrored in
CSS, so there are three cycles to shoot, not four.

## Requirements

1. **Transparent PNGs.** A frame with its photo background still attached
   renders as a rectangle sliding over the page. This is the one requirement
   that can't be worked around in code.
2. **Identical dimensions and framing on every frame** — same zoom, same
   distance, dog in the same place in the box. This matters more than image
   quality: inconsistent crops make him appear to jitter and resize as he
   walks, which reads as a bug rather than as rough art.
3. **~300px tall.** He renders at 104px, so this stays sharp on a 2x display
   without shipping anything large.

## Getting cutouts, on macOS

Both are built in and take a couple of seconds per frame:

- **Photos** — long-press the dog in a still, *Copy Subject*, paste, save as PNG
- **Preview** — Tools → Remove Background

If the frames are shot against a plain, contrasting wall, say so instead and
the background can be keyed out here with Pillow rather than by hand.

## Changing the counts

`WALK_FRAMES`, `SPRITE_PX`, `SPEED` and `WALK_FPS` are constants at the top of
`Exy.tsx`. Six frames per cycle is a target, not a constraint — four works, it
just reads choppier. Change the constant to match what you actually cut.
