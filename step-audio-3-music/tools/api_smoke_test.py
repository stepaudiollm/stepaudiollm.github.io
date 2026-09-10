#!/usr/bin/env python3
"""
接口冒烟测试 API smoke test
-----------------------------------------------------------------------------
用途：验证 demo 实际发出的请求体能不能被服务端正确处理。

关键点：请求体必须和 assets/js/api.js 组装出来的**完全一致**（同样的
model_id / response_format / sample_rate / bit_rate），否则测的就不是 demo。

用法：
  python3 tools/api_smoke_test.py submit          # 只提交，打印 task_id
  python3 tools/api_smoke_test.py poll <task_id>  # 轮询单个任务
  python3 tools/api_smoke_test.py all             # 提交全部 + 轮询到终态
  python3 tools/api_smoke_test.py badparams       # 只测参数校验（不消耗生成额度）
"""
import base64, json, os, sys, threading, time, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "test", "out")


def _key():
    """Key 只从环境变量读。

    前端已改成访客自备 Key（存 localStorage，见 assets/js/config.js 顶部注释），
    仓库里不再有任何硬编码密钥，所以这里没有可回退的来源。
        export STEPFUN_API_KEY=你的key
    免费额度见 https://platform.stepfun.com/
    """
    k = os.environ.get("STEPFUN_API_KEY", "").strip()
    if not k:
        sys.exit("请先设置环境变量 STEPFUN_API_KEY"
                 "（免费额度见 https://platform.stepfun.com/）")
    return k


API_KEY = _key()
BASE_URL = os.environ.get("STEPFUN_BASE_URL", "https://api.stepfun.com")

# 与 config.js 保持一致 —— 改这里之前先确认 config.js 也改了
RESPONSE_FORMAT = "mp3"
SAMPLE_RATE = 44100
BIT_RATE = 192
MODEL_ID = "step-music"


def post(path, payload, timeout=300):
    """返回 (http_status, json_or_text, trace_id)"""
    req = urllib.request.Request(
        BASE_URL + path,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {API_KEY}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.load(r), r.headers.get("x-trace-id", "")
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        try:
            return e.code, json.loads(raw), e.headers.get("x-trace-id", "")
        except json.JSONDecodeError:
            return e.code, raw, e.headers.get("x-trace-id", "")
    except Exception as e:                                    # noqa: BLE001
        return 0, f"{type(e).__name__}: {e}", ""


def b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def envelope(**payload):
    """api.js submit() 加的那层公共字段"""
    body = {"model_id": MODEL_ID, "response_format": RESPONSE_FORMAT,
            "sample_rate": SAMPLE_RATE, **payload}
    if RESPONSE_FORMAT in ("mp3", "opus"):
        body["bit_rate"] = BIT_RATE
    return body


LYRICS = """[Verse 1]
晚风穿过便利店的门
你把找零放在我手心
说要赶最后一班车
就消失在雨里

[Chorus 1]
我把心事折成纸船
放进这条不回头的河
它漂得比我勇敢
终于替我说出口"""

CAPTION = ("A dream pop and lo-fi house song, female vocal, B minor, "
           "warm, hazy, nocturnal, gentle and melancholic")


def cases():
    """(名字, 请求体) —— 覆盖 demo 界面露出的三种能力 + 纯音乐开关"""
    song = os.path.join(ROOT, "test", "A.mp3")
    cs = [
        # 1. 歌曲创作（带歌词）—— 界面 mode='song'
        ("song_with_lyrics", envelope(
            task="text_to_music", caption=CAPTION, lyrics=LYRICS)),
        # 2. 歌曲创作（纯音乐）—— 界面 mode='song' + 勾选纯音乐
        ("song_instrumental", envelope(
            task="text_to_music", caption=CAPTION, instrumental=True)),
        # 3. 歌曲创作（不传歌词，服务端自动作词）
        ("song_auto_lyrics", envelope(
            task="text_to_music", caption=CAPTION)),
    ]
    if os.path.exists(song):
        # 4. 歌曲翻唱 —— 界面 mode='cover'
        cs.append(("cover", envelope(
            task="music_cover", caption=CAPTION, song_audio=b64(song))))
        # 5. 人声分离 —— 界面没露出，但用它产出真实干声喂给 vocal_to_music
        cs.append(("vocal_separation", envelope(
            task="vocal_separation", song_audio=b64(song))))
    return cs


def bad_params():
    """参数校验用例，服务端应立刻 4xx —— 不进队列，不消耗生成额度"""
    return [
        ("missing_song_audio", envelope(task="music_cover", caption=CAPTION)),
        ("missing_vocal_audio", envelope(task="vocal_to_music", caption=CAPTION)),
        ("bogus_task", envelope(task="not_a_real_task", caption=CAPTION)),
        ("bogus_format", {"model_id": MODEL_ID, "task": "text_to_music",
                          "caption": CAPTION, "response_format": "aac"}),
        ("empty_caption", envelope(task="text_to_music", caption="")),
        ("bad_sample_rate", envelope(task="text_to_music", caption=CAPTION,
                                     sample_rate=44100, lyrics="[Verse]\nhi")),
    ]


def submit_all(case_list):
    """并发提交。返回 {name: task_id}，同时打印每个提交的 HTTP 结果"""
    results = {}
    lock = threading.Lock()

    def one(name, body):
        t0 = time.time()
        status, data, trace = post("/v1/audio/music/submit", body)
        dt = time.time() - t0
        size = len(json.dumps(body)) / 1048576
        with lock:
            tid = data.get("task_id") if isinstance(data, dict) else None
            print(f"[submit] {name:22s} HTTP {status}  {dt:5.1f}s  "
                  f"body={size:.2f}MiB  "
                  f"{tid or json.dumps(data, ensure_ascii=False)[:160]}"
                  f"{'  trace=' + trace if trace and not tid else ''}")
            if tid:
                results[name] = tid
    threads = [threading.Thread(target=one, args=c) for c in case_list]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    return results


def poll_all(tasks, hard_timeout=900):
    """轮询到全部终态，成功的把音频写到 test/out/"""
    os.makedirs(OUT, exist_ok=True)
    pending = dict(tasks)
    t0 = time.time()
    final = {}
    while pending and time.time() - t0 < hard_timeout:
        for name, tid in list(pending.items()):
            status, data, _ = post("/v1/audio/music/query", {"task_id": tid}, timeout=60)
            if status != 200:
                print(f"[query ] {name:22s} HTTP {status} {str(data)[:120]}")
                continue
            st = data.get("status")
            el = time.time() - t0
            if st in ("SUCCESS", "FAILED"):
                del pending[name]
                final[name] = data
                if st == "SUCCESS":
                    keys = [k for k in ("audio", "vocal_audio") if data.get(k)]
                    for k in keys:
                        fmt = data.get("response_format", RESPONSE_FORMAT)
                        suffix = "" if k == "audio" else "-vocal"
                        p = os.path.join(OUT, f"{name}{suffix}.{fmt}")
                        with open(p, "wb") as f:
                            f.write(base64.b64decode(data[k]))
                    print(f"[DONE  ] {name:22s} SUCCESS  {el:5.1f}s  "
                          f"fields={sorted(data.keys())}")
                else:
                    err = data.get("error", {})
                    print(f"[DONE  ] {name:22s} FAILED   {el:5.1f}s  "
                          f"stage={err.get('stage')} msg={err.get('message')}")
            else:
                print(f"[query ] {name:22s} {st:8s} {el:5.1f}s")
        if pending:
            time.sleep(10)
    for name, tid in pending.items():
        print(f"[TIMEOUT] {name:22s} still pending after {hard_timeout}s (task_id={tid})")
    return final


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"
    if cmd == "badparams":
        for name, body in bad_params():
            status, data, trace = post("/v1/audio/music/submit", body)
            print(f"[bad   ] {name:22s} HTTP {status}  "
                  f"{json.dumps(data, ensure_ascii=False)[:200]}")
    elif cmd == "submit":
        tasks = submit_all(cases())
        print(json.dumps(tasks, indent=2))
        with open(os.path.join(ROOT, "test", "tasks.json"), "w") as f:
            json.dump(tasks, f, indent=2)
    elif cmd == "poll":
        if len(sys.argv) > 2:
            poll_all({"cli": sys.argv[2]})
        else:
            with open(os.path.join(ROOT, "test", "tasks.json")) as f:
                poll_all(json.load(f))
    else:
        tasks = submit_all(cases())
        with open(os.path.join(ROOT, "test", "tasks.json"), "w") as f:
            json.dump(tasks, f, indent=2)
        if tasks:
            poll_all(tasks)


if __name__ == "__main__":
    main()
