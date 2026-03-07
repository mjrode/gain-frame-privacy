#!/usr/bin/env python3
"""Convert GainFrame logo PNG/JPEG to multi-color SVG using potrace."""

import numpy as np
from PIL import Image
import subprocess
import os
import re

# --- Config ---
SRC = '/Users/michael.rode/code/project/gain-frame-privacy/gainframe-icon-2.0'
OUT_DIR = '/Users/michael.rode/code/project/gain-frame-privacy/tiktok'

print("Loading image...")
img = np.array(Image.open(SRC).convert('RGB'))
h, w = img.shape[:2]
print(f"Image size: {w}x{h}")

r, g, b = img[:,:,0], img[:,:,1], img[:,:,2]

# Separate black and red channels
black_mask = (r < 80) & (g < 80) & (b < 80)
red_mask = (r > 150) & (g < 80) & (b < 80)

print(f"Black pixels: {black_mask.sum()}, Red pixels: {red_mask.sum()}")

# Convert to 1-bit PBM for potrace (0=black, 255=white in PIL)
black_pbm = Image.fromarray((~black_mask).astype(np.uint8) * 255, mode='L').convert('1')
red_pbm = Image.fromarray((~red_mask).astype(np.uint8) * 255, mode='L').convert('1')

black_pbm.save('/tmp/gf_black.pbm')
red_pbm.save('/tmp/gf_red.pbm')
print("PBM files created")

# Run potrace on each color channel
print("Running potrace...")
subprocess.run([
    'potrace', '/tmp/gf_black.pbm', '-s', '-o', '/tmp/gf_black.svg',
    '--turdsize', '30', '--alphamax', '1.0', '--opttolerance', '0.2'
], check=True)
subprocess.run([
    'potrace', '/tmp/gf_red.pbm', '-s', '-o', '/tmp/gf_red.svg',
    '--turdsize', '30', '--alphamax', '1.0', '--opttolerance', '0.2'
], check=True)
print("Potrace done")

# Read SVG outputs
with open('/tmp/gf_black.svg') as f:
    black_svg = f.read()
with open('/tmp/gf_red.svg') as f:
    red_svg = f.read()

# Extract <g> content from each
def get_g_content(svg):
    match = re.search(r'<g([^>]*)>(.*?)</g>', svg, re.DOTALL)
    if match:
        return match.group(1), match.group(2)
    return '', ''

# Get viewBox from black SVG
vb = re.search(r'(width="[^"]*"\s*height="[^"]*"\s*viewBox="[^"]*")', black_svg)
vb_str = vb.group(1) if vb else f'width="{w}" height="{h}" viewBox="0 0 {w} {h}"'

black_attrs, black_paths = get_g_content(black_svg)
red_attrs, red_paths = get_g_content(red_svg)

# Combine into one multi-color SVG
combined = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" {vb_str}>
<g{black_attrs} fill="#1A1A1A">
{black_paths}
</g>
<g{red_attrs} fill="#E53935">
{red_paths}
</g>
</svg>'''

svg_out = os.path.join(OUT_DIR, 'gainframe-icon-2.0.svg')
with open(svg_out, 'w') as f:
    f.write(combined)
print(f"\n✅ SVG saved: {svg_out} ({os.path.getsize(svg_out):,} bytes)")

# Also save a clean 1024x1024 PNG
orig = Image.open(SRC).convert('RGB')
resized = orig.resize((1024, 1024), Image.LANCZOS)
png_out = os.path.join(OUT_DIR, 'gainframe-icon-2.0-1024.png')
resized.save(png_out, 'PNG')
print(f"✅ PNG saved: {png_out} ({os.path.getsize(png_out):,} bytes)")

print("\nDone! Open the SVG in your browser or Figma to verify.")
