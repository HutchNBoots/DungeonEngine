# CX / UX Design Document — "The Last Torchlight"
### Designed by Ben, Session 3

## 1. Visual Style
- **Pixel art throughout** — not just the corridor view, but every menu, icon, and screen. One consistent style, no mismatched modern UI.
- Reference standard: Dad's hand-made wall tileset sheet sets the target palette, brick style, and torch lighting for the whole game.
- Layout inspired by the original *Dungeon Master* (1987), reskinned in pixel art.

## 2. Opening Sequence
1. Game logo appears
2. Scrolling text crawl, **Star Wars style**, tells the game's lore/backstory
3. Background sound: **crackling fire** (not music) — sets mood before the player even moves

## 3. Main Play Screen — Layout

```
+--------------------------------------------------+
|  PARTY PANEL                      [MAP ICON]      |
|  (front line / back line)                          |
|                                                    |
|              FIRST-PERSON CORRIDOR VIEW            |
|         (walls, doors, monsters, torches)           |
|                                                    |
|                                     [SPELL ICON]    |
+--------------------------------------------------+
|         MESSAGE SCROLL (unrolls when triggered)    |
+--------------------------------------------------+
```

### Party Panel (top-left)
Split into two groups, matching combat rules (see Section 5):
- **Front line** (top of panel) — can melee attack or cast spells
- **Back line** (bottom of panel) — spells/items only, cannot melee

Each hero row shows:
- Player-chosen **name**
- **Portrait** (small pixel-art face)
- **HP bar**
- **Class tag** — dynamic, not fixed: changes based on the weapon type currently equipped (see Weapon Types below), rather than being locked in at character creation
- **Weapon Types (melee):** each weapon has a type — **Finesse**, **Strength**, or **Intelligence** — and the hero's displayed class shifts to match whichever weapon is equipped:
  - Finesse weapon → **Rogue / Assassin**
  - Strength weapon → **Barbarian / Berserker**
  - Intelligence weapon → **Ranger**
  - *(exact class names + why "Intelligence" maps to Ranger to be nailed down in Lore, Session 4)*
- **Mana bar** — shown only if the hero is a spellcaster
- **Weapon icon** (large pixel-art sword sprite, not a text symbol) — click to attack with that hero; player can rename their weapon
- **Spell icon** (large pixel-art rune/star sprite, not a text symbol) — casters only; click to open that hero's spell/rune menu

### Movement
- On-screen arrow buttons, styled like the original DM controls
- Also supports **WASD or arrow keys** for keyboard play

### Minimap
- Icon in the **top-right corner**
- Click to open a map of discovered areas
- New areas are revealed by finding **hidden map scrolls** — not automatically as you walk. Scrolls are found on shelves or by solving small puzzles.

### Inventory
- Opens via **E key** or clicking an inventory icon
- **Center:** character shown with equipped gear on them, Minecraft-style paper doll — armor slots
- **Around it:** DM-style slots for weapons, food, and other items
- **Hover tooltip:** shows item name, damage/protection/buffs depending on item type, and — for weapons — its **weapon type** (Finesse / Strength / Intelligence, see Party Panel section above)
- **Armor buff system:** armor pieces can grant:
  - **Damage buffs** to one, multiple, or all weapon types — extra Strength weapon damage, extra Intelligence weapon damage, extra Finesse weapon damage
  - **Damage resistance / protection**
  - **Combinations** — a single armor piece could grant protection *and* one stat buff, or even all three stat buffs at once (rarer, higher-value gear)
  - This means gearing a hero becomes a real choice: build purely around one weapon type, go balanced, or hunt for rare all-stat pieces

### Message Log
- Styled as a **scroll** that unrolls/unfurls at the **bottom of the screen** when there's something to say
- Classic DM-style descriptive text ("You see a rusted door to the north.")

## 4. Monsters & Combat Encounters
- Combat is **real-time** (not turn-based) — matches the original DM feel
- Up to **4 monsters** can appear at once, arranged DM-style in a **2x2 square formation**: 2 in front (closer, larger), 2 behind (further, smaller)
- Each monster has a **floating HP bar** above it
- Combat music starts on encounter, **varies slightly per enemy type**, and **fades out** on kill or on fleeing
- **Hit particle system** shows attack effectiveness:
  - **Blue** = neutral/default hit (also the default before that enemy's weakness is known)
  - **Red** = effective (this weapon/spell is strong against this enemy)
  - **Grey** = ineffective (resisted)
- Enemy weaknesses stay hidden (blue only) until the player finds that enemy's **lore/weakness scroll** — found on shelves or via small puzzles, same method as map scrolls. Reading it unlocks true red/grey feedback for that enemy from then on.

## 4b. Lore Discovery Moments
When the player finds a lore/plot scroll (enemy weakness lore, story lore, etc.), it's a bigger moment than the regular message scroll:
- A **large scroll opens/unrolls**, distinct from the small message-log scroll at the bottom
- Includes **pixel art** (an illustration relevant to what's being revealed — a monster, a character, a scene)
- Pauses the small message log while it's showing — this is a "read this" moment, not a passing note

## 5. Combat Controls (Mouse + Keyboard)
Combines direct hero control with DM's classic front/back positioning:
- **Weapon icon (⚔)** next to a hero — click to attack with that specific hero
- **Spell icon (✦)** next to a caster — click to open that hero's rune menu (or press **Q**, or click a spell icon that appears during combat)
- **Click a monster directly** — attacks with whichever hero is currently active/selected (fast shortcut)
- **Spacebar** — attack shortcut
- **Front line** heroes can melee or cast; **back line** heroes can only cast or use items — positioning is a real tactical choice

### Spellcasting
- Opens via spell icon click, **Q key**, or in-combat spell icon
- Menu shows all unlocked runes, each labeled with its number key
- Player presses rune numbers in sequence to cast — DM-style combo casting
- New spells are discovered/invented by trying new rune combinations

## 6. Planned / Future Controls (not v1, captured for later)
- Number-key hotkeys: quick-select spells for casters, quick-switch weapons for melee fighters

## 7. Win Screen
**Not yet designed** — deliberately deferred until the Lore doc (Session 4) is complete, since the ending should reflect how the story actually resolves.

## 8. Customization
- Players can **rename their champions**
- Players can **name their weapons**

## 9. Art Asset Pipeline (summary — full checklist to be finalized in the Requirements doc, Session 5)
- Backgrounds/tiles: Dad creates composite pixel-art sheets (e.g. wall tileset); Claude Code slices them into individual tile images via a defined grid
- **Monsters, portraits, weapon icons, and item icons are always separate sprites with transparent backgrounds** — never baked into background/wall tiles — so they can be reused across any corridor and layered correctly (HP bars, hit particles, glow effects)
- Monsters may need 2–3 hand-drawn size variants (near/mid/far) for crispness, rather than relying purely on code-scaling
- Music/sound: procedurally generated in-code (chiptune-style), not pre-made audio files, to keep a consistent retro feel
