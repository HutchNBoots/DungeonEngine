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
// The trick: we don't draw one 3D scene. We draw a stack of flat
// "picture frames," one per step of depth ahead of the player, each
// one smaller than the last. Nested inside each other, they fake the
// look of a hallway stretching away from you -- this is how the
// original Dungeon Master-style engines did it.
//
// Sizes below are placeholders for now (see style.css note at the top
// of that file) -- the numbers just control how big each depth frame
// is on screen, not what it looks like.
const DEPTH_CONFIG = [
  { width: 640, height: 480, wallW: 160, capH: 140 }, // depth 0: right in front of you
  { width: 440, height: 340, wallW: 110, capH: 100 }, // depth 1
  { width: 300, height: 230, wallW: 75, capH: 68 },   // depth 2
  { width: 190, height: 145, wallW: 48, capH: 44 },   // depth 3: farthest we'll draw
];

// Turns the abstract facing number into "which direction is to my left"
// and "which direction is to my right" -- needed to know whether to
// draw a side wall at each depth.
function leftOfFacing(facing) {
  return (facing + 3) % 4;
}
function rightOfFacing(facing) {
  return (facing + 1) % 4;
}

// Makes one positioned div and appends it to a parent. `styles` is a
// plain object of CSS properties, so callers can just describe the
// box they want (position, size, color) without repeating boilerplate.
function makeBox(className, styles, parent) {
  const box = document.createElement("div");
  box.className = className;
  Object.assign(box.style, styles);
  parent.appendChild(box);
  return box;
}

// Builds and displays the corridor view for the player's current
// position + facing. Called every time the player moves or turns.
function renderCorridor() {
  const viewport = document.getElementById("viewport");
  viewport.innerHTML = ""; // clear last frame before drawing the new one

  const facingDir = DIRECTIONS[player.facing];
  const leftDir = DIRECTIONS[leftOfFacing(player.facing)];
  const rightDir = DIRECTIONS[rightOfFacing(player.facing)];

  // We build each depth layer's div and remember it in this array so
  // that, once we know how many depths we actually got to see, we can
  // add them to the page in the right order (farthest first). Adding
  // farthest-first means each nearer layer naturally overlaps/covers
  // the one behind it -- no z-index juggling needed.
  const layers = [];

  for (let depth = 0; depth < DEPTH_CONFIG.length; depth++) {
    const config = DEPTH_CONFIG[depth];

    // The tile the player would be standing on if they walked `depth`
    // steps forward from where they are now.
    const cellX = player.x + facingDir.dx * depth;
    const cellY = player.y + facingDir.dy * depth;

    const layer = document.createElement("div");
    layer.className = "depth-layer";
    layer.style.width = config.width + "px";
    layer.style.height = config.height + "px";

    // Ceiling and floor strips are always drawn -- every corridor tile
    // has both.
    makeBox("wall-ceiling", { height: config.capH + "px" }, layer);
    makeBox("wall-floor", { height: config.capH + "px" }, layer);

    // Only draw a side wall if that neighboring tile is actually a wall.
    // If it's open floor, we leave that side see-through for now --
    // rendering side-passages is a later problem, not MVP1's job.
    if (isWall(cellX + leftDir.dx, cellY + leftDir.dy)) {
      makeBox("wall-left", { width: config.wallW + "px" }, layer);
    }
    if (isWall(cellX + rightDir.dx, cellY + rightDir.dy)) {
      makeBox("wall-right", { width: config.wallW + "px" }, layer);
    }

    // Check one tile further ahead: if THAT'S a wall, the corridor
    // dead-ends here. We draw a forward-facing wall to cap it off, and
    // stop looping -- there's nothing further to see past a wall.
    const nextX = cellX + facingDir.dx;
    const nextY = cellY + facingDir.dy;
    const blocked = isWall(nextX, nextY);

    if (blocked) {
      makeBox(
        "wall-forward",
        {
          top: config.capH + "px",
          left: config.wallW + "px",
          width: config.width - config.wallW * 2 + "px",
          height: config.height - config.capH * 2 + "px",
        },
        layer
      );
    }

    layers.push(layer);

    if (blocked) break; // corridor ends here, don't render deeper depths
  }

  // Append farthest-away layer first, nearest layer last, so nearer
  // frames visually sit on top of (and partially hide) farther ones.
  for (let i = layers.length - 1; i >= 0; i--) {
    viewport.appendChild(layers[i]);
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
