#!/usr/bin/env python3
"""
正式示例的验收 verify showcase tracks
-----------------------------------------------------------------------------
覆盖「20 个正式示例接入应用」的验收点：
  1. 首页精选 20 张卡、封面全部加载、无重复
  2. 聆听页四个分区各 5 首，10 张卡带「输入」角标（清唱 5 + 翻唱 5）
  3. 真实音频能播、进度前进、无解码错误
  4. 展开面板：曲名 / 标签 / 结构化歌词 / 描述是 prompt 原文
  5. 翻唱的参考歌曲、清唱配乐的清唱输入都能独立解码
  6. 纯音乐分区是 inst 模式且不显示歌词区
  7. 20 首全部可解码，且时长与 data.js 的静态值一致
  8. **卡片上的静态时长 == 面板里解码后的时长**（data.js 必须 floor，见
     tools/build_showcase_data.py 的 dur()；用 round 会差一秒）
  9. 中英切换：卡片无中文残留、描述走 caption_en、切回中文正常
 10. 卡片标题/meta 行在中英两种语言下都不被 ellipsis 截断

两个容易踩的坑（都踩过）：
  * 应用是 SPA，四个路由的 DOM **同时在文档里**（靠 .on 类切显示）。
    选择器必须限定到 #view-listen / #view-home，否则 querySelectorAll('.card')
    会把两个页面的卡片都数进来（20 变 40）。
  * 点卡片**只播放、不展开面板**（只有点 .card-ref 角标才会自动展开）。
    要验面板内容得自己按 e 打开；而且面板是 modal，不关掉会挡住后面要点的卡片。
  * 切语言别用 localStorage + goto 同一个 hash —— 同 URL 的 goto 不会重新
    执行模块，i18n 里的 lang 还是旧值。直接点界面上的语言开关。

用法：python3 tools/verify_showcase.py
"""
import http.server
import os
import socketserver
import sys
import threading
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8964

ok = True


def chk(cond, label, extra=''):
    global ok
    if not cond:
        ok = False
    print(f"  {'✅' if cond else '❌'} {label}" + (f'  [{extra}]' if extra else ''))


def serve():
    os.chdir(ROOT)
    h = http.server.SimpleHTTPRequestHandler
    h.log_message = lambda *a, **k: None
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', PORT), h) as d:
        d.serve_forever()


def main():
    threading.Thread(target=serve, daemon=True).start()
    time.sleep(1)
    from playwright.sync_api import sync_playwright

    base = f'http://127.0.0.1:{PORT}'
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={'width': 1440, 'height': 950})
        errs, bad = [], []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('response',
              lambda r: bad.append((r.status, r.url)) if r.status >= 400 else None)

        def close_np():
            if pg.evaluate("document.getElementById('np').classList.contains('on')"):
                pg.click('#npClose')
                pg.wait_for_timeout(600)

        def open_card(tid):
            """点卡片播放，再按 e 展开面板（点卡片本身只播不展开）。"""
            close_np()
            pg.click(f'#view-listen .card[data-id="{tid}"]')
            pg.wait_for_timeout(1800)
            pg.keyboard.press('e')
            pg.wait_for_timeout(1500)

        print('=== 1 首页精选 ===')
        pg.goto(f'{base}/app.html#/home', wait_until='load')
        pg.wait_for_timeout(2500)
        h = pg.evaluate("""()=>{
          const cs=[...document.querySelectorAll('#view-home .card')];
          return {n:cs.length, ids:cs.map(c=>c.dataset.id),
            imgs:cs.filter(c=>{const i=c.querySelector('img');return i&&i.naturalWidth>0}).length,
            rows:cs.slice(0,3).map(c=>c.textContent.replace(/\\s+/g,' ').trim().slice(0,58))};
        }""")
        chk(h['n'] == 20, '20 张卡片', str(h['n']))
        chk(h['imgs'] == 20, '封面全部加载', f"{h['imgs']}/20")
        chk(len(set(h['ids'])) == 20, '无重复曲目')
        for r in h['rows']:
            print('     ', r)

        print('=== 2 聆听页分区 ===')
        pg.goto(f'{base}/app.html#/listen', wait_until='load')
        pg.wait_for_timeout(2500)
        l = pg.evaluate("""()=>{
          const v=document.getElementById('view-listen');
          const gs=[...v.querySelectorAll('.grid')].filter(g=>g.querySelector('.card'));
          return {total:v.querySelectorAll('.card').length,
            per:gs.map(g=>g.querySelectorAll('.card').length),
            refs:v.querySelectorAll('.card-ref').length,
            ids:gs.map(g=>[...g.querySelectorAll('.card')].map(c=>c.dataset.id).join(','))};
        }""")
        chk(l['total'] == 20, '20 张卡片', str(l['total']))
        chk(l['per'] == [5, 5, 5, 5], '四个分区各 5 首', str(l['per']))
        chk(l['refs'] == 10, '10 张带「输入」角标（清唱 5 + 翻唱 5）', str(l['refs']))
        for s in l['ids']:
            print('     ', s)

        print('=== 3 播放真实音频（t-01）===')
        pg.click('#view-listen .card[data-id="t-01"]')
        pg.wait_for_timeout(4500)
        st = pg.evaluate("""()=>{const a=document.querySelector('audio');return {
            src:a.currentSrc.split('/').pop(), dur:Math.round(a.duration),
            t:+a.currentTime.toFixed(1), paused:a.paused, err:a.error&&a.error.code}}""")
        chk(st['src'] == 't-01.mp3', '播放 t-01.mp3', st['src'])
        chk(not st['paused'] and st['t'] > 0.3, '在播且进度前进', str(st['t']))
        chk(not st['err'], '无解码错误')

        print('=== 4 展开面板：歌词 / 描述 ===')
        open_card('t-01')
        np = pg.evaluate("""()=>{const w=document.getElementById('npWords');
          return {secs:[...w.querySelectorAll('.lyr-sec')].map(e=>e.textContent),
                  lines:w.querySelectorAll('.lyr-line').length,
                  cap:(w.querySelector('.np-block .v')?.textContent||''),
                  inputs:w.querySelectorAll('.np-input audio').length,
                  title:document.getElementById('npTitle')?.textContent,
                  tags:document.getElementById('npTags')?.textContent,
                  dur:document.getElementById('npDur')?.textContent}}""")
        print('     ', np['title'], '|', np['tags'])
        print('      段落:', np['secs'])
        chk(np['title'] == '怎么两清', '曲名', str(np['title']))
        chk('流行抒情 · 女声 · G minor' in np['tags'], '标签', np['tags'])
        chk(len(np['secs']) == 6 and np['lines'] == 6,
            '6 段结构标签 / 6 组歌词', f"{len(np['secs'])}/{np['lines']}")
        chk(np['cap'].startswith('一首中文现场感流行抒情歌'),
            '描述 = 真实 prompt 原文', np['cap'][:22])
        chk(np['inputs'] == 0, '歌曲创作无输入素材')

        card_t = pg.evaluate(
            """()=>document.querySelector('#view-listen .card[data-id="t-01"]')"""
            """.textContent.match(/\\d+:\\d\\d/)[0]""")
        chk(card_t == np['dur'],
            f'卡片静态时长 == 面板解码时长（{card_t}）', f"card={card_t} np={np['dur']}")

        print('=== 5 翻唱的参考歌曲 ===')
        close_np()
        pg.click('#view-listen .card[data-id="t-18"] .card-ref')
        pg.wait_for_timeout(3500)
        cv = pg.evaluate("""()=>{const w=document.getElementById('npWords');
          return {ins:[...w.querySelectorAll('.np-input')].map(d=>({
                    lab:d.querySelector('.lab')?.textContent?.trim(),
                    src:d.querySelector('audio')?.getAttribute('src').split('/').pop()})),
                  title:document.getElementById('npTitle')?.textContent}}""")
        print('     ', cv)
        chk(cv['title'] == '漏不掉你回眸-cover', '曲名', str(cv['title']))
        chk(len(cv['ins']) == 1 and cv['ins'][0]['src'] == 'ref-song-03.mp3',
            '带 1 个参考歌曲 ref-song-03.mp3')
        d = pg.evaluate("""async()=>{const a=document.querySelector('.np-input audio');
          a.load(); await new Promise(r=>{a.onloadedmetadata=r;a.onerror=r;setTimeout(r,8000)});
          return {dur:Math.round(a.duration||0), err:a.error&&a.error.code}}""")
        chk(d['dur'] == 168 and not d['err'], '参考歌曲可解码 168s', str(d))

        print('=== 6 清唱配乐的清唱输入 ===')
        close_np()
        pg.click('#view-listen .card[data-id="t-13"] .card-ref')
        pg.wait_for_timeout(3500)
        v2 = pg.evaluate("""()=>{const w=document.getElementById('npWords');
          return {ins:[...w.querySelectorAll('.np-input')].map(d=>
                    d.querySelector('audio')?.getAttribute('src').split('/').pop()),
                  title:document.getElementById('npTitle')?.textContent,
                  lyr:w.querySelectorAll('.lyr-sec').length}}""")
        print('     ', v2)
        chk(v2['title'] == 'Golden Afternoon', '曲名', str(v2['title']))
        chk(v2['ins'] == ['ref-vocal-03.mp3'], '带 1 段清唱 ref-vocal-03.mp3')
        chk(v2['lyr'] >= 7, '歌词结构已解析', str(v2['lyr']))

        print('=== 7 纯音乐分区 ===')
        open_card('t-09')
        ins = pg.evaluate("""()=>{const w=document.getElementById('npWords');
          return {mode:document.getElementById('np')?.dataset.mode,
                  lyr:w.querySelectorAll('.np-lyrics').length,
                  cap:(w.querySelector('.np-block .v')?.textContent||''),
                  title:document.getElementById('npTitle')?.textContent}}""")
        print('     ', ins['title'], '| mode:', ins['mode'])
        chk(ins['title'] == 'Level One', '曲名', str(ins['title']))
        chk(ins['mode'] == 'inst' and ins['lyr'] == 0,
            'inst 模式且不显示歌词区', f"{ins['mode']}/{ins['lyr']}")
        chk('复古游戏配乐' in ins['cap'], '描述 = 真实 prompt')

        print('=== 8 全部 20 首可解码且时长与 data.js 一致 ===')
        res = pg.evaluate("""async()=>{
          const mod=await import('./assets/js/data.js'); const out=[];
          for(const t of mod.TRACKS){
            const a=new Audio(); a.preload='metadata'; a.src=t.audio;
            const d=await new Promise(r=>{a.onloadedmetadata=()=>r(a.duration);
              a.onerror=()=>r(-1); setTimeout(()=>r(-2),15000)});
            out.push({id:t.id, want:t.duration, got:d<0?d:Math.floor(d)});
          } return out}""")
        dead = [r for r in res if r['got'] < 0]
        chk(not dead, '20 首全部可解码', str(dead))
        # 容 1 秒：浏览器解码出的时长和 ffprobe 报的容器时长能差 ~50ms
        # （mp3 编码器的 delay/padding），floor() 在整秒边界上就会翻个个儿。
        # 实测 20 首里 container floor 命中 19、decoded floor 也命中 19，
        # 只是各差一首 —— 想让静态值和浏览器逐首完全相等做不到，而且换个浏览器
        # 又是另一套。真正在用的地方都不受影响：进度条和面板走的是解码值，
        # loadedmetadata 之后自动校正（见 audio.js 的 duration()）。
        off = [r for r in res if r['got'] >= 0 and abs(r['got'] - r['want']) > 1]
        chk(not off, 'floor(实测) 与 data.js duration 相差 ≤1s', str(off))
        drift = [f"{r['id']}({r['want']}→{r['got']})"
                 for r in res if r['got'] >= 0 and r['got'] != r['want']]
        print('     ', ' '.join(f"{r['id']}:{r['got']}s" for r in res))
        if drift:
            print('      差 1 秒（卡片静态值 vs 浏览器解码值）:', ' '.join(drift))

        print('=== 9 中英切换 ===')
        close_np()
        pg.click('.lang-switch button[data-lang="en"]')
        pg.wait_for_timeout(1800)
        en = pg.evaluate("""()=>{const cs=[...document.querySelectorAll('#view-listen .card')];
          const txt=cs.map(c=>c.textContent.replace(/\\s+/g,' ').trim());
          return {lang:document.documentElement.lang,
                  cjk:txt.filter(s=>/[\\u4e00-\\u9fff]/.test(s)), first:txt.slice(0,3)}}""")
        for r in en['first']:
            print('     ', r[:64])
        chk(en['lang'] == 'en', 'html lang=en', en['lang'])
        chk(not en['cjk'], '英文模式卡片无中文残留', str(en['cjk'])[:200])
        open_card('t-01')
        ec = pg.evaluate("""()=>({title:document.getElementById('npTitle')?.textContent,
            cap:(document.querySelector('#npWords .np-block .v')?.textContent||'')})""")
        chk(ec['title'] == 'Call It Even', '英文曲名', str(ec['title']))
        chk(ec['cap'].startswith('A Chinese pop ballad'),
            '英文描述走 caption_en', ec['cap'][:28])
        close_np()
        pg.click('.lang-switch button[data-lang="zh"]')
        pg.wait_for_timeout(1500)
        zh = pg.evaluate("""()=>({lang:document.documentElement.lang,
            txt:document.querySelector('#view-listen .card').textContent})""")
        chk(zh['lang'] == 'zh-CN' and '怎么两清' in zh['txt'], '切回中文正常')

        print('=== 10 卡片文字不被截断（中英两种语言、两个页面）===')
        # 卡片的标题和 meta 行都是单行 + ellipsis。中文标签只有两三个字、随便都放得下，
        # 英文长得多（'Female vocal' 对 '女声'），照直译会把 meta 行末尾的时长挤进
        # 省略号里 —— 时长是有用信息，不该丢。所以英文标签在 META 表里是特意压短的，
        # 这条检查就是那个约定的守门人：改 tags_en / title_en 之后必须还能过。
        clip_js = """(view)=>{const out=[];
          for(const c of document.querySelectorAll(view+' .card'))
            for(const e of c.querySelectorAll('h3,.card-meta'))
              if(e.scrollWidth>e.clientWidth+2)
                out.push({id:c.dataset.id, what:e.className||'title',
                          txt:e.textContent.trim(), over:e.scrollWidth-e.clientWidth});
          return out}"""
        for lang in ('zh', 'en'):
            pg.click(f'.lang-switch button[data-lang="{lang}"]')
            pg.wait_for_timeout(1500)
            for route, view in (('listen', '#view-listen'), ('home', '#view-home')):
                pg.goto(f'{base}/app.html#/{route}', wait_until='load')
                pg.wait_for_timeout(2000)
                cl = pg.evaluate(clip_js, view)
                chk(not cl, f'{route} / {lang} 无截断',
                    '; '.join(f"{c['id']} {c['what']} +{c['over']}px «{c['txt']}»"
                              for c in cl))

        print('=== 11 资源与报错 ===')
        real = [b for b in bad if 'favicon.ico' not in b[1]]
        chk(not real, '无 4xx/5xx', str(real[:3]))
        chk(not errs, '无 JS 报错', str(errs[:2]))
        br.close()

    print('\n' + ('✅ 全部通过' if ok else '❌ 有失败项'))
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
