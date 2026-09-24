# Art Generation Prompts — "The Last Torchlight"

> **Why this doc exists:** the original plan (`01-requirements.md` Section 7) had Dad hand-drawing composite sheets that Claude Code would slice up. That's changed — art is now generated with a separate AI image tool, using the prompts in this doc. Each prompt is written to produce one finished, ready-to-use image at an exact size, so there's no slicing step needed.
>
> **How to use this doc:** copy a prompt below into whatever image-gen tool you're using, generate a few options, and pick the best one (or iterate on the prompt). Save the result into `/assets/` using the filename given. This doc grows over time — one section gets added per MVP, right before that MVP needs new art, following the placeholder-first rule in `01-requirements.md` Section 7a.
>
> **Dad:** worth a quick sanity check on the style/resolution choices below before generating for real — these are reasonable defaults, not locked decisions.
>
> **How these get used in code (no effect on the prompts below):** for the wall texture, we learned the hard way that just cropping a flat tile into a tapered shape (CSS `clip-path`) isn't enough — the brick pattern itself needs to visibly shrink toward the vanishing point, or it reads as flat and unconvincing. The fix (`tools/generate_wall_side_assets.py`) pre-warps the flat texture into each depth band's exact trapezoid shape using a Pillow perspective transform, once, offline — see `docs/06-corridor-view-assets.md`. Floor and ceiling will get the same treatment once real textures exist for them: a similar script warping `floor.png`/`ceiling.png` into their own depth-band trapezoids, not just a flat repeating tile. The prompts below don't need to change for this — it's still just a plain seamless square texture, the warping happens after.

---

## Style Guide — paste this before every prompt

**If your tool supports a reference/style image, use one — this matters more than the wording below.** `assets/tiles/wall_plain_01.png` already nails the look we want (flat brick shapes, hard dark outlines, no photo texture). Upload it and ask the tool to match its style for floor/ceiling/anything else, if it supports that ("image-to-image", "style reference", "match this image"). This is the single most reliable way to keep results consistent — wording alone can't guarantee it, especially since a first attempt at a floor texture came back fully photorealistic (soft gradients, film grain, realistic lighting) instead of pixel art, even with the style guide below already in the prompt.

Image-gen tools vary a lot in how literally they take "pixel art" as a style word — some default toward photorealistic/painterly output unless pushed hard with explicit, concrete constraints. Use this block, and don't soften it:

```
Retro 16-bit pixel art sprite/tile, like a SNES or Genesis dungeon
crawler RPG (Dungeon Master, Eye of the Beholder, Legend of Grimrock's
pixel-art tiles). Drawn at a genuinely low native resolution (imagine
32x32 or 64x64 pixels) and scaled up with hard nearest-neighbor
scaling — NOT smoothed, NOT anti-aliased, NOT upscaled with any
blur/interpolation.

Flat, solid color fills only. Each distinct surface (a brick, a
crack, a shadow) is ONE flat color with a hard edge to the next, like
cel-shading — never a soft gradient, never a blend. Dark, mostly
straight or hard-diagonal outlines between shapes, like a comic panel.

STRICT NEGATIVES — none of these should appear at all: photographic
texture, film grain, noise, realistic surface detail, ambient
occlusion, soft/blurry shadows, 3D render, photo, painterly brushwork,
smooth gradients of any kind.

Cold grey stone dungeon walls, warm orange torchlight as the main
light source. Limited, moody color palette (aim for well under 20
distinct colors in the final image).
```

If a first attempt still comes back too smooth/photographic, that specific tool may just not be good at genuine pixel art regardless of wording — worth trying a different image-gen tool for these assets rather than fighting the prompt further.

---

## MVP1 Assets — needed now

MVP1 needs three tileable textures (wall, floor, ceiling) and one sprite (torch). Nothing else — no monsters, items, or doors yet, per the MVP roadmap.

### 1. Wall texture

- **File:** `assets/tiles/wall.png`
- **Size:** 256×256 px, PNG, no transparency (fully opaque)
- **Must tile seamlessly** — the left edge must line up with the right edge, and the top edge with the bottom edge, since the game repeats this texture to fill walls of different sizes.

```
[paste style guide above]

A seamless, tileable stone brick wall texture for a first-person
dungeon corridor. Rough-cut grey stone blocks with visible mortar
lines. Some blocks slightly darker/lighter for texture variation, but
nothing that breaks the tiling seam. No torches, doors, or other
objects in this image — just the wall material itself. 256x256 pixels,
seamless tile.
```

### 2. Floor texture

- **File:** `assets/tiles/floor.png`
- **Size:** 256×256 px, PNG, no transparency
- **Must tile seamlessly**, same reason as the wall.

```
[paste style guide above]

A seamless, tileable dungeon floor texture, viewed from a low
first-person angle. Worn grey flagstones with subtle cracks and dirt,
matching the wall texture's stone color and lighting. No objects,
debris, or characters in this image — just the floor material itself.
256x256 pixels, seamless tile.
```

### 3. Ceiling texture

- **File:** `assets/tiles/ceiling.png`
- **Size:** 256×256 px, PNG, no transparency
- **Must tile seamlessly**

```
[paste style guide above]

A seamless, tileable dungeon ceiling texture. Dark rough stone,
slightly darker overall than the wall texture since it gets less
torchlight. No objects (no beams, chains, or fixtures) in this image —
just the ceiling material itself. 256x256 pixels, seamless tile.
```

### 4. Torch sprite

- **File:** `assets/sprites/torch.png`
- **Size:** 64×128 px, PNG, **transparent background required** — this is a sprite, not a tile, per the hard rule in `01-requirements.md` Section 7 (sprites are always separate transparent PNGs, rendered as `<img>` elements, never baked into a background tile).

```
[paste style guide above]

A single wall-mounted torch with a bright orange/yellow flame, iron
wall bracket, on a FULLY TRANSPARENT background — no wall, no stone,
nothing behind the torch itself. Facing forward, centered in frame.
64x128 pixels (tall and narrow). PNG with alpha transparency.
```

---

## Later MVPs — add sections here when needed

Don't generate these yet — placeholder shapes are correct until each MVP actually starts (per `01-requirements.md` Section 7a):

- **MVP2:** item icons (small, transparent PNGs)
- **MVP3:** door sprite, puzzle switch/socket art
- **MVP4:** 4 Tier 0 monster sprites (Dungeon Rats, Rusted Sentinel, Cave Bats, Skeleton Warrior) — each needs 2-3 hand-drawn size variants (near/mid/far) per Section 7
- **MVP5:** hit-particle effects, HP bar frame
- **MVP6:** rune icons
- **MVP7+:** logo, lore-crawl illustration, win screen art
