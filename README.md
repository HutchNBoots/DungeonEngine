# The Last Torchlight

Welcome to the home of your game, Ben! 🔥

This is the repo where **The Last Torchlight** — your pixel-art dungeon crawler — actually gets built. Everything about the game lives in here: the plans, the story, the art, and eventually all the code.

## What's in here

- **`CLAUDE.md`** — this is the file Claude Code reads automatically every time you open a session here. It's got the project rules, how Claude should talk to you, and the build order. You don't need to open it much, but it's why Claude always "remembers" the plan.
- **`docs/`** — this is where all your design work lives:
  - `01-requirements.md` — the actual build plan, split into MVPs (small playable chunks). This is the main one to point Claude at.
  - `02-lore.md` — the whole story: the Rival Party, Ashwren Vale, the bestiary, spells, weapons — everything you and Dad designed.
  - `03-cx-ux.md` — how the game looks and plays, screen by screen.
  - `00-backlog.md` — the running log of decisions made along the way.
  - `04-multi-agent-review.md` — a check-up on the plan before building started.
- **`/assets`** *(coming soon)* — where the real pixel art tiles and sprites will live once they're sliced up.
- **`/src`** *(coming soon)* — the actual game code goes here.

## How to keep building

Open the Claude app → **Code tab** → start a session pointed at this repo. Claude will read `CLAUDE.md` and know the plan automatically. A good way to kick off a session:

> "Read CLAUDE.md and docs/01-requirements.md, then let's keep going on the next MVP."

## Where things stand

Building in order, one MVP at a time, testing each one before moving to the next (check `01-requirements.md` for the full roadmap):

- [ ] MVP1 — Walk around a real, good-looking dungeon
- [ ] MVP2 — Pick up items, read lore
- [ ] MVP3 — Map + puzzle
- [ ] MVP4 — Monsters appear
- [ ] MVP5 — Combat
- [ ] MVP6 — Spells
- [ ] MVP7+ — Polish, opening crawl, Chapter 1 ending

Have fun building it. 🗡️
