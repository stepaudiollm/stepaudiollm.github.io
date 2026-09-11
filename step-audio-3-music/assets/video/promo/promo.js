/* =============================================================================
   StepAudio 3 Music · 宣传片 promo.js
   -----------------------------------------------------------------------------
   一条统一的时钟（Clock）驱动全部分镜：所有等待都走 wait()，
   因此暂停 / 变速 / 跳幕 / 循环都只是对这一个时钟做手脚，不会出现半截动画。
   ============================================================================= */

const $ = id => document.getElementById(id);
const stage = $('stage');

/* ═══════════════════════════════════════════════════════════════════════════
   0 · 时钟与会话
   ═══════════════════════════════════════════════════════════════════════════ */

const ABORT = Symbol('abort');

const Clock = {
  t: 0, paused: false, speed: 1, waiters: [], last: 0,
  start() {
    this.last = performance.now();
    const loop = now => {
      const dt = Math.min(80, now - this.last);   // 切后台回来不要一次跳完
      this.last = now;
      if (!this.paused) {
        this.t += dt * this.speed;
        for (let i = this.waiters.length - 1; i >= 0; i--) {
          if (this.t >= this.waiters[i].at) this.waiters.splice(i, 1)[0].res();
        }
      }
      Ticker.run(dt, this.paused);
      this._f = (this._f || 0) + 1;
      if (this.t - (this._fT || 0) > 1000) { window.__fps = this._f; this._f = 0; this._fT = this.t; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
};

/** 每帧回调池：音浪、进度条这类连续动画挂在这里 */
const Ticker = {
  fns: new Set(),
  add(fn) { this.fns.add(fn); return () => this.fns.delete(fn); },
  run(dt, paused) { if (paused) return; for (const f of this.fns) f(dt); }
};

let session = 0;                       // 每次重播 +1，旧的 await 全部作废
const alive = s => s === session;

function wait(ms) {
  const s = session;
  return new Promise((res, rej) => {
    Clock.waiters.push({ at: Clock.t + ms, res: () => alive(s) ? res() : rej(ABORT) });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   1 · 舞台缩放
   ═══════════════════════════════════════════════════════════════════════════ */

function fit() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.setProperty('--k', k);
}
addEventListener('resize', fit);
fit();

/** 把页面坐标换算成舞台内的 1920×1080 逻辑坐标 */
function stagePos(el, ax = .5, ay = .5) {
  const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
  const k = s.width / 1920 || 1;
  return { x: (r.left - s.left + r.width * ax) / k, y: (r.top - s.top + r.height * ay) / k };
}

/* ═══════════════════════════════════════════════════════════════════════════
   2 · 基础动作：类切换、打字机、虚拟鼠标
   ═══════════════════════════════════════════════════════════════════════════ */

const on  = (el, c = 'in') => el.classList.add(c);
const off = (el, c = 'in') => el.classList.remove(c);

/** 元素入场后停一会儿再出场 */
async function flash(el, inMs, holdMs) {
  on(el, 'in'); off(el, 'out');
  await wait(inMs + holdMs);
  off(el, 'in'); on(el, 'out');
}

/**
 * 打字机。人打字不是匀速的：空格后略停、标点后停久一点、偶尔顿一下。
 * 这点抖动是"像真人在敲"和"像程序在刷"的全部区别。
 *
 * 实现上先把每个字符该出现的时刻排成时间线，再用一条 rAF 播出去。
 * 逐字符 await 会被帧率绑架 —— 每个字至少占一帧，一段 100 字的台词
 * 在 30fps 下会比设计时长慢一倍，整片节奏全乱。
 */
async function type(el, text, { cps = 34, start = 180, box = null, count = null } = {}) {
  // Intro 的演示节奏需要更紧凑；提高有效字符速度，同时保留标点停顿。
  const base = 1000 / (cps * 1.5625); // 在已有 1.25 倍速度上再加快 25%。
  if (box) box.classList.add('focus');
  el.classList.remove('ph');
  el.textContent = '';
  el.scrollTop = 0;
  const tn = document.createTextNode('');
  const caret = document.createElement('i');
  caret.className = 'caret';
  el.append(tn, caret);

  const times = [];
  let acc = start;
  for (const ch of text) {
    let d = base * (.62 + Math.random() * .8);
    if (ch === ' ') d *= 1.15;
    if (',;:'.includes(ch)) d += base * 2.4;
    if ('.!?'.includes(ch)) d += base * 4.2;
    if (ch === '\n') d += base * 3.4;
    if (Math.random() < .035) d += base * 4;              // 偶尔想一下
    acc += d; times.push(acc);
  }

  const s = session;
  await new Promise((res, rej) => {
    let t = 0, i = 0;
    const stop = Ticker.add(dt => {
      if (!alive(s)) { stop(); rej(ABORT); return; }
      t += dt;
      const was = i;
      while (i < times.length && times[i] <= t) i++;
      if (i !== was) {
        tn.nodeValue = text.slice(0, i);                   // 只改文本节点，不重排 HTML
        if (el.classList.contains('lyrics')) el.scrollTop = el.scrollHeight;
        if (count) count.textContent = String(i);
        // 每敲几个可见字符，从光标附近冒一个音符
        const ch = text[i - 1];
        if (ch && ch !== ' ' && ch !== '\n' && Math.random() < .5) {
          const p = stagePos(caret, .5, .3);
          Notes.spawn(p.x, p.y, 1);
        }
      }
      if (i >= times.length) { stop(); res(); }
    });
  });
  caret.remove();
  if (box) { await wait(160); box.classList.remove('focus'); }
}

const escapeHTML = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

/* ── 虚拟鼠标 ──────────────────────────────────────────────────────────── */
const cursor = $('cursor');
let cursorAt = { x: 960, y: 980 };

function cursorShow(x, y) {
  if (x != null) { cursorAt = { x, y }; place(); }
  on(cursor, 'on');
}
function cursorHide() { off(cursor, 'on'); }
function place() {
  cursor.style.left = cursorAt.x + 'px';
  cursor.style.top  = cursorAt.y + 'px';
}

/** 移动到元素上；时长按距离给，短距离不该走满 700ms */
async function moveTo(el, { ax = .5, ay = .5, ms = null, settle = 130 } = {}) {
  const p = typeof el === 'string' ? null : stagePos(el, ax, ay);
  const to = p || el;
  const dist = Math.hypot(to.x - cursorAt.x, to.y - cursorAt.y);
  const dur = ms ?? Math.max(280, Math.min(900, 260 + dist * .55));
  cursor.style.transition =
    `opacity 320ms var(--ease), left ${dur}ms var(--ease-soft), top ${dur}ms var(--ease-soft)`;
  cursorAt = { x: to.x, y: to.y };
  place();
  await wait(dur + settle);
}

async function click(el) {
  cursor.classList.remove('click');
  void cursor.offsetWidth;
  cursor.classList.add('click');
  if (el && el.classList) {
    el.classList.add('press');
    setTimeout(() => el.classList.remove('press'), 240);
  }
  await wait(300);
}

/** 移过去 + 按下去，最常用的组合 */
async function tap(el, opts = {}) { await moveTo(el, opts); await click(el); }

/* ═══════════════════════════════════════════════════════════════════════════
   3 · 音浪 / 波形
   ═══════════════════════════════════════════════════════════════════════════ */

function buildBars(host, n, cls = '') {
  host.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const b = document.createElement('i');
    if (cls) b.className = cls;
    host.appendChild(b);
  }
  return [...host.children];
}

/**
 * 音浪：两条不同频率的正弦叠加 + 缓慢随机项。
 * 纯 Math.random() 每帧跳会像噪点；带惯性才像真的在跟着音乐。
 */
function spectrum(host, n = 56) {
  const bars = buildBars(host, n);
  const state = bars.map(() => .2);
  let live = false, phase = 0, quiet = 0;
  const stop = Ticker.add(dt => {
    // 静止且已经收敛时就别再写 DOM 了 —— 这条 ticker 全片都在跑
    if (!live && quiet > 1200) return;
    quiet = live ? 0 : quiet + dt;
    phase += dt / 1000;
    for (let i = 0; i < n; i++) {
      const c = 1 - Math.abs(i - (n - 1) / 2) / (n / 2);      // 中间高、两头低
      let target = live
        ? (.16 + .84 * Math.pow(c, .7) *
            (.42 + .3 * Math.sin(phase * 5.2 + i * .42) +
                   .22 * Math.sin(phase * 2.1 + i * .17) +
                   .2 * Math.random()))
        : .09;
      state[i] += (target - state[i]) * Math.min(1, dt / 1000 * (live ? 13 : 5));
      bars[i].style.height = (Math.max(.05, Math.min(1, state[i])) * 100) + '%';
    }
  });
  return {
    play() { live = true; quiet = 0; host.classList.add('live'); },
    idle() { live = false; quiet = 0; host.classList.remove('live'); },
    stop
  };
}

/** 作品条上的静态波形（播放时局部起伏） */
function waveform(host, n = 64, seed = 1) {
  const bars = buildBars(host, n);
  let r = seed * 9301;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const shape = bars.map((_, i) => {
    const env = Math.sin((i / n) * Math.PI) * .55 + .45;
    return Math.max(.16, Math.min(1, env * (.45 + rnd() * .75)));
  });
  bars.forEach((b, i) => { b.style.height = (shape[i] * 100) + '%'; });
  let live = false, phase = 0;
  Ticker.add(dt => {
    if (!live) return;
    phase += dt / 1000;
    bars.forEach((b, i) => {
      const m = 1 + .28 * Math.sin(phase * 6 + i * .5);
      b.style.height = (Math.max(.1, Math.min(1, shape[i] * m)) * 100) + '%';
    });
  });
  return { play() { live = true; }, idle() { live = false; bars.forEach((b, i) => b.style.height = (shape[i] * 100) + '%'); } };
}

/* ── 音符粒子（参考 stepaudio3music-demo）──────────────────────────────────
   打字时从光标附近冒出小音符再浮起淡出。画布用舞台的逻辑尺寸 1920×1080，
   随舞台一起被 CSS scale，坐标直接用 stagePos 得到的逻辑坐标。            */
const NOTE_PATHS = [
  'M9 3.2v9.1a2.6 2.6 0 1 0 1.6 2.4V6.6l4.2-1v6.1a2.6 2.6 0 1 0 1.6 2.4V2z',
  'M6.4 5v8.6a2.4 2.4 0 1 0 1.5 2.2V7.9l7.1-1.6v6.3a2.4 2.4 0 1 0 1.5 2.2V3.4z',
];
const Notes = {
  cv: null, cx: null, ps: [], shapes: new Map(),
  init() {
    this.cv = $('notes');
    this.cv.width = 1920; this.cv.height = 1080;
    this.cx = this.cv.getContext('2d');
    Ticker.add(dt => this.step(dt));
  },
  shape(d) { if (!this.shapes.has(d)) this.shapes.set(d, new Path2D(d)); return this.shapes.get(d); },
  spawn(x, y, n = 1) {
    if (this.ps.length > 44) this.ps = this.ps.slice(-30);
    for (let i = 0; i < n; i++) this.ps.push({
      x, y,
      vx: (Math.random() - .5) * 30,
      vy: -(64 + Math.random() * 38),
      rot: (Math.random() - .5) * .5, vr: (Math.random() - .5) * 1.5,
      size: 22 + Math.random() * 10,
      path: NOTE_PATHS[Math.floor(Math.random() * NOTE_PATHS.length)],
      life: 0, ttl: .95,
    });
  },
  step(dtMs) {
    if (!this.cx) return;
    const dt = Math.min(.05, dtMs / 1000);
    this.cx.clearRect(0, 0, 1920, 1080);
    if (!this.ps.length) return;
    this.ps = this.ps.filter(p => {
      p.life += dt;
      if (p.life >= p.ttl) return false;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt; p.rot += p.vr * dt;
      const k = p.life / p.ttl;
      this.cx.save();
      this.cx.translate(p.x, p.y); this.cx.rotate(p.rot);
      this.cx.scale(p.size / 24, p.size / 24); this.cx.translate(-12, -12);
      this.cx.globalAlpha = .24 * (1 - k * k);
      this.cx.fillStyle = '#8A6428';
      this.cx.fill(this.shape(p.path));
      this.cx.restore();
      return true;
    });
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   4 · 内容
   ═══════════════════════════════════════════════════════════════════════════ */

const COPY = {
  s2a: {
    desc: 'Dreamy synth-pop, female vocal, warm analog pads over a brushed kit, nostalgic and wide, C minor, 92 BPM.',
    lyrics: '[Verse]\nCity lights bleed through the rain\nI keep your name inside a song\n\n[Chorus]\nSo let it ring, let it carry on',
    title: 'Neon Rain',
    tags: 'Synth-pop · Female · 92 BPM · Cm',
    cover: '../covers/cover-s04-retrofuture-02.webp',
    dur: '3:12'
  },
  s2b: {
    desc: 'Rebuild it as a late-night jazz ballad — upright bass, brushed drums, warm Rhodes, male vocal.',
    lyrics: '[Verse]\nCity lights bleed through the rain\nI keep your name inside a song\n\n[Chorus]\nSo let it ring, let it carry on',
    title: 'Neon Rain (Midnight Cut)',
    tags: 'Jazz ballad · Male · 78 BPM · Eb',
    cover: '../covers/cover-s03-collage-02.webp',
    dur: '3:41'
  },
  s3: {
    desc: 'Cinematic indie-folk, female vocal, fingerpicked nylon guitar with strings, hopeful, C minor, 92 BPM.',
    lyrics: '[Verse]\nI counted every quiet street\n\n[Chorus]\nAnd every road leads back to you',
    title: 'Every Road',
    chat: 'Make the chorus feel a little brighter and more uplifting.',
    cover1: '../covers/cover-s01-minimal-01.webp',
    cover2: '../covers/cover-abstract-03.jpg',
    cover3: '../covers/cover-dawn-02.jpg'
  }
};

// 提前解码所有会出现在黑胶唱片中心的封面。只设置 src 会把解码推迟到
// 播放栏出现之后，造成短暂的黑色唱片；decode() 完成后再展示播放栏。
const COVER_READY = new Map();
function preloadCover(src) {
  if (!COVER_READY.has(src)) {
    const img = new Image();
    img.src = src;
    COVER_READY.set(src, new Promise(resolve => {
      if (img.complete) { Promise.resolve(img.decode?.()).catch(() => {}).finally(resolve); return; }
      img.onload = () => Promise.resolve(img.decode?.()).catch(() => {}).finally(resolve);
      img.onerror = resolve;
    }));
  }
  return COVER_READY.get(src);
}
for (const src of [COPY.s2a.cover, COPY.s2b.cover, COPY.s3.cover1, COPY.s3.cover2, COPY.s3.cover3]) {
  preloadCover(src);
}

/* ── ABC-COT 三个版本 ──────────────────────────────────────────────────────
   格式与真实推理产物一致：header + % 段落注释 + 带和弦标记的旋律。
   为了在一屏里读得清，这里是 12 小节的精简版。                            */

const ABC_HEAD = [
  'X:1',
  'Q: 1/4=92',
  'L: 1/16',
  'M: 4/4',
  'K: Cm',
  '% Language: English',
  '% Duration: 41.0s | Total bars: 12',
];

const ABC_V1 = [
  ...ABC_HEAD,
  '% Instruments: [nylon_guitar, bass, strings]',
  '% Intro | Instrumental',
  '"Cm" z8 G,2C2 E2G2 | "Ab" z8 A,2C2 F2A2 |',
  '% Verse | Vocal',
  '"Cm" G4 z2 G2 c2B2G2E2 | "Ab" A4 z2 A2 c2A2G2F2 |',
  '"Eb" G4 z4 B2c2d2B2 | "Bb" F4 z2 F2 A2G2F2D2 |',
  '% Chorus | Vocal',
  '"Cm" c4 z2 c2 e2d2c2G2 | "Ab" A4 z2 c2 f2e2d2c2 |',
  '"Eb" B4 z2 B2 d2c2B2G2 | "Bb" F4 z2 A2 c2B2A2F2 |',
  '% Outro | Instrumental',
  '"Cm" G8 z4 G,2C2 | "Cm" C16 |',
];

/* 改写版：副歌抬高四度并转到关系大调，速度提到 100 */
const ABC_V2 = [
  'X:1',
  'Q: 1/4=100',
  'L: 1/16',
  'M: 4/4',
  'K: Cm',
  '% Language: English',
  '% Duration: 38.6s | Total bars: 12',
  '% Instruments: [nylon_guitar, bass, strings]',
  '% Intro | Instrumental',
  '"Cm" z8 G,2C2 E2G2 | "Ab" z8 A,2C2 F2A2 |',
  '% Verse | Vocal',
  '"Cm" G4 z2 G2 c2B2G2E2 | "Ab" A4 z2 A2 c2A2G2F2 |',
  '"Eb" G4 z4 B2c2d2B2 | "Bb" F4 z2 F2 A2G2F2D2 |',
  '% Chorus | Vocal | lifted a 4th, relative major',
  '"Eb" f4 z2 f2 a2g2f2c2 | "Ab" c\'4 z2 f2 b2a2g2f2 |',
  '"Bb" e4 z2 e2 g2f2e2c2 | "Bb7" c4 z2 e2 f2e2d2B2 |',
  '% Outro | Instrumental',
  '"Cm" g8 z4 G,2C2 | "Cm" C16 |',
];

/* 手动微调版：用户自己把尾奏改成一句下行落回主音（演示可手动继续编辑 ABC） */
const ABC_V3 = ABC_V2.map(l => l);
const V3_OUTRO_LINE = 17;
const V3_OUTRO_TEXT = '"Cm" g8 f2e2 d2c2 | "Cm" c8 G4 C4 |';
ABC_V3[V3_OUTRO_LINE] = V3_OUTRO_TEXT;

/** 改写版相对 v1 变化的行号（用于高亮） */
const V2_CHANGED = [1, 6, 14, 15, 16, 17];
const V3_CHANGED = [V3_OUTRO_LINE];

/* ═══════════════════════════════════════════════════════════════════════════
   5 · ABC 代码高亮
   ═══════════════════════════════════════════════════════════════════════════ */

function abcLineHTML(line) {
  const e = escapeHTML(line);
  if (line.startsWith('%')) {
    // 段落注释（Verse / Chorus…）比元信息注释更重要，给它铜色
    const strong = /^%\s*(Intro|Verse|Chorus|Bridge|Outro|Instruments)/.test(line);
    return `<span class="abc-cmt ${strong ? 'abc-cmt-b' : ''}">${e}</span>`;
  }
  if (/^[A-Za-z]:/.test(line)) {
    return `<span class="abc-hdr">${e}</span>`;
  }
  return e
    .replace(/&quot;[^&]*?&quot;/g, m => `<span class="abc-chord">${m}</span>`)
    .replace(/"[^"]*"/g, m => `<span class="abc-chord">${m}</span>`)
    .replace(/\|/g, '<span class="abc-bar">|</span>');
}

/** 把行数组画进 ABC 面板；changed 里的行加高亮 */
function paintABC(lines, changed = [], cls = 'ins') {
  const host = $('abcCodeInner');
  host.innerHTML = lines.map((l, i) =>
    `<span class="abc-l ${changed.includes(i) ? cls : ''}" data-i="${i}">${abcLineHTML(l) || '&nbsp;'}</span>`
  ).join('');
  return [...host.children];
}

/**
 * 手动编辑：在某一行里逐字重打新内容（用户自己微调 ABC）。
 * 先把该行清空、亮起编辑高亮，再一个字一个字打出来，光标闪烁、冒音符。
 */
async function typeABCLine(baseLines, idx, newText, { cps = 24 } = {}) {
  paintABC(baseLines);
  scrollABCTo(idx);
  await wait(200);
  const host = $('abcCodeInner');
  const line = host.querySelector(`.abc-l[data-i="${idx}"]`);
  if (!line) return;
  line.classList.add('man');

  const base = 1000 / (cps * 1.25);
  const times = [];
  let acc = 260;
  for (const ch of newText) {
    let d = base * (.6 + Math.random() * .8);
    if (ch === ' ') d *= 1.1;
    if (Math.random() < .06) d += base * 4;
    acc += d; times.push(acc);
  }
  const s = session;
  await new Promise((res, rej) => {
    let t = 0, i = 0;
    const stop = Ticker.add(dt => {
      if (!alive(s)) { stop(); rej(ABORT); return; }
      t += dt;
      const was = i;
      while (i < times.length && times[i] <= t) i++;
      if (i !== was) {
        line.innerHTML = (abcLineHTML(newText.slice(0, i)) || '') + '<i class="caret"></i>';
        const ch = newText[i - 1];
        if (ch && ch !== ' ' && Math.random() < .55) {
          const p = stagePos(line, Math.min(.95, i / newText.length), .3);
          Notes.spawn(p.x, p.y, 1);
        }
      }
      if (i >= times.length) { stop(); res(); }
    });
  });
  line.innerHTML = abcLineHTML(newText) || '&nbsp;';
}

/** 内容比容器高时，把视口滚到指定行 */
function scrollABCTo(lineIdx) {
  const host = $('abcCodeInner'), box = $('abcCode');
  const lh = host.children[0]?.getBoundingClientRect().height || 21;
  const k = stage.getBoundingClientRect().width / 1920 || 1;
  const avail = (box.clientHeight - 28);
  const total = host.scrollHeight;
  if (total <= avail) { host.style.transform = 'translateY(0)'; return; }
  const target = Math.max(0, Math.min(total - avail, (lineIdx * lh / k) - avail * .55));
  host.style.transform = `translateY(${-target}px)`;
}

/** 逐行流式吐出 ABC —— 像模型在写，而不是一次贴上 */
async function streamABC(lines, perLine = 78) {
  const host = $('abcCodeInner');
  host.style.transform = 'translateY(0)';
  host.innerHTML = '';
  const caret = $('abcCaret');
  caret.classList.add('on');
  for (let i = 0; i < lines.length; i++) {
    const el = document.createElement('span');
    el.className = 'abc-l';
    el.innerHTML = abcLineHTML(lines[i]) || '&nbsp;';
    el.style.animation = 'insPop 300ms var(--ease) both';
    host.appendChild(el);
    scrollABCTo(i);
    // 注释行是"在想"，写得慢一点；音符行是"在写"，快
    await wait(lines[i].startsWith('%') ? perLine * 2.1 : perLine);
  }
  caret.classList.remove('on');
  await wait(200);
  scrollABCTo(0);
}

/* ═══════════════════════════════════════════════════════════════════════════
   6 · 乐谱：abcjs 渲染 + 钢琴采样试听 + 游标跟随
   ═══════════════════════════════════════════════════════════════════════════ */

const Score = {
  vis: null, events: null, duration: 0, timer: null,
  ctx: null, nodes: new Set(), buffers: new Map(), playing: false, raf: null,

  render(lines) {
    const abc = lines.join('\n');
    const host = $('scoreHost');
    try {
      this.vis = ABCJS.renderAbc(host, abc, {
        add_classes: true,
        staffwidth: 600,
        scale: .82,
        paddingtop: 2, paddingbottom: 6, paddingleft: 0, paddingright: 0,
        wrap: { minSpacing: 1.6, maxSpacing: 2.9, preferredMeasuresPerLine: 4 },
        format: { gchordfont: 'Instrument Sans 11 bold' }
      })[0];
    } catch (e) { console.warn('[promo] renderAbc failed', e); return; }
    $('scoreFill').style.width = '0';
    $('scoreTime').textContent = '0:00';
    $('scoreCursor').classList.remove('on');
    this.prepare();
  },

  prepare() {
    this.events = null; this.duration = 0;
    if (!this.vis) return;
    try {
      const seq = this.vis.setUpAudio({ chordsOff: true });
      const meter = this.vis.getMeterFraction();
      const factor = this.vis.millisecondsPerMeasure(seq.tempo) / 1000 / (meter.num / meter.den);
      this.events = seq.tracks.flat()
        .filter(n => n.cmd === 'note' && Number.isFinite(n.pitch) && n.duration > 0)
        .map(n => ({ pitch: n.pitch, start: n.start * factor, duration: n.duration * factor, volume: n.volume }))
        .sort((a, b) => a.start - b.start);
      this.duration = seq.totalDuration * factor;
      this.tempo = seq.tempo;
    } catch (e) { console.warn('[promo] setUpAudio failed', e); }
  },

  /* ── 采样音色 ───────────────────────────────────────────────────────── */
  NOTES: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  clampPitch(p) { return Math.max(21, Math.min(108, Math.round(p))); },
  async buffer(p) {
    p = this.clampPitch(p);
    if (this.buffers.has(p)) return this.buffers.get(p);
    const name = this.NOTES[p % 12] + (Math.floor(p / 12) - 1);
    const url = window.MIDI?.Soundfont?.acoustic_grand_piano?.[name];
    if (!url) throw new Error('missing sample ' + name);
    const bytes = Uint8Array.from(atob(url.split(',')[1]), c => c.charCodeAt(0));
    const pr = this.ctx.decodeAudioData(bytes.buffer).catch(e => { this.buffers.delete(p); throw e; });
    this.buffers.set(p, pr);
    return pr;
  },

  stopAudio() {
    for (const n of this.nodes) { try { n.stop(); } catch (e) {} }
    this.nodes.clear();
  },

  /** 弹一遍谱子：有 AudioContext 就出声，没有就只走游标 —— 画面永远不等音频 */
  async play() {
    if (this.playing || !this.events?.length) return;
    this.playing = true;
    const mySession = session;
    const btn = $('scorePlayIcon');
    btn.setAttribute('href', '#i-pause');
    const cur = $('scoreCursor');
    cur.classList.add('on');

    // Intro 默认保持静音；乐谱只展示游标和进度，不创建或播放 Web Audio。
    const ctx = null;
    let t0 = performance.now() / 1000;
    if (ctx) {
      this.ctx = ctx;
      try {
        const pitches = [...new Set(this.events.map(n => this.clampPitch(n.pitch)))];
        await Promise.all(pitches.map(p => this.buffer(p)));
        for (const p of pitches) this.buffers.set(p, await this.buffers.get(p));
      } catch (e) { console.warn('[promo] samples', e); }
      if (!alive(mySession)) { this.playing = false; return; }
      t0 = ctx.currentTime;
    }

    // 游标：TimingCallbacks 把"第几个音符"翻译成谱面坐标。
    // 让 left 的过渡时长 = 距上一个事件的真实间隔，游标就匀速滑过每一拍，
    // 不再是一跳一停（原来固定 90ms 会先冲到位再干等，看着卡）。
    if (this.vis) {
      try {
        let lastWall = 0, lastTop = null;
        this.timer = new ABCJS.TimingCallbacks(this.vis, {
          qpm: this.tempo,
          eventCallback: ev => {
            if (!ev || !alive(mySession)) return;
            const now = performance.now();
            const gap = lastWall ? Math.max(60, Math.min(700, now - lastWall)) : 150;
            lastWall = now;
            const top = ev.top - 4, height = ev.height + 8;
            // 换行（top 变了）时不要横向长距离滑动，直接跳到新行行首
            const sameLine = lastTop !== null && Math.abs(top - lastTop) < 4;
            lastTop = top;
            cur.style.transition = sameLine
              ? `opacity 200ms var(--ease), left ${gap}ms linear, top 200ms var(--ease-soft), height 200ms var(--ease-soft)`
              : `opacity 200ms var(--ease), left 0ms, top 220ms var(--ease-soft), height 220ms var(--ease-soft)`;
            cur.style.left   = (ev.left - 1) + 'px';
            cur.style.top    = top + 'px';
            cur.style.height = height + 'px';
          }
        });
        this.timer.start();
      } catch (e) { console.warn('[promo] TimingCallbacks', e); }
    }

    let i = 0;
    const startWall = performance.now();
    const step = () => {
      if (!this.playing || !alive(mySession)) return;
      const pos = ctx ? (ctx.currentTime - t0) : (performance.now() - startWall) / 1000;
      while (ctx && i < this.events.length && this.events[i].start < pos + .3) {
        const n = this.events[i++];
        const at = Math.max(ctx.currentTime, t0 + n.start);
        const end = t0 + n.start + n.duration;
        if (end <= at) continue;
        const sample = this.clampPitch(n.pitch);
        const buf = this.buffers.get(sample);
        if (!buf || buf.then) continue;
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = buf;
        src.playbackRate.value = Math.pow(2, (n.pitch - sample) / 12);
        const level = .5 * Math.min(1, (n.volume || 85) / 127);
        g.gain.setValueAtTime(level, at);
        g.gain.setTargetAtTime(0, end, .08);
        src.connect(g); g.connect(ctx.destination);
        this.nodes.add(src);
        src.onended = () => { this.nodes.delete(src); src.disconnect(); g.disconnect(); };
        src.start(at); src.stop(end + .4);
      }
      const p = Math.max(0, Math.min(1, pos / this.duration));
      $('scoreFill').style.width = (p * 100) + '%';
      $('scoreTime').textContent = fmtTime(pos);
      if (pos >= this.duration) { this.stop(); return; }
      this.raf = requestAnimationFrame(step);
    };
    step();
  },

  stop() {
    this.playing = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.stopAudio();
    if (this.timer) { try { this.timer.stop(); } catch (e) {} this.timer = null; }
    $('scorePlayIcon')?.setAttribute('href', '#i-play');
    $('scoreCursor')?.classList.remove('on');
  }
};

const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ═══════════════════════════════════════════════════════════════════════════
   7 · 分镜
   ═══════════════════════════════════════════════════════════════════════════ */

const SPEC = spectrum($('spectrum2'));
let pcTicker = null;

/** 把所有元素恢复到"什么都还没发生"的状态 */
function resetAll() {
  Score.stop();
  ['sc1', 'sc2', 'sc3', 'sc4'].forEach(id => $(id).classList.remove('on'));
  ['wm1', 'wm4', 'slogan1', 'slogan4', 'sweep1', 'sweep4', 'hl2', 'hl3',
   'compose2', 'compose3', 'playerCard', 'abcwrap3'].forEach(id => {
    const el = $(id); el.classList.remove('in', 'out');
  });
  $('compose3').style.removeProperty('--tx');
  $('compose2').style.removeProperty('--tx');
  $('worklist3').innerHTML = '';
  $('abcCodeInner').innerHTML = '';
  $('abcCodeInner').style.transform = 'translateY(0)';
  $('scoreHost').innerHTML = '';
  $('scoreFill').style.width = '0';
  $('scoreTime').textContent = '0:00';
  $('fileChip2').style.opacity = '0';
  $('drop2').classList.remove('filled', 'over');
  $('dropTitle2').textContent = 'Upload the original';
  $('dropHint2').textContent = 'wav / flac / mp3 / opus';
  $('uploadField2').hidden = true;
  $('uploadField2').classList.remove('show');
  $('tt2').dataset.state = 'idle';
  $('tt2').style.setProperty('--down', 0);
  $('pcFill').style.width = '0';
  $('pcDot').style.left = '0';
  SPEC.idle();
  if (pcTicker) { pcTicker(); pcTicker = null; }
  ['desc2', 'lyrics2', 'title2', 'desc3', 'lyrics3', 'title3', 'chat3'].forEach(id => {
    $(id).textContent = ''; $(id).innerHTML = '';
  });
  $('descCount2').textContent = '0';
  $('descCount3').textContent = '0';
  setTab('song', false);
  cursorHide();
  cursorAt = { x: 960, y: 1000 }; place();
}

/* ── 幕 1 · 开场 ───────────────────────────────────────────────────────── */
async function scene1() {
  mark('1 · Opening');
  $('sc1').classList.add('on');
  off($('brand'), 'on');

  await wait(400);
  on($('wm1'), 'in');
  await wait(900);
  on($('brand'), 'on');
  await wait(300);
  on($('sweep1'), 'in');
  await wait(700);
  on($('slogan1'), 'in');
  beat('s1-title');

  await wait(3000);

  off($('sweep1'), 'in');
  on($('wm1'), 'out'); off($('wm1'), 'in');
  on($('slogan1'), 'out'); off($('slogan1'), 'in');
  await wait(1000);
  $('sc1').classList.remove('on');
}

/* ── 幕 2 · 基础功能 ───────────────────────────────────────────────────── */

function setTab(mode, animate = true) {
  const tabs = [...$('tabs2').querySelectorAll('.tab')];
  tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.mode === mode)));
  const active = tabs.find(t => t.dataset.mode === mode);
  const ink = $('tabInk2');
  if (!animate) ink.style.transition = 'none';
  ink.style.left = active.offsetLeft + 'px';
  ink.style.width = active.offsetWidth + 'px';
  if (!animate) requestAnimationFrame(() => ink.style.transition = '');
  $('about2').textContent = {
    song: 'Write lyrics and a prompt, get a song of your own.',
    vocal2music: 'Upload an a cappella; lyrics and a prompt fill in the full arrangement.',
    cover: 'Upload the original and change its style.'
  }[mode];
}

/** 播放面板：落针、起音浪、走进度，并填入作品信息 */
function startPlayer(track) {
  $('ttLabel').src = track.cover;
  $('pcTitle').textContent = track.title;
  $('pcTags').textContent = track.tags;
  $('pcDur').textContent = track.dur;
  $('pcDesc').textContent = track.desc;
  $('pcLyrics').textContent = track.lyrics;
  const tt = $('tt2');
  tt.dataset.state = 'playing';
  tt.style.setProperty('--down', 1);
  SPEC.play();
  const total = 192;                       // 逻辑时长（秒），只为让进度动起来
  let el = 0;
  if (pcTicker) pcTicker();
  pcTicker = Ticker.add(dt => {
    el = Math.min(total, el + dt / 1000 * 7.5);   // 快进，几秒走完一小段
    const p = el / total;
    $('pcFill').style.width = (p * 100) + '%';
    $('pcDot').style.left = (p * 100) + '%';
    $('pcCur').textContent = fmtTime(el);
    tt.style.setProperty('--p', p);
  });
}
function stopPlayer() {
  $('tt2').dataset.state = 'idle';
  $('tt2').style.setProperty('--down', 0);
  SPEC.idle();
  if (pcTicker) { pcTicker(); pcTicker = null; }
}

/** 表单三连填 */
async function fillCompose(ids, copy, { descBox = null } = {}) {
  await type($(ids.desc), copy.desc, { cps: 42, box: descBox, count: $(ids.count) });
  await wait(260);
  await type($(ids.lyrics), copy.lyrics, { cps: 52, box: $(ids.lyrics) });
  await wait(240);
  await type($(ids.title), copy.title, { cps: 26, box: $(ids.title) });
  await wait(320);
}

async function scene2() {
  mark('2 · Basics');
  $('sc2').classList.add('on');
  setTab('song', false);

  beat('s2-headline');
  await flash($('hl2'), 1100, 2000);
  await wait(700);

  // 编辑栏从右侧切入，停在右侧（不再先居中再移动）
  on($('compose2'), 'in');
  await wait(900);
  setTab('song');
  beat('s2-compose');

  // 歌曲创作
  await fillCompose(
    { desc: 'desc2', count: 'descCount2', lyrics: 'lyrics2', title: 'title2' },
    COPY.s2a, { descBox: $('descBox2') });

  await tap($('create2'));
  $('create2').classList.add('busy');
  await wait(1600);
  cursorHide();

  // 播放面板从左边推进来，占满左半边
  $('create2').classList.remove('busy');
  $('ttLabel').src = COPY.s2a.cover;
  await preloadCover(COPY.s2a.cover);
  on($('playerCard'), 'in');
  await wait(760);
  startPlayer(COPY.s2a);
  beat('s2-player1');
  await wait(3600);

  // ── 切到「歌曲翻唱」：左侧播放栏消失 ──────────────────────────────────
  cursorShow();
  await tap($('tabs2').querySelector('[data-mode="cover"]'));
  setTab('cover');
  stopPlayer();
  off($('playerCard'), 'in'); on($('playerCard'), 'out');
  cursorHide();

  $('uploadField2').hidden = false;
  await wait(60);
  $('uploadField2').classList.add('show');
  ['desc2', 'lyrics2', 'title2'].forEach(id => { $(id).textContent = ''; });
  $('descCount2').textContent = '0';
  await wait(900);

  // 文件飞进上传框
  beat('s2-cover-tab');
  await flyFile();
  beat('s2-file-dropped');

  // 翻唱三连填
  await fillCompose(
    { desc: 'desc2', count: 'descCount2', lyrics: 'lyrics2', title: 'title2' },
    COPY.s2b, { descBox: $('descBox2') });

  cursorShow();
  await tap($('create2'));
  $('create2').classList.add('busy');
  await wait(1600);
  cursorHide();

  // 点 create 后播放栏重新出现
  $('create2').classList.remove('busy');
  off($('playerCard'), 'out');
  $('ttLabel').src = COPY.s2b.cover;
  await preloadCover(COPY.s2b.cover);
  on($('playerCard'), 'in');
  await wait(760);
  startPlayer(COPY.s2b);
  beat('s2-player2');
  await wait(3800);

  // 退场
  stopPlayer();
  off($('playerCard'), 'in'); on($('playerCard'), 'out');
  off($('compose2'), 'in');  on($('compose2'), 'out');
  await wait(800);
  $('sc2').classList.remove('on');
}

/** source_song.wav：中央浮现 → 飞向 dropzone → 落位 */
async function flyFile() {
  const chip = $('fileChip2'), drop = $('drop2');
  chip.style.transition = 'none';
  chip.style.opacity = '0';
  chip.style.transform = 'none';
  // 先量自身尺寸，才能按中心点定位
  const w = chip.offsetWidth, h = chip.offsetHeight;
  const from = { x: 700 - w / 2, y: 540 - h / 2 };
  chip.style.left = from.x + 'px';
  chip.style.top = from.y + 'px';
  await wait(30);

  chip.style.transition = 'opacity 520ms var(--ease), transform 520ms var(--ease-soft)';
  chip.style.transform = 'translateY(0) scale(1)';
  chip.style.opacity = '1';
  await wait(900);

  const target = stagePos(drop, .5, .5);
  chip.style.transition =
    'left 1000ms var(--ease-soft), top 1000ms var(--ease-soft), ' +
    'transform 1000ms var(--ease-soft), opacity 300ms var(--ease) 780ms';
  chip.style.left = (target.x - w / 2) + 'px';
  chip.style.top = (target.y - h / 2) + 'px';
  chip.style.transform = 'scale(.62)';
  await wait(700);
  drop.classList.add('over');
  await wait(340);
  chip.style.opacity = '0';
  drop.classList.remove('over');
  drop.classList.add('filled');
  $('drop2').querySelector('.dz-ico')?.setAttribute('href', '#i-check');
  $('dropTitle2').textContent = 'source_song.wav';
  $('dropHint2').textContent = '18.4 MB · 3:07 · ready';
  await wait(700);
}

/* ── 幕 3 · ABC 可控性 ─────────────────────────────────────────────────── */

function workCard({ cover, title, meta, ver, dur, seed }) {
  const el = document.createElement('div');
  el.className = 'workcard';
  el.innerHTML = `
    <img class="wc-art" src="${cover}" alt="">
    <div class="wc-body">
      <b>${escapeHTML(title)}</b>
      <small><span class="wc-ver">${escapeHTML(ver)}</span>${escapeHTML(meta)}</small>
    </div>
    <div class="wc-wave"></div>
    <span class="wc-time">${dur}</span>
    <button class="wc-play"><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#i-play"/></svg></button>`;
  $('worklist3').appendChild(el);
  el.wave = waveform(el.querySelector('.wc-wave'), 60, seed);
  el.btn = el.querySelector('.wc-play');
  el.icon = el.querySelector('use');
  return el;
}

async function playCard(card, ms) {
  await tap(card.btn);
  card.dataset.state = 'playing';
  card.icon.setAttribute('href', '#i-pause');
  card.wave.play();
  await wait(ms);
  card.dataset.state = '';
  card.icon.setAttribute('href', '#i-play');
  card.wave.idle();
}

async function scene3() {
  mark('3 · ABC control');
  $('sc3').classList.add('on');

  beat('s3-headline');
  await flash($('hl3'), 1100, 2200);
  await wait(700);

  // 编辑栏从左侧切入后固定在左侧，不再二次横移。
  const c3 = $('compose3');
  on(c3, 'in');
  await wait(2500);
  beat('s3-compose');

  await fillCompose(
    { desc: 'desc3', count: 'descCount3', lyrics: 'lyrics3', title: 'title3' },
    COPY.s3);

  cursorShow();
  await tap($('create3'));
  $('create3').classList.add('busy');
  await wait(900);

  // 作品条 + ABC 区一起出现
  const card1 = workCard({
    cover: COPY.s3.cover1, title: 'Every Road', ver: 'v1',
    meta: 'Indie-folk · Female · 92 BPM · Cm', dur: '0:41', seed: 7
  });
  await wait(40);
  on(card1, 'in');
  on($('abcwrap3'), 'in');
  await wait(700);
  $('create3').classList.remove('busy');

  // ABC 流式吐出 → 渲染乐谱
  $('abcBadge').textContent = 'v1 · generated';
  $('abcBadge').classList.remove('hot');
  await streamABC(ABC_V1, 74);
  Score.render(ABC_V1);
  beat('s3-score-v1');
  await wait(600);

  // 听一遍生成的歌
  await playCard(card1, 3400);
  beat('s3-card1-played');

  // 听一遍谱子：MIDI + 游标跟随
  await tap($('scorePlay'));
  Score.play();
  beat('s3-score-play');
  await wait(9000);
  Score.stop();
  await wait(500);

  // ── 用对话框改写 ──────────────────────────────────────────────────────
  await moveTo($('chat3'), { ax: .12 });
  await click($('chatbar3'));
  await type($('chat3'), COPY.s3.chat, { cps: 40, box: $('chatbar3') });
  await wait(300);

  await tap($('chatSend3'));
  $('chatSend3').classList.add('busy');
  await wait(1500);
  $('chatSend3').classList.remove('busy');

  // 改写结果：变化行高亮，乐谱同步换掉
  $('abcBadge').textContent = 'v2 · rewritten';
  $('abcBadge').classList.add('hot');
  $('scoreBadge').textContent = 'C minor · 4/4 · ♩=100';
  $('scorePaper').classList.add('swap');
  paintABC(ABC_V2, V2_CHANGED, 'ins');
  scrollABCTo(15);
  await wait(420);
  Score.render(ABC_V2);
  $('scorePaper').classList.remove('swap');
  beat('s3-score-v2');
  await wait(1800);
  scrollABCTo(0);
  await wait(600);

  // ── 用改写后的 ABC 再生成一首 ────────────────────────────────────────
  await tap($('create3'));
  $('create3').classList.add('busy');
  const card2 = workCard({
    cover: COPY.s3.cover2, title: 'Every Road', ver: 'v2',
    meta: 'Indie-folk · Female · 100 BPM · Cm → Eb', dur: '0:39', seed: 23
  });
  card2.classList.add('gen', 'in');
  await wait(2100);
  card2.classList.remove('gen');
  $('create3').classList.remove('busy');
  await wait(400);

  // 二次倾听
  beat('s3-card2');
  await playCard(card2, 3400);

  // ── 手动再微调一下：用户自己在 ABC 里打字改尾奏 ──────────────────────
  await moveTo($('abcCode'), { ax: .5, ay: .84 });
  await click($('abcCode'));
  $('abcBadge').textContent = 'v3 · editing…';
  $('abcBadge').classList.add('hot');
  await typeABCLine(ABC_V2, V3_OUTRO_LINE, V3_OUTRO_TEXT, { cps: 22 });
  await wait(500);

  // 定稿：高亮改动行，乐谱同步
  paintABC(ABC_V3, V3_CHANGED, 'man');
  scrollABCTo(V3_OUTRO_LINE);
  $('abcBadge').textContent = 'v3 · hand-tuned';
  beat('s3-score-v3');
  $('scorePaper').classList.add('swap');
  await wait(380);
  Score.render(ABC_V3);
  $('scorePaper').classList.remove('swap');
  await wait(1400);
  scrollABCTo(0);
  await wait(500);

  // 用手改后的 ABC 再生成一首 → v3 音频出现在右上
  cursorShow();
  await tap($('create3'));
  $('create3').classList.add('busy');
  const card3 = workCard({
    cover: COPY.s3.cover3, title: 'Every Road', ver: 'v3',
    meta: 'Indie-folk · Female · 100 BPM · hand-tuned outro', dur: '0:39', seed: 41
  });
  card3.classList.add('gen', 'in');
  await wait(2100);
  card3.classList.remove('gen');
  $('create3').classList.remove('busy');
  await wait(400);

  // 三次倾听
  beat('s3-card3');
  await playCard(card3, 3200);
  cursorHide();
  await wait(700);

  // 退场
  off($('abcwrap3'), 'in');
  off(c3, 'in'); on(c3, 'out');
  [...$('worklist3').children].forEach(el => off(el, 'in'));
  await wait(900);
  $('sc3').classList.remove('on');
}

/* ── 幕 4 · 结束 ───────────────────────────────────────────────────────── */
async function scene4() {
  mark('4 · Close');
  $('sc4').classList.add('on');
  await wait(300);
  on($('wm4'), 'in');
  await wait(1000);
  on($('sweep4'), 'in');
  await wait(500);
  on($('slogan4'), 'in');
  beat('s4-title');
  await wait(3200);
  off($('sweep4'), 'in');
  on($('wm4'), 'out'); off($('wm4'), 'in');
  on($('slogan4'), 'out'); off($('slogan4'), 'in');
  off($('brand'), 'on');
  await wait(1100);
  $('sc4').classList.remove('on');
  await wait(400);
}

/* ═══════════════════════════════════════════════════════════════════════════
   8 · 导演：循环播放
   ═══════════════════════════════════════════════════════════════════════════ */

const SCENES = [scene1, scene2, scene3, scene4];

/** 分镜时长，跑一遍就知道成片多长、哪一幕超了 */
window.TIMING = [];

async function run(from = 0) {
  const my = ++session;
  resetAll();
  if (from > 0) on($('brand'), 'on');
  try {
    for (let i = from; i < SCENES.length; i++) {
      if (!alive(my)) return;
      const t0 = Clock.t;
      await SCENES[i]();
      window.TIMING[i] = +((Clock.t - t0) / 1000).toFixed(1);
    }
    if (alive(my)) run(0);                 // 循环
  } catch (e) {
    if (e !== ABORT) console.error('[promo]', e);
  }
}

function mark(label) {
  $('devLabel').textContent = label;
}

/** 节拍点：验收脚本靠它精确等到某个画面，而不是盲等秒数 */
window.BEATS = [];
function beat(name) {
  window.BEATS.push(name);
  if (location.search.includes('dev')) console.log('[beat]', name, (Clock.t / 1000).toFixed(1) + 's');
}

/* ── 调试 / 录制辅助 ───────────────────────────────────────────────────── */
const dev = new URLSearchParams(location.search).has('dev');
if (dev) {
  $('devbar').hidden = false;
  document.body.style.cursor = 'auto';
  $('devbar').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.scene) run(+b.dataset.scene - 1);
    if (b.dataset.act === 'toggle') Clock.paused = !Clock.paused;
    if (b.dataset.act === 'restart') run(0);
  });
  Ticker.add(() => { $('devClock').textContent = (Clock.t / 1000).toFixed(1) + 's'; });
}

/* ── 嵌入模式：点击播放 · 右下角全屏 · 空格暂停 · Esc 退出 ─────────────── */
const embed = new URLSearchParams(location.search).has('embed');
let embedStarted = false, embedUI = null;

const EXPAND_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/></svg>';
const COMPRESS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8V3H3M21 8V3h-5M16 21v-5h5M3 16h5v5"/></svg>';
const PLAY_SVG = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';

function embedPlay() {
  if (!embedStarted) {                       // 第一次播放才真正开跑
    embedStarted = true;
    $('embedPoster').classList.add('hide');
    run(0);
  }
  Clock.paused = false;
  embedUI.classList.remove('idle', 'paused');
  embedUI.classList.add('playing');
}
function embedPause() {
  if (!embedStarted) return;
  Clock.paused = true;
  embedUI.classList.remove('playing');
  embedUI.classList.add('paused');
}
function embedToggle() {
  if (!embedStarted || Clock.paused) embedPlay(); else embedPause();
}
function toggleFull() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

function initEmbed() {
  document.body.classList.add('embed');
  embedUI = document.createElement('div');
  embedUI.className = 'embed-ui idle';
  embedUI.innerHTML =
    '<div class="embed-poster" id="embedPoster">' +
      '<div class="embed-poster-brand"><span>StepAudio 3</span> <em>Music</em></div>' +
      '<button class="embed-play-big" aria-label="Play">' + PLAY_SVG + '</button>' +
      '<span class="embed-poster-cap">Feature walkthrough · click to play</span>' +
    '</div>' +
    '<button class="embed-center-play" aria-label="Play">' + PLAY_SVG + '</button>' +
    '<button class="embed-expand" id="embedExpand" aria-label="Fullscreen">' + EXPAND_SVG + '</button>';
  document.body.appendChild(embedUI);

  // 点视频任意处：播放 / 暂停切换
  embedUI.addEventListener('click', e => {
    if (e.target.closest('#embedExpand')) return;   // 展开按钮单独处理
    embedToggle();
  });
  // 右下角展开 / 收起全屏
  $('embedExpand').addEventListener('click', e => { e.stopPropagation(); toggleFull(); });

  document.addEventListener('fullscreenchange', () => {
    const full = !!document.fullscreenElement;
    $('embedExpand').innerHTML = full ? COMPRESS_SVG : EXPAND_SVG;
    fit();
  });

  // 空格暂停 / 播放；Esc 退出全屏
  addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); embedToggle(); }
    if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen?.();
  });
}

addEventListener('keydown', e => {
  if (embed) return;                          // 嵌入模式有自己的键位
  if (e.code === 'Space') { e.preventDefault(); Clock.paused = !Clock.paused; }
  if (e.key === 'r') run(0);
  if (['1', '2', '3', '4'].includes(e.key)) run(+e.key - 1);
});

/* 起飞 */
window.Notes = Notes;
Notes.init();
Clock.start();
if (embed) { Clock.paused = true; initEmbed(); }
document.fonts.ready.then(() => { fit(); if (!embed) run(0); });
