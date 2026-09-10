#!/usr/bin/env python3
"""
宣传片验收 verify promo video page
-----------------------------------------------------------------------------
1. 资源全部可取（字体 / 封面 / abcjs / 音色库），无 404
2. 无控制台报错
3. abcjs 真的把谱子画出来了，且没有溢出纸面
4. 按「节拍点」精确截图（不是盲等秒数），人眼过一遍构图

用法：python3 tools/verify_promo.py
截图落在 test/shots/promo/（已在 .gitignore 里，不进仓库）
"""
import http.server, os, socketserver, sys, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8951
OUT = os.path.join(ROOT, "test", "shots", "promo")
URL = f"http://127.0.0.1:{PORT}/assets/video/promo.html?dev=1"

# 截图计划：(节拍点, 到达后再等 ms, 文件名)
SHOTS = [
    ("s1-title",         2200, "01-open"),
    ("s2-headline",      1400, "02-headline"),
    ("s2-compose",        600, "03-compose"),
    ("s2-player1",       1800, "04-player"),
    ("s2-file-dropped",   300, "05-upload"),
    ("s2-player2",       1800, "06-player-cover"),
    ("s3-headline",      1400, "07-abc-headline"),
    ("s3-compose",        400, "08-abc-compose"),
    ("s3-score-v1",       900, "09-abc-v1"),
    ("s3-score-play",    3000, "10-score-playing"),
    ("s3-score-v2",       600, "11-abc-v2"),
    ("s3-card2",          900, "12-card2"),
    ("s3-score-v3",      1000, "13-abc-v3"),
    ("s3-card3",         1500, "14-card3"),
    ("s4-title",         1600, "15-close"),
]


def serve():
    os.chdir(ROOT)
    h = http.server.SimpleHTTPRequestHandler
    h.log_message = lambda *a, **k: None
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), h) as d:
        d.serve_forever()


def main():
    os.makedirs(OUT, exist_ok=True)
    threading.Thread(target=serve, daemon=True).start()
    time.sleep(0.8)
    from playwright.sync_api import sync_playwright

    ok = True

    def chk(cond, label, extra=""):
        nonlocal ok
        print(("  ok  " if cond else "  FAIL") + f"  {label}" + (f"  {extra}" if extra else ""))
        if not cond:
            ok = False

    errors, bad = [], []
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        pg = b.new_page(viewport={"width": 1600, "height": 900})
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.on("response", lambda r: bad.append(f"{r.status} {r.url}") if r.status >= 400 else None)

        pg.goto(URL, wait_until="networkidle")
        pg.wait_for_timeout(900)

        chk(not bad, "全部资源可取", "; ".join(bad[:4]))
        chk(pg.evaluate("!!window.ABCJS"), "abcjs 已加载")
        chk(pg.evaluate("!!(window.MIDI && MIDI.Soundfont && MIDI.Soundfont.acoustic_grand_piano)"),
            "钢琴音色库已加载")

        # 舞台真的居中：左右留边应当一样
        gap = pg.eval_on_selector("#stage", """e => {
            const r = e.getBoundingClientRect();
            return [r.left, innerWidth - r.right, r.top, innerHeight - r.bottom];
        }""")
        chk(abs(gap[0] - gap[1]) < 2 and abs(gap[2] - gap[3]) < 2,
            "舞台在视口内居中", f"L{gap[0]:.0f} R{gap[1]:.0f} T{gap[2]:.0f} B{gap[3]:.0f}")

        checked_score = False
        for i, (bt, hold, name) in enumerate(SHOTS):
            pg.wait_for_function(f"window.BEATS.includes('{bt}')", timeout=90_000)
            pg.wait_for_timeout(hold)
            pg.screenshot(path=f"{OUT}/{i:02d}-{name}.png")

            if bt == "s3-score-v1" and not checked_score:
                checked_score = True
                m = pg.evaluate("""() => {
                    const h = document.getElementById('scoreHost');
                    const svg = h.querySelector('svg');
                    const paper = document.getElementById('scorePaper');
                    const k = document.getElementById('stage').getBoundingClientRect().width / 1920;
                    return {
                        staff: h.querySelectorAll('.abcjs-staff').length,
                        note:  h.querySelectorAll('.abcjs-note').length,
                        chord: h.querySelectorAll('.abcjs-chord').length,
                        svgH:  svg ? svg.getBoundingClientRect().height / k : 0,
                        svgW:  svg ? svg.getBoundingClientRect().width / k : 0,
                        boxH:  paper.clientHeight, boxW: paper.clientWidth,
                        abcH:  document.getElementById('abcCodeInner').scrollHeight,
                        abcBox: document.getElementById('abcCode').clientHeight
                    };
                }""")
                chk(m["staff"] >= 2, "乐谱渲染出多行五线谱", f"staff={m['staff']}")
                chk(m["note"] >= 40, "乐谱音符数量合理", f"note={m['note']}")
                chk(m["chord"] >= 8, "和弦标记已渲染", f"chord={m['chord']}")
                chk(m["svgH"] <= m["boxH"] - 8, "乐谱没有超出纸面高度",
                    f"svg={m['svgH']:.0f} box={m['boxH']}")
                chk(m["svgW"] <= m["boxW"] - 4, "乐谱没有超出纸面宽度",
                    f"svg={m['svgW']:.0f} box={m['boxW']}")
                print(f"  info  ABC 代码 {m['abcH']:.0f}px / 容器 {m['abcBox']}px")

            if bt == "s3-card3":
                ncards = pg.eval_on_selector_all("#worklist3 .workcard", "e => e.length")
                vers = pg.eval_on_selector_all("#worklist3 .wc-ver", "e => e.map(x=>x.textContent)")
                chk(ncards == 3 and vers == ["v1", "v2", "v3"], "三首作品都在（v1/v2/v3）", f"{vers}")

        timing = pg.evaluate("window.TIMING")
        fps = pg.evaluate("window.__fps || 0")
        print(f"\n  info  分镜时长 {timing}  合计 {sum(t for t in timing if t):.1f}s   ~{fps:.0f} fps")

        chk(not errors, "无控制台报错", "; ".join(errors[:4]))
        b.close()

    print(f"\n截图：{OUT}")
    print("PASS" if ok else "FAIL")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
