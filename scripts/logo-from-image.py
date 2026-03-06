#!/usr/bin/env python3
"""將刺猬圖去背（橙褐/米色背景變透明），置中輸出為各尺寸 ic_launcher_foreground。"""
import os
from PIL import Image

# 橙褐色背景視為透明
BG_THRESHOLD = 200  # 灰度高於此視為背景
BG_SATURATION = 0.4  # 低飽和+偏橙也視為背景

def make_transparent(in_path: str, out_path: str) -> Image.Image:
    img = Image.open(in_path).convert("RGBA")
    w, h = img.size
    data = img.getdata()
    new = []
    for r, g, b, a in data:
        gray = (r + g + b) / 3
        if gray >= BG_THRESHOLD:
            new.append((r, g, b, 0))
        elif gray >= BG_THRESHOLD - 40:
            t = (gray - (BG_THRESHOLD - 40)) / 40
            new.append((r, g, b, int(a * (1 - t))))
        else:
            new.append((r, g, b, a))
    img.putdata(new)
    img.save(out_path, "PNG")
    return img

def center_on_canvas(src: Image.Image, size: int) -> Image.Image:
    """將圖片縮放並置中於 size x size 透明畫布（適應 Android 圖標安全區）。"""
    src = src.convert("RGBA")
    # 縮放到約 72% 以留邊距（對應 66dp 安全區）
    scale = (size * 0.72) / max(src.size)
    new_w = int(src.size[0] * scale)
    new_h = int(src.size[1] * scale)
    src = src.resize((new_w, new_h), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - src.size[0]) // 2
    y = (size - src.size[1]) // 2
    out.paste(src, (x, y), src)
    return out

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src = os.path.join(base, "public", "ip", "logo-hedgehog.png")
    tmp = os.path.join(base, "public", "ip", "logo-hedgehog-transparent.png")
    if not os.path.isfile(src):
        print("找不到:", src)
        return
    make_transparent(src, tmp)
    img = Image.open(tmp).convert("RGBA")
    # Android mipmap 尺寸 (px)
    sizes = [
        (48, "mipmap-mdpi"),
        (72, "mipmap-hdpi"),
        (96, "mipmap-xhdpi"),
        (144, "mipmap-xxhdpi"),
        (192, "mipmap-xxxhdpi"),
    ]
    res = os.path.join(base, "android", "app", "src", "main", "res")
    for size, folder in sizes:
        out_img = center_on_canvas(img, size)
        path = os.path.join(res, folder, "ic_launcher_foreground.png")
        out_img.save(path, "PNG")
        print("已寫入:", path)
    # drawable-nodpi 用較大圖（適配多解析度）
    path_nodpi = os.path.join(res, "drawable-nodpi", "ic_launcher_foreground.png")
    center_on_canvas(img, 432).save(path_nodpi, "PNG")
    print("已寫入:", path_nodpi)

if __name__ == "__main__":
    main()
