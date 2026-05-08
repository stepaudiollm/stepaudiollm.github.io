#!/usr/bin/env python3
"""
把 persona 的 video + audio + srt 合成单个 mp4，字幕烧成气泡。
- video 时长不够时循环补齐到 audio 时长
- ASS 字幕：user 左下 / assistant 右下，半透明深色背景 + 圆角近似（box border style）
- assistant 前缀显示 persona 名（小写 caps，accent 色）

用法:
    python3 scripts/burn_persona_subs.py [persona_id ...]

不传 id 时跑全部已配置的 persona。
"""
from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 跟 data.js 的 PERSONAS 对齐；新增 persona 在这里加一条
PERSONAS = [
    {
        "id": "tianfeifei",
        "name": "田菲菲",
        "accent": "#ff8ab0",  # 粉
    },
    {
        "id": "sujinyan",
        "name": "苏烬言",
        "accent": "#5ed4ff",  # 蓝
    },
]


@dataclass
class Cue:
    start: float
    end: float
    speaker: str  # 'user' / 'assistant' / ''
    text: str


def parse_srt(path: Path) -> list[Cue]:
    raw = path.read_text(encoding="utf-8").replace("\r", "")
    cues: list[Cue] = []
    # 第一个出现的非 user/assistant speaker 视作 "user"，第二个视作 "assistant"。
    # 用于支持 [Speaker_1]/[Speaker_2] 这类标签。
    alias: dict[str, str] = {}

    def normalize(raw_speaker: str) -> str:
        s = raw_speaker.strip().lower()
        if s in ("user", "assistant"):
            return s
        if s in alias:
            return alias[s]
        used = set(alias.values())
        for slot in ("user", "assistant"):
            if slot not in used:
                alias[s] = slot
                return slot
        return s  # 第三个及以后保留原样

    for block in re.split(r"\n\s*\n", raw.strip()):
        lines = block.strip().split("\n")
        if len(lines) < 2:
            continue
        time_idx = next((i for i, l in enumerate(lines) if "-->" in l), -1)
        if time_idx < 0:
            continue
        m = re.match(
            r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)",
            lines[time_idx],
        )
        if not m:
            continue
        h1, mn1, s1, ms1, h2, mn2, s2, ms2 = map(int, m.groups())
        start = h1 * 3600 + mn1 * 60 + s1 + ms1 / 1000
        end = h2 * 3600 + mn2 * 60 + s2 + ms2 / 1000
        body = "\n".join(lines[time_idx + 1 :]).strip()
        sm = re.match(r"^\[([^\]]+)\]\s*", body)
        speaker = normalize(sm.group(1)) if sm else ""
        text = body[sm.end() :].strip() if sm else body
        cues.append(Cue(start, end, speaker, text))
    return cues


def fmt_ass_time(t: float) -> str:
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t - h * 3600 - m * 60
    cs = int(round((s - int(s)) * 100))
    sec = int(s)
    if cs == 100:
        cs = 0
        sec += 1
    return f"{h:d}:{m:02d}:{sec:02d}.{cs:02d}"


def hex_to_ass_color(hex_color: str, alpha: int = 0) -> str:
    """#RRGGBB -> &HAABBGGRR&  (alpha=0 全不透明，alpha=255 全透明)"""
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"&H{alpha:02X}{b:02X}{g:02X}{r:02X}&"


def darken(hex_color: str, factor: float = 0.55) -> str:
    h = hex_color.lstrip("#")
    r = int(int(h[0:2], 16) * factor)
    g = int(int(h[2:4], 16) * factor)
    b = int(int(h[4:6], 16) * factor)
    return f"#{r:02x}{g:02x}{b:02x}"


def wrap_chinese(text: str, max_per_line: int = 22) -> list[str]:
    """中文按字数硬换行，返回行列表（中文 1 计、ASCII 0.5 计）。

    - 优先在标点处断行（标点超过软阈值就断）
    - 若超过硬阈值（max_per_line）仍未遇到标点，强制硬切，避免文本溢出气泡
    """
    soft_limit = max_per_line * 0.9
    out: list[str] = []
    cur: list[str] = []
    cur_len = 0.0
    for ch in text:
        cur.append(ch)
        cur_len += 1 if ord(ch) > 127 else 0.5
        # 命中标点 + 已经够长 → 在标点后切
        if cur_len >= soft_limit and ch in "，。！？、；：,.!?;: ":
            out.append("".join(cur).strip())
            cur, cur_len = [], 0.0
            continue
        # 没标点也长到极限 → 强制硬切
        if cur_len >= max_per_line:
            out.append("".join(cur).strip())
            cur, cur_len = [], 0.0
    if cur:
        out.append("".join(cur).strip())
    return [s for s in out if s]


def line_pixel_width(line: str, fs: float) -> float:
    """估算 ASS 渲染下某行像素宽度。略往大估避免溢出。

    Noto Sans CJK SC 实测 CJK 字宽 ~ 1.0em，但加 spacing/anti-alias 边缘后接近 1.02em；
    ASCII 在该字体下平均 ~ 0.55-0.6em（标点最窄、字母数字偏宽）。保守估算用 1.05/0.6。
    """
    w = 0.0
    for ch in line:
        w += fs * 1.05 if ord(ch) > 127 else fs * 0.6
    return w


def rounded_rect_path(w: int, h: int, r: int) -> str:
    """ASS \\p1 drawing 路径：圆角矩形，从 (r,0) 顺时针。

    四角用 cubic bezier 近似 1/4 圆，控制点偏移 = 0.5523 * r。
    """
    k = max(1, int(round(r * 0.5523)))
    return (
        f"m {r} 0 "
        f"l {w - r} 0 "
        f"b {w - r + k} 0 {w} {r - k} {w} {r} "
        f"l {w} {h - r} "
        f"b {w} {h - r + k} {w - r + k} {h} {w - r} {h} "
        f"l {r} {h} "
        f"b {r - k} {h} 0 {h - r + k} 0 {h - r} "
        f"l 0 {r} "
        f"b 0 {r - k} {r - k} 0 {r} 0"
    )


def ass_color_bbggrr(hex_color: str) -> str:
    """#RRGGBB → &HBBGGRR& （drawing 的 \\1c 用这个，不带 alpha）"""
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"&H{b:02X}{g:02X}{r:02X}&"


def build_ass(cues: list[Cue], persona: dict, video_w: int, video_h: int) -> str:
    """生成 ASS 字幕文件。

    每条字幕产生两条 Dialogue：
      - Layer 0：用 \\p1 drawing 画圆角矩形作为气泡背景
      - Layer 1：文字本体
    user 左下深玻璃；assistant 右下 accent 染色 + persona 名 label
    """
    accent = persona["accent"]
    name = persona["name"]

    margin_x = max(48, int(video_w * 0.05))
    margin_v = max(60, int(video_h * 0.10))

    fontsize = max(22, int(video_h / 20))
    label_size = max(16, int(fontsize * 0.55))

    pad_x = int(fontsize * 0.7)
    pad_y = int(fontsize * 0.55)
    line_height = int(fontsize * 1.45)
    label_block = int(label_size * 1.7)
    radius = int(fontsize * 0.55)

    # 气泡最宽不超过画面 45%；max_chars 留 5% 安全边
    max_box_w = int(video_w * 0.45)
    max_text_w = max_box_w - 2 * pad_x
    max_chars_per_line = max(6, int(max_text_w / (fontsize * 1.1)))

    user_bg_color = ass_color_bbggrr("#061024")
    user_bg_alpha = "&H66&"  # ~60% 透
    asst_bg_color = ass_color_bbggrr(darken(accent, 0.45))
    asst_bg_alpha = "&H50&"  # ~70% 透
    accent_color = ass_color_bbggrr(accent)
    white_color = "&HFFFFFF&"

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {video_w}
PlayResY: {video_h}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Bg,Noto Sans CJK SC,{fontsize},&H00FFFFFF&,&H00FFFFFF&,&H00000000&,&H00000000&,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: Tx,Noto Sans CJK SC,{fontsize},&H00FFFFFF&,&H00FFFFFF&,&H00000000&,&H00000000&,0,0,0,0,100,100,0,0,1,0,1,7,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    events: list[str] = []
    for c in cues:
        if c.end <= c.start:
            continue
        is_asst = c.speaker == "assistant"
        lines = wrap_chinese(c.text, max_per_line=max_chars_per_line)
        if not lines:
            continue

        text_pixel_w = max(line_pixel_width(ln, fontsize) for ln in lines)
        if is_asst:
            text_pixel_w = max(text_pixel_w, line_pixel_width(name, label_size))
        text_pixel_w = min(text_pixel_w, max_text_w)

        box_w = int(text_pixel_w + 2 * pad_x)
        box_h = int(
            (label_block if is_asst else 0)
            + len(lines) * line_height
            + 2 * pad_y
        )

        box_y = video_h - margin_v - box_h
        if is_asst:
            box_x = video_w - margin_x - box_w
        else:
            box_x = margin_x

        text_x = box_x + pad_x
        text_y = box_y + pad_y

        if is_asst:
            bg_color, bg_alpha = asst_bg_color, asst_bg_alpha
        else:
            bg_color, bg_alpha = user_bg_color, user_bg_alpha

        path = rounded_rect_path(box_w, box_h, radius)
        bg_event_text = (
            rf"{{\an7\pos({box_x},{box_y})\bord0\shad0"
            rf"\1c{bg_color}\1a{bg_alpha}\p1}}{path}{{\p0}}"
        )
        events.append(
            f"Dialogue: 0,{fmt_ass_time(c.start)},{fmt_ass_time(c.end)},"
            f"Bg,,0,0,0,,{bg_event_text}"
        )

        wrapped_text = r"\N".join(lines)
        if is_asst:
            text_inner = (
                rf"{{\fs{label_size}\c{accent_color}\b1}}{name}"
                rf"{{\r\fs{fontsize}\c{white_color}}}\N{wrapped_text}"
            )
        else:
            text_inner = rf"{{\c{white_color}}}{wrapped_text}"

        text_event_text = (
            rf"{{\an7\pos({text_x},{text_y})\bord0\shad0"
            rf"\fs{fontsize}\c{white_color}}}{text_inner}"
        )
        events.append(
            f"Dialogue: 1,{fmt_ass_time(c.start)},{fmt_ass_time(c.end)},"
            f"Tx,,0,0,0,,{text_event_text}"
        )

    return header + "\n".join(events) + "\n"


def get_audio_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=nokey=1:noprint_wrappers=1", str(path),
        ]
    ).decode().strip()
    return float(out)


def get_video_size(path: Path) -> tuple[int, int]:
    out = subprocess.check_output(
        [
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=s=x:p=0", str(path),
        ]
    ).decode().strip()
    w, h = out.split("x")
    return int(w), int(h)


def burn(persona: dict, *, force: bool = False) -> Path:
    pid = persona["id"]
    video = ROOT / "assets" / "video" / "persona" / f"{pid}.mp4"
    audio = ROOT / "assets" / "audio" / f"{pid}.mp3"
    srt = ROOT / "assets" / "subtitles" / f"{pid}.srt"
    out_dir = ROOT / "assets" / "video" / "persona"
    out = out_dir / f"{pid}_subbed.mp4"

    for p in (video, audio, srt):
        if not p.exists():
            raise FileNotFoundError(f"missing input: {p}")

    if out.exists() and not force:
        print(f"[skip] {out.name} already exists (--force to overwrite)")
        return out

    cues = parse_srt(srt)
    vw, vh = get_video_size(video)
    audio_dur = get_audio_duration(audio)

    ass_path = ROOT / "scripts" / f"_{pid}.ass"
    ass_path.write_text(build_ass(cues, persona, vw, vh), encoding="utf-8")

    # 关键 ffmpeg 参数：
    # -stream_loop -1 让 video 循环；-t <audio_dur> 截断到 audio 长度
    # -map 0:v / -map 1:a 选 looped video + 完整 audio
    # -vf ass=... 把 ASS 字幕烧上去
    # +faststart 让网页流式播放更顺
    cmd = [
        "ffmpeg", "-y",
        "-stream_loop", "-1", "-i", str(video),
        "-i", str(audio),
        "-t", f"{audio_dur:.3f}",
        "-vf", f"ass={ass_path}",
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "160k",
        "-movflags", "+faststart",
        str(out),
    ]
    print("[run]", " ".join(cmd))
    subprocess.check_call(cmd)
    print(f"[ok] {out}")
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*", help="persona id 列表，留空则跑全部")
    ap.add_argument("--force", action="store_true", help="覆盖已有输出")
    args = ap.parse_args()

    targets = (
        [p for p in PERSONAS if p["id"] in args.ids]
        if args.ids else PERSONAS
    )
    if args.ids and len(targets) != len(args.ids):
        unknown = set(args.ids) - {p["id"] for p in PERSONAS}
        print(f"[warn] unknown persona id: {sorted(unknown)}", file=sys.stderr)

    for p in targets:
        burn(p, force=args.force)


if __name__ == "__main__":
    main()
