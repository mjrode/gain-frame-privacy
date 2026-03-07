#!/usr/bin/env python3
"""Generate all favicon sizes from the GainFrame 2.0 logo.

Replaces all existing favicon assets in /assets/ with the new icon.
Backs up originals to /assets/favicon-backup/ first.

Run: python3 brand/generate-favicons.py
"""

from PIL import Image
import os
import shutil
import struct

ROOT = '/Users/michael.rode/code/project/gain-frame-privacy'
SRC = os.path.join(ROOT, 'brand', 'gainframe-icon-2.0-1024.png')
ASSETS = os.path.join(ROOT, 'assets')
BACKUP = os.path.join(ASSETS, 'favicon-backup')

# --- Step 1: Backup existing favicons ---
os.makedirs(BACKUP, exist_ok=True)
for f in os.listdir(ASSETS):
    if f.startswith('favicon') and not os.path.isdir(os.path.join(ASSETS, f)):
        src = os.path.join(ASSETS, f)
        dst = os.path.join(BACKUP, f)
        if not os.path.exists(dst):
            shutil.copy2(src, dst)
            print(f"  Backed up: {f}")

# Also backup favicon.ico from root
ico_src = os.path.join(ROOT, 'favicon.ico')
ico_bak = os.path.join(BACKUP, 'favicon.ico')
if os.path.exists(ico_src) and not os.path.exists(ico_bak):
    shutil.copy2(ico_src, ico_bak)
    print("  Backed up: favicon.ico (root)")

print("✅ Backups saved to assets/favicon-backup/\n")

# --- Step 2: Load source image ---
print("Loading source image...")
img = Image.open(SRC).convert('RGBA')

# Add white background (source might have transparency)
bg = Image.new('RGBA', img.size, (255, 255, 255, 255))
bg.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
img = bg.convert('RGB')

print(f"Source: {img.size[0]}x{img.size[1]}\n")

# --- Step 3: Generate PNG favicons ---
sizes = {
    'favicon-48.png': 48,
    'favicon-96.png': 96,
    'favicon-192.png': 192,
    'favicon-512.png': 512,
    'favicon.png': 1024,  # full size
}

for filename, size in sizes.items():
    resized = img.resize((size, size), Image.LANCZOS)
    out = os.path.join(ASSETS, filename)
    resized.save(out, 'PNG', optimize=True)
    print(f"  ✅ {filename} ({size}x{size}) — {os.path.getsize(out):,} bytes")

# --- Step 4: Generate WebP favicons ---
webp_sizes = {
    'favicon-48.webp': 48,
    'favicon-192.webp': 192,
    'favicon.webp': 512,  # used as nav icon and structured data logo
}

for filename, size in webp_sizes.items():
    resized = img.resize((size, size), Image.LANCZOS)
    out = os.path.join(ASSETS, filename)
    resized.save(out, 'WEBP', quality=90, method=6)
    print(f"  ✅ {filename} ({size}x{size}) — {os.path.getsize(out):,} bytes")

# --- Step 5: Generate favicon.ico (16x16 + 32x32 multi-icon) ---
ico_path = os.path.join(ROOT, 'favicon.ico')
img16 = img.resize((16, 16), Image.LANCZOS)
img32 = img.resize((32, 32), Image.LANCZOS)
img16.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32)])
print(f"  ✅ favicon.ico (16+32) — {os.path.getsize(ico_path):,} bytes")

# --- Step 6: Save original source as favicon-original.jpg ---
orig_out = os.path.join(ASSETS, 'favicon-original.jpg')
img.save(orig_out, 'JPEG', quality=95)
print(f"  ✅ favicon-original.jpg — {os.path.getsize(orig_out):,} bytes")

print("\n🎉 All favicons generated! Test locally with:")
print("   cd ~/code/project/gain-frame-privacy && python3 -m http.server 8000")
print("   Then open http://localhost:8000")
