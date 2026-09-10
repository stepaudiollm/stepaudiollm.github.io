#!/usr/bin/env python3
"""
端到端浏览器测试 E2E browser test
-----------------------------------------------------------------------------
在真实 Chromium 里跑 app.html，走完「创作 → 提交 → 轮询 → 落库 → 出卡片」
全流程，把控制台报错、失败请求、以及卡在哪一步全部打出来。

接口本身已单独验证通过（tools/api_smoke_test.py），所以这个脚本的目的是
定位**前端**的问题。

用法：python3 tools/e2e_test.py [mode]     mode = song | vocal2music | cover
"""
import http.server, os, socketserver, sys, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8899


def serve():
    os.chdir(ROOT)
    h = http.server.SimpleHTTPRequestHandler
    h.log_message = lambda *a, **k: None
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), h) as httpd:
        httpd.serve_forever()


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "song"
    threading.Thread(target=serve, daemon=True).start()
    time.sleep(1)

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        br = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        pg = br.new_page()

        console, failed, reqs = [], [], []
        pg.on("console", lambda m: (
            console.append(f"[{m.type}] {m.text}"),
            print(f"  CONSOLE[{m.type}] {m.text[:300]}")) and None)
        pg.on("pageerror", lambda e: (
            console.append(f"[pageerror] {e}"),
            print(f"  !! PAGEERROR {e}")) and None)
        pg.on("requestfailed", lambda r: (
            failed.append(f"{r.url} {r.failure}"),
            print(f"  !! REQFAIL {r.url[:110]} :: {r.failure}")) and None)

        def on_resp(r):
            if "/v1/audio/music/" in r.url:
                reqs.append((r.url, r.status))
                tag = "submit" if "submit" in r.url else "query"
                print(f"  >> API {tag} HTTP {r.status}")
        pg.on("response", on_resp)

        print(f"=== 打开页面 (mode={mode}) ===")
        pg.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="networkidle")
        print(f"  title={pg.title()!r}")

        # 进入创作页
        pg.evaluate("location.hash = '#/create'")
        pg.wait_for_timeout(1200)

        # 报告关键控件在不在、能不能点
        state = pg.evaluate("""() => {
          const g = id => document.getElementById(id);
          const btn = g('cSubmit');
          return {
            hasCreatePage: !!g('cDesc'),
            submitExists: !!btn,
            submitDisabled: btn ? btn.disabled : null,
            quotaText: g('cQuota') ? g('cQuota').textContent : null,
            tabs: [...document.querySelectorAll('#cTabs .tab')].map(b => b.dataset.mode),
            uploadHidden: g('cUploadField') ? g('cUploadField').hidden : null,
          };
        }""")
        print("=== 页面状态 ===")
        for k, v in state.items():
            print(f"  {k}: {v}")

        if not state["hasCreatePage"]:
            print("!! 创作页没渲染出来，后面不用测了")
            br.close()
            return

        if state["submitDisabled"]:
            print("!! 提交按钮是 disabled —— 这就是「点了没反应」的直接原因")

        # 切到目标能力
        pg.evaluate(f"""() => {{
          const b = document.querySelector('#cTabs .tab[data-mode="{mode}"]');
          if (b) b.click();
        }}""")
        pg.wait_for_timeout(600)

        # 填描述
        pg.fill("#cDesc", "A dream pop song, female vocal, B minor, warm and hazy")
        pg.fill("#cLyrics", "[Verse 1]\n晚风穿过便利店的门\n\n[Chorus 1]\n我把心事折成纸船")

        # 需要音频的能力：塞一个真实文件进 input
        if mode in ("vocal2music", "cover"):
            # 清唱配乐要真干声，用 vocal_separation 分离出来的那份；
            # A.mp3 是整首混音，拿它当干声测不准
            f = (os.path.join(ROOT, "test", "out", "vocal_separation.mp3")
                 if mode == "vocal2music" else os.path.join(ROOT, "test", "A.mp3"))
            if not os.path.exists(f):
                print(f"!! 缺 {f}")
                br.close()
                return
            pg.set_input_files("#cFile", f)
            pg.wait_for_timeout(3000)
            print(f"  已挂载音频 {os.path.getsize(f)/1048576:.1f} MiB")

        print("=== 点击提交 ===")
        pg.click("#cSubmit")

        # 等到出现终态：卡片出现 / 报错 toast / 超时
        t0 = time.time()
        last = None
        while time.time() - t0 < 420:
            st = pg.evaluate("""() => {
              const host = document.getElementById('cSession');
              const toast = document.querySelector('.toast, #toast');
              return {
                taskRows: host ? host.querySelectorAll('.task').length : 0,
                doneRows: host ? host.querySelectorAll('.card-row').length : 0,
                rowText: host ? [...host.querySelectorAll('.task, .card-row')]
                    .map(r => r.textContent.replace(/\\s+/g,' ').trim().slice(0,110)) : [],
                toast: toast ? toast.textContent.trim().slice(0,200) : null,
              };
            }""")
            cur = str({k: v for k, v in st.items() if k != "toast"})
            if cur != last:
                print(f"  t+{time.time()-t0:5.1f}s {st}")
                last = cur
            if st["doneRows"] > 0:
                print("  >>> 成品卡片已渲染，全流程走通")
                break
            pg.wait_for_timeout(4000)

        print("=== 最终检查：IndexedDB 里有没有落库 ===")
        idb = pg.evaluate("""async () => {
          return await new Promise(res => {
            const r = indexedDB.open('sa3m', 2);
            r.onsuccess = () => {
              const d = r.result;
              try {
                const t = d.transaction(['tracks','blobs'], 'readonly');
                const a = t.objectStore('tracks').getAll();
                const b = t.objectStore('blobs').getAll();
                t.oncomplete = () => res({
                  tracks: a.result.length,
                  blobs: b.result.length,
                  blobSizes: b.result.map(x => x.blob ? x.blob.size : 0),
                  titles: a.result.map(x => x.title),
                  durations: a.result.map(x => x.duration),
                  covers: a.result.map(x => x.cover),
                });
              } catch (e) { res({error: String(e)}); }
            };
            r.onerror = () => res({error: 'idb open failed'});
          });
        }""")
        print(f"  {idb}")

        print()
        print(f"=== 汇总 ===")
        print(f"  API 调用: {len(reqs)} 次 -> {[s for _, s in reqs]}")
        print(f"  失败请求: {len(failed)}")
        print(f"  控制台 error/pageerror: "
              f"{len([c for c in console if 'error' in c.lower()])}")
        br.close()


if __name__ == "__main__":
    main()
