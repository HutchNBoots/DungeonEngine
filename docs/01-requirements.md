# Project Requirements — "The Last Torchlight"
### A Dungeon Master–inspired dungeon crawler (web app)
> **Status: FINALIZED for handoff to Claude Code.** Built from the approved UX (`03-cx-ux.md`) and Lore (`02-lore.md`) docs, and resolves the 5 open action items from the Multi-Agent Review (`04-multi-agent-review.md`). Ready to be the primary spec for MVP1 onward.

## 1. Project Goal
Build a playable, browser-based, first-person dungeon crawler inspired by *Dungeon Master* (FTL Games, Amiga, 1987), reskinned in original pixel art, with real-time combat, rune-based spellcasting, and a full original story ("The Last Torchlight").

**Builder:** Ben (age 10–13, some Scratch experience), with Dad on art/asset generation
**Tutor/co-developer:** Claude
**Environment:** Claude Code, working from this GitHub repo. Delivered as a browser-playable web app (HTML/CSS/JS), shareable via a simple link — single-player, no server/backend required (see Multiplayer decision in `00-backlog.md`).

## 2. Scope (v1 — Chapter 1 only)
"Chapters = Levels" (locked in lore). **v1 = Chapter 1 of "The Last Torchlight," fully playable start to finish** — not the whole game. Later chapters are the natural way to expand after v1 works.

**In scope for v1:**
- 1 dungeon level (Chapter 1), grid-based
- First-person pixel-art corridor viewport, DM-style
- Movement: on-screen arrows (DM-style) + WASD/arrow keys
- A starting party of 4 heroes (front line / back line, per UX doc)
- **Real-time combat** (not turn-based — this was a deliberate, locked decision, not a simplification)
- Weapon-type system: Strength / Finesse / Intelligence, with dynamic class tags (Barbarian/Berserker, Rogue/Assassin, Ranger)
- Armor with protection + stat-buff system
- Monsters from **Tier 0 (Not Corrupted) only** for Chapter 1 — Dungeon Rats, Rusted Sentinel, Cave Bats, Skeleton Warrior (see Bestiary Scoping below)
- Hit-effectiveness particles (blue/red/grey), gated behind lore-scroll discovery
- Inventory: pick up items, E-key/click to open, paper-doll + slot UI
- Rune-based spellcasting: **starter spell set only** (see Spell Scoping below)
- At least 1 puzzle (switch-combo or item-socket type — see Game Systems)
- Minimap, revealed via found map scrolls only (never via spells)
- One fallen rival-party member found this chapter (broken torch + lore reveal)
- Message scroll (unrolls at bottom)
- Win condition: reach the end of Chapter 1

**Out of scope for v1 (stretch goals — see MVP7+ and beyond):**
- Chapters 2+ (Tier 1–3 monsters, later bosses, Ashwren, The Mad One)
- Save/load persistence *(see Persistence note below — easier than it sounds once this is a real deployed page)*
- Full 30-spell list (trimmed for v1, see below)
- Character creation screen (start with a pre-made party)
- Multiplayer (explicitly decided against, see `00-backlog.md`)

## 3. Technical Approach & Architecture
**Architecture (resolved):** static web app, no backend/server, no database.
- **Hosting: Vercel**, connected directly to the GitHub repo — every push to `main` auto-deploys, giving a live shareable link automatically. Free tier is plenty for this project.
- No server needed because: single-player (multiplayer explicitly decided against), and any future save/continue feature uses browser `localStorage`, not a database (see Persistence note below).
- This means the "architecture" is genuinely simple: **GitHub repo → Vercel → live URL.** Good for Ben to understand as a real, professional deployment pattern, not a toy one — it's the same basic setup many real static sites use.

**Stack:**
- Plain HTML + CSS + JavaScript (no framework needed) — easiest for Ben to read and understand every line
- Dungeon map as a 2D array/grid in code
- Rendering: DOM/CSS-based corridor view (nested divs at depth layers), per the mockups already built — more approachable for Ben to read/modify than canvas
- Art: real pixel-art tiles (Dad's tileset sheets), sliced via a Python/Pillow script into individual files — see Art Pipeline below
- No build tools/npm required for v1
- **Persistence note:** since this will be a real deployed web page (not a sandboxed Artifact), normal browser `localStorage` is fully available for a future "continue game" feature — no special setup needed. Not required for v1, but worth knowing it's simple to add later.

## 4. Game Systems (resolved — generic mechanics, reusable across chapters)

### 4a. Puzzle Types (building blocks — specific instances defined in Lore)
- **Switch-combo:** N switches must be in the correct on/off state to open a linked door/gate
- **Item-socket:** a specific item (e.g. a gem) placed in a matching slot triggers something
- **Sequence:** interact with things in the correct order (levers, symbols)

### 4b. Monster Movement/AI Rules (resolved — was previously open)
- **Tier 0 (v1 scope):** mostly **stationary or short-patrol** within their room — simplest to build and fair for a first playable pass. Cave Bats are the exception: erratic/darting movement within their room (matches their lore description).
- **Tier 1+ (future chapters):** aggro-on-sight/sound, chase behavior
- **Flee-at-low-HP:** reserved for specific "scout"-type enemies (e.g. Rift Hound) in later chapters, not v1
- Bosses get fully scripted, hand-designed behavior per phase (not reused from this generic system)

### 4c. Combat Pacing — Real-Time + Casting (resolved — Multi-Agent Review item #3)
Combat stays fully real-time (locked decision, not negotiable). To keep rune-sequence casting fair rather than punishing: **no hard pause, but a forgiving input window** — the game doesn't require frame-perfect timing between rune presses, and a small on-screen indicator shows the in-progress sequence so the player always knows where they are in a cast, even mid-fight. This preserves DM's tension without making casting feel unfair.

## 5. Bestiary Scoping for v1
Full bestiary (17 creatures across 4 tiers + Skeleton Line + The Mad One + Ashwren) is defined in `02-lore.md` for the whole game. **v1 uses Tier 0 only:**
- Dungeon Rats (weak: Strength)
- Rusted Sentinel (weak: Finesse)
- Cave Bats (weak: Intelligence)
- Skeleton Warrior (weak: Strength)

This deliberately gives v1 one clean weakness target per weapon type, so the hit-particle system is easy to test and tune before adding more monsters later.

## 6. Spell Scoping for v1 (resolved — Multi-Agent Review item #2)
Full list is 30 basic + parked 5-rune spells (`02-lore.md`). **v1 ships with a starter set of 8**, chosen to cover every category and both discovery methods:
1. **Torch** (Utility) — taught via starting gear
2. **Firebolt** (Offense) — taught via scroll
3. **Ward Shield** (Defense) — taught via scroll
4. **See HP** (Perception) — taught via scroll
5. **Blink** (Movement) — hidden, must be guessed
6. **Heal Wounds** (Healing) — taught via scroll
7. **Weaken Foe** (Debuff) — taught via scroll
8. **Unbind Door** (Utility) — tied to the v1 puzzle

Remaining 22+ basic spells and all 5-rune spells are added in later chapters as new monsters/puzzles justify them.

## 7. Art Pipeline Checklist (resolved — from backlog Art Pipeline Decisions)
- **Source:** Dad creates composite pixel-art sheets; Ben and Dad curate together
- **Slicing:** Claude Code writes a Python + Pillow script to cut sheets into individual tiles
- **Per-sheet spec required before slicing:** grid layout (rows/cols), pixel size per cell (mixing 16x16 / 32x32 / 64x32 is fine, just needs to be specified per cell), which cells need transparent backgrounds, output naming convention (e.g. `wall_plain_01.png`)
- **Hard rule:** monsters, portraits, weapon icons, and item icons are always separate sprites with transparent backgrounds — never baked into background tiles
- **Monster sizing:** 2–3 hand-drawn size variants (near/mid/far) preferred over pure code-scaling
- **v1 asset list needed:** corridor wall tiles (already have Dad's sheet), 4 monster sprites (Tier 0 only), party portraits x4, weapon icons, 1 door, torches, the puzzle's switch/item art
- **Music/sound:** procedurally generated in-code (Web Audio), not audio files

## 7a. Graphics Workflow Per MVP (resolved — placeholder-first strategy)
**Rule: build the logic first with simple placeholder art (flat colored shapes/CSS blocks), then swap in real art once it exists — never block an MVP on art that isn't ready yet.** This is standard game-dev practice ("grey-boxing") and keeps Ben's coding progress independent of Dad's art production pace.

| MVP | Placeholder art (build with this first) | Real art (swap in when ready) |
|---|---|---|
| MVP1 | *(Skipped — see note below)* | **Dad's wall tileset goes in from the start.** MVP1's whole point is proving the dungeon feels visually striking to walk through, not just that movement logic works — a flat-rectangle version wouldn't actually test that. Already sliced and ready. |
| MVP2 | Simple colored squares/icons for items | Hand-drawn item icons (low priority, easy to swap later) |
| MVP3 | Plain door rectangle, basic switch/socket shapes | Dad's door tile (already have it), puzzle-specific art |
| MVP4 | Colored polygon silhouettes for monsters (like the combat mockups) | 4 Tier 0 monster sprites — **needs generating**, not yet done (only a test skeleton warrior prompt exists so far) |
| MVP5 | Text/emoji-style hit particles, simple HP bar | Pixel-art hit particles, matching UI frame style |
| MVP6 | Text-symbol rune icons | Large pixel-art rune icons (style already prototyped in `icon-style-comparison.html`) |
| MVP7+ | N/A — this stage is largely art/polish | Logo, lore-crawl illustration, win screen art |

**MVP1 note:** placeholder-first is still the right default for MVP2 onward, but MVP1 is the exception — it's the very first thing Ben and Dad will see and judge the whole project by, so it should use real wall art immediately rather than prove logic first and look at it later. For MVP4 onward, placeholders remain correct since Dad hasn't generated monster sprites yet.

**Action for Dad before MVP4:** the 4 Tier 0 monster sprites (Dungeon Rats, Rusted Sentinel, Cave Bats, Skeleton Warrior) are the next real art bottleneck — worth generating those relatively soon, though MVP2–3 can proceed without them.

## 7b. Sprite Rendering — Technical Spec (resolved)
Applies to all monsters, party portraits, weapon icons, item icons, and any other non-background visual element.

- **File format:** PNG with alpha-channel transparency. No solid background color on any sprite — this was already established as a hard rule (Section 7), this section defines *how* that gets rendered.
- **Display method:** each sprite is a separate `<img>` element (not a CSS background-image), absolutely positioned within its container, layered above the corridor/background using `z-index`. Using real `<img>` tags (rather than CSS backgrounds) keeps sprites easy for Ben to swap, inspect, and reason about independently of layout code.
- **Pixel crispness:** every sprite element uses `image-rendering: pixelated` in CSS — this is required, not optional, otherwise the browser will blur pixel art when it's scaled, which would undercut the whole art style. (Already used correctly in the mockups built earlier.)
- **Depth-based sizing (monsters):** rather than relying on the browser to scale one image up/down for near/mid/far distance, use the correct hand-drawn size variant for that depth (per the "2–3 size variants" rule in Section 7) and position it at the matching depth layer's coordinates in the corridor view. Pure code-scaling is a fallback only if a size variant doesn't exist yet, not the default approach.
- **Positioning:** sprite screen position is calculated from the same depth-layer coordinate system already used in the corridor-view mockups (`ravenspire-mockup-v2.html` / the tile-based mockup) — reuse that positioning logic rather than inventing a new one.
- **Layering example (combat scene):** corridor background → monster sprite → floating HP bar → hit particles → any UI overlays, in that z-index order.

## 8. Learning Objectives for Ben
- How a 2D grid represents a game map
- How facing direction + movement works
- What a "game state" object is, and why it's kept separate from rendering
- How event listeners connect input (click/key) to game actions
- The basic structure of a real-time combat loop
- Basics of Python (for the tile-slicing script) alongside JavaScript (for the game itself)

## 9. Epics & MVP Roadmap
An **Epic** is a big feature area; each MVP builds one out on top of everything before it. Build and test each fully before moving to the next.

| MVP | Epic | What it delivers |
|---|---|---|
| **MVP1** | Exploration Core | Dungeon grid (Chapter 1 layout), first-person pixel-art corridor view **using Dad's real wall tileset from the start** (not placeholder shapes — see Section 7a), start-new-game flow, movement (turn + walk) via on-screen controls + WASD/arrows. No items, monsters, or content yet. **Success bar: the dungeon should feel visually striking to walk through, not just functionally correct.** |
| **MVP2** | Items & Lore Interaction | Pick up items, add to inventory, read scrolls, interact with lore objects (e.g. click a corpse → scroll opens). Inventory UI (paper-doll + slots) built here. |
| **MVP3** | Map & Puzzle | Minimap (map-scroll only). Doors. One puzzle (switch-combo or item-socket, per Game Systems). |
| **MVP4** | Monsters | Tier 0 monsters (4 types) exist and move per the AI rules above. No combat yet. |
| **MVP5** | Combat | Real-time combat: attack via weapon icon/click/spacebar, floating HP bars, hit-effectiveness particles (blue/red/grey, gated by lore scrolls), combat music, win/lose/flee. Weapon-type + armor-buff system live here. |
| **MVP6** | Spells | The 8 starter spells, spell menu (Q/click/in-combat icon), rune-sequence casting with the forgiving-input-window design. |
| **MVP7+** | Polish & Ch. 1 Close | Opening logo + lore crawl + fire crackle, lore-discovery scroll reveal (big scroll + pixel art), the broken-torch/rival-member moment, win screen for Chapter 1. |

## 10. Definition of Done (v1)
A player can open the web page, see their party, walk through Chapter 1 using on-screen controls or keyboard, pick up items and read lore, solve the puzzle, encounter and fight all 4 Tier 0 monster types, cast at least one spell, find the fallen rival-party member's broken torch, and reach a win screen for Chapter 1.

## 11. Suggested GitHub Repo Structure
```
CLAUDE.md         (Claude Code reads this automatically every session — Dad/Ben setup, non-negotiables, conventions)
/docs
  00-backlog.md
  01-requirements.md   (this file)
  02-lore.md
  03-cx-ux.md
  04-multi-agent-review.md
/assets
  /tiles          (sliced wall/floor/door pieces)
  /sprites        (monsters, portraits, weapon/spell icons)
  /source-sheets  (Dad's original composite sheets, kept for re-slicing)
/src
  (game code — index.html, .js, .css)
/tools
  slice_tileset.py  (the Pillow slicing script)
```
`CLAUDE.md` at the repo root is the important one — Claude Code loads it automatically at the start of every session, so it's where the Dad/Ben working setup, non-negotiable decisions, and conventions live, rather than needing to be re-explained each time. Keeping `/docs` in the repo means the full spec is always available too — point Claude Code at `01-requirements.md` for any new MVP.
