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
// '#' = wall, '.' = floor. This is a TEST layout for building/testing
// the movement + rendering engine -- it is NOT the real Chapter 1
// layout yet. Swap this out once the actual chapter map is designed.
//
// Row 0 is the top of the map. dungeonMap[y][x] gives the tile at
// column x, row y.
const dungeonMap = [
  "##########",
  "#........#",
  "#.######.#",
  "#.#....#.#",
  "#.#.##.#.#",
  "#.#.#..#.#",
  "#.#.#.##.#",
  "#...#....#",
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
  return tile === "#";
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

// A see-through black layer drawn on top of the texture, darker at
// greater depth. Stacking a gradient over an image like this is how
// you tint a background-image in CSS -- there's no direct way to
// "darken an image" the way shadeFor() darkens a plain color.
function fogOverlayFor(depth) {
  const darkness = Math.min(depth * 0.22, 0.82);
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

// Builds and displays the corridor view for the player's current
// position + facing. Called every time the player moves or turns.
function renderCorridor() {
  const viewport = document.getElementById("viewport");
  viewport.innerHTML = ""; // clear last frame before drawing the new one

  const facingDir = DIRECTIONS[player.facing];
  const leftDir = DIRECTIONS[leftOfFacing(player.facing)];
  const rightDir = DIRECTIONS[rightOfFacing(player.facing)];

  for (let depth = 0; depth < RECT_SIZES.length - 1; depth++) {
    const near = getRect(depth);
    const far = getRect(depth + 1);

    // The tile the player would be standing on if they walked `depth`
    // steps forward from where they are now.
    const cellX = player.x + facingDir.dx * depth;
    const cellY = player.y + facingDir.dy * depth;

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
    makeSurfacePiece(
      "floor",
      depth,
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

    // Check one tile further ahead: if THAT'S a wall, the corridor
    // dead-ends here. We fill in the far rectangle as a flat wall
    // facing the player, and stop -- there's nothing further to see
    // past a wall.
    const nextX = cellX + facingDir.dx;
    const nextY = cellY + facingDir.dy;
    if (isWall(nextX, nextY)) {
      makeSurfacePiece(
        "forward",
        depth + 1,
        [
          [far.left, far.top],
          [far.right, far.top],
          [far.right, far.bottom],
          [far.left, far.bottom],
        ],
        viewport
      );
      break;
    }
  }

  updateDebugLine();
}

function updateDebugLine() {
  const debugLine = document.getElementById("debug-line");
  const facingName = DIRECTIONS[player.facing].name;
  debugLine.textContent =
    "x: " + player.x + "  y: " + player.y + "  facing: " + facingName;
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
  }
});


// -------------------------------------------------------------------
// START SCREEN -> GAME SCREEN
// -------------------------------------------------------------------
document.getElementById("start-button").addEventListener("click", () => {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  renderCorridor(); // draw the very first frame once the game screen appears
});
