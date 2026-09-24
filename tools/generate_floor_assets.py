"""
Pre-warps the flat floor texture into 4 correctly-tapered floor
images (FLOOR-0..3 from docs/06-corridor-view-assets.md), the same
idea as tools/generate_wall_side_assets.py but rotated: a floor piece
tapers top-to-bottom (full width close to the player, narrower higher
up/farther away) instead of left-to-right like a side wall does.

Why this needs to exist: same reasoning as the wall script -- CSS
clip-path only crops the flat texture into the right trapezoid
silhouette, it doesn't shrink the flagstone pattern toward the far
edge. This warps it for real, once, offline, so the browser just
displays an image that's already correctly tapered.

Geometry must match RECT_SIZES / getRect() in src/game.js exactly --
same copy-paste-on-purpose note as the wall script.

Run it from the repo root:
    python3 tools/generate_floor_assets.py
"""

from pathlib import Path
import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE_TEXTURE = REPO_ROOT / "assets" / "tiles" / "floor_plain_01.png"
OUTPUT_DIR = REPO_ROOT / "assets" / "tiles"

VIEWPORT_W, VIEWPORT_H = 640, 480

# Must match RECT_SIZES in src/game.js exactly.
RECT_SIZES = [
    (640, 480),
    (460, 350),
    (320, 250),
    (210, 170),
    (130, 108),
]

# How many flagstone repeats you see receding within one depth band --
# same idea as TILE_COUNT in the wall script, just tiled vertically
# (the floor's own "depth" direction) instead of horizontally.
TILE_COUNT = 3


def get_rect(index):
    width, height = RECT_SIZES[index]
    left = (VIEWPORT_W - width) / 2
    top = (VIEWPORT_H - height) / 2
    return {
        "left": left,
        "top": top,
        "right": VIEWPORT_W - left,
        "bottom": VIEWPORT_H - top,
    }


def find_perspective_coeffs(dest_points, src_points):
    """Same recipe as generate_wall_side_assets.py -- see its docstring."""
    matrix = []
    for (x, y), (src_x, src_y) in zip(dest_points, src_points):
        matrix.append([x, y, 1, 0, 0, 0, -src_x * x, -src_x * y])
        matrix.append([0, 0, 0, x, y, 1, -src_y * x, -src_y * y])
    a = np.array(matrix, dtype=float)
    b = np.array(src_points, dtype=float).reshape(8)
    return np.linalg.solve(a, b).tolist()


def warp_floor(depth, source):
    """
    Builds the FLOOR image for one depth band (depth -> depth+1).
    Ceiling can reuse this once ceiling art exists -- it's the same
    shape upside down, so the same warp with a vertically-flipped
    source would work, not written yet since there's no ceiling
    texture to warp.
    """
    near = get_rect(depth)
    far = get_rect(depth + 1)

    bbox_w = near["right"] - near["left"]  # near edge is the wide one
    bbox_h = near["bottom"] - far["bottom"]

    # Corners of the trapezoid in this image's own local pixel
    # coordinates. Near edge (bottom, full width) to far edge (top,
    # inset both sides).
    near_left_local = (0, bbox_h)
    near_right_local = (bbox_w, bbox_h)
    far_right_local = (far["right"] - near["left"], 0)
    far_left_local = (far["left"] - near["left"], 0)

    # Tile vertically -- this is the floor's own "receding into the
    # distance" direction, same role TILE_COUNT plays horizontally for
    # the wall script.
    src_w, src_h = source.size
    strip = Image.new("RGB", (src_w, src_h * TILE_COUNT))
    for i in range(TILE_COUNT):
        strip.paste(source, (0, i * src_h))
    strip_w, strip_h = strip.size

    dest_points = [near_left_local, near_right_local, far_right_local, far_left_local]
    src_points = [(0, strip_h), (strip_w, strip_h), (strip_w, 0), (0, 0)]
    coeffs = find_perspective_coeffs(dest_points, src_points)

    out_w, out_h = round(bbox_w), round(bbox_h)
    return strip.transform((out_w, out_h), Image.PERSPECTIVE, coeffs, resample=Image.BICUBIC)


def main():
    source = Image.open(SOURCE_TEXTURE).convert("RGB")
    for depth in range(len(RECT_SIZES) - 1):
        warped = warp_floor(depth, source)
        out_path = OUTPUT_DIR / ("floor_depth" + str(depth) + ".png")
        warped.save(out_path)
        print("Saved", out_path.name, warped.size)


if __name__ == "__main__":
    main()
