#!/usr/bin/env python3
"""
API Key 配置流程验证 verify API key setup flow
-----------------------------------------------------------------------------
在真实 Chromium 里走完访客自备 Key 的全流程，覆盖用户提的四条要求：
  1. 侧栏「API 文档」下方出现「API 配置」按钮，点开中间的配置面板
  2. 面板里有"领免费额度"提示 + 「立即前往」按钮
  3. 填 Key → 校验（分别模拟 可用 / 无效 / 没有音乐模型权限 / 网络失败）
  4. 未配置 Key 就点创作 → 弹提示 → 「去配置」直达配置面板

校验请求通过打桩 window.fetch 模拟，所以不需要真实网络、不消耗任何额度，
而且能覆盖真实接口很难制造的分支（比如 404 model_invalid）。

用法：python3 tools/verify_apikey_flow.py
"""
import http.server, os, socketserver, sys, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8907

# 打桩：拦截 /v1/audio/music/query 的校验探测，按需要返回不同状态；
# 同时记录 window.open，用来验证「立即前往」的目标地址（比等真实弹窗可靠）
STUB = """
window.__opened = [];
const realOpen = window.open;
window.open = (u, ...rest) => { window.__opened.push(String(u)); return null; };
window.__stub = (status, body) => {
  window.__calls = [];
  const real = window.fetch;
  window.fetch = (url, opt) => {
    const u = String(url);
    if (u.includes('/v1/audio/music/query')) {
      window.__calls.push({ url: u, auth: (opt.headers||{}).Authorization || '' });
      if (status === 0) return Promise.reject(new TypeError('Failed to fetch'));
      return Promise.resolve(new Response(JSON.stringify(body), {
        status, headers: { 'Content-Type': 'application/json' } }));
    }
    return real(url, opt);
  };
};
"""


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

    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": 1500, "height": 1000})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        pg.on("console", lambda m: errs.append(f"[{m.type}] {m.text[:160]}")
              if m.type == "error" else None)
        pg.add_init_script(STUB)
        pg.goto(f"http://127.0.0.1:{PORT}/app.html#/", wait_until="networkidle")
        pg.evaluate("localStorage.removeItem('sa3m.apikey')")
        pg.reload(wait_until="networkidle")
        pg.wait_for_timeout(1200)

        print("=== 1. 侧栏「API 配置」按钮 ===")
        nav = pg.evaluate("""() => {
          const b = document.getElementById('navApiKey');
          if (!b) return {exists:false};
          const docs = [...document.querySelectorAll('.nav-sub')]
              .find(x => (x.dataset.tipI18n||'') === 'nav.api');
          const dot = document.getElementById('navKeyDot');
          return {
            exists: true,
            label: b.querySelector('.nav-label').textContent.trim(),
            afterApiDocs: !!docs && docs.compareDocumentPosition(b) === 4,
            dotVisible: dot ? !dot.hidden : false,
          };
        }""")
        chk(nav.get("exists"), "按钮存在")
        chk(nav.get("label") == "API 配置", f"文案为「API 配置」", f"实际={nav.get('label')!r}")
        chk(nav.get("afterApiDocs"), "位于「API 文档」下方")
        chk(nav.get("dotVisible"), "未配置时状态点亮起")

        print("\n=== 2. 点开配置面板 ===")
        pg.click("#navApiKey")
        pg.wait_for_timeout(500)
        dlg = pg.evaluate("""() => {
          const s = document.querySelector('.dlg-scrim');
          if (!s) return {open:false};
          const promo = s.querySelector('.key-promo');
          const go = s.querySelector('[data-a="go"]');
          const r = s.querySelector('.dlg').getBoundingClientRect();
          return {
            open: true,
            centered: Math.abs((r.left+r.right)/2 - innerWidth/2) < 4
                   && Math.abs((r.top+r.bottom)/2 - innerHeight/2) < 4,
            hasInput: !!s.querySelector('#keyInput'),
            inputMasked: (s.querySelector('#keyInput')||{}).type === 'password',
            promoText: promo ? promo.querySelector('.key-promo-txt').textContent.trim() : '',
            goLabel: go ? go.textContent.trim() : '',
            hasPrivacyNote: !!s.querySelector('.key-note'),
          };
        }""")
        chk(dlg.get("open"), "面板打开")
        chk(dlg.get("centered"), "位于页面正中")
        chk(dlg.get("hasInput"), "有 Key 输入框")
        chk(dlg.get("inputMasked"), "输入框默认遮蔽（password）")
        chk("免费" in dlg.get("promoText", ""), "有领免费额度的提示",
            f"实际={dlg.get('promoText')!r}")
        chk(dlg.get("goLabel", "").startswith("立即前往"), "有「立即前往」按钮",
            f"实际={dlg.get('goLabel')!r}")
        chk(dlg.get("hasPrivacyNote"), "有「只存本地」的说明")

        # 「立即前往」应打开开放平台
        pg.click('[data-a="go"]')
        pg.wait_for_timeout(300)
        opened = pg.evaluate("() => window.__opened || []")
        chk(any("platform.stepfun.com" in u for u in opened),
            "「立即前往」跳开放平台", f"实际={opened}")

        print("\n=== 3. Key 校验的各个分支 ===")
        cases = [
            (401, {"error": {"type": "invalid_api_key", "message": "Incorrect API key"}},
             False, "无效", "401 → 判为无效且不保存"),
            (404, {"error": {"type": "model_invalid", "message": "not whitelisted"}},
             False, "音乐模型", "404 → 提示没有音乐模型权限"),
            (0, None, False, "网络", "网络失败 → 提示网络问题"),
            (400, {"error": {"type": "request_params_invalid", "message": "task not found"}},
             True, "校验通过", "400 task-not-found → 判为可用并保存"),
        ]
        for status, body, should_save, expect_txt, label in cases:
            pg.evaluate("([s,b]) => window.__stub(s,b)", [status, body])
            pg.fill("#keyInput", "test-key-" + str(status))
            pg.click('[data-a="save"]')
            # 等到出现"终态"状态行再读。成功时面板 600ms 后会自动关，
            # 固定 sleep 会读到已经被移除的元素（空字符串），那是测试的问题不是产品的。
            try:
                pg.wait_for_function(
                    """() => { const e = document.getElementById('keyStatus');
                       return e && !e.hidden && e.textContent.trim()
                              && !e.classList.contains('busy'); }""",
                    timeout=5000)
            except Exception:
                pass
            r = pg.evaluate("""() => ({
              status: (document.getElementById('keyStatus')||{}).textContent || '',
              cls: (document.getElementById('keyStatus')||{}).className || '',
              saved: localStorage.getItem('sa3m.apikey') || '',
              sentAuth: (window.__calls[0]||{}).auth || '',
            })""")
            chk(expect_txt in r["status"], f"{label}", f"状态行={r['status']!r}")
            if should_save:
                chk(r["saved"] == "test-key-" + str(status), "  Key 已落盘")
                chk("ok" in r["cls"], "  状态行标为成功")
            else:
                chk(r["saved"] == "", "  坏 Key 未落盘", f"localStorage={r['saved']!r}")
                chk("err" in r["cls"], "  状态行标为错误")
            chk(r["sentAuth"] == "Bearer test-key-" + str(status),
                "  校验请求带上了待验证的 Key", f"实际={r['sentAuth']!r}")

        pg.wait_for_timeout(800)     # 成功后面板会自动关

        print("\n=== 4. 保存后界面状态同步 ===")
        st = pg.evaluate("""() => {
          const dot = document.getElementById('navKeyDot');
          return { dlgClosed: !document.querySelector('.dlg-scrim'),
                   dotHidden: dot ? dot.hidden : null };
        }""")
        chk(st["dlgClosed"], "校验通过后面板自动关闭")
        chk(st["dotHidden"], "状态点已熄灭")

        print("\n=== 5. 未配置 Key 就点创作 ===")
        pg.evaluate("localStorage.removeItem('sa3m.apikey')")
        pg.reload(wait_until="networkidle")
        pg.evaluate("location.hash = '#/create'")
        pg.wait_for_timeout(1200)
        pre = pg.evaluate("""() => {
          const b = document.getElementById('cSubmit');
          const q = document.getElementById('cQuota');
          return { submitDisabled: b ? b.disabled : null,
                   quota: q ? q.textContent.trim() : '' };
        }""")
        chk(pre["submitDisabled"] is False,
            "未配置 Key 时「开始创作」仍可点（否则弹不出提示）",
            f"disabled={pre['submitDisabled']}")
        chk("API Key" in pre["quota"], "底部提示说明缺 Key", f"实际={pre['quota']!r}")

        pg.fill("#cDesc", "A dream pop song, female vocal")
        pg.click("#cSubmit")
        pg.wait_for_timeout(600)
        need = pg.evaluate("""() => {
          const s = document.querySelector('.dlg-scrim');
          if (!s) return {open:false};
          return { open:true,
                   title: (s.querySelector('h3')||{}).textContent || '',
                   jump: (s.querySelector('[data-a="setup"]')||{}).textContent || '' };
        }""")
        chk(need.get("open"), "弹出未配置提示窗")
        chk("API Key" in need.get("title", ""), "标题说明缺 Key", f"实际={need.get('title')!r}")
        chk("去配置" in need.get("jump", ""), "有跳转按钮", f"实际={need.get('jump')!r}")
        # 没配 Key 时不该真的发起提交
        chk(pg.evaluate("() => (window.__calls||[]).length") == 0,
            "未配置时没有发出任何生成请求")

        print("\n=== 6. 「去配置」直达配置面板 ===")
        pg.click('[data-a="setup"]')
        pg.wait_for_timeout(700)
        jumped = pg.evaluate("""() => {
          const s = document.querySelector('.dlg-scrim');
          return { open: !!s, hasInput: !!(s && s.querySelector('#keyInput')),
                   scrims: document.querySelectorAll('.dlg-scrim').length };
        }""")
        chk(jumped["open"] and jumped["hasInput"], "跳到了 Key 配置面板")
        chk(jumped["scrims"] == 1, "只剩一层遮罩（没有叠加）",
            f"实际 {jumped['scrims']} 层")

        print(f"\n=== JS 报错 ===\n  {errs if errs else '无 ✅'}")
        if errs:
            ok = False
        br.close()

    print("\n" + ("✅ 全部通过" if ok else "❌ 有失败项，见上"))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
