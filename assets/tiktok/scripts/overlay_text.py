#!/usr/bin/env python3
import argparse
import os
import textwrap
from PIL import Image, ImageDraw, ImageFont

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except IOError:
        print(f"Warning: Font {path} not found. Falling back to default.")
        return ImageFont.load_default()

def wrap_text(text, font, max_width):
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        current_line.append(word)
        # Check width
        bbox = font.getbbox(" ".join(current_line))
        w = bbox[2] - bbox[0]
        if w > max_width:
            if len(current_line) == 1:
                lines.append(" ".join(current_line))
                current_line = []
            else:
                current_line.pop()
                lines.append(" ".join(current_line))
                current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def process_cover(img, draw, title, accent, fonts, padding_top=150):
    impact_font = fonts['anton']
    
    # Safe zone for cover is middle 60% of 1080 (so max width is 648px)
    max_w = 648
    lines = wrap_text(title, impact_font, max_w)
    
    y = padding_top
    for line in lines:
        # Measure line width to center it
        bbox = impact_font.getbbox(line)
        line_w = bbox[2] - bbox[0]
        line_h = bbox[3] - bbox[1]
        
        x = (1080 - line_w) // 2
        
        # Word by word rendering for accent color
        words = line.split()
        for word in words:
            # Simple check if accent word in word
            color = "#E53935" if accent and accent.upper() in word.upper() else "#2A2A2A"
            draw.text((x, y), word, font=impact_font, fill=color)
            
            # advance x
            w_bbox = impact_font.getbbox(word + " ")
            x += w_bbox[2] - w_bbox[0]
            
        y += line_h * 1.2 # line spacing

def draw_pill(draw, text, font, x_center, y, padding_x=40, padding_y=20):
    bbox = font.getbbox(text)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    
    # Draw pill
    rect_x1 = x_center - (w // 2) - padding_x
    rect_y1 = y - padding_y
    rect_x2 = x_center + (w // 2) + padding_x
    rect_y2 = y + h + padding_y
    
    # Pill logic with rounded rectangle
    radius = (rect_y2 - rect_y1) // 2
    draw.rounded_rectangle([rect_x1, rect_y1, rect_x2, rect_y2], radius=radius, fill="#2A2A2A")
    
    # Draw text
    draw.text((x_center - w//2, y), text, font=font, fill="#FFFFFF")
    
    return rect_y2 # Return bottom Y for next element

def process_slide(img, draw, title, subtitle, fonts, padding_top=120):
    anton_font = fonts['anton_slide']
    roboto_font = fonts['roboto']
    
    # Draw Title Pill
    bottom_y = draw_pill(draw, title, anton_font, 1080 // 2, padding_top)
    
    # Draw Subtitle
    if subtitle:
        sub_y = bottom_y + 30
        lines = wrap_text(subtitle, roboto_font, 800) # 800px max width for subtitle
        for line in lines:
            bbox = roboto_font.getbbox(line)
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
            draw.text(((1080 - w) // 2, sub_y), line, font=roboto_font, fill="#2A2A2A")
            sub_y += h * 1.3

def main():
    parser = argparse.ArgumentParser(description="Overlay typography on GainFrame TikTok Carousel slides")
    parser.add_argument("image", help="Path to input image")
    parser.add_argument("--type", choices=['cover', 'slide'], required=True)
    parser.add_argument("--title", required=True, help="Title text (shouting/all caps)")
    parser.add_argument("--accent", help="Accent word to color red (only for cover slides)")
    parser.add_argument("--subtitle", help="Subtitle text (only for numbered slides)")
    args = parser.parse_args()

    # Load image
    try:
        img = Image.open(args.image).convert("RGBA")
    except Exception as e:
        print(f"Error opening image: {e}")
        return

    # Create drawing context
    draw = ImageDraw.Draw(img)

    # Resolve paths
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    fonts_dir = os.path.join(base_dir, "gf-mascot", "fonts")
    
    # Load fonts
    fonts = {
        'anton': get_font(os.path.join(fonts_dir, "Anton-Regular.ttf"), 140), # Huge for covers
        'anton_slide': get_font(os.path.join(fonts_dir, "Anton-Regular.ttf"), 80), # Smaller for pill
        'roboto': get_font(os.path.join(fonts_dir, "Roboto-Medium.ttf"), 50)
    }

    # Process based on type
    if args.type == 'cover':
        process_cover(img, draw, args.title, args.accent, fonts)
    elif args.type == 'slide':
        process_slide(img, draw, args.title, args.subtitle, fonts)

    # Add the badge to the top left
    badge_path = os.path.join(base_dir, "gf-mascot", "gary-badge.png")
    if os.path.exists(badge_path):
        badge = Image.open(badge_path).convert("RGBA")
        # Resize to 10% of width (1080 * 0.12 ~ 130px)
        basewidth = 130
        wpercent = (basewidth / float(badge.size[0]))
        hsize = int((float(badge.size[1]) * float(wpercent)))
        badge = badge.resize((basewidth, hsize), Image.Resampling.LANCZOS)
        
        # Paste with transparency mask
        img.paste(badge, (40, 40), badge)
    else:
        print(f"Warning: Badge not found at {badge_path}")

    # Convert back to RGB and save
    out_img = img.convert("RGB")
    out_name = args.image.replace(".png", "_styled.png").replace(".jpg", "_styled.jpg")
    out_img.save(out_name)
    print(f"Saved styled image to {out_name}")

if __name__ == "__main__":
    main()
