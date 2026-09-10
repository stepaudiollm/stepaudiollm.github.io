#!/usr/bin/env python3
"""
每日额度开关验证 verify ENFORCE_DAILY_LIMIT switch
-----------------------------------------------------------------------------
config.js 的 ENFORCE_DAILY_LIMIT 是**部署期开关**，所以这里不在浏览器里改
内存变量，而是真的改一遍文件、重跑、再还原 —— 部署者怎么用，就怎么测。

关闭时（默认）应当：
  · 界面上没有「今日剩余 N 次」，那一行整体隐藏（不留空白占位）
  · quotaLeft() 返回 Infinity，「开始创作」不会被额度禁用
  · 不往 localStorage 写 sa3m.quota（否则日后打开开关，访客会凭空背上历史用量）

开启时应当：
  · 显示「今日剩余 N 次」
  · 用满后按钮禁用、文案变成「今日额度已用完」

用法：python3 tools/verify_daily_limit.py
"""
import http.server, os, re, shutil, socketserver, sys, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, "assets", "js", "config.js")
PORT = 8971


def serve():
    os.chdir(ROOT)
    h = http.server.SimpleHTTPRequestHandler
    h.log_message = lambda *a, **k: None
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), h) as d:
        d.serve_forever()


def set_flag(value: bool):
    """把 config.js 里的 ENFORCE_DAILY_LIMIT 改成指定值"""
    s = open(CFG, encoding="utf-8").read()
    new, n = re.subn(r"(ENFORCE_DAILY_LIMIT:\s*)(true|false)",
                     lambda m: m.group(1) + ("true" if value else "false"), s)
    assert n == 1, f"config.js 里匹配到 {n} 处 ENFORCE_DAILY_LIMIT"
    open(CFG, "w", encoding="utf-8").write(new)


def read_flag():
    m = re.search(r"ENFORCE_DAILY_LIMIT:\s*(true|false)", open(CFG, encoding="utf-8").read())
    return m.group(1) == "true"


_probe_n = 0


def probe(pg, base):
    """打开创作页，回报额度相关的界面状态。

    每次带一个不同的 query。否则从 app.html 跳到 app.html#/create 只是**同文档的
    片段导航**，文档根本不重新加载，config.js 也就不会重新拉 —— 磁盘上的开关翻了，
    页面里还是旧值，会被误判成"开关没生效"。
    """
    global _probe_n
    _probe_n += 1
    pg.goto(f"{base}/app.html?probe={_probe_n}#/create", wait_until="networkidle")
    pg.wait_for_timeout(1400)
    return pg.evaluate("""async () => {
        const m = await import('./assets/js/api.js');
        const q = document.getElementById('cQuota');
        const b = document.getElementById('cSubmit');
        return {
          left: m.quotaLeft() === Infinity ? 'Infinity' : m.quotaLeft(),
          text: q ? q.textContent.trim() : null,
          hidden: q ? q.hidden : null,
          boxHeight: q ? Math.round(q.getBoundingClientRect().height) : null,
          disabled: b ? b.disabled : null,
          stored: localStorage.getItem('sa3m.quota'),
        }; }""")


def main():
    original = read_flag()
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
    try:
        with sync_playwright() as p:
            br = p.chromium.launch()
            pg = br.new_page(viewport={"width": 1400, "height": 900})
            # 关掉 HTTP 缓存。否则改完 config.js 再 goto，浏览器会复用已缓存的
            # ES 模块，磁盘上的开关翻了但页面里还是旧值 —— 会误判成"开关没生效"。
            cdp = pg.context.new_cdp_session(pg)
            # 必须先 Network.enable，否则 setCacheDisabled 静默无效 —— 踩过：
            # 磁盘开关翻了但 config.js 仍从缓存取，看起来像"开关没生效"。
            cdp.send("Network.enable")
            cdp.send("Network.setCacheDisabled", {"cacheDisabled": True})
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
            pg.on("console", lambda m: errs.append(f"[{m.type}] {m.text[:140]}")
                  if m.type == "error" else None)

            # 先配一个 Key，否则那行字会一直是"还没配置 API Key"，测不到额度分支
            pg.goto(f"{base}/app.html", wait_until="networkidle")
            pg.evaluate("localStorage.setItem('sa3m.apikey','test-key-for-quota-check')")
            pg.evaluate("localStorage.removeItem('sa3m.quota')")

            print(f"=== A. 关闭（默认）：ENFORCE_DAILY_LIMIT = false ===")
            set_flag(False)
            r = probe(pg, base)
            print(f"    {r}")
            chk(r["left"] == "Infinity", "quotaLeft() 返回 Infinity", str(r["left"]))
            chk(r["text"] == "", "界面上没有「今日剩余」文案", repr(r["text"]))
            chk(r["hidden"] is True, "那一行被隐藏", str(r["hidden"]))
            chk(r["boxHeight"] == 0, "不占纵向空间（无空白占位）", f"{r['boxHeight']}px")
            chk(r["disabled"] is False, "「开始创作」没有被额度禁用", str(r["disabled"]))
            chk(r["stored"] is None, "没有写 sa3m.quota 计数", repr(r["stored"]))

            print(f"\n=== B. 开启：ENFORCE_DAILY_LIMIT = true ===")
            set_flag(True)
            r = probe(pg, base)
            print(f"    {r}")
            chk(r["left"] == 10, "quotaLeft() 回到 DAILY_LIMIT", str(r["left"]))
            chk("今日剩余" in (r["text"] or ""), "显示「今日剩余 N 次」", repr(r["text"]))
            chk(r["hidden"] is False, "那一行可见", str(r["hidden"]))
            chk(r["disabled"] is False, "还有额度时按钮可用", str(r["disabled"]))

            print(f"\n=== C. 开启且用满：应禁用并改文案 ===")
            pg.evaluate("""() => {
                const d = new Date();
                const day = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
                localStorage.setItem('sa3m.quota', JSON.stringify({day, used: 10}));
            }""")
            r = probe(pg, base)
            print(f"    {r}")
            chk(r["left"] == 0, "quotaLeft() 归零", str(r["left"]))
            chk("用完" in (r["text"] or ""), "文案变成「今日额度已用完」", repr(r["text"]))
            chk(r["disabled"] is True, "按钮被禁用", str(r["disabled"]))

            print(f"\n  JS 报错: {errs if errs else '无 ✅'}")
            if errs:
                ok = False
            br.close()
    finally:
        set_flag(original)
        print(f"\n  已把 config.js 还原为 ENFORCE_DAILY_LIMIT = {str(original).lower()}")

    print("\n" + ("✅ 全部通过" if ok else "❌ 有失败项，见上"))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
