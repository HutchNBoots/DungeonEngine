# Art Generation Prompts — "The Last Torchlight"

> **Why this doc exists:** the original plan (`01-requirements.md` Section 7) had Dad hand-drawing composite sheets that Claude Code would slice up. That's changed — art is now generated with a separate AI image tool, using the prompts in this doc. Each prompt is written to produce one finished, ready-to-use image at an exact size, so there's no slicing step needed.
>
> **How to use this doc:** copy a prompt below into whatever image-gen tool you're using, generate a few options, and pick the best one (or iterate on the prompt). Save the result into `/assets/` using the filename given. This doc grows over time — one section gets added per MVP, right before that MVP needs new art, following the placeholder-first rule in `01-requirements.md` Section 7a.
>
> **Dad:** worth a quick sanity check on the style/resolution choices below before generating for real — these are reasonable defaults, not locked decisions.
>
> **How these get used in code (no effect on the prompts below):** the corridor renderer draws each wall/floor/ceiling piece as a tapered shape (CSS `clip-path`), cut out of the flat square texture — the texture itself stays a plain seamless tile, the code does the tapering. One thing still to build when real textures go in: the same texture should look smaller/more compressed on farther pieces (real perspective shrinks bricks with distance), which will be a `background-size` change per depth band in `game.js`, not a different image asset.

---

## Style Guide — paste this before every prompt

Image-gen tools drift in style between separate generations. To keep the wall, floor, ceiling, and every future sprite feeling like they belong in the same game, start every prompt with this block:

```
Dark fantasy dungeon crawler pixel art, in the style of Dungeon Master (1987)
and Eye of the Beholder. Chunky, readable pixel art — NOT smooth or
anti-aliased, NOT photorealistic. Cold grey stone dungeon walls, warm
orange torchlight as the main light source. Limited, moody color
palette. Flat lighting with hard-edged shadows, no soft gradients.
```

If your tool supports using a reference image (image-to-image, or "match the style of this image"), generate the wall texture first, then feed it in as the style reference for everything after — that keeps the palette locked across all the pieces.

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
