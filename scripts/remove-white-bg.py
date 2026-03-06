#!/usr/bin/env python3
"""去除圖片白色背景，輸出透明 PNG。用法: python3 remove-white-bg.py <輸入> [輸出]"""
import sys
from typing import Optional
from PIL import Image

def remove_white(in_path: str, out_path: Optional[str] = None, threshold: int = 235) -> None:
    out_path = out_path or in_path
    img = Image.open(in_path).convert("RGBA")
    w, h = img.size
    data = img.getdata()
    new = []
    for r, g, b, a in data:
        # 接近白的像素改為透明，過渡區線性降低 alpha
        gray = (r + g + b) / 3
        if gray >= threshold:
            new.append((r, g, b, 0))
        elif gray >= threshold - 25:
            # 過渡
            t = (gray - (threshold - 25)) / 25
            new.append((r, g, b, int(a * (1 - t))))
        else:
            new.append((r, g, b, a))
    img.putdata(new)
    img.save(out_path, "PNG")
    print(f"已輸出: {out_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python3 remove-white-bg.py <輸入.png> [輸出.png]")
        sys.exit(1)
    remove_white(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
