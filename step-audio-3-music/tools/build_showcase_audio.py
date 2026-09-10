#!/usr/bin/env python3
"""
把 showcases/ 里的正式示例转成站内音频 build showcase audio
-----------------------------------------------------------------------------
源目录（**不在仓库里**，是 demo 之外的素材目录）：
    /data/projects/stepmusic/music-demo/showcases/
        歌曲创作/lyrics2song_caseN.{mp3,txt}
        纯音乐创作/instrumental_caseN.{wav,mp3,txt}
        歌曲翻唱/coverN.{mp3,txt} + source_songN.mp3
        清唱配乐/vocal2mix_caseN.{mp3,txt} + vocalN.{mp3,flac}

产物落到 assets/audio/tracks（成品）与 assets/audio/refs（输入素材），
**沿用原来占位音频的文件名**（t-NN.mp3 / ref-song-0N.mp3 / ref-vocal-0N.mp3），
这样 data.js 里的 id、FEATURED_ORDER 和还没换掉的分区都不用动。

编码口径（按要求）：
  * **128k CBR mp3**，统一码率。
    源里 14 个成品本身就是 128k mp3，往上转到 192k 只会让体积涨 ~50%
    并多一代有损压缩、不会提升音质；所以统一到 128k 而不是 192k。
    代价是 4 首无损 WAV 的纯音乐和 320k 的两首参考歌曲会掉一档音质，
    这是「体积最省 + 码率统一」换来的，已确认。
  * **不重采样**：源是 44.1k 或 48k，两者 mp3 都原生支持。
    为了「统一」去重采样属于白做一道有损工序 —— 落地页写着模型输出
    「48kHz · stereo」，把真 48k 的成品降到 44.1k 反而和文案打架。
  * 丢掉源文件的元数据（-map_metadata -1），只写我们自己的 ID3v2.3
    title / artist / album —— 成品是可下载的，下载下来得有个正经标题。
  * -write_xing 1 写 Xing 头：CBR 也要有，否则某些播放器拖动进度条会飘。

用法：
    python3 tools/build_showcase_audio.py            # 转换 + 打印清单
    python3 tools/build_showcase_audio.py --dry-run  # 只打印要做什么

四个分区共 20 个成品 + 10 个输入素材（5 首参考歌曲 + 5 段清唱）都在清单里。
换素材就改 JOBS 里对应那一行，再跑一次。
"""
import argparse
import json
import os
import shutil
import subprocess
import sys

# conda 环境里的 ffmpeg 缺 libopenvino 起不来，固定用系统的
FFMPEG = '/usr/bin/ffmpeg'
FFPROBE = '/usr/bin/ffprobe'

SRC = '/data/projects/stepmusic/music-demo/showcases'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRACKS = os.path.join(ROOT, 'assets/audio/tracks')
REFS = os.path.join(ROOT, 'assets/audio/refs')

BITRATE = '128k'
ARTIST = 'StepAudio 3 Music'

# (槽位文件名, 源相对路径, ID3 标题, ID3 专辑=能力分区)
# 槽位顺序对应 data.js 里的 t-01…t-20
JOBS = [
    # ── 歌曲创作 text_to_music → t-01…t-05 ────────────────────────────────
    ('tracks/t-01.mp3', '歌曲创作/lyrics2song_case1.mp3', '怎么两清', '歌曲创作'),
    ('tracks/t-02.mp3', '歌曲创作/lyrics2song_case2.mp3', '檐下听雨', '歌曲创作'),
    ('tracks/t-03.mp3', '歌曲创作/lyrics2song_case3.mp3', 'Start Fresh Today', '歌曲创作'),
    ('tracks/t-04.mp3', '歌曲创作/lyrics2song_case4.mp3', 'Pixel Love', '歌曲创作'),
    ('tracks/t-05.mp3', '歌曲创作/lyrics2song_case5.mp3', 'Fluorescent Goodbye', '歌曲创作'),

    # ── 纯音乐创作 text_to_music + instrumental → t-06…t-10 ───────────────
    ('tracks/t-06.mp3', '纯音乐创作/instrumental_case1.wav', 'First Snow in Town', '纯音乐创作'),
    ('tracks/t-07.mp3', '纯音乐创作/instrumental_case2.wav', 'Neon Taiko', '纯音乐创作'),
    ('tracks/t-08.mp3', '纯音乐创作/instrumental_case3.mp3', 'Quiet Majesty', '纯音乐创作'),
    ('tracks/t-09.mp3', '纯音乐创作/instrumental_case4.wav', 'Level One', '纯音乐创作'),
    ('tracks/t-10.mp3', '纯音乐创作/instrumental_case5.wav', 'Neon Horizon', '纯音乐创作'),

    # ── 清唱配乐 vocal_to_music → t-11…t-15 ───────────────────────────────
    ('tracks/t-11.mp3', '清唱配乐/vocal2mix_case1.mp3', '那颗星星', '清唱配乐'),
    ('tracks/t-12.mp3', '清唱配乐/vocal2mix_case2.mp3', '烟雨书签', '清唱配乐'),
    ('tracks/t-13.mp3', '清唱配乐/vocal2mix_case3.mp3', 'Golden Afternoon', '清唱配乐'),
    ('tracks/t-14.mp3', '清唱配乐/vocal2mix_case4.mp3', '橘子糖', '清唱配乐'),
    ('tracks/t-15.mp3', '清唱配乐/vocal2mix_case5.mp3', 'Laundry Wish', '清唱配乐'),

    # 清唱输入。vocal1 是 FLAC（4:13 的整段清唱），其余是 192k mp3。
    ('refs/ref-vocal-01.mp3', '清唱配乐/vocal1.flac', '那颗星星 · 清唱', '输入素材'),
    ('refs/ref-vocal-02.mp3', '清唱配乐/vocal2.mp3', '烟雨书签 · 清唱', '输入素材'),
    ('refs/ref-vocal-03.mp3', '清唱配乐/vocal3.mp3', 'Golden Afternoon · 清唱', '输入素材'),
    ('refs/ref-vocal-04.mp3', '清唱配乐/vocal4.mp3', '橘子糖 · 清唱', '输入素材'),
    ('refs/ref-vocal-05.mp3', '清唱配乐/vocal5.mp3', 'Laundry Wish · 清唱', '输入素材'),

    # ── 歌曲翻唱 music_cover → t-16…t-20 ──────────────────────────────────
    ('tracks/t-16.mp3', '歌曲翻唱/cover1.mp3', '两只老虎-cover', '歌曲翻唱'),
    ('tracks/t-17.mp3', '歌曲翻唱/cover2.mp3', '烟雨书签-cover', '歌曲翻唱'),
    ('tracks/t-18.mp3', '歌曲翻唱/cover3.mp3', '漏不掉你回眸-cover', '歌曲翻唱'),
    ('tracks/t-19.mp3', '歌曲翻唱/cover4.mp3', '法庭外的风-cover', '歌曲翻唱'),
    ('tracks/t-20.mp3', '歌曲翻唱/cover5.mp3', '玻璃门外的蓝天-cover', '歌曲翻唱'),

    # 翻唱的参考歌曲。注意 cover2.txt 的 "source audio" 写成了 cover2.mp3
    # （指向自己的产物，明显是笔误），真正的输入是 source_song2.mp3 ——
    # 它和 清唱配乐/vocal2mix_case2.mp3 **逐字节相同**，也就是说这一例是
    # 「先用清唱配乐生成一首歌，再拿它去翻唱」的链式示例。
    ('refs/ref-song-01.mp3', '歌曲翻唱/source_song1.mp3', '两只老虎 · 参考歌曲', '输入素材'),
    ('refs/ref-song-02.mp3', '歌曲翻唱/source_song2.mp3', '烟雨书签 · 参考歌曲', '输入素材'),
    ('refs/ref-song-03.mp3', '歌曲翻唱/source_song3.mp3', '漏不掉你回眸 · 参考歌曲', '输入素材'),
    ('refs/ref-song-04.mp3', '歌曲翻唱/source_song4.mp3', '法庭外的风 · 参考歌曲', '输入素材'),
    ('refs/ref-song-05.mp3', '歌曲翻唱/source_song5.mp3', '玻璃门外的蓝天 · 参考歌曲', '输入素材'),
]


def probe(path):
    """取时长 / 采样率 / 声道 / 码率。"""
    out = subprocess.run(
        [FFPROBE, '-v', 'error', '-select_streams', 'a:0',
         '-show_entries', 'stream=sample_rate,channels,codec_name',
         '-show_entries', 'format=duration,bit_rate,size',
         '-of', 'json', path],
        capture_output=True, text=True, check=True).stdout
    d = json.loads(out)
    st, fm = d['streams'][0], d['format']
    return {
        'codec': st['codec_name'],
        'rate': int(st['sample_rate']),
        'ch': int(st['channels']),
        'dur': float(fm['duration']),
        'kbps': round(int(fm['bit_rate']) / 1000),
        'size': int(fm['size']),
    }


def encode(src, dst, title, album):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    tmp = dst + '.tmp.mp3'
    cmd = [
        FFMPEG, '-nostdin', '-y', '-v', 'error',
        '-i', src,
        '-map', '0:a:0',
        '-c:a', 'libmp3lame', '-b:a', BITRATE,
        # 不给 -ar / -ac：保留源的采样率与声道（全是 44.1k/48k 立体声）
        '-map_metadata', '-1',
        '-id3v2_version', '3', '-write_xing', '1',
        '-metadata', f'title={title}',
        '-metadata', f'artist={ARTIST}',
        '-metadata', f'album={album}',
        tmp,
    ]
    subprocess.run(cmd, check=True)
    shutil.move(tmp, dst)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    for exe in (FFMPEG, FFPROBE):
        if not os.access(exe, os.X_OK):
            sys.exit(f'找不到可执行的 {exe}')

    missing = [j[1] for j in JOBS if not os.path.isfile(os.path.join(SRC, j[1]))]
    if missing:
        sys.exit('源文件缺失：\n  ' + '\n  '.join(missing))

    print(f'{"槽位":<24} {"源":<38} {"源格式":<20} {"产物":<18} 时长')
    print('-' * 118)
    total_in = total_out = 0.0
    for slot, rel, title, album in JOBS:
        src = os.path.join(SRC, rel)
        dst = os.path.join(ROOT, 'assets/audio', slot)
        a = probe(src)
        total_in += a['size']
        if args.dry_run:
            print(f'{slot:<24} {rel:<38} '
                  f'{a["codec"]}/{a["kbps"]}k/{a["rate"]}Hz'.ljust(20) +
                  f' {"(dry-run)":<18} {a["dur"]:.1f}s')
            continue
        encode(src, dst, title, album)
        b = probe(dst)
        total_out += b['size']
        # 时长必须对得上，转码丢帧是真会发生的
        assert abs(a['dur'] - b['dur']) < 0.5, f'{slot} 时长不符 {a["dur"]} → {b["dur"]}'
        assert b['rate'] == a['rate'], f'{slot} 采样率被改了 {a["rate"]} → {b["rate"]}'
        print(f'{slot:<24} {rel:<38} '
              f'{a["codec"]}/{a["kbps"]}k/{a["rate"]}Hz'.ljust(20) +
              f' mp3/{b["kbps"]}k/{b["rate"]}Hz'.ljust(18) +
              f' {b["dur"]:.1f}s  {b["size"]/1e6:.2f}MB')

    print('-' * 118)
    if args.dry_run:
        print(f'{len(JOBS)} 个文件待转换，源合计 {total_in/1e6:.1f}MB')
    else:
        print(f'{len(JOBS)} 个文件，源合计 {total_in/1e6:.1f}MB → 产物合计 {total_out/1e6:.1f}MB')
        print('\n（data.js 里的 duration 用上面这一列的秒数取整）')


if __name__ == '__main__':
    main()
