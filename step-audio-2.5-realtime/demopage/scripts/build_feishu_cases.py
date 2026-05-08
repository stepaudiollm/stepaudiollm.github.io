#!/usr/bin/env python3
"""把飞书文档里的 case 合成为 mp4：仅做 video loop + audio mux，不烧字幕。

规则（严格）：每个 case 必须同时具备
  - 重录音频（WAV/wav，由表格「重录音频」列提供）
  - 动效视频（mp4，由表格「动效」列提供，优先 kling_*）
两者缺一则跳过该 case。视频不足 audio 长度时循环补齐。
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path('/home/i-zhanghaoyang/step2p5-demopage')
OUT_DIR = ROOT / 'assets' / 'video' / 'feishu_cases'
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 用户在这里放修复版 SRT，按"音频文件名去后缀"匹配覆盖（如 fuyuyan-0.WAV → fuyuyan-0.srt）
SRT_FIX_DIR = ROOT / 'assets' / 'video' / 'srt_fix'

CACHE = Path('/tmp/feishu_assets')
CACHE.mkdir(exist_ok=True)

APP_ID = 'cli_a93b1cc42a38dbcd'
APP_SECRET = 'LbdiUP1a8QWYuQNa6ynxNbbn3a1Isx3R'

sys.path.insert(0, str(ROOT / 'scripts'))
import burn_persona_subs as bps  # noqa


# 各表的列含义。若为 None 表示这张表没有该列 / 不参与。
TABLE_SCHEMA = {
    # block_id : {label, audio_col(重录音频), video_col(动效), srt_col(字幕)}
    'Hz8gdzNw4oSNSCxKaJMcKydEnXf': {'label': '小跃-情绪价值',     'audio_col': 1, 'video_col': 4, 'srt_col': 1},
    'TnRJdwCJYoCH96xYoNdcVpSBnEh': {'label': '小跃-双商领跑',     'audio_col': 1, 'video_col': 4, 'srt_col': 1},
    'FtmNd2QeooJrLgxQmOKcqwE9nfh': {'label': '小跃-副语言感知',   'audio_col': 1, 'video_col': 3, 'srt_col': 1},
    'DfI1dxqShoUIr7xag4pc8ChTnKX': {'label': '人设自定义',         'audio_col': None, 'video_col': 3, 'srt_col': 4},
    'OZ8Idt1ljouhokxMgDjcSV0NnNb': {'label': '贴合语境表现力',     'audio_col': None, 'video_col': 3, 'srt_col': 4},
}


def get_token():
    import urllib.request
    body = json.dumps({'app_id': APP_ID, 'app_secret': APP_SECRET}).encode()
    req = urllib.request.Request(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        data=body, headers={'Content-Type': 'application/json'},
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)['tenant_access_token']


def download(token, file_token, file_name):
    safe_name = re.sub(r'[^A-Za-z0-9._一-鿿()-]', '_', file_name)
    target = CACHE / f'{file_token}_{safe_name}'
    if target.exists() and target.stat().st_size > 0:
        return target
    import urllib.request
    url = f'https://open.feishu.cn/open-apis/drive/v1/medias/{file_token}/download'
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req) as r:
        data = r.read()
    target.write_bytes(data)
    return target


def cell_walk(all_blocks, cid, parts):
    cb = all_blocks.get(cid)
    if not cb:
        return
    bt = cb['block_type']
    if bt == 2:
        txt = ''.join(e.get('text_run', {}).get('content', '') for e in cb.get('text', {}).get('elements', []))
        if txt.strip():
            parts.append(('TXT', txt.strip()))
    elif bt in (3, 4, 5):
        kn = ['heading1', 'heading2', 'heading3'][bt - 3]
        txt = ''.join(e.get('text_run', {}).get('content', '') for e in cb.get(kn, {}).get('elements', []))
        if txt.strip():
            parts.append(('TXT', txt.strip()))
    elif bt == 23:
        f = cb.get('file', {})
        parts.append(('FILE', f.get('name', ''), f.get('token', '')))
    for c in cb.get('children', []):
        cell_walk(all_blocks, c, parts)


def cell_files(all_blocks, cid):
    parts = []
    cb = all_blocks.get(cid)
    if not cb:
        return parts
    for c in cb.get('children', []):
        cell_walk(all_blocks, c, parts)
    return [(name, token) for kind, name, *rest in [(p[0], p[1] if p[0] == 'FILE' else None, p[2] if p[0] == 'FILE' else None) for p in parts] if kind == 'FILE' for token in [rest[0]] if name and token]


def cell_text_join(all_blocks, cid):
    parts = []
    cb = all_blocks.get(cid)
    if not cb:
        return ''
    for c in cb.get('children', []):
        cell_walk(all_blocks, c, parts)
    return ' '.join(p[1] for p in parts if p[0] == 'TXT')


def detect_persona(texts_blob):
    for n in ['田菲菲', '苏烬言', '小鱼儿', '章鱼哥', '小跃']:
        if n in texts_blob:
            return n
    return '小跃'


PERSONA_ACCENT = {
    '田菲菲': '#ff8ab0',
    '苏烬言': '#5ed4ff',
    '小鱼儿': '#a7f3d0',
    '章鱼哥': '#a78bfa',
    '小跃':   '#ffd166',
}

LABEL_SLUG = {
    '小跃-情绪价值': 'xiaoyue-emotion',
    '小跃-双商领跑': 'xiaoyue-iqeq',
    '小跃-副语言感知': 'xiaoyue-paraling',
    '人设自定义': 'persona',
    '贴合语境表现力': 'expression',
}


def pick_video(files):
    """从一组文件里挑动效 mp4：优先 kling_，避开豆包参考片段 (3bnsnmnomu*)。"""
    mp4 = [(n, t) for n, t in files if n.lower().endswith('.mp4')]
    kling = [x for x in mp4 if x[0].startswith('kling_')]
    if kling:
        return kling[0]
    others = [x for x in mp4 if not re.match(r'^3bnsnmnomu', x[0])]
    if others:
        return others[0]
    return mp4[0] if mp4 else None


def pick_audio_wav(files):
    """重录音频列里只取 .WAV/.wav；mp3 不算（那是 mp3 dump，不是「重录」）。"""
    wav = [(n, t) for n, t in files if n.lower().endswith('.wav')]
    if wav:
        return wav[0]
    return None


def pick_srt(files):
    srt = [(n, t) for n, t in files if n.lower().endswith('.srt')]
    return srt[0] if srt else None


def collect_cases():
    all_blocks = {}
    import glob
    for p in sorted(glob.glob('/tmp/feishu_doc/page_*.json')):
        d = json.load(open(p))
        for b in d['data']['items']:
            all_blocks[b['block_id']] = b

    cases = []
    for tb in (b for b in all_blocks.values() if b['block_type'] == 31):
        schema = TABLE_SCHEMA.get(tb['block_id'])
        if not schema:
            continue
        cells = tb['table']['cells']
        prop = tb.get('table', {}).get('property', {})
        cols = prop.get('column_size', 8)
        rows = prop.get('row_size', len(cells) // cols)
        for r in range(1, rows):
            def cell(c):
                idx = r * cols + c
                return cells[idx] if idx < len(cells) else None

            audio_files = cell_files(all_blocks, cell(schema['audio_col'])) if schema['audio_col'] is not None else []
            video_files = cell_files(all_blocks, cell(schema['video_col'])) if schema['video_col'] is not None else []
            srt_files   = cell_files(all_blocks, cell(schema['srt_col']))   if schema['srt_col']   is not None else []

            blob = ' '.join(
                cell_text_join(all_blocks, cell(c)) for c in range(cols) if cell(c)
            )

            cases.append({
                'table_label': schema['label'],
                'row': r,
                'audio': pick_audio_wav(audio_files),
                'video': pick_video(video_files),
                'srt':   pick_srt(srt_files),
                'blob':  blob,
            })
    return cases


def build_one(token, case, force=False):
    slug = f"{LABEL_SLUG[case['table_label']]}-r{case['row']}"
    out_mp4 = OUT_DIR / f'{slug}.mp4'
    if out_mp4.exists() and not force:
        print(f'  [skip] {out_mp4.name}')
        return out_mp4

    if not (case['audio'] and case['video']):
        print(f'  [drop] {slug}: '
              f'audio={"y" if case["audio"] else "N"} '
              f'video={"y" if case["video"] else "N"}')
        return None

    a_name, a_tok = case['audio']
    v_name, v_tok = case['video']

    print(f'  [build] {slug}')
    print(f'    v={v_name}  a={a_name}')

    vid_path = download(token, v_tok, v_name)
    aud_path = download(token, a_tok, a_name)

    audio_dur = bps.get_audio_duration(aud_path)

    cmd = [
        'ffmpeg', '-y',
        '-stream_loop', '-1', '-i', str(vid_path),
        '-i', str(aud_path),
        '-t', f'{audio_dur:.3f}',
        '-map', '0:v:0', '-map', '1:a:0',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '160k',
        '-movflags', '+faststart',
        str(out_mp4),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f'  [ERR] ffmpeg failed for {slug}:')
        print(res.stderr[-1500:])
        return None
    print(f'  [ok] {out_mp4.name} ({out_mp4.stat().st_size//1024} KB)')
    return out_mp4


def main():
    cases = collect_cases()
    print(f'Got {len(cases)} table rows.')
    # 去重：相同 (audio_token, video_token) 只保留一份
    seen = set()
    uniq = []
    for c in cases:
        key = (c['audio'][1] if c['audio'] else None,
               c['video'][1] if c['video'] else None)
        if key in seen:
            continue
        seen.add(key)
        uniq.append(c)
    print(f'After dedup: {len(uniq)}')

    token = get_token()
    print(f'token: {token[:20]}...')
    force = '--force' in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith('--')]

    built, dropped = 0, 0
    for case in uniq:
        slug = f"{LABEL_SLUG[case['table_label']]}-r{case['row']}"
        if only and slug not in only:
            continue
        r = build_one(token, case, force=force)
        if r: built += 1
        else: dropped += 1
    print(f'\nbuilt={built}, dropped={dropped}, total considered={built+dropped}')


if __name__ == '__main__':
    main()
