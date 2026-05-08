// 入口：内容渲染 + 滚动驱动 + 交互
import { MODEL, HIGHLIGHTS, TECH_POINTS, METRICS, CASES, PERSONAS,
         EMOTION_CASES, IQ_EQ_CASES, PARALINGUISTIC_CASES, EXPRESSION_CASES } from './data.js';
import { initHeroPointCloud } from './pointcloud.js';
import { createAudioPlayer } from './audio-player.js';

// 调试用：把 JS 错误显示在屏幕底部，方便排查
window.addEventListener('error', (e) => {
  let bar = document.getElementById('__err-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = '__err-bar';
    bar.style.cssText =
      'position:fixed;left:0;right:0;bottom:0;z-index:9999;padding:10px 16px;' +
      'background:#a8131c;color:#fff;font:13px/1.5 monospace;max-height:30vh;overflow:auto;';
    document.body.appendChild(bar);
  }
  bar.textContent += `[error] ${e.message} @ ${e.filename}:${e.lineno}:${e.colno}\n`;
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[unhandledrejection]', e.reason);
});

/* ---------- 共享音频管理 ----------
 * Abilities 和 Personas 都用这个全局 <audio> 元素。
 * 任意时刻只允许一个 owner（一个能力栏目 / 一张人设卡片），
 * 切换时自动停掉前一个，避免两段声音叠在一起。
 */
const ASSET_VER = 'v=20260507c';
const bust = (url) => (url ? url + (url.includes('?') ? '&' : '?') + ASSET_VER : url);

const sharedAudio = document.createElement('audio');
sharedAudio.preload = 'auto';
sharedAudio.style.display = 'none';
document.body.appendChild(sharedAudio);

// Web Audio 图：首次调用 ensureAudioAnalyser() 时创建 MediaElementSource + AnalyserNode。
// 只能创建一次（Web Audio 规范：每个 media element 只能有一个 MediaElementSource）。
let _audioCtx = null;
let _analyser = null;
let _audioGraphReady = false;

function ensureAudioAnalyser() {
  if (_audioGraphReady) return _analyser;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    _audioCtx = new Ctx();
    _analyser = _audioCtx.createAnalyser();
    _analyser.fftSize = 2048;
    _analyser.smoothingTimeConstant = 0.55;
    const src = _audioCtx.createMediaElementSource(sharedAudio);
    src.connect(_analyser);
    _analyser.connect(_audioCtx.destination);
    _audioGraphReady = true;
  } catch (e) {
    console.warn('[audio] analyser graph init failed:', e);
  }
  return _analyser;
}

function resumeAudioCtx() {
  if (_audioCtx && _audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }
}

let _audioOwnerCleanup = null;

function claimAudio(src, callbacks = {}) {
  // 释放上一个 owner
  if (_audioOwnerCleanup) {
    try { _audioOwnerCleanup(); } catch (_) {}
    _audioOwnerCleanup = null;
  }
  // reset 音频
  sharedAudio.pause();
  sharedAudio.currentTime = 0;
  sharedAudio.muted = false;
  sharedAudio.volume = 1;
  sharedAudio.src = src;

  const onEnded = () => { try { callbacks.onEnded && callbacks.onEnded(); } catch (_) {} };
  const onError = (e) => { try { callbacks.onError && callbacks.onError(e); } catch (_) {} };
  const onTime  = () => { try { callbacks.onTime && callbacks.onTime(sharedAudio.currentTime, sharedAudio.duration || 0); } catch (_) {} };

  sharedAudio.addEventListener('ended', onEnded);
  sharedAudio.addEventListener('error', onError);
  sharedAudio.addEventListener('timeupdate', onTime);

  _audioOwnerCleanup = () => {
    sharedAudio.pause();
    sharedAudio.removeEventListener('ended', onEnded);
    sharedAudio.removeEventListener('error', onError);
    sharedAudio.removeEventListener('timeupdate', onTime);
    try { callbacks.onStop && callbacks.onStop(); } catch (_) {}
  };

  const promise = sharedAudio.play();
  if (promise && typeof promise.then === 'function') {
    promise.catch((err) => {
      console.warn('[audio] play blocked:', err);
      try { callbacks.onError && callbacks.onError(err); } catch (_) {}
    });
  }
}

function releaseAudio() {
  if (_audioOwnerCleanup) {
    try { _audioOwnerCleanup(); } catch (_) {}
    _audioOwnerCleanup = null;
  }
}

// 通用：秒数 → "m:ss"
function fmtTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, '0')}`;
}

/* ---------- Hero: 点云 logo ---------- */
const heroCanvas = document.getElementById('hero-canvas');
if (heroCanvas) {
  try {
    initHeroPointCloud(heroCanvas);
  } catch (err) {
    console.error('[pointcloud] init failed:', err);
  }
}

/* ---------- Intro ---------- */
document.getElementById('intro-body').textContent = MODEL.introBody;
const _arxiv = document.getElementById('link-arxiv');
const _github = document.getElementById('link-github');
if (_arxiv) _arxiv.href = MODEL.links.arxiv;
if (_github) _github.href = MODEL.links.github;

/* ---------- Intro: 装饰性声波 ---------- */
(function renderWaveformBars() {
  const group = document.getElementById('waveform-bars');
  if (!group) return;
  const N = 60;
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * 400;
    // 用两个正弦叠加做一个好看的声纹静态图
    const base =
      20 + 30 * Math.abs(Math.sin(i * 0.25)) + 22 * Math.abs(Math.sin(i * 0.11 + 1.3));
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x - 2);
    rect.setAttribute('y', 100 - base / 2);
    rect.setAttribute('width', 3);
    rect.setAttribute('height', base);
    rect.setAttribute('rx', 1.5);
    rect.setAttribute('fill', 'url(#waveGradient)');
    rect.style.opacity = 0.35 + (base / 80) * 0.6;
    rect.style.transformOrigin = `${x}px 100px`;
    rect.style.animation = `waveBar ${1.2 + Math.random() * 1.6}s ease-in-out ${
      i * 0.04
    }s infinite alternate`;
    group.appendChild(rect);
  }
})();

// 注入声波动画 keyframes
(function injectWaveKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes waveBar {
      from { transform: scaleY(0.5); }
      to   { transform: scaleY(1.0); }
    }
  `;
  document.head.appendChild(style);
})();

/* ---------- § 3 Highlights: Bento ---------- */
(function renderHighlights() {
  const grid = document.getElementById('bento-grid');
  if (!grid) return;
  HIGHLIGHTS.forEach((h, i) => {
    const card = document.createElement('div');
    card.className = `bento-card size-${h.size} reveal`;
    card.setAttribute('data-delay', String((i % 4) + 1));
    card.innerHTML = `
      <div class="bento-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${h.iconPath}"/></svg>
      </div>
      <div class="bento-tag">${h.tag}</div>
      <h3 class="bento-title">${h.title}</h3>
      <p class="bento-desc">${h.desc}</p>
    `;
    grid.appendChild(card);
  });
})();

/* ---------- § 4 Tech Timeline ---------- */
(function renderTimeline() {
  const wrap = document.getElementById('timeline');
  if (!wrap) return;
  TECH_POINTS.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'timeline-item reveal';
    item.setAttribute('data-delay', String((i % 3) + 1));
    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-step">STAGE ${p.step}</div>
      <h3 class="timeline-title">${p.title}</h3>
      <div class="timeline-sub">${p.subtitle}</div>
      <p class="timeline-desc">${p.desc}</p>
    `;
    wrap.appendChild(item);
  });
})();

/* ---------- § 5 Metrics ---------- */
(function renderMetrics() {
  const chart = document.getElementById('metrics-chart');
  if (!chart) return;

  // 图表：只画我们模型的五个维度 bar（horizontal）
  const ours = METRICS.rows.find((r) => r.isOurs);
  chart.innerHTML =
    `<div class="chart-title">StepAudio-2.5-Realtime · 五维评测</div>` +
    METRICS.dims
      .map((d) => {
        const v = ours.values[d.key];
        return `
          <div class="bar-row">
            <div class="bar-row-label">
              <span class="bar-row-label-text">${d.label}</span>
              <span class="bar-row-label-hint">${d.hint}</span>
            </div>
            <div style="display:flex; align-items:center;">
              <div class="bar-track" style="flex:1;"><div class="bar-fill" data-target="${v}"></div></div>
              <span class="bar-value" data-count="${v}">0</span>
            </div>
          </div>
        `;
      })
      .join('');
})();

/* ---------- § 5 IQ × EQ: 弧形卡片转盘 + sticky 滚动驱动 + 示波器波形 ---------- */
(function renderIQEQ() {
  const track = document.getElementById('ability-track');
  const detailBody = document.getElementById('ability-detail-body');
  const carousel = document.getElementById('ability-carousel');
  if (!track || !detailBody || !carousel) return;

  const DATA = IQ_EQ_CASES;
  const N = DATA.length;
  track.style.setProperty('--ability-count', N);
  // 7 张卡片需要更短的每卡滚距，否则整体 section 太高
  if (N >= 6) track.style.setProperty('--ability-step', '55vh');

  const PLAY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
  const PAUSE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>`;

  // ---- 构建卡片（转盘右侧） ----
  DATA.forEach((ab, idx) => {
    const card = document.createElement('div');
    card.className = 'ability-card';
    card.dataset.idx = String(idx);
    card.style.setProperty('--ability-accent', ab.accent);
    card.style.setProperty('--ability-accent2', ab.accent2 || ab.accent);
    // mini 波柱（仅 active 卡跳动）
    const bars = [];
    for (let i = 0; i < 26; i++) {
      const dur = 0.9 + Math.random() * 1.3;
      const delay = -Math.random() * 2;
      bars.push(`<span style="--bar-dur:${dur.toFixed(2)}s; --bar-delay:${delay.toFixed(2)}s;"></span>`);
    }
    card.innerHTML = `
      <div>
        <div class="ability-card-index">${ab.index}</div>
        <div class="ability-card-subtitle">${ab.subtitle}</div>
        <h3 class="ability-card-title">${ab.title}</h3>
      </div>
      <div class="ability-card-mini-wave">${bars.join('')}</div>
    `;
    carousel.appendChild(card);
  });
  const cards = Array.from(carousel.querySelectorAll('.ability-card'));

  // ---- 左侧文字渲染（仅 per-card 正文部分，主标题常驻） ----
  function renderDetail(ab) {
    detailBody.style.setProperty('--ability-accent', ab.accent);
    detailBody.style.setProperty('--ability-accent2', ab.accent2 || ab.accent);
    const scenesHtml = (ab.scenes || []).map(s => `<li class="ability-detail-scene">${s}</li>`).join('');
    detailBody.innerHTML = `
      <div class="ability-detail-index">${ab.index} · ${ab.subtitle}</div>
      <h3 class="ability-detail-title">${ab.title}</h3>
      <p class="ability-detail-tagline">${ab.tagline}</p>
      <p class="ability-detail-desc">${ab.desc}</p>
      <ul class="ability-detail-scenes">${scenesHtml}</ul>
      <div class="ability-audio-row">
        <button class="ability-play-btn" type="button" aria-label="play sample">
          <span class="play-icon">${PLAY_ICON}</span>
          <span class="pause-icon">${PAUSE_ICON}</span>
        </button>
        <div class="ability-wave-wrap">
          <canvas class="ability-wave-canvas"></canvas>
          <div class="ability-wave-meta">
            <span class="ability-wave-caption">${ab.audioLabel}</span>
            <span class="ability-wave-time">0:00</span>
          </div>
        </div>
      </div>
    `;
    const btn = detailBody.querySelector('.ability-play-btn');
    if (btn) btn.addEventListener('click', () => togglePlay(ab));
    // 重绑 canvas
    canvas = detailBody.querySelector('.ability-wave-canvas');
    canvas2d = canvas ? canvas.getContext('2d') : null;
    resizeCanvas();
    // 还在播同一段？保留 playing 样式
    const row = detailBody.querySelector('.ability-audio-row');
    if (row && currentAb && currentAb.id === ab.id && !sharedAudio.paused) {
      row.classList.add('playing');
    }
  }

  // ---- 弧形转盘 transform ----
  function applyCardTransforms(activeIdxFloat) {
    const angleStep = 42;   // deg per step
    const R = 340;          // arc radius (px)
    cards.forEach((card, i) => {
      const r = i - activeIdxFloat;
      const angleRad = (r * angleStep) * Math.PI / 180;
      const ty = R * Math.sin(angleRad);
      const tx = R * (1 - Math.cos(angleRad));     // 弧向外凸（x 往右增）
      const rot = r * 10;
      const scl = Math.max(0.55, 1 - Math.abs(r) * 0.13);
      // 面包机弹出：|r| 小时额外把选中卡往左推
      const popAmount = 48;
      const popFade = Math.max(0, 1 - Math.abs(r));
      const popX = -popAmount * popFade;
      // 透明度：|r|≤1 全亮到半亮，1-1.35 线性淡出
      let opacity;
      const ar = Math.abs(r);
      if (ar <= 1)       opacity = 1 - ar * 0.45;          // 1.0 → 0.55
      else if (ar <= 1.35) opacity = 0.55 * (1 - (ar - 1) / 0.35);
      else               opacity = 0;

      card.style.transform = `translate3d(${tx + popX}px, ${ty}px, 0) rotate(${rot}deg) scale(${scl})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = String(Math.round(100 - ar * 10));
      card.classList.toggle('is-active', ar < 0.5);
      card.style.pointerEvents = opacity > 0.2 ? 'auto' : 'none';
    });
  }

  // ---- 文字淡入淡出切换 ----
  let lastSnappedIdx = -1;
  let fadeTimer = 0;
  function maybeUpdateDetail(snappedIdx) {
    if (snappedIdx === lastSnappedIdx) return;
    const ab = DATA[snappedIdx];
    if (!ab) return;
    detailBody.classList.add('fading');
    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
      // 换卡片 = 停掉上一个 case 的音频
      releaseAudio();
      currentAb = null;
      renderDetail(ab);
      detailBody.classList.remove('fading');
      lastSnappedIdx = snappedIdx;
    }, 200);
  }

  // ---- 示波器（Web Audio time-domain 数据）----
  let canvas = null;
  let canvas2d = null;
  const TIME_BUF = new Uint8Array(1024);

  function resizeCanvas() {
    if (!canvas || !canvas2d) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(2, rect.width);
    const h = Math.max(2, rect.height);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);

  // 连续绘制：播放时画真实波形，空闲时画微动静默线
  function drawWave() {
    if (canvas && canvas2d) {
      const rect = canvas.getBoundingClientRect();
      const W = rect.width, H = rect.height;
      if (W > 0 && H > 0) {
        canvas2d.clearRect(0, 0, W, H);
        // 基准横线（非常淡）
        canvas2d.lineWidth = 1;
        canvas2d.strokeStyle = 'rgba(129, 140, 248, 0.08)';
        canvas2d.beginPath();
        canvas2d.moveTo(0, H / 2);
        canvas2d.lineTo(W, H / 2);
        canvas2d.stroke();

        const isPlaying = _analyser && !sharedAudio.paused && !sharedAudio.ended;
        if (isPlaying) {
          _analyser.getByteTimeDomainData(TIME_BUF);
          // 外发光层
          canvas2d.lineWidth = 3.5;
          canvas2d.strokeStyle = 'rgba(129, 140, 248, 0.25)';
          drawTimePath(canvas2d, W, H);
          // 主线
          canvas2d.lineWidth = 1.8;
          const grad = canvas2d.createLinearGradient(0, 0, W, 0);
          grad.addColorStop(0, '#818cf8');
          grad.addColorStop(1, '#a78bfa');
          canvas2d.strokeStyle = grad;
          drawTimePath(canvas2d, W, H);
        } else {
          // 空闲：细微正弦呼吸
          const t = performance.now() / 1000;
          canvas2d.lineWidth = 1.5;
          canvas2d.strokeStyle = 'rgba(129, 140, 248, 0.55)';
          canvas2d.beginPath();
          const steps = 160;
          for (let i = 0; i < steps; i++) {
            const x = (i / (steps - 1)) * W;
            const y = H / 2 + Math.sin(i * 0.18 + t * 0.9) * 1.5;
            if (i === 0) canvas2d.moveTo(x, y);
            else canvas2d.lineTo(x, y);
          }
          canvas2d.stroke();
        }
      }
    }
    // 时间码
    const timeEl = detailBody.querySelector('.ability-wave-time');
    if (timeEl) {
      const dur = sharedAudio.duration;
      if (isFinite(dur) && dur > 0) {
        const cur = formatTime(sharedAudio.currentTime || 0);
        const total = formatTime(dur);
        timeEl.textContent = `${cur} / ${total}`;
      } else {
        timeEl.textContent = '0:00';
      }
    }
    requestAnimationFrame(drawWave);
  }
  function drawTimePath(c, W, H) {
    c.beginPath();
    const N_ = TIME_BUF.length;
    for (let i = 0; i < N_; i++) {
      const x = (i / (N_ - 1)) * W;
      const v = TIME_BUF[i] / 128 - 1;             // -1..1
      const y = H / 2 + v * (H / 2 - 2);
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  }
  function formatTime(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss.toString().padStart(2, '0')}`;
  }
  requestAnimationFrame(drawWave);

  // ---- 播放控制 ----
  let currentAb = null;
  function togglePlay(ab) {
    const row = detailBody.querySelector('.ability-audio-row');
    if (!row) return;
    // 懒初始化 Web Audio 图
    ensureAudioAnalyser();
    resumeAudioCtx();

    if (row.classList.contains('playing') && currentAb && currentAb.id === ab.id) {
      releaseAudio();
      row.classList.remove('playing');
      currentAb = null;
      return;
    }
    currentAb = ab;
    row.classList.add('playing');
    claimAudio(bust(ab.audio), {
      onEnded: () => { row.classList.remove('playing'); currentAb = null; },
      onError: () => { row.classList.remove('playing'); currentAb = null; },
      onStop:  () => { const r = detailBody.querySelector('.ability-audio-row'); if (r) r.classList.remove('playing'); currentAb = null; },
    });
  }

  // ---- 滚动进度驱动 ----
  function onScroll() {
    const rect = track.getBoundingClientRect();
    const scrollDist = rect.height - window.innerHeight;
    if (scrollDist <= 0) {
      applyCardTransforms(0);
      maybeUpdateDetail(0);
      return;
    }
    const p = Math.max(0, Math.min(1, -rect.top / scrollDist));
    const activeIdxFloat = p * (N - 1);
    applyCardTransforms(activeIdxFloat);
    maybeUpdateDetail(Math.round(activeIdxFloat));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // ---- 离开 section 停止播放 ----
  const sec = document.getElementById('iq-eq');
  if (sec && 'IntersectionObserver' in window) {
    const leaveObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting && currentAb) {
            releaseAudio();
            currentAb = null;
            const r = detailBody.querySelector('.ability-audio-row');
            if (r) r.classList.remove('playing');
          }
        });
      },
      { threshold: 0.02 }
    );
    leaveObs.observe(sec);
  }

  // ---- 初始渲染 ----
  renderDetail(DATA[0]);
  applyCardTransforms(0);
  lastSnappedIdx = 0;
  requestAnimationFrame(onScroll);
})();


/* ---------- § 4 Emotion: 左 单视频（点击播放） + 右纯文字介绍 ---------- */
(function renderEmotion() {
  const detail = document.getElementById('emotion-detail');
  const video = document.getElementById('emotion-video');
  const playBtn = document.getElementById('emotion-video-play');
  if (!detail || !video) return;

  // 右侧只放标题 + 描述（不再随 case 切换）
  detail.innerHTML = `
    <div class="emotion-main-header reveal">
      <div class="eyebrow">Emotional Range</div>
      <h2 class="emotion-main-title">百变<span class="accent">大咖</span></h2>
      <p class="emotion-main-sub">中彩票的狂喜、发现号不对的落差、男友竟是富二代的震惊、渣男曝光后的愤怒——剧情急转九次，情绪分毫不差地踩在每一拍上，全程没有一次出戏。</p>
      <ul class="emotion-feat-list">
        <li><span class="emotion-feat-dot"></span>极端情绪落差，无缝即时切换</li>
        <li><span class="emotion-feat-dot"></span>轻笑、语速、停顿随台词精细雕琢</li>
        <li><span class="emotion-feat-dot"></span>角色性格始终如一，连戏能力拉满</li>
      </ul>
    </div>
  `;

  function setPlayingClass(isPlaying) {
    video.classList.toggle('is-playing', isPlaying);
    if (playBtn) playBtn.classList.toggle('is-playing', isPlaying);
  }

  function toggle() {
    if (video.paused || video.ended) {
      try { releaseAudio(); } catch (_) {}
      video.muted = false;
      video.play().then(() => setPlayingClass(true)).catch((err) => {
        console.warn('[emotion] video play blocked:', err);
        setPlayingClass(false);
      });
    } else {
      video.pause();
      setPlayingClass(false);
    }
  }

  video.addEventListener('click', toggle);
  if (playBtn) playBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  video.addEventListener('play',  () => setPlayingClass(true));
  video.addEventListener('pause', () => setPlayingClass(false));
  video.addEventListener('ended', () => { setPlayingClass(false); video.currentTime = 0; });

  // 离开 section 自动暂停
  const sec = document.getElementById('emotion');
  if (sec && 'IntersectionObserver' in window) {
    new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (!e.isIntersecting && !video.paused) video.pause();
      });
    }, { threshold: 0.05 }).observe(sec);
  }
})();


/* ---------- § 6 Paralinguistic: 诊断面板 ---------- */
(function renderParalinguistic() {
  const list = document.getElementById('para-list');
  if (!list) return;

  const PLAY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
  const PAUSE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>`;

  let activeCase = null;
  function deactivate(el) {
    if (!el) return;
    el.querySelector('.para-audio-row')?.classList.remove('playing');
    const t = el.querySelector('.para-audio-time');
    if (t) t.textContent = '0:00';
    if (activeCase === el) activeCase = null;
  }
  function activate(el, src) {
    if (activeCase === el) { releaseAudio(); deactivate(el); return; }
    if (activeCase) deactivate(activeCase);
    activeCase = el;
    el.querySelector('.para-audio-row')?.classList.add('playing');
    const timeEl = el.querySelector('.para-audio-time');
    claimAudio(src, {
      onTime: (cur, dur) => {
        if (timeEl && dur > 0) timeEl.textContent = `${fmtTime(cur)} / ${fmtTime(dur)}`;
      },
      onEnded: () => deactivate(el),
      onError: () => deactivate(el),
      onStop: () => deactivate(el),
    });
  }

  PARALINGUISTIC_CASES.forEach((c) => {
    const el = document.createElement('article');
    el.className = 'para-case reveal';
    el.dataset.id = c.id;
    el.style.setProperty('--para-accent', c.accent || '#818cf8');
    const detectsHtml = (c.detects || []).map(d => `
      <li class="para-detect-item">
        <span class="para-detect-icon">${d.icon || '◆'}</span>
        <span class="para-detect-label">${d.label}</span>
        <span class="para-detect-value">${d.value}</span>
      </li>
    `).join('');
    el.innerHTML = `
      <div class="para-left">
        <div>
          <div class="para-index">${c.index || ''}</div>
          <h3 class="para-title">${c.title}</h3>
          <p class="para-tagline">${c.tagline || ''}</p>
          <p class="para-desc">${c.desc || ''}</p>
        </div>
        <div class="para-audio-row">
          <button class="para-audio-btn" type="button" aria-label="play">
            <span class="play-icon">${PLAY_ICON}</span>
            <span class="pause-icon">${PAUSE_ICON}</span>
          </button>
          <span class="para-audio-label">${c.audioLabel || c.title}</span>
          <span class="para-audio-time">0:00</span>
        </div>
      </div>
      <div class="para-right">
        <div class="para-right-head">Model Detected</div>
        <ul class="para-detect-list">${detectsHtml}</ul>
      </div>
    `;
    el.querySelector('.para-audio-row').addEventListener('click', () => {
      if (c.audio) activate(el, bust(c.audio));
    });
    list.appendChild(el);
  });

  const sec = document.getElementById('paralinguistic');
  if (sec && 'IntersectionObserver' in window) {
    new IntersectionObserver((ents) => {
      ents.forEach(e => { if (!e.isIntersecting && activeCase) { releaseAudio(); deactivate(activeCase); } });
    }, { threshold: 0.02 }).observe(sec);
  }
})();


/* ---------- § 7 Personas: seed 风格横向大卡片画廊 ---------- */
(function renderPersonas() {
  const gallery = document.getElementById('persona-gallery');
  const track = document.getElementById('persona-track');
  const indicator = document.getElementById('persona-indicator');
  const prevBtn = document.querySelector('.persona-nav-prev');
  const nextBtn = document.querySelector('.persona-nav-next');
  if (!gallery || !track) return;

  const PLAY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
  const PAUSE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>`;

  let activeCard = null;

  function deactivate(card) {
    if (!card) return;
    card.classList.remove('active');
    const video = card.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    if (card._videoCleanup) {
      try { card._videoCleanup(); } catch (_) {}
      card._videoCleanup = null;
    }
    const fill = card.querySelector('.persona-progress-fill');
    const thumb = card.querySelector('.persona-progress-thumb');
    const cur = card.querySelector('.persona-ctrl-cur');
    const total = card.querySelector('.persona-ctrl-total');
    if (fill) fill.style.width = '0%';
    if (thumb) thumb.style.left = '0%';
    if (cur) cur.textContent = '0:00';
    if (total) total.textContent = '0:00';
    if (activeCard === card) activeCard = null;
  }

  function activate(card, opts = {}) {
    if (activeCard === card) {
      if (opts.keepIfActive) return;
      deactivate(card);
      return;
    }
    if (activeCard) deactivate(activeCard);
    // 视频自带音轨；停掉其他 section 仍在用的 sharedAudio，避免叠音
    releaseAudio();

    activeCard = card;
    card.classList.add('active');

    const video = card.querySelector('video');
    if (!video) return;

    const fill = card.querySelector('.persona-progress-fill');
    const thumb = card.querySelector('.persona-progress-thumb');
    const curEl = card.querySelector('.persona-ctrl-cur');
    const totalEl = card.querySelector('.persona-ctrl-total');
    const prog = card.querySelector('.persona-progress');

    const onTime = () => {
      const cur = video.currentTime;
      const dur = video.duration;
      if (isFinite(dur) && dur > 0 && !prog?.classList.contains('dragging')) {
        const pct = (cur / dur) * 100;
        if (fill) fill.style.width = `${pct}%`;
        if (thumb) thumb.style.left = `${pct}%`;
        if (prog) prog.setAttribute('aria-valuenow', pct.toFixed(1));
      }
      if (curEl) curEl.textContent = fmtTime(cur);
      if (totalEl && isFinite(dur) && dur > 0) totalEl.textContent = fmtTime(dur);
    };
    const onLoaded = () => {
      if (totalEl && isFinite(video.duration)) totalEl.textContent = fmtTime(video.duration);
    };
    const onEnded = () => deactivate(card);
    const onError = () => {
      showState(card, '视频加载失败');
      setTimeout(() => clearState(card), 2400);
      deactivate(card);
    };

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    card._videoCleanup = () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
    };

    video.currentTime = opts.startAt ?? 0;
    video.muted = false;
    video.play().catch((err) => {
      console.warn('[persona] video play blocked:', err);
    });
  }

  function showState(card, txt) {
    let el = card.querySelector('.persona-state');
    if (!el) {
      el = document.createElement('div');
      el.className = 'persona-state';
      card.appendChild(el);
    }
    el.textContent = txt;
  }
  function clearState(card) {
    const el = card.querySelector('.persona-state');
    if (el) el.remove();
  }

  PERSONAS.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'persona-card';
    card.setAttribute('role', 'listitem');
    card.dataset.id = p.id;
    card.dataset.name = p.name;
    if (p.accent) card.style.setProperty('--persona-accent', p.accent);

    card.innerHTML = `
      <div class="persona-media">
        <img class="persona-avatar" src="${bust(p.avatar)}" alt="${p.name}" loading="lazy" draggable="false" />
        <video class="persona-video" playsinline preload="metadata"
               disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback">
          <source src="${bust(p.video)}" type="video/mp4" />
        </video>
      </div>
      <div class="persona-pulse"><span class="persona-pulse-dot"></span>正在播放</div>
      <button class="persona-poster-play" type="button" aria-label="play">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <div class="persona-info">
        <div class="persona-info-text">
          <div class="persona-tag">${p.tag}</div>
          <h3 class="persona-name">${p.name}</h3>
          <p class="persona-desc">${p.desc}</p>
        </div>
      </div>
      <div class="persona-controls">
        <button class="persona-ctrl-play" type="button" aria-label="play/pause">
          <span class="play-icon">${PLAY_ICON}</span>
          <span class="pause-icon">${PAUSE_ICON}</span>
        </button>
        <span class="persona-ctrl-time persona-ctrl-cur">0:00</span>
        <div class="persona-progress" role="slider" aria-label="seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="persona-progress-track">
            <div class="persona-progress-fill"></div>
            <div class="persona-progress-thumb"></div>
          </div>
        </div>
        <span class="persona-ctrl-time persona-ctrl-total">0:00</span>
      </div>
    `;
    track.appendChild(card);
  });

  const cards = Array.from(track.querySelectorAll('.persona-card'));

  if (indicator) {
    cards.forEach((c, i) => {
      const dot = document.createElement('button');
      dot.className = 'persona-indicator-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to persona ${i + 1}`);
      dot.addEventListener('click', () => scrollToCard(i));
      indicator.appendChild(dot);
    });
  }

  let focusIndex = 0;
  function refreshFocus() {
    const galleryRect = gallery.getBoundingClientRect();
    const galleryCenter = galleryRect.left + galleryRect.width / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const d = Math.abs(center - galleryCenter);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    focusIndex = bestIdx;
    cards.forEach((c, i) => c.classList.toggle('is-focus', i === bestIdx));
    if (indicator) {
      Array.from(indicator.children).forEach((d, i) => d.classList.toggle('active', i === bestIdx));
    }
    if (prevBtn) prevBtn.disabled = bestIdx === 0;
    if (nextBtn) nextBtn.disabled = bestIdx === cards.length - 1;
  }
  requestAnimationFrame(refreshFocus);
  gallery.addEventListener('scroll', () => {
    requestAnimationFrame(refreshFocus);
  }, { passive: true });
  window.addEventListener('resize', refreshFocus);

  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      if (gallery.classList.contains('was-dragging')) return;
      if (e.target.closest('.persona-controls')) return;
      if (i === focusIndex) {
        activate(card);
      } else {
        scrollToCard(i);
      }
    });

    const ctrlPlay = card.querySelector('.persona-ctrl-play');
    if (ctrlPlay) {
      ctrlPlay.addEventListener('click', (e) => {
        e.stopPropagation();
        activate(card);
      });
    }

    const prog = card.querySelector('.persona-progress');
    if (prog) {
      const fill = card.querySelector('.persona-progress-fill');
      const thumb = card.querySelector('.persona-progress-thumb');
      const curEl = card.querySelector('.persona-ctrl-cur');
      let dragging = false;
      let pendingPct = 0;

      function pctFromEvent(evt) {
        const rect = prog.getBoundingClientRect();
        const x = (evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left;
        return Math.max(0, Math.min(1, x / rect.width));
      }
      function videoDuration() {
        const v = card.querySelector('video');
        return v && isFinite(v.duration) && v.duration > 0 ? v.duration : 0;
      }
      function updateScrubUI(pct) {
        pendingPct = pct;
        const dur = videoDuration();
        if (fill)  fill.style.width = `${pct * 100}%`;
        if (thumb) thumb.style.left = `${pct * 100}%`;
        if (curEl && dur) curEl.textContent = fmtTime(pct * dur);
        prog.setAttribute('aria-valuenow', (pct * 100).toFixed(1));
      }
      function commitSeek(pct) {
        const video = card.querySelector('video');
        if (!video) return;
        // 卡片还没激活：用 startAt 让 activate 直接从这个位置起播
        if (activeCard !== card) {
          activate(card, { startAt: pct * (videoDuration() || 0) });
          return;
        }
        const dur = videoDuration();
        if (!dur) {
          // 元数据还没加载，等一下再 seek
          const onMeta = () => {
            video.removeEventListener('loadedmetadata', onMeta);
            if (activeCard === card) video.currentTime = pct * video.duration;
          };
          video.addEventListener('loadedmetadata', onMeta);
          return;
        }
        video.currentTime = pct * dur;
      }
      prog.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        dragging = true;
        prog.classList.add('dragging');
        const pct = pctFromEvent(e);
        updateScrubUI(pct);
        // 不在 mousedown 立即 seek —— 留到 mouseup 一次性提交，避免“点击就重播”
      });
      window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        updateScrubUI(pctFromEvent(e));
      });
      window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        prog.classList.remove('dragging');
        commitSeek(pendingPct);
      });
      prog.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        dragging = true;
        prog.classList.add('dragging');
        updateScrubUI(pctFromEvent(e));
      }, { passive: true });
      prog.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        updateScrubUI(pctFromEvent(e));
      }, { passive: true });
      prog.addEventListener('touchend', () => {
        if (!dragging) return;
        dragging = false;
        prog.classList.remove('dragging');
        commitSeek(pendingPct);
      });
    }
  });

  function scrollToCard(i) {
    const card = cards[i];
    if (!card) return;
    const galleryRect = gallery.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offset = (cardRect.left + cardRect.width / 2) - (galleryRect.left + galleryRect.width / 2);
    gallery.scrollBy({ left: offset, behavior: 'smooth' });
  }
  if (prevBtn) prevBtn.addEventListener('click', () => scrollToCard(Math.max(0, focusIndex - 1)));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollToCard(Math.min(cards.length - 1, focusIndex + 1)));

  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let movedX = 0;
  function onDown(e) {
    isDown = true;
    movedX = 0;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    startScroll = gallery.scrollLeft;
    gallery.classList.add('dragging');
    gallery.classList.remove('was-dragging');
  }
  function onMove(e) {
    if (!isDown) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const dx = x - startX;
    movedX = dx;
    gallery.scrollLeft = startScroll - dx;
  }
  function onUp() {
    if (!isDown) return;
    isDown = false;
    gallery.classList.remove('dragging');
    if (Math.abs(movedX) > 5) {
      gallery.classList.add('was-dragging');
      setTimeout(() => gallery.classList.remove('was-dragging'), 50);
    }
  }
  gallery.addEventListener('mousedown', onDown);
  gallery.addEventListener('mousemove', onMove);
  gallery.addEventListener('mouseup', onUp);
  gallery.addEventListener('mouseleave', onUp);

  const sec = document.getElementById('personas');
  if (sec && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting && activeCard) {
            deactivate(activeCard);
          }
        });
      },
      { threshold: 0.05 }
    );
    obs.observe(sec);
  }
})();

/* ---------- § 8 Expression: 中心 stage 演播厅 ---------- */
(function renderExpression() {
  const stage = document.getElementById('expr-stage');
  if (!stage || !EXPRESSION_CASES.length) return;

  const PLAY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
  const PAUSE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>`;

  const c = EXPRESSION_CASES[0];   // 目前只有 1 个，未来多个可以改成列表
  const performsHtml = (c.performs || []).map(p => `<span class="expr-perform-tag">${p}</span>`).join('');

  const card = document.createElement('div');
  card.className = 'expr-card reveal';
  card.innerHTML = `
    <div class="expr-card-head">
      <div class="expr-subtitle">${c.subtitle || 'Expression Case'}</div>
      <h3 class="expr-title">${c.title}</h3>
      <p class="expr-tagline">${c.tagline || ''}</p>
    </div>
    <p class="expr-desc">${c.desc || ''}</p>
    <div class="expr-player">
      <button class="expr-play-btn" type="button" aria-label="play">
        <span class="play-icon">${PLAY_ICON}</span>
        <span class="pause-icon">${PAUSE_ICON}</span>
      </button>
      <div class="expr-wave-wrap">
        <canvas class="expr-wave-canvas"></canvas>
        <div class="expr-wave-meta">
          <span>${c.audioLabel || c.title}</span>
          <span class="expr-wave-time">0:00</span>
        </div>
      </div>
    </div>
    <div class="expr-performs-label">The model performs</div>
    <div class="expr-performs">${performsHtml}</div>
  `;
  stage.appendChild(card);

  // Canvas + Web Audio oscilloscope
  const canvas = card.querySelector('.expr-wave-canvas');
  const ctx2d = canvas.getContext('2d');
  const timeEl = card.querySelector('.expr-wave-time');
  const TIME_BUF = new Uint8Array(1024);

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(2, r.width) * dpr;
    canvas.height = Math.max(2, r.height) * dpr;
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    const r = canvas.getBoundingClientRect();
    const W = r.width, H = r.height;
    if (W > 0 && H > 0) {
      ctx2d.clearRect(0, 0, W, H);
      // baseline
      ctx2d.lineWidth = 1;
      ctx2d.strokeStyle = 'rgba(168, 85, 247, 0.1)';
      ctx2d.beginPath();
      ctx2d.moveTo(0, H / 2); ctx2d.lineTo(W, H / 2);
      ctx2d.stroke();
      const playing = _analyser && !sharedAudio.paused && !sharedAudio.ended
        && card.querySelector('.expr-player').classList.contains('playing');
      if (playing) {
        _analyser.getByteTimeDomainData(TIME_BUF);
        // glow
        ctx2d.lineWidth = 4;
        ctx2d.strokeStyle = 'rgba(168, 85, 247, 0.3)';
        drawPath(W, H);
        // main
        ctx2d.lineWidth = 2;
        const grad = ctx2d.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, '#a855f7');
        grad.addColorStop(1, '#818cf8');
        ctx2d.strokeStyle = grad;
        drawPath(W, H);
      } else {
        // idle soft sine
        const t = performance.now() / 1000;
        ctx2d.lineWidth = 1.5;
        ctx2d.strokeStyle = 'rgba(168, 85, 247, 0.55)';
        ctx2d.beginPath();
        const steps = 160;
        for (let i = 0; i < steps; i++) {
          const x = (i / (steps - 1)) * W;
          const y = H / 2 + Math.sin(i * 0.2 + t * 0.8) * 2;
          if (i === 0) ctx2d.moveTo(x, y);
          else ctx2d.lineTo(x, y);
        }
        ctx2d.stroke();
      }
    }
    // time code
    if (timeEl) {
      const d = sharedAudio.duration;
      if (isFinite(d) && d > 0 && card.querySelector('.expr-player').classList.contains('playing')) {
        timeEl.textContent = `${fmtTime(sharedAudio.currentTime)} / ${fmtTime(d)}`;
      }
    }
    requestAnimationFrame(draw);
  }
  function drawPath(W, H) {
    ctx2d.beginPath();
    const L = TIME_BUF.length;
    for (let i = 0; i < L; i++) {
      const x = (i / (L - 1)) * W;
      const v = TIME_BUF[i] / 128 - 1;
      const y = H / 2 + v * (H / 2 - 2);
      if (i === 0) ctx2d.moveTo(x, y);
      else ctx2d.lineTo(x, y);
    }
    ctx2d.stroke();
  }
  requestAnimationFrame(draw);

  // Play toggle
  const player = card.querySelector('.expr-player');
  let isPlaying = false;
  player.addEventListener('click', () => {
    ensureAudioAnalyser();
    resumeAudioCtx();
    if (isPlaying) {
      releaseAudio();
      player.classList.remove('playing');
      isPlaying = false;
      return;
    }
    player.classList.add('playing');
    isPlaying = true;
    claimAudio(bust(c.audio), {
      onEnded: () => { player.classList.remove('playing'); isPlaying = false; if (timeEl) timeEl.textContent = '0:00'; },
      onError: () => { player.classList.remove('playing'); isPlaying = false; },
      onStop:  () => { player.classList.remove('playing'); isPlaying = false; },
    });
  });

  // 离开 section 停止
  const sec = document.getElementById('expression');
  if (sec && 'IntersectionObserver' in window) {
    new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (!e.isIntersecting && isPlaying) {
          releaseAudio(); player.classList.remove('playing'); isPlaying = false;
        }
      });
    }, { threshold: 0.02 }).observe(sec);
  }
})();

/* ---------- § 6 Cases: Tabs + Cards ---------- */
(function renderCases() {
  const tabsWrap = document.getElementById('case-tabs');
  const grid = document.getElementById('case-grid');
  if (!tabsWrap || !grid) return;

  const cats = CASES.categories;
  cats.forEach((c, i) => {
    const tab = document.createElement('button');
    tab.className = `case-tab${i === 0 ? ' active' : ''}`;
    tab.dataset.cat = c.id;
    tab.textContent = c.title;
    tabsWrap.appendChild(tab);
  });

  function renderCategory(cat) {
    grid.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'case-category-header';
    header.textContent = cat.subtitle;
    grid.appendChild(header);

    cat.items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'case-card';
      card.style.animationDelay = `${idx * 0.06}s`;
      const personas = cat.authors
        .map(
          (a) =>
            `<span class="persona-pill" style="background: linear-gradient(135deg, ${a.color1}, ${a.color2});"><span class="persona-pill-dot"></span>${a.name}</span>`
        )
        .join('');
      card.innerHTML = `
        <div class="case-authors">${personas}</div>
        <h3 class="case-title">${item.title}</h3>
        <p class="case-desc">${item.desc}</p>
      `;
      card.appendChild(
        createAudioPlayer({
          src: `assets/audio/${item.audio}`,
          name: item.audio.replace(/\.[^.]+$/, ''),
        })
      );
      grid.appendChild(card);
    });
  }

  renderCategory(cats[0]);

  tabsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.case-tab');
    if (!btn) return;
    const id = btn.dataset.cat;
    tabsWrap.querySelectorAll('.case-tab').forEach((t) => t.classList.toggle('active', t === btn));
    const cat = cats.find((c) => c.id === id);
    if (cat) renderCategory(cat);
  });
})();

/* ---------- Scroll reveal（section + 内部元素） ---------- */
(function setupReveal() {
  const sections = document.querySelectorAll('.section');
  const reveals = document.querySelectorAll('.reveal');

  // Section 整体：进入视口（任何像素）就亮起。Abilities section 较高（310vh），不能用高阈值。
  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) en.target.classList.add('in-view');
      });
    },
    { threshold: 0, rootMargin: '-5% 0px -5% 0px' }
  );
  sections.forEach((s) => sectionObs.observe(s));

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          revealObs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  reveals.forEach((el) => revealObs.observe(el));
})();

/* ---------- Metrics bar + count-up 动画 ---------- */
(function setupMetricsAnim() {
  const metricsSec = document.getElementById('metrics');
  if (!metricsSec) return;
  const fills = metricsSec.querySelectorAll('.bar-fill');
  const counts = metricsSec.querySelectorAll('[data-count]');
  let fired = false;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !fired) {
          fired = true;
          // bar 从 0 到 target%（取最大值的比例）
          fills.forEach((f) => {
            const t = parseFloat(f.dataset.target);
            requestAnimationFrame(() => {
              f.style.width = `${t}%`;
            });
          });
          // 数字滚动
          counts.forEach((el) => {
            const target = parseFloat(el.dataset.count);
            const dur = 1200;
            const t0 = performance.now();
            function tick(now) {
              const p = Math.min(1, (now - t0) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = (target * eased).toFixed(2);
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          });
        }
      });
    },
    { threshold: 0.3 }
  );
  obs.observe(metricsSec);
})();

/* ---------- Nav: hero 上透明，滚出后显示；active 项随滚动高亮 ---------- */
(function setupNav() {
  const nav = document.querySelector('.nav');
  const heroSection = document.getElementById('hero');
  if (!nav || !heroSection) return;

  const navLinks = Array.from(nav.querySelectorAll('.nav-links a[href^="#"]'));
  const NAV_H = 64;

  // 收集所有 section 目标
  const sectionTargets = navLinks.map(a => ({
    link: a,
    el: document.querySelector(a.getAttribute('href')),
  })).filter(o => o.el);

  function updateNav() {
    const scrollY = window.scrollY;
    const heroBottom = heroSection.getBoundingClientRect().bottom + scrollY;

    // 滚出 hero 后显示 nav 背景
    if (scrollY + NAV_H >= heroBottom) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }

    // 高亮当前可见 section
    let activeIdx = 0;
    for (let i = 0; i < sectionTargets.length; i++) {
      const top = sectionTargets[i].el.getBoundingClientRect().top + scrollY;
      if (scrollY + NAV_H * 2 >= top) activeIdx = i;
    }
    navLinks.forEach(a => a.classList.remove('active'));
    if (sectionTargets[activeIdx]) {
      sectionTargets[activeIdx].link.classList.add('active');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();
