#!/usr/bin/env python3
"""
从 showcases/*.txt 生成 assets/js/data.js  build showcase track data
-----------------------------------------------------------------------------
data.js 里 TRACKS 的**歌词和描述直接来自源 txt**，不手抄 —— 那些歌词一首几十行、
还带字面量 \\n 转义，手抄一定会错。所以这个脚本负责：

  1. 解析 showcases/<分区>/<case>.txt 的 title / prompt / lyrics 段
  2. 归一化歌词：字面量 \\n → 真换行、去掉空行、给每个 [Section] 前补一个空行
     （源里有的 case 行行之间都空一行，播放器会把每行渲染成独立段落、行距散掉；
      统一成「段内不空行、段间空一行」，和播放器的逐行解析对得上）
  3. 从产物 mp3 实测时长填 duration
  4. 把标题/标签/英文译文这些需要人判断的字段从下面的 META 表取

**描述（caption）一律是源 txt 里的 prompt 原文**，不改写 —— 这个展示的价值就在于
「真实输入长什么样」。因此中文界面上也会出现英文 prompt（源里 8 个 case 的输入本来
就是英文写的），这是有意的。caption_en 则是英文渲染：输入本来是英文的就用原文，
中文输入的给译文。

用法：
    python3 tools/build_showcase_data.py            # 覆盖写 assets/js/data.js
    python3 tools/build_showcase_data.py --check    # 只校验，不写（CI/回归用）

音频文件由 tools/build_showcase_audio.py 生成，两个脚本的槽位映射必须一致。
"""
import argparse
import json
import os
import re
import subprocess
import sys

FFPROBE = '/usr/bin/ffprobe'
SRC = '/data/projects/stepmusic/music-demo/showcases'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets/js/data.js')

# ─────────────────────────────────────────────────────────────────────────────
# 需要人判断的字段。txt 里只有 title / prompt / lyrics，
# 标签、英文标题、中文 prompt 的英译都在这里维护。
#   slot:      t-NN，与 build_showcase_audio.py 的槽位一致
#   src:       源 txt 相对路径
#   cover:     沿用原占位数据的封面分配（都是抽象图，与曲目无强绑定）
#   title_en:  英文标题；源标题本来就是英文的就重复一遍
#   tags/_en:  三个一组 [风格, 人声/器乐, 调性或特征]，取自 prompt 里真写了的信息。
#              **英文标签要压得比直译更短**：卡片 meta 行是「三个标签 · 时长」，
#              英文比中文长得多（'Female vocal' 对 '女声'），照直译会把时长挤出
#              省略号。所以用 Female/Male、No vocals 这种写法。
#              改完务必跑 tools/verify_showcase.py，它会检查有没有被截断。
#   cap_en:    prompt 的英文版；prompt 本来是英文就留 None（自动复用原文）
# ─────────────────────────────────────────────────────────────────────────────
META = [
    # ── 歌曲创作 song ────────────────────────────────────────────────────
    dict(slot='t-01', section='song', src='歌曲创作/lyrics2song_case1.txt',
         cover='cover-s02-sculpture-01.webp', title_en='Call It Even',
         tags=['流行抒情', '女声', 'G minor'], tags_en=['Pop ballad', 'Female', 'G minor'],
         cap_en='A Chinese pop ballad with a live-room feel, female vocal, G minor, 74 BPM, 4/4. '
                'A real band playing in one take, no electronic bed or effects. Piano, acoustic guitar, '
                'real bass, brushed drums and a small string section, keeping the natural room air and '
                'playing dynamics. No intro — straight into the lyrics. Verses low and restrained, '
                'strings gradually entering later to lift the emotion slightly. The lyrics dwell on '
                'absence in a relationship, rhetorical questions, repetition and silence. Vocal close-mic, '
                'natural and real, light vibrato and audible breath, only minimal tuning; no vocoder, '
                'no auto-harmony, no synthetic voice, and no obvious autotune or robotic processing.'),
    dict(slot='t-02', section='song', src='歌曲创作/lyrics2song_case2.txt',
         cover='cover-warm-02.jpg', title_en='Rain Under the Eaves',
         tags=['国风', '女声', '古筝 · 笛子'], tags_en=['Guofeng', 'Female', 'Guzheng'],
         cap_en='I want a beautiful, wistful guofeng song, female vocal, with guzheng and bamboo flute. '
                'The melody should carry an oriental flavour, the whole thing like a film theme.'),
    dict(slot='t-03', section='song', src='歌曲创作/lyrics2song_case3.txt',
         cover='cover-s19-diorama-05.webp', title_en='Start Fresh Today',
         tags=['民谣流行', '男声', 'D major'], tags_en=['Folk-pop', 'Male', 'D major']),
    dict(slot='t-04', section='song', src='歌曲创作/lyrics2song_case4.txt',
         cover='cover-s05-portrait-01.webp', title_en='Pixel Love',
         tags=['Soul', '男声', 'E minor'], tags_en=['Soul', 'Male', 'E minor']),
    dict(slot='t-05', section='song', src='歌曲创作/lyrics2song_case5.txt',
         cover='cover-s20-botanical-01.webp', title_en='Fluorescent Goodbye',
         tags=['另类摇滚', '男声', 'Cinematic'], tags_en=['Alt-rock', 'Male', 'Cinematic']),

    # ── 纯音乐创作 instrumental ──────────────────────────────────────────
    dict(slot='t-06', section='instrumental', src='纯音乐创作/instrumental_case1.txt',
         cover='cover-dawn-01.jpg', title_en='First Snow in Town',
         tags=['钢琴', '器乐', 'C major'], tags_en=['Piano', 'No vocals', 'C major'],
         cap_en='Could you make me a gentle piano piece, the film-score kind of feel, C major at 85 BPM, '
                'built as theme and variations, with a touch of eighties warmth — like the first snow '
                'falling on a quiet small town. No vocals.'),
    dict(slot='t-07', section='instrumental', src='纯音乐创作/instrumental_case2.txt',
         cover='cover-s15-scanner-01.webp', title_en='Neon Taiko',
         tags=['Bebop', '器乐', '太鼓'], tags_en=['Bebop', 'No vocals', 'Taiko'],
         cap_en='classic bebop, Jupiter-8, taiko ensemble, cavernous reverb, polished production'),
    dict(slot='t-08', section='instrumental', src='纯音乐创作/instrumental_case3.txt',
         cover='cover-city-01.jpg', title_en='Quiet Majesty',
         tags=['管弦', '器乐', 'Cinematic'], tags_en=['Orchestral', 'No vocals', 'Elegant']),
    dict(slot='t-09', section='instrumental', src='纯音乐创作/instrumental_case4.txt',
         cover='cover-abstract-03.jpg', title_en='Level One',
         tags=['游戏配乐', '器乐', '复古'], tags_en=['Game score', 'No vocals', 'Retro'],
         cap_en='Retro video-game score. It opens on a single low ostinato and slowly stacks up into a '
                'full, rich arrangement.'),
    dict(slot='t-10', section='instrumental', src='纯音乐创作/instrumental_case5.txt',
         cover='cover-retro-01.jpg', title_en='Neon Horizon',
         tags=['City Pop', '器乐', '808'], tags_en=['City Pop', 'No vocals', '808']),

    # ── 清唱配乐 vocal2music ─────────────────────────────────────────────
    dict(slot='t-11', section='vocal2music', src='清唱配乐/vocal2mix_case1.txt',
         cover='cover-s01-minimal-04.webp', title_en='That Star',
         tags=['City Pop', '女声', 'Bossa Nova'], tags_en=['City Pop', 'Female', 'Bossa Nova'],
         ref=('vocal_audio', 'ref-vocal-01.mp3'),
         cap_en='A warm, healing City Pop song with a female vocal, with a touch of bossa nova and soft '
                'rock — easy and swaying, tender and full of hope.'),
    dict(slot='t-12', section='vocal2music', src='清唱配乐/vocal2mix_case2.txt',
         cover='cover-s17-surreal-05.webp', title_en='Misty-Rain Bookmark',
         tags=['City Pop', '男声', '爵士 · 轻摇滚'],
         tags_en=['City Pop', 'Male', 'Jazz · Soft rock'],
         ref=('vocal_audio', 'ref-vocal-02.mp3'),
         cap_en='A warm, mellow City Pop song with a male vocal, with a touch of jazz and soft rock '
                '— hazy and romantic in mood.'),
    dict(slot='t-13', section='vocal2music', src='清唱配乐/vocal2mix_case3.txt',
         cover='cover-ink-02.jpg', title_en='Golden Afternoon',
         tags=['民谣', '男声', 'Latin'], tags_en=['Folk', 'Male', 'Latin'],
         ref=('vocal_audio', 'ref-vocal-03.mp3')),
    dict(slot='t-14', section='vocal2music', src='清唱配乐/vocal2mix_case4.txt',
         cover='cover-s06-mascot-03.webp', title_en='Orange Candy',
         tags=['民谣摇滚', '女声', 'Latin'], tags_en=['Folk rock', 'Female', 'Latin'],
         ref=('vocal_audio', 'ref-vocal-04.mp3'),
         cap_en='A folk-rock song with a Latin flavour and a female vocal — gentle, a little husky, full '
                'of weary sadness that finally lets go.'),
    dict(slot='t-15', section='vocal2music', src='清唱配乐/vocal2mix_case5.txt',
         cover='cover-s14-textile-01.webp', title_en='Laundry Wish',
         tags=['民谣流行', '男声', 'Acoustic'], tags_en=['Folk-pop', 'Male', 'Acoustic'],
         ref=('vocal_audio', 'ref-vocal-05.mp3')),

    # ── 歌曲翻唱 cover ───────────────────────────────────────────────────
    dict(slot='t-16', section='cover', src='歌曲翻唱/cover1.txt',
         cover='cover-s09-science-05.webp', title_en='Two Tigers (Cover)',
         tags=['Pop · Jazz', '男声', '强节奏'], tags_en=['Pop · Jazz', 'Male', 'Groove'],
         ref=('song_audio', 'ref-song-01.mp3')),
    dict(slot='t-17', section='cover', src='歌曲翻唱/cover2.txt',
         cover='cover-cosmic-04.jpg', title_en='Misty-Rain Bookmark (Cover)',
         tags=['Pop · R&B · Metal', '女声', '快节奏'],
         tags_en=['Pop/R&B/Metal', 'Female', 'Fast'],
         ref=('song_audio', 'ref-song-02.mp3'),
         cap_en='Pop, R&B, metal, up-tempo, female vocal'),
    dict(slot='t-18', section='cover', src='歌曲翻唱/cover3.txt',
         cover='cover-club-05.jpg', title_en='Your Backward Glance (Cover)',
         tags=['Soul', '男声', '抒情'], tags_en=['Soul', 'Male', 'Ballad'],
         ref=('song_audio', 'ref-song-03.mp3'),
         cap_en='Soul, gentle male vocal, lyrical, heartbroken'),
    dict(slot='t-19', section='cover', src='歌曲翻唱/cover4.txt',
         cover='cover-s03-collage-05.webp', title_en='Courthouse Wind (Cover)',
         tags=['Trap', '男声', '激昂'], tags_en=['Trap', 'Male', 'Anthemic'],
         ref=('song_audio', 'ref-song-04.mp3'),
         cap_en='Trap, up-tempo, male vocal, impassioned, expansive'),
    dict(slot='t-20', section='cover', src='歌曲翻唱/cover5.txt',
         cover='cover-s10-zine-04.webp', title_en='Blue Sky Outside (Cover)',
         tags=['Trap', '男声', 'D major'], tags_en=['Trap', 'Male', 'D major'],
         ref=('song_audio', 'ref-song-05.mp3')),
]


def parse_txt(path):
    """txt 是「段名单独一行 + 内容若干行」的平铺格式，段名固定是这几个。"""
    keys = {'title', 'prompt', 'lyrics', 'source audio', 'vocal audio'}
    out, cur = {}, None
    for raw in open(path, encoding='utf-8').read().split('\n'):
        if raw.strip() in keys:
            cur = raw.strip()
            out[cur] = []
        elif cur:
            out[cur].append(raw)
    return {k: '\n'.join(v).strip() for k, v in out.items()}


#: 源 txt 里的歌词是**转义过的单行字符串**（\n 当换行、引号写成 \"）
ESCAPES = {'n': '\n', 'r': '\n', 't': '\t', '"': '"', "'": "'", '\\': '\\'}


def unescape(s):
    """把转义序列解开。遇到不认识的转义就报错，别默默吞掉。"""
    # 源里 vocal2mix_case1 有一处坏转义：`[Chorus 2]\所有的你…`（\n 掉了 n）。
    # 只在「] 后面的反斜杠跟着的不是合法转义字符」时把 n 补回去 ——
    # 否则正常的 `]\n` 会被误伤成 `]\nn`。
    s = re.sub(r'\]\\(?![nrt"\'\\])', r']\\n', s)
    bad = []

    def rep(m):
        c = m.group(1)
        if c in ESCAPES:
            return ESCAPES[c]
        bad.append(m.group(0))
        return m.group(0)

    out = re.sub(r'\\(.)', rep, s)
    assert not bad, f'歌词里有无法识别的转义 {bad!r}，先确认源文件是不是坏了'
    return out


def norm_lyrics(raw):
    """解转义 → 段内不空行、段间空一行。"""
    if not raw:
        return ''
    lines = [ln.strip() for ln in unescape(raw).split('\n')]
    lines = [ln for ln in lines if ln]
    out = []
    for ln in lines:
        if ln.startswith('[') and out:
            out.append('')          # 段间空一行
        out.append(ln)
    return '\n'.join(out)


def dur(path):
    """实测秒数，**向下取整**。

    必须和 audio.js 的 fmt() 一致 —— 它是 Math.floor(s/60):Math.floor(s%60)。
    卡片在音频加载前显示 data.js 里的静态值、展开面板显示解码出的真实值，
    这里若用 round()，153.72s 会写成 154 → 卡片 2:34、面板 2:33，同一首歌
    两个地方差一秒。取 floor 就都是 2:33。
    """
    out = subprocess.run(
        [FFPROBE, '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'default=nw=1:nk=1', path],
        capture_output=True, text=True, check=True).stdout
    return int(float(out.strip()))


def js(v):
    """输出成 JS 字面量。用 json.dumps：双引号 + 正确转义，比手拼安全。"""
    return json.dumps(v, ensure_ascii=False)


def build():
    rows = []
    for m in META:
        txt = parse_txt(os.path.join(SRC, m['src']))
        audio_rel = f"assets/audio/tracks/{m['slot']}.mp3"
        audio_abs = os.path.join(ROOT, audio_rel)
        if not os.path.isfile(audio_abs):
            sys.exit(f'缺音频 {audio_rel} —— 先跑 tools/build_showcase_audio.py')

        inst = m['section'] == 'instrumental'
        cap = txt.get('prompt', '')
        r = {
            'id': m['slot'], 'section': m['section'],
            'cover': 'assets/covers/' + m['cover'],
            'audio': audio_rel, 'duration': dur(audio_abs),
            'title': txt['title'], 'title_en': m['title_en'],
            'tags': m['tags'], 'tags_en': m['tags_en'],
            'caption': cap, 'caption_en': m.get('cap_en') or cap,
        }
        if not inst:
            r['lyrics'] = norm_lyrics(txt.get('lyrics', ''))
            if not r['lyrics']:
                sys.exit(f"{m['slot']} 不是纯音乐却没有歌词")
        else:
            r['instrumental'] = True
            if txt.get('lyrics'):
                sys.exit(f"{m['slot']} 是纯音乐却带歌词")
        if 'ref' in m:
            kind, fn = m['ref']
            ref_rel = 'assets/audio/refs/' + fn
            if not os.path.isfile(os.path.join(ROOT, ref_rel)):
                sys.exit(f'缺输入素材 {ref_rel}')
            r['inputs'] = {kind: ref_rel}
        rows.append(r)
    return rows


SECTION_TITLE = {
    'song': '歌曲创作 text_to_music',
    'instrumental': '纯音乐创作 text_to_music + instrumental',
    'vocal2music': '清唱配乐 vocal_to_music（旋律跟随清唱）',
    'cover': '歌曲翻唱 music_cover（旋律跟随参考歌曲）',
}


def render(rows):
    out = ['''/* =============================================================================
   示例曲目数据 —— **正式示例，不是占位数据**
   -----------------------------------------------------------------------------
   本文件由 tools/build_showcase_data.py 从素材目录生成，不要手改：
       /data/projects/stepmusic/music-demo/showcases/<分区>/<case>.txt
   改了素材或想调标签/英文译文，改那个脚本里的 META 表再重跑：
       python3 tools/build_showcase_audio.py   # 音频 → 128k mp3
       python3 tools/build_showcase_data.py    # 本文件

   几个口径：
     * caption 是**源 txt 里 prompt 的原文**，不改写 —— 展示的价值就在于「真实
       输入长什么样」。所以中文界面上也会出现英文 prompt（源里 8 个 case 的输入
       本来就是英文写的），这是有意的；caption_en 给的是英文渲染。
     * duration 由产物 mp3 实测取整；播放器 loadedmetadata 还会再校正一次。
     * 歌词已归一化成「段内不空行、段间空一行」，与 player.js 的逐行解析对齐。
   四个分区与接口 task 的对应关系见 assets/js/api.js 的 TASK_MAP。
   每个分区 5 首 —— 聆听页一排放 5 张，首页精选正好 4 排 × 5 列 = 20 首。
   ============================================================================= */

export const SECTIONS = [
  { id: 'song',         task: 'text_to_music',  instrumental: false },
  { id: 'instrumental', task: 'text_to_music',  instrumental: true  },
  { id: 'vocal2music',  task: 'vocal_to_music', instrumental: false },
  { id: 'cover',        task: 'music_cover',    instrumental: false },
];

export const TRACKS = [''']

    last = None
    for r in rows:
        if r['section'] != last:
            last = r['section']
            bar = '─' * max(3, 66 - len(SECTION_TITLE[last]))
            out.append(f'  /* ── {SECTION_TITLE[last]} {bar} */')
        out.append('  {')
        out.append(f"    id: {js(r['id'])}, section: {js(r['section'])}, "
                   f"cover: {js(r['cover'])},")
        out.append(f"    audio: {js(r['audio'])}, duration: {r['duration']},")
        out.append(f"    title: {js(r['title'])}, title_en: {js(r['title_en'])},")
        out.append(f"    tags: {js(r['tags'])}, tags_en: {js(r['tags_en'])},")
        out.append(f"    caption: {js(r['caption'])},")
        out.append(f"    caption_en: {js(r['caption_en'])},")
        if 'lyrics' in r:
            out.append(f"    lyrics: {js(r['lyrics'])},")
        if r.get('instrumental'):
            out.append('    instrumental: true,')
        if 'inputs' in r:
            k, v = next(iter(r['inputs'].items()))
            out.append(f"    inputs: {{ {k}: {js(v)} }},")
        out.append('  },')
    out.append('];')
    out.append('''
/* 首页「精选作品」：4 排 × 5 首，就是全部 20 首。
   刻意打散成一个拉丁方 —— 5 列布局下任意一列都不出现重复的能力分区，
   这样首页看上去是「作品集」，而不是按能力分好组的目录（那是「聆听」页的事）。
   （每排 5 格但只有 4 个分区，所以行内必然有一个分区出现两次，这个躲不掉。）

   排序为整排轮转过一次：原先的最后一排提到了最前面，其余依次下移。
   轮转只是重新排列每一列的内部顺序，所以上面的拉丁方性质不受影响。 */
export const FEATURED_ORDER = [
  't-19', 't-05', 't-10', 't-15', 't-20',
  't-01', 't-06', 't-11', 't-16', 't-02',
  't-07', 't-12', 't-17', 't-03', 't-08',
  't-13', 't-18', 't-04', 't-09', 't-14',
];

/* 灵感示例：点一下填进输入框。取自上面 20 个正式示例里真实用过的 prompt，
   长的那几条按输入框的体量做了截取。structured prompt 比一句话信息量大。 */
export const RECIPES = [''')

    # 灵感示例直接复用真实 prompt：挑短的、风格分布开的
    picks = [
        ('t-06', '温柔钢琴', 'Gentle Piano'),
        ('t-11', '治愈 City Pop', 'Healing City Pop'),
        ('t-02', '唯美国风', 'Wistful Guofeng'),
        ('t-09', '复古游戏', 'Retro Game'),
        ('t-07', 'Bebop × 太鼓', 'Bebop × Taiko'),
        ('t-14', '拉丁民谣摇滚', 'Latin Folk Rock'),
        ('t-05', '电影感另类摇滚', 'Cinematic Alt-Rock'),
        ('t-08', '沉静管弦', 'Contemplative Orchestral'),
        ('t-10', 'City Pop 器乐', 'City Pop Instrumental'),
        ('t-20', '凶悍 Trap', 'Hard Trap'),
    ]
    by_id = {r['id']: r for r in rows}
    for tid, lab, lab_en in picks:
        r = by_id[tid]
        inst = 'true' if r.get('instrumental') else 'false'
        out.append(f"  {{ label: {js(lab)}, label_en: {js(lab_en)}, instrumental: {inst},")
        out.append(f"    caption: {js(r['caption'])},")
        out.append(f"    caption_en: {js(r['caption_en'])} }},")
    out.append('];')
    out.append('')
    out.append('export const TRACK_BY_ID = new Map(TRACKS.map(t => [t.id, t]));')
    out.append('')
    return '\n'.join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true', help='只校验，不写文件')
    args = ap.parse_args()

    rows = build()
    text = render(rows)

    if args.check:
        cur = open(OUT, encoding='utf-8').read() if os.path.isfile(OUT) else ''
        if cur != text:
            sys.exit('data.js 与素材不同步 —— 跑 python3 tools/build_showcase_data.py')
        print(f'✅ data.js 与素材同步（{len(rows)} 首）')
        return

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(text)

    n_lyr = sum(1 for r in rows if 'lyrics' in r)
    n_ref = sum(1 for r in rows if 'inputs' in r)
    total = sum(r['duration'] for r in rows)
    print(f'写入 {OUT}')
    print(f'  {len(rows)} 首，含歌词 {n_lyr} 首，带输入素材 {n_ref} 首，'
          f'合计时长 {total // 60}分{total % 60}秒')
    for sec in ('song', 'instrumental', 'vocal2music', 'cover'):
        got = [r for r in rows if r['section'] == sec]
        print(f'  {sec:<13} {len(got)} 首  '
              + '  '.join(f"{r['id']}·{r['title']}({r['duration']}s)" for r in got))


if __name__ == '__main__':
    main()
