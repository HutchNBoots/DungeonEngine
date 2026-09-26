# Art Generation Prompts — "The Last Torchlight"

> **Why this doc exists:** the original plan (`01-requirements.md` Section 7) had Dad hand-drawing composite sheets that Claude Code would slice up. That's changed — art is now generated with a separate AI image tool, using the prompts in this doc. Each prompt is written to produce one finished, ready-to-use image at an exact size, so there's no slicing step needed.
>
> **How to use this doc:** copy a prompt below into whatever image-gen tool you're using, generate a few options, and pick the best one (or iterate on the prompt). Save the result into `/assets/` using the filename given. This doc grows over time — one section gets added per MVP, right before that MVP needs new art, following the placeholder-first rule in `01-requirements.md` Section 7a.
>
> **Dad:** worth a quick sanity check on the style/resolution choices below before generating for real — these are reasonable defaults, not locked decisions.
>
> **How these get used in code (no effect on the prompts below):** for the wall texture, we learned the hard way that just cropping a flat tile into a tapered shape (CSS `clip-path`) isn't enough — the brick pattern itself needs to visibly shrink toward the vanishing point, or it reads as flat and unconvincing. The fix (`tools/generate_wall_side_assets.py`) pre-warps the flat texture into each depth band's exact trapezoid shape using a Pillow perspective transform, once, offline — see `docs/06-corridor-view-assets.md`. Floor and ceiling will get the same treatment once real textures exist for them: a similar script warping `floor.png`/`ceiling.png` into their own depth-band trapezoids, not just a flat repeating tile. The prompts below don't need to change for this — it's still just a plain seamless square texture, the warping happens after.
>
> **Every prompt below states its own exact pixel size AND repeats the retro-pixel-art requirement directly in its own body** — not just in the shared style guide. That's on purpose: a generation that only got the specific prompt (style guide forgotten, or trimmed by the tool) should still come back at the right size and in the right style, not silently drift to some default resolution or a smooth/photorealistic look. Pasting the shared style guide too still helps — it's more detail on palette and mood — but it's no longer the only thing enforcing size and retro-ness.

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
objects in this image — just the wall material itself.

EXACT SIZE: 256x256 pixels, seamless tile. RETRO PIXEL ART ONLY —
flat solid color fills, hard black outlines, chunky and blocky like a
16-bit SNES-era game tile. NOT photorealistic, NOT a photo texture,
NOT smooth or softly shaded.
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

EXACT SIZE: 256x256 pixels, seamless tile. RETRO PIXEL ART ONLY —
flat solid color fills, hard black outlines, chunky and blocky like a
16-bit SNES-era game tile. NOT photorealistic, NOT a photo texture,
NOT smooth or softly shaded. (A prior attempt at this exact asset came
back as a realistic stone photo — that is the mistake to avoid.)
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
just the ceiling material itself.

EXACT SIZE: 256x256 pixels, seamless tile. RETRO PIXEL ART ONLY —
flat solid color fills, hard black outlines, chunky and blocky like a
16-bit SNES-era game tile. NOT photorealistic, NOT a photo texture,
NOT smooth or softly shaded.
```

### 4. Torch sprite

- **File:** `assets/sprites/torch.png`
- **Size:** 64×128 px, PNG, **transparent background required** — this is a sprite, not a tile, per the hard rule in `01-requirements.md` Section 7 (sprites are always separate transparent PNGs, rendered as `<img>` elements, never baked into a background tile).

```
[paste style guide above]

A single wall-mounted torch with a bright orange/yellow flame, iron
wall bracket, on a FULLY TRANSPARENT background — no wall, no stone,
nothing behind the torch itself. Facing forward, centered in frame.

EXACT SIZE: 64x128 pixels (tall and narrow). PNG with alpha
transparency. RETRO PIXEL ART ONLY — flat solid color fills, hard
black outlines, chunky and blocky like a 16-bit SNES-era game sprite.
NOT photorealistic, NOT smooth or softly shaded, NOT a rendered 3D
flame effect.
```

---

## MVP4 prep — Skeleton Warrior (drafted early, not needed until MVP4 starts)

One of the 4 Tier 0 monsters (`02-lore.md`): "classic reanimated dungeon guardian, sword and shield, animated by old residual dungeon magic — weak to Strength (shatter the bones)." Tier 0 means **not corrupted** — mundane bones and rusty gear, no glowing effects, no dark magic visuals. That's a real constraint worth keeping in the prompt: later skeleton variants (Skeleton Archer, Knight, Juggernaut) can look tougher, but this one should read as a plain, long-dead guardian, not a demon.

Per `01-requirements.md` Section 7, a monster needs **2-3 hand-drawn size variants** (near/mid/far) rather than one image scaled by code — scaling pixel art down often looks blurry, and a real artist adjusts detail for each size instead of just shrinking it. Same style guide as everything else in this doc, plus the same tip: if your tool supports a reference image, `wall_plain_01.png` still sets the palette/lighting to match.

- **Files:** `assets/sprites/skeleton_warrior_near.png`, `_mid.png`, `_far.png`
- **Sizes:** near 256×384px, mid 160×240px, far 96×144px — all PNG, **transparent background required** (sprite rule, same as the torch: rendered as `<img>`, never baked into a tile)
- **Sizes are a starting guess, not locked** — adjust once the actual combat screen layout exists and you can see how much space a monster gets.

```
[paste style guide above]

A skeleton warrior standing in a dungeon-guardian pose, gripping a
plain sword and a battered round shield. Ordinary bleached bone,
NOT glowing, NOT corrupted, no dark magic aura or purple/green
energy effects -- ancient residual magic reanimates it, but nothing
about its appearance should look otherwise supernatural. Rusted,
dented iron/steel gear (sword, shield, maybe a few remaining scraps
of old armor) -- centuries-old, not fresh or shiny.

Full body visible, facing forward/slightly angled toward the
viewer, as if seen down a dungeon corridor. FULLY TRANSPARENT
background -- no floor, no wall, nothing behind the figure itself.

RETRO PIXEL ART ONLY, every variant -- flat solid color fills, hard
black outlines, chunky and blocky like a 16-bit SNES-era game sprite.
NOT photorealistic, NOT smooth or softly shaded, NOT a rendered 3D
model.

[near variant] EXACT SIZE 256x384 pixels, tall aspect ratio, full
detail (individual rib/bone shading, gear texture clearly visible).

[mid variant] EXACT SIZE 160x240 pixels, same pose, simplified
slightly for the smaller size -- keep the silhouette instantly
readable as the same character, drop only the finest detail.

[far variant] EXACT SIZE 96x144 pixels, same pose again, reduced to
bold shapes and its most essential silhouette -- readable as a
skeleton warrior even as a small, distant shape.
```

---

## MVP2/7+ prep — Fallen Adventurer (drafted early)

The "one fallen rival-party member per chapter" lore beat (`02-lore.md`) — currently in the game as a test lore object (`Fallen Adventurer` in `game.js`) using a flat placeholder color. **Important distinction from the skeleton above:** this is a much more recent death than the ancient, already-skeletal Tier 0 guardians — the rival party only went in before the player, not centuries ago. So this should read as a fallen *person*, not bones. (The placeholder lore text in `game.js` originally said "a set of old bones," which contradicted this — fixed to match.)

This doubles as two possible uses: the small pickup-style icon it uses today, and/or the bigger pixel-art illustration the UX doc (`03-cx-ux.md` Section 4b) calls for when a real lore-reveal scroll opens ("includes pixel art -- an illustration relevant to what's being revealed"). One landscape-ish image works for both; crop it down for the small icon, use it full-size for the big reveal.

- **File:** `assets/sprites/fallen_adventurer.png`
- **Size:** 400×300 px, PNG, **transparent background required**

```
[paste style guide above]

A fallen adventurer lies collapsed on the dungeon floor -- clearly a
person, NOT a bare skeleton or bones. This death is recent, not the
ancient, already-skeletal remains of the ordinary dungeon guardians
found elsewhere. Dressed in worn traveling/adventuring gear: leather
armor, a torn cloak, a pack. Beside them, a torch that's snapped or
gone dark -- broken, no flame. Somber and tragic in tone, not gory or
graphic -- this is a story beat about loss and dread, not a horror
scene.

Full figure visible at a slight angle, as if just discovered lying in
a dungeon corridor. FULLY TRANSPARENT background -- no floor, no
wall, nothing behind the figure and torch themselves.

EXACT SIZE: 400x300 pixels, landscape orientation. RETRO PIXEL ART
ONLY -- flat solid color fills, hard black outlines, chunky and
blocky like a 16-bit SNES-era game sprite. NOT photorealistic, NOT
smooth or softly shaded, NOT a rendered 3D model.
```

---

## Later MVPs — add sections here when needed

Don't generate these yet — placeholder shapes are correct until each MVP actually starts (per `01-requirements.md` Section 7a):

- **MVP2:** item icons (small, transparent PNGs)
- **MVP3:** door sprite, puzzle switch/socket art
- **MVP4:** the other 3 Tier 0 monster sprites (Dungeon Rats, Rusted Sentinel, Cave Bats) — Skeleton Warrior is drafted above, ready whenever
- **MVP5:** hit-particle effects, HP bar frame
- **MVP6:** rune icons
- **MVP7+:** logo, lore-crawl illustration, win screen art
