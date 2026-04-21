#!/usr/bin/env python3
"""Generate placeholder PWA icons (192x192 and 512x512 PNG)"""
from PIL import Image, ImageDraw
import sys

def create_icon(size, output_path):
    """Create a placeholder icon with blue background and shield+heart+wave"""
    # Create image with light blue background
    img = Image.new('RGBA', (size, size), (227, 242, 253, 255))  # #E3F2FD
    draw = ImageDraw.Draw(img)
    
    # Scale values based on size
    scale = size / 192
    center = size // 2
    outer_circle_r = int(75 * scale)
    stroke_width = int(3 * scale)
    
    # Draw outer blue circle
    circle_bbox = [
        center - outer_circle_r,
        center - outer_circle_r,
        center + outer_circle_r,
        center + outer_circle_r
    ]
    draw.ellipse(circle_bbox, outline=(33, 150, 243, 255), width=stroke_width)
    
    # Draw shield outline
    shield_left = center - int(31 * scale)
    shield_right = center + int(31 * scale)
    shield_top = center - int(56 * scale)
    shield_mid = center + int(35 * scale)
    
    # Shield polygon
    shield_points = [
        (center, shield_top),                    # top center
        (shield_left, center - int(36 * scale)),  # top-left
        (shield_left, center - int(1 * scale)),   # mid-left
        (center, shield_mid),                    # bottom center
        (shield_right, center - int(1 * scale)),  # mid-right
        (shield_right, center - int(36 * scale)), # top-right
    ]
    draw.polygon(shield_points, outline=(33, 150, 243, 255), width=stroke_width)
    
    # Draw heart inside shield
    heart_cx = center
    heart_top = center - int(26 * scale)
    heart_bottom = center + int(43 * scale)
    heart_left = center - int(16 * scale)
    heart_right = center + int(16 * scale)
    
    # Simple heart shape
    heart_points = [
        (heart_cx, heart_bottom),
        (heart_left, heart_top + int(15 * scale)),
        (heart_left - int(8 * scale), heart_top + int(8 * scale)),
        (heart_left - int(8 * scale), heart_top),
        (heart_cx - int(4 * scale), heart_top - int(8 * scale)),
        (heart_cx, heart_top),
        (heart_cx + int(4 * scale), heart_top - int(8 * scale)),
        (heart_right + int(8 * scale), heart_top),
        (heart_right + int(8 * scale), heart_top + int(8 * scale)),
        (heart_right, heart_top + int(15 * scale)),
    ]
    draw.polygon(heart_points, fill=(244, 67, 54, 255))  # #F44336
    
    # Draw wave at bottom
    wave_top = center + int(34 * scale)
    wave_height = int(6 * scale)
    wave_width = int(20 * scale)
    
    # Draw simple wave pattern (three peaks)
    for wave_x in range(shield_left, shield_right, wave_width):
        draw.arc(
            [wave_x, wave_top, wave_x + wave_width, wave_top + wave_height * 2],
            0, 180,
            fill=(33, 150, 243, 255),
            width=int(2 * scale)
        )
    
    # Save with anti-aliasing
    img = img.resize((size, size), Image.LANCZOS)
    img.save(output_path, 'PNG')
    print(f"✓ Created {output_path} ({size}x{size})")

if __name__ == '__main__':
    try:
        create_icon(192, 'frontend-pwa/public/icons/icon-192.png')
        create_icon(512, 'frontend-pwa/public/icons/icon-512.png')
        print("\n✓ PWA icons created successfully!")
    except ImportError:
        print("ERROR: PIL (Pillow) not installed. Installing now...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
        create_icon(192, 'frontend-pwa/public/icons/icon-192.png')
        create_icon(512, 'frontend-pwa/public/icons/icon-512.png')
        print("\n✓ PWA icons created successfully!")
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
