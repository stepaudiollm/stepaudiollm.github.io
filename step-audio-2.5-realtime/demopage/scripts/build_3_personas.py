#!/usr/bin/env python3
"""一次性脚本：合成 3 个 persona case 的 mp4（无字幕，仅 video loop + audio mux）。
"""
import json, re, subprocess, sys, urllib.request
from pathlib import Path

ROOT = Path('/home/i-zhanghaoyang/step2p5-demopage')
OUT_DIR = ROOT / 'assets' / 'video' / 'persona'
CACHE = Path('/tmp/feishu_assets')
CACHE.mkdir(exist_ok=True)
APP_ID = 'cli_a93b1cc42a38dbcd'
APP_SECRET = 'LbdiUP1a8QWYuQNa6ynxNbbn3a1Isx3R'

CASES = [
    {'id':'tianfeifei', 'video_token':'PpqVbpqMsonZtbxJPrIcdYqynJc',
     'video_name':'kling_4012.mp4', 'audio_token':'Ic6Pb88kAojdXdxTWCAcuCupn1Z',
     'audio_name':'goodcase_557669ce.mp3'},
    {'id':'sujinyan',   'video_token':'N09gbYpxxoTrY3xiMQSc31hRnNb',
     'video_name':'kling_3689.mp4', 'audio_token':'ZvulbGFq8oAouexxjJtcSuSpnLc',
     'audio_name':'goodcase_a28bfb41.mp3'},
    {'id':'xiaoyuer',   'video_token':'Lri2bxcaFoLPLsxi4t9c0Alvnbh',
     'video_name':'kling_2793.mp4', 'audio_token':'V7s9bBul7oIJYUxqG0scEdG7n5b',
     'audio_name':'goodcase_85a8322e.mp3'},
]


def get_token():
    body = json.dumps({'app_id':APP_ID,'app_secret':APP_SECRET}).encode()
    req = urllib.request.Request(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        data=body, headers={'Content-Type':'application/json'})
    return json.load(urllib.request.urlopen(req))['tenant_access_token']


def download(token, file_token, file_name):
    safe = re.sub(r'[^A-Za-z0-9._-]', '_', file_name)
    target = CACHE / f'{file_token}_{safe}'
    if target.exists() and target.stat().st_size > 0:
        return target
    url = f'https://open.feishu.cn/open-apis/drive/v1/medias/{file_token}/download'
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req) as r:
        target.write_bytes(r.read())
    return target


def audio_dur(p):
    out = subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration',
                                    '-of','default=nokey=1:noprint_wrappers=1', str(p)])
    return float(out.decode().strip())


def main():
    tk = get_token()
    print(f'token: {tk[:20]}...')
    for c in CASES:
        out_mp4 = OUT_DIR / f"{c['id']}.mp4"
        v = download(tk, c['video_token'], c['video_name'])
        a = download(tk, c['audio_token'], c['audio_name'])
        dur = audio_dur(a)
        print(f"  [build] {c['id']}  v={v.name}  a={a.name}  dur={dur:.1f}s")
        cmd = ['ffmpeg','-y',
               '-stream_loop','-1','-i',str(v),
               '-i',str(a),
               '-t', f'{dur:.3f}',
               '-map','0:v:0','-map','1:a:0',
               '-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p',
               '-c:a','aac','-b:a','160k',
               '-movflags','+faststart',
               str(out_mp4)]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print(f'  [ERR] {c["id"]}: {res.stderr[-800:]}')
        else:
            print(f"  [ok] {out_mp4} ({out_mp4.stat().st_size//1024} KB)")


if __name__ == '__main__':
    main()
