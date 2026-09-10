#!/usr/bin/env python3
"""
首页背景视频构建 build hero background montage
-----------------------------------------------------------------------------
把 Coverr 的五段原片剪成一条**无缝循环**的蒙太奇，产出：

    assets/video/hero.webm        VP9，现代浏览器优先
    assets/video/hero.mp4         H.264，Safari / 旧浏览器兜底
    assets/video/hero-poster.jpg  首帧海报（视频加载前 & 不放视频时的静态背景）

素材：乐手架麦录制 → 吉他手弹奏 → 现场演出灯光 → 对麦演唱 → 吉他手近景。
五个画面都有人、有乐器、有场景 —— 不用手部特写（看不出在做什么），
也不用糊掉的远景。挑选标准与排片顺序见下面 CLIPS 上方的注释。

四个关键处理，每个都对应一个踩过的坑：

1. **无缝循环靠拆第一条素材**，不是在末尾补一段。
   之前的做法是末尾接一小段第一条素材的开头，结果循环回去时那个镜头连着播了
   两遍，看起来就是"卡一下"。
   现在把第一条素材切成前后相邻的两片 A1 / A2，顺序排成
       A2 → B → C → D → E → A1
   于是视频的最后一帧和第一帧是**同一个时刻**（A1 的尾 = A2 的头），
   循环点落在同一个连续镜头内部，画面完全接得上。

2. **亮度自动配平**。五条原片的平均亮度差得很远（实测 53～90），不配平的话
   暗的那段看不出画面、亮的那段把居中的白字冲掉。
   脚本会先无校正地切一遍、逐段实测平均亮度，再按
       gamma = ln(measured/255) / ln(TARGET_Y/255)
   反解出每段需要的 gamma 并重切。**注意 ffmpeg eq 的 gamma 是 >1 变亮**
   （与"幂指数"直觉相反，第一次按幂指数填，最暗那段从 29.6 掉到 2.7 几乎全黑）。
   自动测量的意义就是换素材时不需要再手算，也不会再把方向搞反。

3. **统一画幅，且输出 16:9**。首屏整屏铺满 + object-fit:cover，源比视口"矮"就会
   被放大：1920x800 的源在 1920x1080 视口上要放大 1.35x，在 2K 上要 1.80x ——
   这是"清晰度不够"的直接原因。改成 1920x1080 后常见视口是缩小或 1:1，明显更锐。
   代价是像素多 35%、文件更大，这次清晰度优先。

4. **绕开水印**。Coverr 上 slug 带 `premium-` 的片子画面正中压着 coverr+ 水印，
   一律不能用。

用法：
  python3 tools/build_hero_video.py               # 下载 + 剪辑 + 编码
  python3 tools/build_hero_video.py --target-y 90 # 整体更亮
  python3 tools/build_hero_video.py --keep-src    # 保留原片与中间文件

素材来源与授权：Coverr（https://coverr.co），免费商用、无需署名。
逐条清单见 assets/video/CREDITS.md。
"""
import argparse, math, os, shutil, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "video")
SRC = os.path.join(OUT, "_source")

XFADE = 0.8          # 段间交叉溶解
SEG = 3.4            # 每段取用时长（第一条会被拆成两半）

# slug, 裁剪区, 入点, 说明
#
# 选片三条硬性要求（都是踩过的）：
# 1. **不要手部特写**。之前用了弹吉他/弹钢琴的手部特写，画面看不出在做什么。
#    现在五个画面都有人、有乐器、有场景。
# 2. **原生 1920x1080、无信箱黑边**。输出是 16:9，源也是 16:9 才能零放大（见
#    下面 OUT_W/OUT_H 的说明）。带黑边的素材要先裁再放大，反而更糊 ——
#    音乐厅钢琴那条（1920x1012，内容仅 1920x800）就是因此被排除的。
# 3. **别用 slug 带 premium- 的**：那些片子画面正中压着 coverr+ 水印。
#
# 顺序还要避免同一个人相邻。这里两位乐手各出两个镜头，排成 1/4 与 2/5，
# 中间都隔着别的画面，看起来才不像同一条素材跳了一下。
CLIPS = [
    ("coverr-a-guy-setting-up-his-phone-camera-to-record-his-music-performance-3437",
     "1920:1080:0:0", 3.0, "乐手架麦录制（拆两半接循环）"),
    ("coverr-guitarist-5928",              "1920:1080:0:0", 4.0, "吉他手弹奏"),
    ("coverr-live-music-concert-5249",     "1920:1080:0:0", 1.5, "现场演出灯光"),
    ("coverr-a-guy-singing-into-a-microphone-745",
     "1920:1080:0:0", 2.0, "对麦演唱"),
    ("coverr-man-playing-a-guitar-4433",   "1920:1080:0:0", 5.0, "吉他手（近景）"),
]

EXTRA_LIB = "/data/environment/miniforge3/envs/eval/lib"   # ffmpeg 缺的库在这


def env():
    e = dict(os.environ)
    if os.path.isdir(EXTRA_LIB):
        e["LD_LIBRARY_PATH"] = EXTRA_LIB + ":" + e.get("LD_LIBRARY_PATH", "")
    return e


def run(cmd):
    r = subprocess.run(cmd, env=env(), capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"命令失败：{' '.join(cmd[:4])}…\n{r.stderr[-1800:]}")
    return r


def mib(p):
    return os.path.getsize(p) / 1048576


def duration(p):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                      "-of", "default=nw=1:nk=1", p]).stdout.strip())


def mean_luma(path):
    """整段平均亮度（0-255）。用 PyAV 而不是 ffmpeg signalstats：
    后者要从 stderr 里刮 metadata，格式随版本变，很脆。"""
    import av
    import numpy as np
    c = av.open(path)
    vals = []
    for i, fr in enumerate(c.decode(video=0)):
        if i % 6:                                  # 每 6 帧取一帧就够稳
            continue
        vals.append(float(fr.to_ndarray(format="gray").mean()))
    c.close()
    return sum(vals) / len(vals) if vals else 0.0


def gamma_for(measured, target):
    """ffmpeg eq 的 gamma：>1 变亮。output ≈ input**(1/gamma)（归一化后）。"""
    m = max(1.0, min(254.0, measured)) / 255.0
    t = max(1.0, min(254.0, target)) / 255.0
    return max(0.4, min(3.0, math.log(m) / math.log(t)))


def fetch(slug):
    os.makedirs(SRC, exist_ok=True)
    p = os.path.join(SRC, slug + ".mp4")
    if os.path.exists(p) and os.path.getsize(p) > 100_000:
        return p
    url = f"https://cdn.coverr.co/videos/{slug}/1080p.mp4"
    print(f"  下载 {slug}")
    try:
        with urllib.request.urlopen(url, timeout=240) as r, open(p, "wb") as f:
            shutil.copyfileobj(r, f)
    except Exception as e:                                       # noqa: BLE001
        sys.exit(f"下载失败 {slug}：{e}\n可手动下载后放到 {p}")
    return p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--crf", type=int, default=25)
    ap.add_argument("--vp9-crf", type=int, default=32)
    # 输出 16:9 而不是 2.4:1 电影画幅。
    # 首屏是整屏铺满 + object-fit:cover，源比视口"矮"的话浏览器必须放大来填满：
    #   1920x800 源 → 1440x900 视口放大 1.12x，1920x1080 视口放大 1.35x，
    #   2560x1440 视口放大 1.80x —— 这就是"清晰度不够"的直接原因。
    # 换成 1920x1080 后：1440x900 是**缩小**（0.83x，更锐），1920x1080 正好 1:1。
    ap.add_argument("--width", type=int, default=1920)
    ap.add_argument("--height", type=int, default=1080)
    ap.add_argument("--target-y", type=float, default=100.0,
                    help="配平后的目标平均亮度 0-255，调这个控制整体明暗")
    ap.add_argument("--keep-src", action="store_true")
    a = ap.parse_args()

    for t in ("ffmpeg", "ffprobe"):
        if not shutil.which(t):
            sys.exit(f"需要 {t}")
    os.makedirs(OUT, exist_ok=True)

    print("素材：")
    srcs = [fetch(c[0]) for c in CLIPS]

    def cut(src, crop, ss, dur, gamma, dst):
        vf = f"crop={crop},scale={a.width}:{a.height},setsar=1,fps=25"
        if abs(gamma - 1.0) > 0.01:
            vf += f",eq=gamma={gamma:.3f}"
        run(["ffmpeg", "-y", "-v", "error", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}",
             "-i", src, "-an", "-vf", vf,
             "-c:v", "libx264", "-preset", "fast", "-crf", "18",
             "-pix_fmt", "yuv420p", dst])

    # 排片：第一条拆成 A1(前) / A2(后)，A2 打头、A1 收尾，循环点落在这条素材内部
    half = SEG / 2
    slug0, crop0, ss0, note0 = CLIPS[0]
    plan = [("A2", srcs[0], crop0, ss0 + half, half, f"{note0}（后半，开场）")]
    for (slug, crop, ss, note), src in zip(CLIPS[1:], srcs[1:]):
        plan.append((slug, src, crop, ss, SEG, note))
    plan.append(("A1", srcs[0], crop0, ss0, half, f"{note0}（前半，收尾接回开场）"))

    # ── 第一遍：不校正，量每段亮度
    print("测亮度：")
    gammas = []
    for i, (_, src, crop, ss, dur, note) in enumerate(plan):
        probe = os.path.join(SRC, f"probe-{i:02d}.mp4")
        cut(src, crop, ss, dur, 1.0, probe)
        y = mean_luma(probe)
        g = gamma_for(y, a.target_y)
        gammas.append(g)
        print(f"  {note:26s} 实测 {y:5.1f} → gamma {g:.3f}")

    # ── 第二遍：带校正正式切
    print("切段：")
    segs = []
    for i, (_, src, crop, ss, dur, note) in enumerate(plan):
        dst = os.path.join(SRC, f"seg-{i:02d}.mp4")
        cut(src, crop, ss, dur, gammas[i], dst)
        segs.append(dst)
    for i, s in enumerate(segs):
        print(f"  seg-{i:02d} {mean_luma(s):5.1f}  {plan[i][5]}")

    # ── 串 xfade。offset 必须用累计时长往后推，写死常数会让后面几段叠在一起。
    durs = [duration(s) for s in segs]
    parts = [f"[{i}:v]scale={a.width}:{a.height},setsar=1,fps=25,"
             f"format=yuv420p,setpts=PTS-STARTPTS[v{i}]" for i in range(len(segs))]
    cur, acc = "[v0]", durs[0]
    for i in range(1, len(segs)):
        label = f"[x{i}]"
        parts.append(f"{cur}[v{i}]xfade=transition=fade:duration={XFADE}:"
                     f"offset={acc - XFADE:.3f}{label}")
        acc += durs[i] - XFADE
        cur = label
    chain = ";".join(parts)

    inputs = []
    for s in segs:
        inputs += ["-i", s]

    mp4 = os.path.join(OUT, "hero.mp4")
    webm = os.path.join(OUT, "hero.webm")
    poster = os.path.join(OUT, "hero-poster.jpg")

    print("编码 mp4（H.264）…")
    run(["ffmpeg", "-y", "-v", "error", *inputs,
         "-filter_complex", chain, "-map", cur, "-an",
         "-c:v", "libx264", "-preset", "slow", "-crf", str(a.crf),
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4])

    print("编码 webm（VP9）…")
    run(["ffmpeg", "-y", "-v", "error", *inputs,
         "-filter_complex", chain, "-map", cur, "-an",
         "-c:v", "libvpx-vp9", "-crf", str(a.vp9_crf), "-b:v", "0",
         "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", webm])

    print("导出海报帧…")
    run(["ffmpeg", "-y", "-v", "error", "-i", mp4, "-frames:v", "1", "-q:v", "6", poster])

    total = duration(mp4)
    if not a.keep_src:
        shutil.rmtree(SRC, ignore_errors=True)

    print()
    for p in (webm, mp4, poster):
        print(f"  {os.path.basename(p):18s} {mib(p):5.2f} MiB")
    print(f"  {len(CLIPS)} 个画面，循环 {total:.1f}s，段间 {XFADE}s 溶解，"
          f"目标亮度 {a.target_y:.0f}")
    print("  浏览器只会下 webm 或 mp4 其中一个")


if __name__ == "__main__":
    main()
