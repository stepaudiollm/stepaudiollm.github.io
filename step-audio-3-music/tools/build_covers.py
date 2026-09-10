#!/usr/bin/env python3
"""
封面库构建 build cover library
-----------------------------------------------------------------------------
把 assets/covers_v2/ 里的高清原图压成适合网页的尺寸，用 ASCII 文件名写进
assets/covers/，并重新生成 assets/js/covers.js（随机封面池的清单）。

为什么要压：卡片网格是 5 列，每张封面实际显示约 200px，2 倍屏也只需
~400px。原图 1254×1254 约等于所需像素的 6 倍，44 张就是 17.2 MiB ——
聆听页一屏 20 张封面要下 8 MiB，GitHub Pages 上首屏会明显卡。
640×640 保留了 2 倍屏的余量，总体积降到约 2.8 MiB。

为什么改名：原文件名带中文，URL 会变成 90 字符的百分号编码。CJK 没有
NFC/NFD 归一化问题所以功能上能用，但英文 slug 的 URL 干净得多，跨工具
和 CDN 也不用担心编码。系列语义通过 slug 保留（见 SERIES）。

原图不进仓库（covers_v2/ 在 .gitignore 里），也不保留在本地 —— assets/covers/
里的 640×640 是有损压缩的成品，回不到原始分辨率。要换尺寸或加新封面，得先把
原图重新放回 assets/covers_v2/ 再跑这个脚本。

用法：python3 tools/build_covers.py [--size 640] [--quality 82] [--dry-run]
"""
import argparse, os, sys, unicodedata

try:
    from PIL import Image
except ImportError:
    sys.exit("需要 Pillow：pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "covers_v2")
DST = os.path.join(ROOT, "assets", "covers")
MANIFEST = os.path.join(ROOT, "assets", "js", "covers.js")

# 中文系列名 → ASCII slug。加新系列时在这里补一行即可。
SERIES = {
    "极简图形与反设计":     "minimal",
    "雕塑与材料行为":       "sculpture",
    "手工拼贴与印刷":       "collage",
    "复古未来漫画角色":     "retrofuture",
    "概念人物肖像":         "portrait",
    "天真插画与吉祥物":     "mascot",
    "科学图形与数据艺术":   "science",
    "复印与地下杂志":       "zine",
    "绘画性抽象与真实笔触": "painterly",
    "档案影像与摄影再编":   "archive",
    "纺织刺绣与民艺":       "textile",
    "复古数字与扫描器艺术": "scanner",
    "超现实双关与不可能物体": "surreal",
    "微缩模型与舞台装置":   "diorama",
    "自然标本与生态艺术":   "botanical",
}


def parse(name):
    """cover-S01-极简图形与反设计-01.webp → ('cover-s01-minimal-01.webp', 中文系列名)"""
    stem = os.path.splitext(name)[0]
    parts = stem.split("-")
    # 形如 cover / S01 / 中文名 / 01；中文名本身不含连字符，但防一手
    if len(parts) < 4 or parts[0] != "cover":
        return None, None
    sid, idx, zh = parts[1], parts[-1], "-".join(parts[2:-1])
    zh = unicodedata.normalize("NFC", zh)
    slug = SERIES.get(zh)
    if not slug:
        return None, zh
    return f"cover-{sid.lower()}-{slug}-{idx}.webp", zh


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--size", type=int, default=640)
    ap.add_argument("--quality", type=int, default=82)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    if not os.path.isdir(SRC):
        sys.exit(f"找不到源目录 {SRC}")

    srcs = sorted(f for f in os.listdir(SRC)
                  if f.lower().endswith((".webp", ".jpg", ".jpeg", ".png")))
    if not srcs:
        sys.exit(f"{SRC} 里没有图片")

    unknown, written, total = [], [], 0
    for f in srcs:
        out, zh = parse(f)
        if not out:
            unknown.append((f, zh))
            continue
        sp, dp = os.path.join(SRC, f), os.path.join(DST, out)
        if a.dry_run:
            print(f"  {f}\n    -> {out}")
            written.append(out)
            continue
        im = Image.open(sp).convert("RGB")
        if im.size != (a.size, a.size):
            im = im.resize((a.size, a.size), Image.LANCZOS)
        im.save(dp, "WEBP", quality=a.quality, method=6)
        total += os.path.getsize(dp)
        written.append(out)

    if unknown:
        print("!! 以下文件的系列名不在 SERIES 表里，已跳过（去 tools/build_covers.py 补映射）：")
        for f, zh in unknown:
            print(f"   {f}   系列名={zh!r}")

    print(f"\n转换 {len(written)} 张 -> {DST}")
    if total:
        print(f"  合计 {total/1048576:.2f} MiB，平均 {total/len(written)/1024:.0f} KiB")

    # 清单包含 covers/ 下的全部封面（老 jpg + 新 webp），随机池用它
    allc = sorted(f for f in os.listdir(DST)
                  if f.lower().endswith((".webp", ".jpg", ".jpeg", ".png")))
    if a.dry_run:
        print(f"\n（dry-run，未写 {MANIFEST}）清单将含 {len(allc)} 张")
        return

    lines = [
        "/* =============================================================================",
        "   封面库清单 COVER MANIFEST",
        "   ---------------------------------------------------------------------------",
        "   由 tools/build_covers.py 自动生成，不要手改。",
        "   静态站点没有目录列表接口，随机挑封面必须有一份显式清单。",
        "   新增封面：把原图放进 assets/covers_v2/，然后重跑",
        "     python3 tools/build_covers.py",
        "   ============================================================================= */",
        "",
        "const C = 'assets/covers/';",
        "",
        f"/** 全部 {len(allc)} 张封面的相对路径 */",
        "export const COVERS = [",
    ]
    lines += [f"  C + '{f}'," for f in allc]
    lines += [
        "];",
        "",
        "/** 从封面库里随机挑一张 */",
        "export const randomCover = () => COVERS[Math.floor(Math.random() * COVERS.length)];",
        "",
        "/**",
        " * 随机挑 n 张互不重复的封面。",
        " * 用 Fisher-Yates 洗一份副本，避免边挑边判重在 n 接近总数时退化。",
        " */",
        "export function sampleCovers(n) {",
        "  const a = COVERS.slice();",
        "  for (let i = a.length - 1; i > 0; i--) {",
        "    const j = Math.floor(Math.random() * (i + 1));",
        "    [a[i], a[j]] = [a[j], a[i]];",
        "  }",
        "  return a.slice(0, Math.min(n, a.length));",
        "}",
        "",
    ]
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    print(f"清单已写入 {MANIFEST}（{len(allc)} 张）")


if __name__ == "__main__":
    main()
