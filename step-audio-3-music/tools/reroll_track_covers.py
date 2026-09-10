#!/usr/bin/env python3
"""
重摇示例曲目封面 re-roll demo track covers
-----------------------------------------------------------------------------
把 assets/js/data.js 里 20 首示例曲目的 cover 字段，从整个封面库里重新随机
分配一批。

为什么写进 data.js 而不是运行时随机：
  1. audio.js 的 applyArt 会按封面 URL 缓存提取出的主色调，URL 每次刷新都变
     等于缓存永远不命中；
  2. 示例曲目是静态内容，封面每次刷新都换会显得页面在抽风，用户记住的那首
     歌下次长得不一样；
  3. 生成的作品封面存在 IndexedDB 里本来就是固定的，示例曲目理应一致。
所以随机只发生在"构建时"跑这个脚本的这一刻，跑完就固定下来。

选封面时按系列轮转（round-robin），保证 20 张尽量来自 20 个不同系列 ——
纯随机很容易让某一排 5 张里出现 3 张同系列，聆听页看着像重复。

用法：
  python3 tools/reroll_track_covers.py              # 随机重摇
  python3 tools/reroll_track_covers.py --seed 42    # 可复现
  python3 tools/reroll_track_covers.py --dry-run    # 只看结果不写文件
"""
import argparse, os, random, re, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "assets", "js", "data.js")
MANIFEST = os.path.join(ROOT, "assets", "js", "covers.js")


def load_covers():
    src = open(MANIFEST, encoding="utf-8").read()
    names = re.findall(r"C \+ '([^']+)'", src)
    if not names:
        sys.exit(f"{MANIFEST} 里没解析到封面，先跑 tools/build_covers.py")
    return names


def series_of(name):
    """cover-s01-minimal-01.webp -> 's01-minimal'；cover-city-01.jpg -> 'city'"""
    stem = os.path.splitext(name)[0]
    parts = stem.split("-")[1:]          # 去掉开头的 'cover'
    return "-".join(parts[:-1]) or stem


def pick(names, n, rng):
    """按系列轮转取 n 张互不重复的封面，最大化系列多样性"""
    buckets = defaultdict(list)
    for x in names:
        buckets[series_of(x)].append(x)
    for b in buckets.values():
        rng.shuffle(b)
    order = list(buckets)
    rng.shuffle(order)

    out = []
    while len(out) < n:
        progressed = False
        for k in order:
            if buckets[k]:
                out.append(buckets[k].pop())
                progressed = True
                if len(out) == n:
                    break
        if not progressed:               # 封面库总数不够 n
            break
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    rng = random.Random(a.seed)

    covers = load_covers()
    src = open(DATA, encoding="utf-8").read()

    # 只替换 TRACKS 里的 cover 字段，形如：cover: C + 'cover-city-01.jpg',
    hits = list(re.finditer(r"cover: C \+ '([^']+)'", src))
    if not hits:
        sys.exit("data.js 里没找到 cover 字段，格式可能变了")

    chosen = pick(covers, len(hits), rng)
    if len(chosen) < len(hits):
        sys.exit(f"封面库只有 {len(covers)} 张，不够分给 {len(hits)} 首")

    # 从后往前替换，避免前面的替换把后面的偏移算乱
    out = src
    for m, new in zip(reversed(hits), reversed(chosen)):
        out = out[:m.start()] + f"cover: C + '{new}'" + out[m.end():]

    # 找出每首歌的 id，方便打印对照
    ids = re.findall(r"id: '(t-\d+)'", src)
    print(f"封面库 {len(covers)} 张，示例曲目 {len(hits)} 首，"
          f"覆盖 {len({series_of(c) for c in chosen})} 个系列"
          f"{'（seed=' + str(a.seed) + '）' if a.seed is not None else ''}")
    for tid, old, new in zip(ids, (m.group(1) for m in hits), chosen):
        print(f"  {tid}  {old:28s} -> {new}")

    if a.dry_run:
        print("\n（dry-run，未写文件）")
        return
    open(DATA, "w", encoding="utf-8").write(out)
    print(f"\n已写入 {DATA}")


if __name__ == "__main__":
    main()
