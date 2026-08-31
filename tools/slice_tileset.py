"""
Slices Dad's composite wall-asset sheet into individual tile PNGs.

How this works: the composite sheet has a dark navy/black background
behind every tile, so each tile can be described as a simple pixel
rectangle (left, top, right, bottom) inside the sheet. We measured
those rectangles once (by finding the gaps of background color between
tiles) and hard-coded them below -- per the art pipeline described in
docs/01-requirements.md Section 7, each new composite sheet gets its
own per-sheet spec like this rather than trying to auto-detect grids
every time (the auto-detection got confused by dark pixels *inside*
some tiles, like the black archway and the corridor mockup, so a
hard-coded spec is more reliable than a fully automatic one).

Run it from the repo root:
    python3 tools/slice_tileset.py
"""

from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE_SHEET = REPO_ROOT / "assets" / "source-sheets" / "wall-assets-dm-clone.jpg"
OUTPUT_DIR = REPO_ROOT / "assets" / "tiles"

# Each entry: (output filename, left, top, right, bottom)
# Coordinates are pixel positions in the source sheet.
TILES = [
    # Row 1
    ("wall_plain_01.png", 34, 70, 229, 258),
    ("wall_cracked_01.png", 260, 70, 456, 258),
    ("wall_plain_02.png", 950, 70, 1145, 258),
    ("wall_mossy_01.png", 1177, 70, 1371, 258),
    # Row 2
    ("wall_cracked_holes_01.png", 34, 287, 229, 492),
    ("wall_mossy_02.png", 260, 287, 456, 492),
    ("door_wood_01.png", 950, 287, 1145, 492),
    ("archway_open_01.png", 1177, 287, 1371, 492),
    # Row 3
    ("wall_window_potion_01.png", 34, 527, 229, 710),
    ("wall_cracked_02.png", 260, 527, 456, 710),
    ("wall_window_barred_01.png", 491, 527, 686, 710),
    ("wall_portcullis_01.png", 720, 527, 915, 710),
    ("wall_gargoyle_01.png", 950, 527, 1145, 710),
    ("wall_torch_01.png", 1177, 527, 1371, 710),
]

# The big corridor mockup isn't a reusable tile (it's a pre-built scene,
# not something we can tile or reuse piece by piece) -- saved separately
# as an art-direction reference instead of going in assets/tiles/.
REFERENCE_IMAGE = ("corridor_reference_mockup.png", 491, 70, 915, 492)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SOURCE_SHEET).convert("RGB")

    for filename, left, top, right, bottom in TILES:
        tile = sheet.crop((left, top, right, bottom))
        tile.save(OUTPUT_DIR / filename)
        print("Saved", filename, tile.size)

    ref_name, left, top, right, bottom = REFERENCE_IMAGE
    reference_dir = REPO_ROOT / "assets" / "source-sheets"
    sheet.crop((left, top, right, bottom)).save(reference_dir / ref_name)
    print("Saved reference image", ref_name)


if __name__ == "__main__":
    main()
