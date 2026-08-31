# Ben's Project Backlog — "The Last Torchlight"
### A tutoring plan Claude will work through with Ben, session by session

Parent note: this replaces the doc order from before. Ben now **creates** the three docs himself, in this order: UX first (the fun, visual part), then Lore, then Requirements last (once he knows what he's actually building). Claude's job in each session is to ask questions, react to Ben's ideas, and only write things down once Ben has decided them — not to write the docs for him.

---

## SESSION 1 — Quick Refresher
**Goal:** Since Ben already knows the game, just a fast reminder, not a research task.

**Ben's task:** Skim one short video to jog his memory, then tell Claude 3 things he loved about it and 1 thing he'd change.

**One link to share with Ben:**
- Short gameplay video: https://www.youtube.com/watch?v=RpDfAlo0y5o

**Done when:** Ben's named his 3 favorite things + 1 change — takes 5-10 minutes, straight into Session 2.

---

## SESSION 2 — How This Project Will Work
**Goal:** Ben understands the plan before diving in.

**Claude explains:**
- We're not copying Dungeon Master exactly — we're building our own game *inspired* by it
- Ben will design 3 documents, and Claude Code will use them to actually write the game
- Order: **UX (how it looks/plays) → Lore (the story/world) → Requirements (the technical to-do list)**
- Why this order: designing the screen first makes the game feel real and gives Ben something to react to; the world/story comes next once he knows what's on screen; the requirements doc comes last because by then he knows exactly what needs building
- Claude's role throughout: ask questions, sketch options, never lock in a decision without Ben choosing it

**Done when:** Ben can explain back, in his own words, what a "UX doc," a "lore doc," and a "requirements doc" are for.

---

## SESSION 3 — UX Design (the fun bit)
**Goal:** Ben designs how the game looks and plays, screen by screen.

**Working method:** Claude asks one question at a time, sketches Ben's answer back in plain language (or a rough text/ASCII layout), and only moves on once Ben is happy.

**Questions to work through with Ben:**
1. What does the player see first when they open the game?
2. What's on screen during exploration — draw or describe the layout (viewport, party info, controls, map)?
3. How does the player move — buttons, keyboard, both?
4. What happens when the player finds a monster? A locked door? An item?
5. What does winning look like?
6. What's the overall mood/style — colors, fonts, retro vs. modern?

**Output:** a UX document, written up from Ben's answers (Claude drafts, Ben edits/approves).

**Done when:** Ben has a doc he'd be happy to hand to a developer and say "build this."

---

## SESSION 4 — Lore & World
**Goal:** Ben invents the story, setting, and creatures — now that he knows what the screens look like.

**Recommended order (big picture first, then specifics):** the monsters, weapons, and spells should serve the story rather than the other way around, so start broad and narrow down.
1. **Big picture** — setting, why the party's there, who/what the villain or mystery is
2. **Story structure** — ask Ben: chapters (each with a puzzle + new monster/weapon/spell + a reveal), zones/areas with their own theme, one continuous mystery pieced together in any order, or brainstorm together
3. **Character types** — melee classes (Barbarian, Warrior, etc.) and caster classes (Wizard + others)
4. **Monster types** — the bestiary, weaknesses, where scrolls/puzzles are hidden (see Game Systems section above for generic puzzle types to draw from)
5. **Spells** — the rune system, what spells exist, how new ones are invented
6. **Weapons** — types, how naming them works, how weaknesses tie to monster types
7. **Healing & potions** — how healing works, and potion creation/use

**Working method:** same as Session 3 — question, sketch, confirm, one topic at a time.

**Output:** a Lore document, written up from Ben's answers.

**Done when:** Ben can tell the story of his game in 2–3 minutes, start to finish, without notes.

---

## SESSION 5 — Requirements for Claude Code
**Goal:** Turn Ben's UX + Lore decisions into a clear, buildable to-do list for Claude Code.

**Claude's role:** translate Ben's creative decisions into concrete scope — what's in v1, what's a stretch goal, what order to build things in. Keep v1 small and finishable; capture bigger ideas as stretch goals rather than cutting them.

**Output:** a Requirements document combining Ben's UX + Lore work into a build plan with milestones.

**Done when:** all 3 documents exist, agree with each other, and are ready to hand to Claude Code.

---

## SESSION 6+ — Build With Claude Code
Once all 3 docs are approved, Ben and Claude Code work through the milestones from the requirements doc one at a time (see the milestone list once Session 5 is complete). Claude explains each piece of code as it's written rather than just producing it.

---

## Multi-Agent Review — Before MVP1 Build Begins
Once weapons/items/armor/potions placeholders (and the rest of Session 4 lore) are in good shape, run a multi-agent review pass: instead of one AI checking its own work, a few different passes review it from different angles (e.g. "does this make sense as a game," "is this actually buildable," "does this fit the lore established so far") and results get compared. Catches blind spots a single pass might miss — same idea as a second pair of human eyes. Do this once, right before starting MVP1, not repeatedly.

## Game Systems — Split Between Lore and Requirements
Came up while discussing puzzles: some things are **generic reusable mechanics** (belong in Requirements, Session 5) vs **specific story instances of those mechanics** (belong in Lore, Session 4).

- **Requirements doc should define generic puzzle types** as reusable building blocks, e.g.: switch-combo (N switches must be correctly set to open a linked door), item-socket (a specific item placed in a matching slot triggers something), sequence puzzle (interact with things in the right order)
- **Lore doc should invent specific puzzle instances** using those types — e.g. "2 red switches open the red door in the Undercroft Cult's camp," "the red diamond fits the vault door" — tied to a room and a story reason
- **Requirements doc should also define monster movement/AI rules** as a system: options to choose from include stationary (waits until approached), patrol (fixed path), aggro-on-sight/sound (idle then chase), flee-at-low-HP. This is a meaningful difficulty/feel decision, not just flavor, so it needs real thought in Session 5 rather than being assumed.

## Multiplayer — Decided Against (for now)
Considered: separate parties per player, shared dungeon. Decided to stay **single-player**, since the game is web-based and shareable via a simple link — friends can play through Ben's story and puzzles on their own. Simpler to build, and fits the goal (Ben's story, experienced by others) better than real-time sync would. Not ruled out forever, just not part of this project.

## Art Pipeline Decisions (to formalize in Session 5 requirements doc)
Captured during UX design, to be written up properly as an art asset checklist when we get to Session 5:

- **Art source:** Dad generates/creates pixel-art composite sheets (e.g. wall tileset sheet); Ben and Dad collaborate on curating/creating them
- **Slicing:** Claude Code writes a script (e.g. Python + Pillow) to cut composite sheets into individual tile images, based on a defined grid
- **Per-sheet spec needed:** grid layout (rows/cols), pixel size per cell (this project mixes 16x16 / 32x32 / 64x32), which cells need transparency, output file naming convention
- **Monsters, portraits, weapon icons, item icons:** always separate sprites on transparent backgrounds — never baked into background/wall tiles. This allows reuse across any corridor and correct layering (HP bars, hit particles, glow effects on top)
- **Monster sizing:** consider 2-3 hand-drawn size versions (near/mid/far) rather than relying purely on code-scaling one image, since scaling pixel art down can look blurry
- **Music/sound:** procedurally generated (Web Audio / code-based chiptune style) rather than pre-made files, to keep the retro feel consistent
- **Reference standard:** Dad's wall tileset sheet sets the target palette/style/lighting for all future art

## Quick Reference: Backlog Checklist
- [x] Session 1: Refresher complete, Ben named favorites + 1 change
- [x] Session 2: Ben understands the process and doc order
- [x] Session 3: UX doc drafted and approved — see `03-cx-ux.md`
- [x] Session 4: Lore doc built with Ben — see `02-lore.md`. Covers premise, mission, protagonist motivation, villain (Ashwren Vale), bestiary (4 tiers + Skeleton Line), The Mad One encounter, final boss fight, full spell/rune system, weapons/shields/armor/potions. **Deliberately left open:** rival party roster (leader + members' names/personalities) — parked by choice, not blocking, pick up whenever convenient.
- [x] Multi-Agent Review complete — see `04-multi-agent-review.md` (Story Keeper, Game Designer, Builder/Coder passes). No blockers found; 5 action items to carry into Session 5.
- [x] Session 5: Requirements doc finalized — see `01-requirements.md`. Scoped to Chapter 1 / v1 only. Resolves all 5 Multi-Agent Review action items, the Game Systems split (puzzle types + monster AI), and the Art Pipeline checklist — all now live in that doc rather than scattered across this backlog.
- [ ] Session 6+: Build milestones (MVP1–MVP7+, per the Epics & MVP Roadmap in `01-requirements.md`), tracked as they're completed

## Handoff to GitHub / Claude Code
All 5 docs (`00-backlog.md`, `01-requirements.md`, `02-lore.md`, `03-cx-ux.md`, `04-multi-agent-review.md`) are ready to go into a GitHub repo — see the suggested repo structure in `01-requirements.md` Section 11. Claude Code (via the mobile app's Code tab) works from that repo directly — no local computer needed. Point any new Claude Code session at `01-requirements.md` first; it's the primary build spec.

## Starting a New Chat
If continuing in a fresh chat, upload `00-backlog.md`, `02-lore.md`, `03-cx-ux.md`, and `04-multi-agent-review.md` at the start so Claude has full context rather than reconstructing it from memory.
