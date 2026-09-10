#!/usr/bin/env python3
"""
落地页验证 verify landing page
-----------------------------------------------------------------------------
覆盖首页的验收点：
  1. 资源全部可取（视频 / 海报 / 封面 / 字体），无 404
  2. 五个断点无横向溢出，顶栏在窄屏不折行
  3. 首屏只有产品名与标语，产品名分两行且 Music 使用渐变，logo 可随顶栏反色
  4. 锚点跳转不被 fixed 顶栏遮挡
  5. 中英切换无残留、共用 sa3m.lang
  6. prefers-reduced-motion：不加载视频但保留海报做静态背景，内容直接可见
  7. 与应用互跳：首页 CTA → app.html，应用 logo → 首页
  8. **真实鼠标滚轮**能滚页面 —— base.css 给 body 设了 overflow:hidden（应用外壳
     要用），落地页必须覆盖掉。只用 JS scrollTo 验证会漏掉这个 bug，务必用
     mouse.wheel / 键盘这类真实输入。

用法：python3 tools/verify_landing.py
"""
import http.server, os, socketserver, sys, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8943

def serve():
    os.chdir(ROOT)
    h = http.server.SimpleHTTPRequestHandler
    h.log_message = lambda *a, **k: None
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), h) as d:
        d.serve_forever()


def main():
    threading.Thread(target=serve, daemon=True).start()
    time.sleep(1)
    from playwright.sync_api import sync_playwright

    ok = True

    def chk(cond, label, extra=""):
        nonlocal ok
        print(f"  {'✅' if cond else '❌'} {label}" + (f"  {extra}" if extra and not cond else ""))
        if not cond:
            ok = False

    base = f"http://127.0.0.1:{PORT}"
    with sync_playwright() as p:
        br = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])

        # ── 1 资源 & 基本渲染 ──────────────────────────────────────────────
        pg = br.new_page(viewport={"width": 1440, "height": 900})
        bad, errs = [], []
        pg.on("requestfailed", lambda r: bad.append(f"{r.url.split('/')[-1]}::{r.failure}"))
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.on("console", lambda m: errs.append(f"[{m.type}] {m.text[:140]}")
              if m.type == "error" else None)
        pg.on("response", lambda r: bad.append(f"{r.url.split('/')[-1]}::HTTP{r.status}")
              if r.status >= 400 else None)
        pg.goto(f"{base}/index.html", wait_until="load")
        pg.evaluate("localStorage.setItem('sa3m.lang','zh')")
        pg.reload(wait_until="load")
        pg.wait_for_timeout(3000)

        print("=== 1 资源与渲染 ===")
        chk(not bad, "无 404 / 失败请求", str(bad[:4]))
        chk(not errs, "无 JS 报错", str(errs[:3]))
        st = pg.evaluate("""() => {
            const v=document.getElementById('heroVideo');
            return { videoPlaying: v ? !v.paused : false, readyState: v? v.readyState:0,
                     caps: document.querySelectorAll('.cap').length,
                     chain: document.querySelectorAll('.chain-step').length,
                     uses: document.querySelectorAll('.use').length,
                     tags: [...document.querySelectorAll('.tag')].map(e=>e.textContent) }; }""")
        chk(st["videoPlaying"], "背景视频在播放", f"readyState={st['readyState']}")
        chk(st["caps"] == 4 and st["chain"] == 4 and st["uses"] == 3,
            "四种能力 / 四段信号链 / 三个场景都在", str(st))
        chk(st["tags"] == ['[Verse]', '[Chorus]', '[Bridge]', '[Outro]'],
            "分区用歌曲结构标签标记", str(st["tags"]))

        # ── 2 断点 ────────────────────────────────────────────────────────
        print("=== 2 响应式 ===")
        for w in (320, 390, 560, 768, 1180, 1440):
            q = br.new_page(viewport={"width": w, "height": 860})
            q.goto(f"{base}/index.html", wait_until="load")
            q.wait_for_timeout(1500)
            r = q.evaluate("""() => {
                const h=e=>Math.round(e.getBoundingClientRect().height);
                return { over: document.documentElement.scrollWidth-document.documentElement.clientWidth,
                         headH: h(document.querySelector('.lhead')),
                         ctaH: h(document.querySelector('.lhead-cta')) }; }""")
            chk(r["over"] == 0 and r["headH"] <= 66 and r["ctaH"] <= 36,
                f"{w}px 无横向溢出且顶栏单行", str(r))
            q.close()

        # ── 3 首屏结构 & 真实滚轮 ────────────────────────────────────────
        print("=== 3 首屏结构 ===")
        h = pg.evaluate("""() => {
            const r=e=>e.getBoundingClientRect();
            const copy=document.querySelector('.hero-copy');
            const sl=document.querySelector('.hero-slogan');
            return {
              blocks: [...copy.children].map(e=>e.className.split(' ')[0]),
              sloganText: sl.innerText.trim(),
              wordmarkTop: document.querySelector('.hero-wordmark-top')?.innerText.trim(),
              wordmarkMain: document.querySelector('.hero-wordmark-main')?.innerText.trim(),
              musicGradient: getComputedStyle(document.querySelector('.hero-wordmark-main')).backgroundImage,
              sweepWidth: Math.round(document.querySelector('.hero-sweep')?.getBoundingClientRect().width || 0),
              logoInline: !!document.querySelector('svg.lbrand-mark'),
              logoColorFollows: getComputedStyle(document.querySelector('.lbrand-mark')).fill,
              heroJump: !!document.querySelector('.hero-jump'),
              videoToggle: !!document.querySelector('.hero-vidtoggle'),
              textAlign: getComputedStyle(copy).textAlign,
            }; }""")
        chk(h["blocks"] == ["hero-wordmark", "hero-sweep", "hero-slogan"],
            "首屏包含产品名 / 横线 / 标语", str(h["blocks"]))
        chk(h["wordmarkTop"] == "StepAudio3" and h["wordmarkMain"] == "Music",
            "字标分为 StepAudio3 / Music 两行", f"{h['wordmarkTop']} / {h['wordmarkMain']}")
        chk("MAKE YUOR IDEAS SING" in h["sloganText"], "标语正确", h["sloganText"])
        chk("gradient" in h["musicGradient"], "Music 使用渐变色", h["musicGradient"])
        chk(h["sweepWidth"] == 420, "横线桌面宽度与参考页一致", str(h["sweepWidth"]))
        chk(h["logoInline"], "logo 是内联 SVG（可随顶栏反色）")
        chk(h["textAlign"] == "center", "首屏文字居中", h["textAlign"])
        chk(not h["heroJump"] and not h["videoToggle"], "首屏按钮已移除")

        print("=== 3b 真实鼠标滚轮 / 键盘能滚页面 ===")
        pg.evaluate("window.scrollTo(0,0)")
        pg.wait_for_timeout(300)
        pg.mouse.move(700, 500)
        for _ in range(4):
            pg.mouse.wheel(0, 400)
            pg.wait_for_timeout(200)
        y_wheel = pg.evaluate("()=>Math.round(window.scrollY)")
        chk(y_wheel > 300, "鼠标滚轮能向下滚", f"scrollY={y_wheel}")
        pg.keyboard.press("End")
        pg.wait_for_timeout(800)
        y_end = pg.evaluate("()=>Math.round(window.scrollY)")
        chk(y_end > y_wheel, "键盘 End 能到底", f"scrollY={y_end}")
        ov = pg.evaluate("()=>getComputedStyle(document.body).overflowY")
        chk(ov != "hidden", "body 纵向没有被 overflow:hidden 锁住", ov)
        pg.evaluate("window.scrollTo(0,0)")
        pg.wait_for_timeout(400)

        # ── 4 锚点 ────────────────────────────────────────────────────────
        print("=== 4 锚点不被顶栏遮挡 ===")
        for aid in ("model", "caps", "uses"):
            pg.evaluate(f"location.hash='#{aid}'")
            pg.wait_for_timeout(700)
            top = pg.evaluate(f"()=>Math.round(document.querySelector('#{aid} .tag').getBoundingClientRect().top)")
            chk(top >= 64, f"#{aid} 不在顶栏下面", f"top={top}")

        # ── 5 语言 ────────────────────────────────────────────────────────
        print("=== 5 中英切换 ===")
        pg.evaluate("window.scrollTo(0,0)")
        pg.click('.llang button[data-lang="en"]')
        pg.wait_for_timeout(800)
        en = pg.evaluate("""() => ({ lang: document.documentElement.lang,
            stored: localStorage.getItem('sa3m.lang'),
            cn: [...document.querySelectorAll('[data-t]')].filter(e=>/[\\u4e00-\\u9fa5]/.test(e.textContent)).length })""")
        chk(en["lang"] == "en" and en["cn"] == 0, "英文下无残留中文", str(en))
        chk(en["stored"] == "en", "语言写进 sa3m.lang（与应用共用）", str(en))

        # ── 6 减少动效 ────────────────────────────────────────────────────
        print("=== 6 prefers-reduced-motion ===")
        rp = br.new_page(viewport={"width": 1440, "height": 900})
        rp.emulate_media(reduced_motion="reduce")
        rp.goto(f"{base}/index.html", wait_until="load")
        rp.wait_for_timeout(1800)
        rm = rp.evaluate("""() => {
            const v=document.querySelector('.hero-media');
            const els=[...document.querySelectorAll('[data-reveal]')];
            return { invisible: els.filter(e=>parseFloat(getComputedStyle(e).opacity)<0.9).length,
                     posterKept: !!(v && v.getAttribute('poster')),
                     playing: v ? !v.paused : null,
                     heroH: v ? Math.round(v.getBoundingClientRect().height) : 0 }; }""")
        chk(rm["invisible"] == 0, "内容不依赖入场动画即可见", str(rm))
        chk(rm["posterKept"] and rm["heroH"] > 500, "保留海报图作静态背景", str(rm))
        chk(rm["playing"] is False, "不播放视频", str(rm))
        rp.close()

        # ── 7 与应用互跳 ──────────────────────────────────────────────────
        print("=== 7 与应用互跳 ===")
        hrefs = pg.evaluate("""() => ({
            headCta: document.querySelector('.lhead-cta').getAttribute('href'),
            outroCta: document.querySelector('.outro .btn-stage').getAttribute('href') })""")
        chk(hrefs["headCta"] == "app.html" and hrefs["outroCta"] == "app.html",
            "两个「开始创作」都指向应用首页", str(hrefs))
        np = br.new_page(viewport={"width": 1440, "height": 900})
        np.goto(f"{base}/index.html", wait_until="load")
        np.wait_for_timeout(1200)
        np.click(".btn-stage")
        np.wait_for_timeout(2200)
        # 「开始创作」落在应用**首页**（输入框 + 精选），不是直接进创作页 ——
        # 直接跳 #/create 会把访客丢进一个满是表单的页面，少了一层过渡。
        chk("app.html" in np.url and "#/create" not in np.url
            and np.locator("#homeDesc").count() > 0,
            "首页 CTA → 应用首页（不是直接进创作页）", np.url)
        np.click(".brand")
        np.wait_for_timeout(1800)
        chk(np.locator(".hero-slogan").count() > 0, "应用 logo → 首页", np.url)
        np.close()

        br.close()

    print("\n" + ("✅ 全部通过" if ok else "❌ 有失败项，见上"))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
