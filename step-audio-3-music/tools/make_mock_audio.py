#!/usr/bin/env python3
"""
生成占位音频 mock audio —— 临时用，等真实成品音频到位后整个 assets/audio/ 目录可直接删除替换。

为什么要生成能真正发声的占位音频，而不是静音文件：
播放系统里有三样东西必须有真实波形才能验收 ——
  1. 峰值波形进度条（真实峰值，不是随机数）
  2. 展开面板里的实时律动频谱（AnalyserNode 需要真实频率能量）
  3. 唱臂随进度走针（需要真实时长）
静音文件这三样全都测不了。

用法：
  python3 tools/make_mock_audio.py            # 生成全部
  python3 tools/make_mock_audio.py --clean    # 删除生成物

依赖：numpy + lameenc（均为纯 Python 可 pip 安装，不需要 ffmpeg）
"""
import argparse, math, os, shutil, sys
import numpy as np

try:
    import lameenc
except ImportError:
    sys.exit("需要 lameenc：pip install lameenc")

SR = 44100
BITRATE = 128                      # 与 05-tech-plan.md 定的示例音频码率一致
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "audio")
TRACK_DIR = os.path.join(ROOT, "tracks")
REF_DIR = os.path.join(ROOT, "refs")

# ── 音高 ──────────────────────────────────────────────────────────────────────
def hz(semitones_from_a4: float) -> float:
    return 440.0 * (2.0 ** (semitones_from_a4 / 12.0))

MAJOR = [0, 2, 4, 5, 7, 9, 11]
MINOR = [0, 2, 3, 5, 7, 8, 10]

# ── 基本合成块 ────────────────────────────────────────────────────────────────
def tone(freq, dur, decay=3.0, harmonics=(1.0, 0.45, 0.22, 0.10), vib=0.0):
    """带泛音与指数衰减的单音。decay 越大越像拨弦，越小越像持续音。"""
    n = max(1, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    y = np.zeros(n, dtype=np.float32)
    fm = 1.0 + (vib * np.sin(2 * np.pi * 5.2 * t) if vib else 0.0)
    for i, amp in enumerate(harmonics, start=1):
        y += amp * np.sin(2 * np.pi * freq * i * t * fm, dtype=np.float32).astype(np.float32)
    y *= np.exp(-decay * t).astype(np.float32)
    # 极短的起音斜坡，避免爆音
    a = min(n, int(0.004 * SR))
    if a > 1:
        y[:a] *= np.linspace(0, 1, a, dtype=np.float32)
    peak = float(np.max(np.abs(y))) or 1.0
    return y / peak

def hat(dur, decay=42.0, rng=None):
    """滤过的噪声，当作闭合踩镲，给波形提供高频颗粒。"""
    n = max(1, int(dur * SR))
    r = rng if rng is not None else np.random.default_rng(0)
    y = r.standard_normal(n).astype(np.float32)
    # 简易一阶高通，让它听起来薄一点
    y[1:] -= 0.92 * y[:-1]
    y *= np.exp(-decay * (np.arange(n, dtype=np.float32) / SR))
    peak = float(np.max(np.abs(y))) or 1.0
    return y / peak

def kick(dur=0.22):
    """扫频低音，给波形一个规律的强拍。"""
    n = max(1, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    f = 118.0 * np.exp(-15.0 * t) + 44.0
    y = np.sin(2 * np.pi * np.cumsum(f) / SR, dtype=np.float32).astype(np.float32)
    y *= np.exp(-11.0 * t).astype(np.float32)
    return y

def add(buf, seg, at):
    """把 seg 叠加到 buf 的 at 秒处，越界自动裁剪。"""
    i = int(at * SR)
    if i >= len(buf) or i < 0:
        return
    m = min(len(seg), len(buf) - i)
    buf[i:i + m] += seg[:m]

# ── 一首曲子 ──────────────────────────────────────────────────────────────────
def build_track(seed, dur, bpm, root_semi, mode, brightness=1.0, drums=True, sparse=False):
    """
    生成一段有段落起伏的循环。段落起伏很重要 ——
    没有它，波形是一条等高的砖墙，看不出"这是音乐"。
    """
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    L = np.zeros(n, dtype=np.float32)
    R = np.zeros(n, dtype=np.float32)
    scale = MAJOR if mode == "maj" else MINOR
    beat = 60.0 / bpm
    bar = 4 * beat
    prog = [0, 5, 3, 4] if mode == "maj" else [0, 3, 5, 4]   # 级数
    nbars = int(math.ceil(dur / bar))

    for b in range(nbars):
        t0 = b * bar
        deg = prog[b % len(prog)]
        chord_root = root_semi + scale[deg % 7] + 12 * (deg // 7)

        # 低音：1、3 拍
        for k in (0, 2):
            add(L, 0.50 * tone(hz(chord_root - 24), beat * 1.9, decay=2.4,
                               harmonics=(1.0, 0.30, 0.10)), t0 + k * beat)
            add(R, 0.50 * tone(hz(chord_root - 24), beat * 1.9, decay=2.4,
                               harmonics=(1.0, 0.30, 0.10)), t0 + k * beat)

        # 和弦铺底：整小节持续音，左右微微失谐做出宽度
        for iv, pan in ((0, -1), (2, 1), (4, -1), (6, 1)):
            f = hz(chord_root + scale[(deg + iv) % 7] - scale[deg % 7])
            v = 0.20 * (1.0 if iv < 5 else 0.55)
            seg = v * tone(f, bar * 0.98, decay=0.75, harmonics=(1.0, 0.25, 0.08), vib=0.002)
            add(L if pan < 0 else R, seg * 1.0, t0)
            add(R if pan < 0 else L, seg * 0.72, t0 + 0.011)   # 11ms 位移 = 立体声宽度

        # 琶音：八分音符，高八度，brightness 控制亮度
        step = beat / 2
        cnt = int(bar / step)
        for s in range(cnt):
            if sparse and s % 2 == 1:
                continue
            d = scale[(deg + 2 * s) % 7] + 12 * (1 + (s // 7))
            f = hz(root_semi + d + 12)
            v = 0.16 * brightness * (0.55 + 0.45 * rng.random())
            add(L, v * tone(f, step * 2.2, decay=7.0, harmonics=(1.0, 0.5, 0.3)),
                t0 + s * step)
            add(R, v * 0.85 * tone(f, step * 2.2, decay=7.0, harmonics=(1.0, 0.5, 0.3)),
                t0 + s * step + 0.007)

        if drums:
            for k in (0, 2):
                add(L, 0.42 * kick(), t0 + k * beat)
                add(R, 0.42 * kick(), t0 + k * beat)
            for s in range(cnt):
                if s % 2 == 1:
                    v = 0.055 * (0.6 + 0.4 * rng.random())
                    h = v * hat(0.09, rng=rng)
                    add(L, h, t0 + s * step)
                    add(R, h * 0.9, t0 + s * step + 0.003)

    # 段落包络：intro 渐入 → 主段 → 中段推起来（"副歌"）→ outro 渐出
    t = np.arange(n, dtype=np.float32) / SR
    env = np.full(n, 0.72, dtype=np.float32)
    c0, c1 = dur * 0.42, dur * 0.74
    env[(t >= c0) & (t < c1)] = 1.0
    intro = int(min(n, 2.2 * SR))
    env[:intro] *= np.linspace(0.15, 1.0, intro, dtype=np.float32)
    outro = int(min(n, 2.6 * SR))
    env[-outro:] *= np.linspace(1.0, 0.05, outro, dtype=np.float32)
    # 平滑段落跳变，避免咔嗒
    k = int(0.25 * SR)
    env = np.convolve(env, np.ones(k, dtype=np.float32) / k, mode="same").astype(np.float32)

    L *= env
    R *= env
    # 软限幅，留 headroom
    L = np.tanh(L * 1.05).astype(np.float32)
    R = np.tanh(R * 1.05).astype(np.float32)
    peak = max(float(np.max(np.abs(L))), float(np.max(np.abs(R)))) or 1.0
    g = 0.89 / peak
    return L * g, R * g

def build_vocal(seed, dur, root_semi, mode):
    """清唱占位：单声部旋律，有颤音、无打击乐 —— 波形应该明显比整曲稀疏。"""
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    y = np.zeros(n, dtype=np.float32)
    scale = MAJOR if mode == "maj" else MINOR
    t0, i = 0.0, 0
    while t0 < dur:
        d = rng.choice([0.45, 0.6, 0.9, 1.2])
        deg = int(rng.integers(0, 7))
        f = hz(root_semi + scale[deg] + 12)
        seg = 0.75 * tone(f, d * 1.15, decay=1.1,
                          harmonics=(1.0, 0.55, 0.18, 0.07), vib=0.010)
        add(y, seg, t0)
        t0 += d
        i += 1
    a = int(0.15 * SR)
    y[:a] *= np.linspace(0, 1, a, dtype=np.float32)
    y[-a:] *= np.linspace(1, 0, a, dtype=np.float32)
    y = np.tanh(y * 1.1).astype(np.float32)
    peak = float(np.max(np.abs(y))) or 1.0
    y *= 0.85 / peak
    return y, y.copy()

# ── 编码 ─────────────────────────────────────────────────────────────────────
def write_mp3(path, L, R):
    inter = np.empty(L.size + R.size, dtype=np.int16)
    inter[0::2] = np.clip(L * 32767.0, -32768, 32767).astype(np.int16)
    inter[1::2] = np.clip(R * 32767.0, -32768, 32767).astype(np.int16)
    enc = lameenc.Encoder()
    enc.set_bit_rate(BITRATE)
    enc.set_in_sample_rate(SR)
    enc.set_channels(2)
    enc.set_quality(3)
    data = enc.encode(inter.tobytes()) + enc.flush()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(bytes(data))
    return len(data)

# ── 曲目表（与 assets/js/data.js 的 id 一一对应）──────────────────────────────
#  id, 时长, BPM, 根音(相对A4半音), 调式, 亮度, 鼓, 稀疏
TRACKS = [
    # 歌曲创作 text_to_music
    ("t-01", 28, 104, -14, "min", 1.00, True,  False),
    ("t-02", 24,  92, -12, "maj", 0.85, True,  False),
    ("t-03", 31,  78,  -9, "min", 0.70, True,  True),
    ("t-04", 26, 118, -17, "maj", 1.10, True,  False),
    ("t-05", 27, 134, -14, "maj", 1.20, True,  False),   # 摇滚：快、亮、鼓最重
    # 纯音乐 instrumental
    ("t-06", 33,  70, -16, "min", 0.55, False, True),
    ("t-07", 29,  86, -11, "maj", 0.75, True,  True),
    ("t-08", 36,  60, -19, "min", 0.45, False, True),
    ("t-09", 27, 126, -14, "min", 1.15, True,  False),
    ("t-10", 30,  64, -12, "maj", 0.60, False, True),    # 独奏钢琴：无鼓、稀疏
    # 清唱配乐 vocal_to_music
    ("t-11", 25,  96, -10, "maj", 0.95, True,  False),
    ("t-12", 30,  82, -15, "min", 0.80, True,  False),
    ("t-13", 22, 110, -12, "maj", 1.05, True,  False),
    ("t-14", 28,  74, -17, "min", 0.65, True,  True),
    ("t-15", 28,  88, -18, "maj", 0.70, True,  True),    # 爵士：中速、暗、松
    # 歌曲翻唱 music_cover
    ("t-16", 29,  94, -14, "maj", 0.88, True,  False),
    ("t-17", 24, 122, -18, "min", 1.12, True,  False),
    ("t-18", 34,  68, -12, "min", 0.50, False, True),
    ("t-19", 26, 106, -15, "maj", 0.98, True,  False),
    ("t-20", 26,  76, -13, "maj", 0.82, True,  True),    # 雷鬼：慢、切分
]
# 参考音频：清唱（清唱配乐用）/ 原曲（歌曲翻唱用），各 5 段
REF_VOCAL  = [("ref-vocal-01", 11, -10, "maj"), ("ref-vocal-02", 13, -15, "min"),
              ("ref-vocal-03", 10, -12, "maj"), ("ref-vocal-04", 12, -17, "min"),
              ("ref-vocal-05", 12, -18, "maj")]
REF_SONG   = [("ref-song-01", 16, 94, -14, "maj", 0.88, True,  False),
              ("ref-song-02", 14, 122, -18, "min", 1.10, True, False),
              ("ref-song-03", 18, 68, -12, "min", 0.55, False, True),
              ("ref-song-04", 15, 106, -15, "maj", 0.95, True, False),
              ("ref-song-05", 15, 76, -13, "maj", 0.82, True,  True)]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clean", action="store_true", help="删除生成的音频目录")
    args = ap.parse_args()
    if args.clean:
        for d in (TRACK_DIR, REF_DIR):
            if os.path.isdir(d):
                shutil.rmtree(d); print("已删除", d)
        return

    total = 0
    for i, (tid, dur, bpm, root, mode, br, dr, sp) in enumerate(TRACKS):
        L, R = build_track(1000 + i, dur, bpm, root, mode, br, dr, sp)
        n = write_mp3(os.path.join(TRACK_DIR, f"{tid}.mp3"), L, R)
        total += n
        print(f"  tracks/{tid}.mp3  {dur:>2}s  {n/1024:6.0f} KB")
    for i, (rid, dur, root, mode) in enumerate(REF_VOCAL):
        L, R = build_vocal(2000 + i, dur, root, mode)
        total += write_mp3(os.path.join(REF_DIR, f"{rid}.mp3"), L, R)
        print(f"  refs/{rid}.mp3")
    for i, (rid, dur, bpm, root, mode, br, dr, sp) in enumerate(REF_SONG):
        L, R = build_track(4000 + i, dur, bpm, root, mode, br, dr, sp)
        total += write_mp3(os.path.join(REF_DIR, f"{rid}.mp3"), L, R)
        print(f"  refs/{rid}.mp3")
    print(f"\n合计 {total/1048576:.2f} MiB —— 全部为占位音频，真实音频到位后可整体替换。")

if __name__ == "__main__":
    main()
