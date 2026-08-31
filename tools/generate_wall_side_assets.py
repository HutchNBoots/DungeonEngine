"""
Pre-warps the flat wall texture into 4 correctly-tapered side-wall
images (WALL-SIDE-0..3 from docs/06-corridor-view-assets.md).

Why this needs to exist: the corridor renderer already cuts each wall
piece into a trapezoid shape using CSS clip-path, which gets the
*silhouette* right. But clip-path only crops a flat repeating image --
it doesn't warp what's printed on it, so the brick pattern stayed the
same size all the way across each piece instead of shrinking toward
the far edge. A real receding wall is a flat rectangle in the world,
seen at an angle -- that's a perspective (projective) transform of a
rectangle onto a trapezoid, and this script does exactly that with
Pillow, once, offline, so the browser just displays an image that
already has the correct taper baked into its pixels.

How the geometry lines up with game.js: RECT_SIZES and get_rect()
below are copied from the RECT_SIZES / getRect() in game.js on
purpose -- these images are only correct because they use the exact
same near/far rectangles the renderer positions them at. If that
shrink curve ever changes in game.js, it needs to change here too.

Run it from the repo root:
    python3 tools/generate_wall_side_assets.py
"""

from pathlib import Path
import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE_TEXTURE = REPO_ROOT / "assets" / "tiles" / "wall_plain_01.png"
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

# How many times the texture repeats across one depth band before
# warping -- controls how many brick courses you see receding within
# a single band. Purely a look-and-feel number, easy to change.
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
    """
    Solves for the 8 coefficients Pillow's Image.transform(...,
    Image.PERSPECTIVE, ...) needs. Standard recipe: build the linear
    system that maps each dest point to its matching src point, then
    solve it. (Pillow wants dest->source coefficients, which is why
    dest_points come first here even though we're conceptually
    "placing" src_points onto dest_points.)
    """
    matrix = []
    for (x, y), (src_x, src_y) in zip(dest_points, src_points):
        matrix.append([x, y, 1, 0, 0, 0, -src_x * x, -src_x * y])
        matrix.append([0, 0, 0, x, y, 1, -src_y * x, -src_y * y])
    a = np.array(matrix, dtype=float)
    b = np.array(src_points, dtype=float).reshape(8)
    return np.linalg.solve(a, b).tolist()


def warp_side_wall(depth, source):
    """
    Builds the WALL-SIDE image for one depth band (depth -> depth+1).
    This is the LEFT wall's shape; the right wall is just this image
    mirrored horizontally (done in CSS, not here -- no need for a
    second file).
    """
    near = get_rect(depth)
    far = get_rect(depth + 1)

    bbox_w = far["left"] - near["left"]
    bbox_h = near["bottom"] - near["top"]

    # The 4 corners of the trapezoid, in this image's own local pixel
    # coordinates (near edge is always the left edge, full height --
    # far edge sits at the right edge, inset top and bottom).
    near_top_local = (0, 0)
    near_bottom_local = (0, bbox_h)
    far_bottom_local = (bbox_w, far["bottom"] - near["top"])
    far_top_local = (bbox_w, far["top"] - near["top"])

    # Repeat the texture horizontally before warping -- this is what
    # a real flat wall extending into the distance actually is: the
    # same brick pattern repeated along its length, then viewed at an
    # angle. Warping a single un-repeated tile would just stretch one
    # brick across the whole wall instead of showing several,
    # shrinking, receding ones.
    src_w, src_h = source.size
    strip = Image.new("RGB", (src_w * TILE_COUNT, src_h))
    for i in range(TILE_COUNT):
        strip.paste(source, (i * src_w, 0))
    strip_w, strip_h = strip.size

    dest_points = [near_top_local, near_bottom_local, far_bottom_local, far_top_local]
    src_points = [(0, 0), (0, strip_h), (strip_w, strip_h), (strip_w, 0)]
    coeffs = find_perspective_coeffs(dest_points, src_points)

    out_w, out_h = round(bbox_w), round(bbox_h)
    return strip.transform((out_w, out_h), Image.PERSPECTIVE, coeffs, resample=Image.BICUBIC)


def main():
    source = Image.open(SOURCE_TEXTURE).convert("RGB")
    for depth in range(len(RECT_SIZES) - 1):
        warped = warp_side_wall(depth, source)
        out_path = OUTPUT_DIR / ("wall_side_depth" + str(depth) + ".png")
        warped.save(out_path)
        print("Saved", out_path.name, warped.size)

        # The right wall is a mirror image of the left wall at the same
        # depth -- no need to warp it separately, just flip the result.
        mirrored = warped.transpose(Image.FLIP_LEFT_RIGHT)
        mirrored_path = OUTPUT_DIR / ("wall_side_depth" + str(depth) + "_mirrored.png")
        mirrored.save(mirrored_path)
        print("Saved", mirrored_path.name, mirrored.size)


if __name__ == "__main__":
    main()
