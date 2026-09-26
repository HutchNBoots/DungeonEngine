// ===================================================================
// The Last Torchlight -- MVP1: Exploration Core
//
// What this file does, in order:
//   1. Defines the dungeon map as a grid of walls/floors.
//   2. Keeps track of where the player is and which way they're facing.
//   3. Turns that state into a first-person corridor view (nested
//      "picture frame" divs, one per step of depth down the hallway).
//   4. Wires up keyboard + on-screen button controls to move the player.
//
// Game state (the map, player position/facing) is kept as plain
// objects/arrays, separate from the rendering code, per the project's
// code conventions -- rendering just *reads* the state, it never
// changes it directly.
// ===================================================================


// -------------------------------------------------------------------
// 1. THE DUNGEON MAP
// -------------------------------------------------------------------
// '#' = wall, '.' = floor, 'D' = door (see the door section below --
// closed blocks like a wall, open doesn't). This is a TEST layout for
// building/testing the movement + rendering engine -- it is NOT the
// real Chapter 1 layout yet. Swap this out once the actual chapter
// map is designed.
//
// Row 0 is the top of the map. dungeonMap[y][x] gives the tile at
// column x, row y.
const dungeonMap = [
  "##########",
  "#........#",
  "#.######.#",
  "#.D....#.#",
  "#.#.##.#.#",
  "#.#.#..#.#",
  "#.#.#.##.#",
  "#...D....#",
  "#.######.#",
  "##########",
];

// Reads the tile at (x, y). Anything outside the map counts as a
// wall, so the player can never walk (or see) off the edge of the grid.
function isWall(x, y) {
  const row = dungeonMap[y];
  if (row === undefined) return true;
  const tile = row[x];
  if (tile === undefined) return true;
  if (tile === "D") return !isDoorOpen(x, y); // closed door blocks like a wall
  return tile === "#";
}

// -------------------------------------------------------------------
// 1b. DOORS -- MVP3: Map & Puzzle
// -------------------------------------------------------------------
// The map above just marks WHERE a door is; whether it's open is
// separate, mutable state, kept here rather than editing the map
// string in place (strings can't be edited character-by-character in
// JS anyway).
const doorStates = {};

function doorKey(x, y) {
  return x + "," + y;
}
function isDoorTile(x, y) {
  const row = dungeonMap[y];
  return row !== undefined && row[x] === "D";
}
function isDoorOpen(x, y) {
  return doorStates[doorKey(x, y)] === "open";
}
function openDoor(x, y) {
  doorStates[doorKey(x, y)] = "open";
}

// Doors in this set can't be opened by just clicking them -- they're
// wired to a puzzle instead (see the item-socket below). Every other
// door opens with a plain click.
const PUZZLE_LOCKED_DOORS = new Set(["4,7"]);

function handleDoorClick(x, y) {
  if (isDoorOpen(x, y)) return;
  if (PUZZLE_LOCKED_DOORS.has(doorKey(x, y))) {
    showMessage("This door is locked. Something else must open it.");
    return;
  }
  openDoor(x, y);
  renderCorridor();
}


// -------------------------------------------------------------------
// 2. PLAYER STATE
// -------------------------------------------------------------------
// facing is a number 0-3, meaning: 0 = North, 1 = East, 2 = South, 3 = West.
// Storing direction as a number (instead of a word) makes turning left/right
// just simple math -- see turnLeft()/turnRight() below.
const player = {
  x: 1,
  y: 1,
  facing: 1, // start facing East, into the open corridor
};

// One entry per facing value. dx/dy is "which way do I move if I take
// one step while facing this direction." North is dy: -1 because row 0
// is the top of the map, so "up" means a smaller row number.
const DIRECTIONS = [
  { dx: 0, dy: -1, name: "North" },
  { dx: 1, dy: 0, name: "East" },
  { dx: 0, dy: 1, name: "South" },
  { dx: -1, dy: 0, name: "West" },
];

// Turning left/right just moves the facing number around a 0-3 circle.
// +1 turns clockwise (right). -1 (written as +3 to avoid negative numbers) turns
// counter-clockwise (left).
function turnRight() {
  player.facing = (player.facing + 1) % 4;
}
function turnLeft() {
  player.facing = (player.facing + 3) % 4;
}

// Moves the player one tile in the given direction (+1 = forward, -1 = backward),
// but only if that tile isn't a wall.
function move(stepDirection) {
  const dir = DIRECTIONS[player.facing];
  const targetX = player.x + dir.dx * stepDirection;
  const targetY = player.y + dir.dy * stepDirection;
  if (!isWall(targetX, targetY)) {
    player.x = targetX;
    player.y = targetY;
  }
}


// -------------------------------------------------------------------
// 2b. PARTY & ITEMS -- MVP2: Items & Lore Interaction
// -------------------------------------------------------------------
// Just enough of a party to hang a per-hero inventory on -- a name and
// a front/back line. No HP, mana, or class tags yet: those depend on
// stats that don't exist until combat (MVP4/5) actually needs them.
const party = [
  { name: "Hero 1", line: "front", equipment: { weapon: null, armor: null }, items: [null, null, null, null] },
  { name: "Hero 2", line: "front", equipment: { weapon: null, armor: null }, items: [null, null, null, null] },
  { name: "Hero 3", line: "back", equipment: { weapon: null, armor: null }, items: [null, null, null, null] },
  { name: "Hero 4", line: "back", equipment: { weapon: null, armor: null }, items: [null, null, null, null] },
];

// Which hero picked-up items go to, and whose inventory the panel shows.
// Click a hero in the party panel to change this.
let activeHeroIndex = 0;

function getActiveHero() {
  return party[activeHeroIndex];
}

// The minimap only ever shows anything once a map scroll is found --
// never automatically, per the locked decision in CLAUDE.md.
let mapRevealed = false;

// Items and lore objects placed on the TEST map (see the note on
// dungeonMap above -- these positions aren't the real Chapter 1
// content either, just enough to test picking things up and reading
// a lore message). `slot` says which equipment slot an item goes in
// -- "general" means it's not equippable, just carried.
const mapItems = [
  { x: 3, y: 1, type: "item", slot: "weapon", name: "Rusted Shortsword", color: "#8a8a8a", pickedUp: false },
  { x: 5, y: 1, type: "item", slot: "armor", name: "Leather Armor", color: "#7a5230", pickedUp: false },
  { x: 7, y: 1, type: "item", slot: "general", name: "Health Potion", color: "#b23b3b", pickedUp: false },
  {
    x: 6,
    y: 7,
    type: "lore",
    name: "Fallen Adventurer",
    color: "#55555f",
    icon: "../assets/sprites/fallen_adventurer.png",
    iconWidth: 200, // wider box than a regular item -- matches the sprite's
    iconHeight: 152, // own ~4:3 aspect ratio and reads as a real scene, not an icon
    loreText: "A traveler's pack lies beside a torch, snapped and dark. Whoever this was, they never made it out -- and not long ago, either.",
    pickedUp: false,
  },
  { x: 2, y: 1, type: "item", slot: "general", name: "Blue Gem", color: "#3a6ea8", pickedUp: false },
  {
    x: 8,
    y: 3,
    type: "item",
    slot: "general",
    name: "Map Scroll",
    color: "#d4c896",
    effect: "reveal-map", // consumed immediately, never sits in inventory -- see handleMapIconClick
    pickedUp: false,
  },
  {
    x: 3,
    y: 7,
    type: "socket",
    name: "Ancient Socket",
    color: "#6a4a8a",
    requiresItemName: "Blue Gem",
    linkedDoor: { x: 4, y: 7 },
    pickedUp: false,
  },
  // Food items -- real icons this time (sliced from Dad's food sheet,
  // assets/sprites/items/), rather than the flat placeholder squares
  // everything else above still uses.
  {
    x: 4,
    y: 1,
    type: "item",
    slot: "general",
    name: "Roast Turkey",
    color: "#8a5a2a",
    icon: "../assets/sprites/items/roast_turkey.png",
    pickedUp: false,
  },
  {
    x: 6,
    y: 1,
    type: "item",
    slot: "general",
    name: "Red Wine",
    color: "#5a1a2a",
    icon: "../assets/sprites/items/red_wine.png",
    pickedUp: false,
  },
];

// Finds a not-yet-picked-up item/lore-object sitting on the player's
// own tile, if any -- this test map only ever puts one per tile.
function itemAtCell(x, y) {
  return mapItems.find((mapItem) => !mapItem.pickedUp && mapItem.x === x && mapItem.y === y);
}

// What happens when the player clicks an item/lore-object icon.
function handleMapIconClick(mapItem) {
  if (mapItem.type === "lore") {
    showMessage(mapItem.loreText);
    return; // lore objects (like a corpse) stay on the map, re-readable
  }

  if (mapItem.type === "socket") {
    const hero = getActiveHero();
    const matchingSlotIndex = hero.items.findIndex(
      (item) => item && item.name === mapItem.requiresItemName
    );
    if (matchingSlotIndex === -1) {
      showMessage("This socket needs a " + mapItem.requiresItemName + ".");
      return;
    }
    hero.items[matchingSlotIndex] = null; // the gem is consumed, not returned
    mapItem.pickedUp = true; // puzzle solved, socket icon disappears
    openDoor(mapItem.linkedDoor.x, mapItem.linkedDoor.y);
    showMessage("The " + mapItem.requiresItemName + " clicks into place. A door unlocks nearby.");
    renderCorridor();
    renderInventoryPanel();
    return;
  }

  // A map scroll reveals the minimap immediately rather than sitting
  // in the inventory -- reading it is the whole point of picking it up.
  if (mapItem.effect === "reveal-map") {
    mapItem.pickedUp = true;
    mapRevealed = true;
    showMessage("You found a map! The minimap now shows the dungeon layout.");
    renderCorridor();
    return;
  }

  const hero = getActiveHero();
  const emptySlotIndex = hero.items.indexOf(null);
  if (emptySlotIndex === -1) {
    showMessage(hero.name + "'s inventory is full.");
    return;
  }
  hero.items[emptySlotIndex] = mapItem;
  mapItem.pickedUp = true;
  renderCorridor(); // removes the icon, since the item is picked up now
  renderInventoryPanel(); // keeps the panel in sync if it's open
}

// Moves an item from a general inventory slot into its matching
// equipment slot (weapon/armor), swapping back whatever was equipped
// there before. Clicking a "general" (non-equippable) item does nothing.
function equipItem(hero, generalSlotIndex) {
  const item = hero.items[generalSlotIndex];
  if (!item || item.slot === "general") return;
  const previouslyEquipped = hero.equipment[item.slot];
  hero.equipment[item.slot] = item;
  hero.items[generalSlotIndex] = previouslyEquipped;
  renderInventoryPanel();
}

// Moves an equipped item back into the first open general slot.
function unequipItem(hero, slotName) {
  const item = hero.equipment[slotName];
  if (!item) return;
  const emptySlotIndex = hero.items.indexOf(null);
  if (emptySlotIndex === -1) return; // no room to unequip into
  hero.items[emptySlotIndex] = item;
  hero.equipment[slotName] = null;
  renderInventoryPanel();
}


// -------------------------------------------------------------------
// 3. RENDERING THE CORRIDOR VIEW
// -------------------------------------------------------------------
// Real perspective: imagine a rectangle marking "the edge of what you
// can see" at each step of depth down the hallway. Right at the
// player, that rectangle is the whole screen. One step further, it's
// a smaller rectangle centered in the middle of the screen (since
// looking further down a hallway shows you a narrower slice of it).
// Two steps further, smaller still. And so on.
//
// RECT_SIZES lists those rectangles, nearest to farthest. The actual
// wall/floor/ceiling shapes are then the four-sided regions *between*
// one rectangle and the next -- each one a trapezoid that's wide at
// the near edge and narrow at the far edge, which is what makes the
// hallway look like it recedes into the distance instead of looking
// like stacked boxes.
const RECT_SIZES = [
  { width: 640, height: 480 }, // right where the player is standing
  { width: 460, height: 350 },
  { width: 320, height: 250 },
  { width: 210, height: 170 },
  { width: 130, height: 108 }, // farthest we'll ever draw
];

const VIEWPORT_WIDTH = 640;
const VIEWPORT_HEIGHT = 480;

// Turns a RECT_SIZES entry into the actual pixel edges of that
// rectangle, centered in the viewport.
function getRect(index) {
  const { width, height } = RECT_SIZES[index];
  const left = (VIEWPORT_WIDTH - width) / 2;
  const top = (VIEWPORT_HEIGHT - height) / 2;
  return { left, top, right: VIEWPORT_WIDTH - left, bottom: VIEWPORT_HEIGHT - top };
}

// Turns the abstract facing number into "which direction is to my left"
// and "which direction is to my right" -- needed to know whether to
// draw a side wall at each depth.
function leftOfFacing(facing) {
  return (facing + 3) % 4;
}
function rightOfFacing(facing) {
  return (facing + 1) % 4;
}

// Base color for each surface type, as HSL. Depth shading (below)
// darkens these the further away a piece is, which is what sells the
// "fading into the dark" look -- without it, every depth would be the
// same flat brightness and look like stacked cardboard again.
//
// Floor and ceiling still use these flat colors (no art for them yet).
// left/right/forward keep an entry here too, purely as a fallback
// color shown if the real wall texture below ever fails to load.
const SURFACE_COLORS = {
  ceiling: { h: 245, s: 35, l: 14 },
  floor: { h: 30, s: 35, l: 20 },
  left: { h: 220, s: 6, l: 36 },
  right: { h: 220, s: 6, l: 30 },
  forward: { h: 250, s: 12, l: 13 },
};

function shadeFor(surface, depth) {
  const base = SURFACE_COLORS[surface];
  const falloff = Math.pow(0.82, depth); // each step back gets a bit darker
  const lightness = Math.max(base.l * falloff, 3);
  return "hsl(" + base.h + ", " + base.s + "%, " + lightness.toFixed(1) + "%)";
}

// Real wall art (Dad's sheet, sliced by tools/slice_tileset.py). The
// forward-facing dead-end cap uses this directly -- it's viewed
// straight-on, so a plain repeating texture is already correct for it.
const WALL_TEXTURE_URL = "../assets/tiles/wall_plain_01.png";
const WALL_SURFACES = new Set(["forward"]);

// A door filling the forward-facing cap uses this instead -- also from
// Dad's original sheet, already sliced and ready (see 01-requirements.md
// Section 7a, which specifically called this out as ready ahead of MVP3).
const DOOR_TEXTURE_URL = "../assets/tiles/door_wood_01.png";

// The texture tile is drawn smaller at greater depth -- that's what
// makes the brickwork look like it's shrinking into the distance,
// the same way the lightness falloff makes it look like it's getting
// darker. Real perspective would do this automatically; since our
// walls are flat CSS shapes rather than true 3D, we fake it by hand.
const WALL_TEXTURE_BASE_SIZE = 130; // px, at depth 0 (closest)
const WALL_TEXTURE_SHRINK = 0.78; // multiplied in once per step of depth

function wallTextureSizeFor(depth) {
  const size = WALL_TEXTURE_BASE_SIZE * Math.pow(WALL_TEXTURE_SHRINK, depth);
  const px = Math.max(size, 24) + "px";
  return px + " " + px;
}

// Left/right walls use pre-warped images instead (tools/generate_wall_side_assets.py)
// -- unlike the forward cap, a side wall is viewed at an angle, receding
// away from the player, so a plain repeating texture would never show
// the brick pattern actually converging toward the far end. These
// images have that convergence baked into their pixels already, one
// per depth band (0..3), with the right wall just using the same
// image mirrored horizontally -- see docs/06-corridor-view-assets.md.
function wallSideImageUrl(depth, side) {
  const suffix = side === "right" ? "_mirrored" : "";
  return "../assets/tiles/wall_side_depth" + depth + suffix + ".png";
}

// Floor uses pre-warped images too (tools/generate_floor_assets.py) --
// same reasoning as the side walls, just tapering top-to-bottom
// (full width close to the player, narrower farther away) instead of
// left-to-right. Ceiling doesn't have real art yet, so it still just
// uses shadeFor() below.
function floorImageUrl(depth) {
  return "../assets/tiles/floor_depth" + depth + ".png";
}

// A see-through black layer drawn on top of the texture, darker at
// greater depth. Stacking a gradient over an image like this is how
// you tint a background-image in CSS -- there's no direct way to
// "darken an image" the way shadeFor() darkens a plain color.
function fogOverlayFor(depth) {
  // Capped well under 1 on purpose: a wall piece with no closer, brighter
  // neighbor on the same side (e.g. an opening right beside the player
  // that closes back in one step further) needs to still read as "wall,
  // fading into darkness" rather than disappearing into the background
  // and looking like there's nothing there at all.
  const darkness = Math.min(depth * 0.14, 0.5);
  return "rgba(4, 4, 8, " + darkness.toFixed(2) + ")";
}

// CSS clip-path needs percentages (so the shape still lines up if the
// viewport gets scaled by CSS), not raw pixels -- this converts.
function toPercent(value, total) {
  return ((value / total) * 100).toFixed(2) + "%";
}

// Builds one clip-path polygon string from a list of [x, y] pixel
// points describing the corners of a shape, in order around its edge.
function clipPathFromPoints(points) {
  const parts = points.map(
    ([x, y]) => toPercent(x, VIEWPORT_WIDTH) + " " + toPercent(y, VIEWPORT_HEIGHT)
  );
  return "polygon(" + parts.join(", ") + ")";
}

// Creates one wall/floor/ceiling piece: a div covering the whole
// viewport, then clipped down to just the trapezoid shape we want.
// Because every piece is clipped to its own non-overlapping shape,
// pieces never need to be stacked/ordered on top of each other --
// unlike the old stacked-rectangle version, there's no z-index math.
function makeSurfacePiece(surfaceType, depth, points, parent) {
  const piece = document.createElement("div");
  piece.className = "corridor-surface";
  piece.style.clipPath = clipPathFromPoints(points);

  // Fallback color first, in case the texture below fails to load --
  // background-color and background-image are independent properties,
  // so the color still shows through if the image 404s.
  piece.style.backgroundColor = shadeFor(surfaceType, depth);

  if (WALL_SURFACES.has(surfaceType)) {
    piece.style.backgroundImage =
      "linear-gradient(" +
      fogOverlayFor(depth) +
      ", " +
      fogOverlayFor(depth) +
      "), url('" +
      WALL_TEXTURE_URL +
      "')";
    piece.style.backgroundSize = wallTextureSizeFor(depth);
    piece.style.backgroundRepeat = "repeat";
  }

  parent.appendChild(piece);
  return piece;
}

// Creates one side-wall piece (left or right) using its pre-warped
// image. Unlike makeSurfacePiece, this needs to know the piece's own
// bounding box (not just the viewport): the image was generated at
// exactly that size, so a child element sized/positioned to that same
// box (in simple container-relative percentages) is what lines the
// image up pixel-for-pixel with the clip-path trapezoid cut from the
// outer piece. (We use a child element rather than CSS background-
// position percentages on the outer piece directly, because
// background-position percentages don't mean "percent of the
// container" the way element left/top/width/height do -- they're
// relative to the leftover space after the image is placed, which
// isn't what we want here.)
function makeSideWallPiece(side, depth, near, far, points, parent) {
  const piece = document.createElement("div");
  piece.className = "corridor-surface";
  piece.style.clipPath = clipPathFromPoints(points);
  piece.style.backgroundColor = shadeFor(side, depth); // fallback if the image fails to load

  const bboxLeft = side === "left" ? near.left : far.right;
  const bboxWidth = far.left - near.left; // same magnitude on both sides
  const bboxHeight = near.bottom - near.top;

  const image = document.createElement("div");
  image.style.position = "absolute";
  image.style.left = toPercent(bboxLeft, VIEWPORT_WIDTH);
  image.style.top = toPercent(near.top, VIEWPORT_HEIGHT);
  image.style.width = toPercent(bboxWidth, VIEWPORT_WIDTH);
  image.style.height = toPercent(bboxHeight, VIEWPORT_HEIGHT);
  image.style.backgroundImage =
    "linear-gradient(" +
    fogOverlayFor(depth) +
    ", " +
    fogOverlayFor(depth) +
    "), url('" +
    wallSideImageUrl(depth, side) +
    "')";
  image.style.backgroundSize = "100% 100%";
  image.style.backgroundRepeat = "no-repeat";
  piece.appendChild(image);

  parent.appendChild(piece);
  return piece;
}

// Creates the floor piece for one depth band, same approach as
// makeSideWallPiece but rotated: the floor's bounding box is widest
// at its near (bottom) edge rather than tallest at its near (left or
// right) edge.
function makeFloorPiece(depth, near, far, points, parent) {
  const piece = document.createElement("div");
  piece.className = "corridor-surface";
  piece.style.clipPath = clipPathFromPoints(points);
  piece.style.backgroundColor = shadeFor("floor", depth); // fallback if the image fails to load

  const bboxWidth = near.right - near.left;
  const bboxHeight = near.bottom - far.bottom;

  const image = document.createElement("div");
  image.style.position = "absolute";
  image.style.left = toPercent(near.left, VIEWPORT_WIDTH);
  image.style.top = toPercent(far.bottom, VIEWPORT_HEIGHT);
  image.style.width = toPercent(bboxWidth, VIEWPORT_WIDTH);
  image.style.height = toPercent(bboxHeight, VIEWPORT_HEIGHT);
  image.style.backgroundImage =
    "linear-gradient(" +
    fogOverlayFor(depth) +
    ", " +
    fogOverlayFor(depth) +
    "), url('" +
    floorImageUrl(depth) +
    "')";
  image.style.backgroundSize = "100% 100%";
  image.style.backgroundRepeat = "no-repeat";
  piece.appendChild(image);

  parent.appendChild(piece);
  return piece;
}

// A door filling the forward-facing cap. Same idea as the plain wall
// cap (viewed straight-on, so no perspective warp needed) but uses
// the door image stretched to fill the opening, and is clickable.
function makeDoorPiece(doorX, doorY, depth, points, parent) {
  const piece = document.createElement("div");
  piece.className = "corridor-surface";
  piece.style.clipPath = clipPathFromPoints(points);
  piece.style.backgroundColor = shadeFor("forward", depth);
  piece.style.backgroundImage =
    "linear-gradient(" +
    fogOverlayFor(depth) +
    ", " +
    fogOverlayFor(depth) +
    "), url('" +
    DOOR_TEXTURE_URL +
    "')";
  piece.style.backgroundSize = "100% 100%";
  piece.style.backgroundRepeat = "no-repeat";
  piece.style.cursor = "pointer";
  piece.addEventListener("click", () => handleDoorClick(doorX, doorY));
  parent.appendChild(piece);
  return piece;
}

// Builds and displays the corridor view for the player's current
// position + facing. Called every time the player moves or turns.
function renderCorridor() {
  const viewport = document.getElementById("viewport");
  viewport.innerHTML = ""; // clear last frame before drawing the new one

  const facingDir = DIRECTIONS[player.facing];
  const leftDir = DIRECTIONS[leftOfFacing(player.facing)];
  const rightDir = DIRECTIONS[rightOfFacing(player.facing)];

  // Collected while walking the depths below, then drawn all at once
  // after every wall/floor/ceiling piece -- so an item always appears
  // in front of the corridor geometry at its own depth, regardless of
  // which depth's surfaces happened to be added to the page first.
  const itemsToRender = [];

  for (let depth = 0; depth < RECT_SIZES.length - 1; depth++) {
    const near = getRect(depth);
    const far = getRect(depth + 1);

    // The tile the player would be standing on if they walked `depth`
    // steps forward from where they are now.
    const cellX = player.x + facingDir.dx * depth;
    const cellY = player.y + facingDir.dy * depth;

    const mapItemHere = itemAtCell(cellX, cellY);
    if (mapItemHere) {
      itemsToRender.push({ mapItem: mapItemHere, depth, far });
    }

    // Ceiling and floor are always drawn -- every corridor tile has both.
    // Each is a trapezoid spanning the full width at "near" (wide) down
    // to the full width at "far" (narrow).
    makeSurfacePiece(
      "ceiling",
      depth,
      [
        [near.left, near.top],
        [near.right, near.top],
        [far.right, far.top],
        [far.left, far.top],
      ],
      viewport
    );
    makeFloorPiece(
      depth,
      near,
      far,
      [
        [near.left, near.bottom],
        [near.right, near.bottom],
        [far.right, far.bottom],
        [far.left, far.bottom],
      ],
      viewport
    );

    // Only draw a side wall if that neighboring tile is actually a wall.
    // If it's open floor, we leave that side see-through for now --
    // rendering side-passages is a later problem, not MVP1's job.
    if (isWall(cellX + leftDir.dx, cellY + leftDir.dy)) {
      makeSideWallPiece(
        "left",
        depth,
        near,
        far,
        [
          [near.left, near.top],
          [far.left, far.top],
          [far.left, far.bottom],
          [near.left, near.bottom],
        ],
        viewport
      );
    }
    if (isWall(cellX + rightDir.dx, cellY + rightDir.dy)) {
      makeSideWallPiece(
        "right",
        depth,
        near,
        far,
        [
          [near.right, near.top],
          [far.right, far.top],
          [far.right, far.bottom],
          [near.right, near.bottom],
        ],
        viewport
      );
    }

    // Check one tile further ahead: if THAT'S a wall (or a closed
    // door), the corridor dead-ends here. We fill in the far rectangle
    // with a wall or door facing the player, and stop -- there's
    // nothing further to see past it. An OPEN door isn't a wall as far
    // as isWall() is concerned, so this just doesn't trigger for it --
    // rendering continues past it like it was never there.
    const nextX = cellX + facingDir.dx;
    const nextY = cellY + facingDir.dy;
    if (isWall(nextX, nextY)) {
      const capPoints = [
        [far.left, far.top],
        [far.right, far.top],
        [far.right, far.bottom],
        [far.left, far.bottom],
      ];
      if (isDoorTile(nextX, nextY)) {
        makeDoorPiece(nextX, nextY, depth + 1, capPoints, viewport);
      } else {
        makeSurfacePiece("forward", depth + 1, capPoints, viewport);
      }
      break;
    }
  }

  // Draw farthest-first so a nearer item's sprite overlaps/covers a
  // farther one if they ever lined up on screen, same as how the real
  // world would occlude them.
  for (let i = itemsToRender.length - 1; i >= 0; i--) {
    const { mapItem, depth, far } = itemsToRender[i];
    renderDepthItem(mapItem, depth, far, viewport);
  }

  renderMinimap(); // keeps the player marker current if the panel's open
  updateDebugLine();
}

function updateDebugLine() {
  const debugLine = document.getElementById("debug-line");
  const facingName = DIRECTIONS[player.facing].name;
  debugLine.textContent =
    "x: " + player.x + "  y: " + player.y + "  facing: " + facingName;
}

// Shows a clickable icon for whatever item/lore-object is on the
// player's own tile, if any. Just a colored square for now, per the
// placeholder-first rule -- real icons come once art exists for them.
// How much smaller an item/lore-object sprite gets each step further
// away -- the same idea as the wall/floor depth shading, just applied
// to a sprite's size instead of a texture's color. This is the
// "code-scaling" fallback 01-requirements.md Section 7b allows when a
// sprite doesn't have hand-drawn near/mid/far variants yet (which is
// every item sprite so far) -- once real size variants exist for
// something, picking the right variant is the better approach, not
// scaling one image up or down.
const ITEM_DEPTH_SHRINK = 0.72;
const DEFAULT_ITEM_SIZE = 110; // px, at depth 0, for items without their own iconWidth/iconHeight

// Draws one item/lore-object sprite at the given depth, sized and
// positioned to match that depth's frame -- so it's visible receding
// down the corridor and grows as the player gets closer, the same way
// everything else in the view does, instead of only appearing once
// the player is standing right on top of it.
function renderDepthItem(mapItem, depth, far, viewport) {
  const scale = Math.pow(ITEM_DEPTH_SHRINK, depth);
  const width = (mapItem.iconWidth || DEFAULT_ITEM_SIZE) * scale;
  const height = (mapItem.iconHeight || DEFAULT_ITEM_SIZE) * scale;

  // Anchored so its bottom edge sits on the floor at the far edge of
  // this depth's band, and centered left-right since it's directly
  // ahead of the player (that's the only case we render at all).
  const centerX = VIEWPORT_WIDTH / 2;
  const bottomY = far.bottom;

  const icon = document.createElement("div");
  const isInteractive = depth === 0; // only the tile you're standing on can be picked up/read
  icon.className = "map-icon" + (isInteractive ? " interactive" : "");
  icon.style.left = toPercent(centerX - width / 2, VIEWPORT_WIDTH);
  icon.style.top = toPercent(bottomY - height, VIEWPORT_HEIGHT);
  icon.style.width = toPercent(width, VIEWPORT_WIDTH);
  icon.style.height = toPercent(height, VIEWPORT_HEIGHT);

  if (mapItem.icon) {
    // Real art: no fallback color underneath, or it would show through
    // the image's transparent areas as a solid-colored box instead of
    // letting the actual corridor behind it show through.
    icon.style.backgroundImage = "url('" + mapItem.icon + "')";
  } else {
    icon.style.backgroundColor = mapItem.color; // still-placeholder items only
  }
  icon.title = mapItem.name;
  if (isInteractive) {
    icon.addEventListener("click", () => handleMapIconClick(mapItem));
  }
  viewport.appendChild(icon);
}

// Draws the party panel: one clickable box per hero. Clicking a hero
// makes them "active" -- that's who picked-up items go to, and whose
// inventory the panel below shows.
function renderPartyPanel() {
  const panel = document.getElementById("party-panel");
  panel.innerHTML = "";

  party.forEach((hero, index) => {
    const box = document.createElement("div");
    box.className = "hero-box" + (index === activeHeroIndex ? " active" : "");
    box.innerHTML =
      '<div class="hero-name">' + hero.name + "</div>" +
      '<div class="hero-line">' + hero.line + " line</div>";
    box.addEventListener("click", () => {
      activeHeroIndex = index;
      renderPartyPanel();
      renderInventoryPanel();
    });
    panel.appendChild(box);
  });
}

// Draws the active hero's inventory: their two equip slots (weapon,
// armor -- the "paper doll", simplified to plain labeled boxes since
// there's no character art yet) plus their general item slots.
// A small icon thumbnail for an item, if it has one -- falls back to
// nothing (just the text name) for items without real art yet.
function itemIconHtml(item) {
  if (!item.icon) return "";
  return '<div class="slot-icon" style="background-image:url(\'' + item.icon + "')\"></div>";
}

function renderInventoryPanel() {
  const hero = getActiveHero();
  document.getElementById("inventory-hero-name").textContent = hero.name + "'s Inventory";

  const equipContainer = document.getElementById("inventory-equip-slots");
  equipContainer.innerHTML = "";
  ["weapon", "armor"].forEach((slotName) => {
    const item = hero.equipment[slotName];
    const slotEl = document.createElement("div");
    slotEl.className = "item-slot" + (item ? " filled" : "");
    slotEl.innerHTML =
      '<div class="slot-label">' + slotName + "</div>" + (item ? itemIconHtml(item) + item.name : "empty");
    if (item) {
      slotEl.addEventListener("click", () => unequipItem(hero, slotName));
    }
    equipContainer.appendChild(slotEl);
  });

  const generalContainer = document.getElementById("inventory-general-slots");
  generalContainer.innerHTML = "";
  hero.items.forEach((item, index) => {
    const slotEl = document.createElement("div");
    slotEl.className = "item-slot" + (item ? " filled" : "");
    slotEl.innerHTML = item ? itemIconHtml(item) + item.name : '<div class="slot-label">empty</div>';
    if (item) {
      slotEl.addEventListener("click", () => equipItem(hero, index));
    }
    generalContainer.appendChild(slotEl);
  });
}

function toggleInventory() {
  const panel = document.getElementById("inventory-panel");
  const opening = panel.classList.contains("hidden");
  panel.classList.toggle("hidden");
  if (opening) {
    renderInventoryPanel();
  }
}

// Draws the minimap: a small colored cell per map tile, plus a marker
// for the player's own position. Just a plain grid for now, per
// placeholder-first -- no map art exists yet.
function renderMinimap() {
  const grid = document.getElementById("minimap-grid");
  grid.innerHTML = "";

  if (!mapRevealed) {
    grid.textContent = "No map scroll found yet.";
    return;
  }

  dungeonMap.forEach((row, y) => {
    const rowEl = document.createElement("div");
    rowEl.className = "minimap-row";
    for (let x = 0; x < row.length; x++) {
      const tile = row[x];
      const cell = document.createElement("div");
      cell.className = "minimap-cell " + (tile === "#" ? "wall" : tile === "D" ? "door" : "floor");
      if (x === player.x && y === player.y) {
        cell.classList.add("player");
      }
      rowEl.appendChild(cell);
    }
    grid.appendChild(rowEl);
  });
}

function toggleMinimap() {
  const panel = document.getElementById("minimap-panel");
  panel.classList.toggle("hidden");
  renderMinimap();
}

// Generic popup for lore text -- also reused for small system messages
// like "inventory is full" rather than building a second message box.
function showMessage(text) {
  document.getElementById("lore-text").textContent = text;
  document.getElementById("lore-overlay").classList.remove("hidden");
}
function hideMessage() {
  document.getElementById("lore-overlay").classList.add("hidden");
}


// -------------------------------------------------------------------
// 4. CONTROLS
// -------------------------------------------------------------------
// Every control -- keyboard or on-screen button -- just calls one of
// the move/turn functions above, then re-renders. Input never touches
// game state directly; it only triggers the same handful of actions.

function handleForward() {
  move(1);
  renderCorridor();
}
function handleBackward() {
  move(-1);
  renderCorridor();
}
function handleTurnLeft() {
  turnLeft();
  renderCorridor();
}
function handleTurnRight() {
  turnRight();
  renderCorridor();
}

document.getElementById("btn-forward").addEventListener("click", handleForward);
document.getElementById("btn-backward").addEventListener("click", handleBackward);
document.getElementById("btn-turn-left").addEventListener("click", handleTurnLeft);
document.getElementById("btn-turn-right").addEventListener("click", handleTurnRight);

document.getElementById("btn-inventory").addEventListener("click", toggleInventory);
document.getElementById("btn-close-inventory").addEventListener("click", toggleInventory);
document.getElementById("btn-close-lore").addEventListener("click", hideMessage);
document.getElementById("btn-minimap").addEventListener("click", toggleMinimap);
document.getElementById("btn-close-minimap").addEventListener("click", toggleMinimap);

document.addEventListener("keydown", (event) => {
  // Only respond to movement keys once the game screen is visible --
  // no point moving the player while the start screen is still up.
  if (document.getElementById("game-screen").classList.contains("hidden")) {
    return;
  }
  switch (event.key) {
    case "w":
    case "ArrowUp":
      handleForward();
      break;
    case "s":
    case "ArrowDown":
      handleBackward();
      break;
    case "a":
    case "ArrowLeft":
      handleTurnLeft();
      break;
    case "d":
    case "ArrowRight":
      handleTurnRight();
      break;
    case "e":
    case "E":
      toggleInventory();
      break;
    case "m":
    case "M":
      toggleMinimap();
      break;
  }
});


// -------------------------------------------------------------------
// START SCREEN -> GAME SCREEN
// -------------------------------------------------------------------
document.getElementById("start-button").addEventListener("click", () => {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  renderPartyPanel();
  renderCorridor(); // draw the very first frame once the game screen appears
});
