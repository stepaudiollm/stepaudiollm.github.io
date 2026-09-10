#!/usr/bin/env python3
"""
封面改动验证 verify cover changes
-----------------------------------------------------------------------------
检查三件事：
  1. 各页面上的封面 <img> 有没有 404 / 加载失败
  2. 随机封面池是不是真的覆盖整个封面库（84 张），而不是只在示例曲目里挑
  3. 聆听页实际下了多少字节的封面（首屏体积）

用法：python3 tools/verify_covers.py

注意：应用在 app.html（index.html 是落地页）。指错文件的话 hash 路由不生效，
每个"页面"都只会看到落地页那 4 张封面，测试会静默地空过。
"""
import http.server, os, socketserver, sys, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8901


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
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page()

        bad, cover_bytes = [], {}
        pg.on("response", lambda r: cover_bytes.__setitem__(r.url, r)
              if "/assets/covers/" in r.url else None)
        pg.on("requestfailed", lambda r: bad.append((r.url, r.failure)))

        def check(route, label):
            nonlocal ok
            cover_bytes.clear()
            bad.clear()
            pg.goto(f"http://127.0.0.1:{PORT}/app.html{route}", wait_until="networkidle")
            pg.wait_for_timeout(2500)
            # 浏览器已解码的图才算真的能显示
            st = pg.evaluate("""() => {
              const imgs = [...document.querySelectorAll('img')]
                .filter(i => i.src.includes('/assets/covers/'));
              return {
                total: imgs.length,
                broken: imgs.filter(i => !i.complete || i.naturalWidth === 0)
                            .map(i => i.src.split('/').pop()),
                sizes: [...new Set(imgs.map(i => i.naturalWidth + 'x' + i.naturalHeight))],
              };
            }""")
            n404 = [u for u, r in cover_bytes.items() if r.status >= 400]
            total_kb = 0
            for u, r in cover_bytes.items():
                try:
                    total_kb += len(r.body()) / 1024
                except Exception:
                    pass
            flag = "✅" if not st["broken"] and not n404 else "❌"
            print(f"{flag} {label:10s} 封面 img {st['total']:3d} 张  "
                  f"加载失败 {len(st['broken'])}  HTTP4xx/5xx {len(n404)}  "
                  f"下载 {total_kb/1024:.2f} MiB  固有尺寸={st['sizes']}")
            if st["broken"]:
                print(f"    坏图: {st['broken'][:6]}")
            if n404:
                print(f"    404 : {[u.split('/')[-1] for u in n404][:6]}")
            if st["broken"] or n404:
                ok = False

        print("=== 各页面封面加载 ===")
        check("#/", "首页")
        check("#/listen", "聆听页")
        check("#/library", "曲库")

        print("\n=== 随机池覆盖度（模拟 1000 次生成）===")
        cov = pg.evaluate("""async () => {
          const m = await import('./assets/js/covers.js');
          const seen = new Set();
          for (let i = 0; i < 1000; i++) seen.add(m.randomCover());
          return { poolSize: m.COVERS.length, distinct: seen.size,
                   sample: [...seen].slice(0, 3),
                   webp: m.COVERS.filter(c => c.endsWith('.webp')).length,
                   jpg: m.COVERS.filter(c => c.endsWith('.jpg')).length };
        }""")
        print(f"  封面库 {cov['poolSize']} 张（webp {cov['webp']} + jpg {cov['jpg']}）"
              f"，1000 次抽到 {cov['distinct']} 张不同封面")
        if cov["distinct"] != cov["poolSize"]:
            print(f"  ❌ 没覆盖全库（差 {cov['poolSize']-cov['distinct']} 张）")
            ok = False
        else:
            print("  ✅ 完整覆盖整个封面库")

        # 清单里的每一张都必须真能取到
        print("\n=== 清单里 84 张逐个 HTTP 校验 ===")
        res = pg.evaluate(f"""async () => {{
          const m = await import('./assets/js/covers.js');
          const out = [];
          for (const c of m.COVERS) {{
            const r = await fetch('http://127.0.0.1:{PORT}/' + c, {{method:'HEAD'}});
            if (!r.ok) out.push(c + ' -> ' + r.status);
          }}
          return out;
        }}""")
        if res:
            print(f"  ❌ {len(res)} 张取不到：{res[:8]}")
            ok = False
        else:
            print("  ✅ 84 张全部 200")

        br.close()
    print("\n" + ("✅ 全部通过" if ok else "❌ 有问题，见上"))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
