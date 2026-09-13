/* =============================================================================
   player.js · 唱盘驱动 + 峰值波形 + 实时频谱 + 播放胶囊 + 展开面板
   ============================================================================= */

import * as A from './audio.js';
import { t, locField, onLangChange } from './i18n.js';
import { toast } from './ui.js';
import { likes, toggleLike } from './store.js';

const $ = id => document.getElementById(id);
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* 展开面板左上角的功能名。用「功能」而不是接口的 task 字段 ——
   同一个 task（text_to_music）对应两种功能（歌曲创作 / 纯音乐）。 */
const TASK_LABEL = {
  song: 'Song', instrumental: 'Instrumental',
  vocal2music: 'Vocal2Music', cover: 'Cover',
};

const ICO_WAVES = `<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.8" stroke-linecap="round"><use href="#i-waves"/></svg>`;

/* 输入音频用的 objectURL，重绘/关闭时回收，避免泄漏 */
let inputUrls = [];
function revokeInputUrls() { inputUrls.forEach(URL.revokeObjectURL); inputUrls = []; }

const plTT = $('plTT'), npTT = $('npTT');
const npEl = $('np'), npScrim = $('npScrim');
let npOpen = false;
let raf = null;

/* ── 唱盘：状态 + 唱臂角度 ──────────────────────────────────────────────
   唱臂只在**播放中**落下。暂停时摆回支架并抬针（700ms 的可见摆动），
   恢复时再摆回当前进度对应的角度。 */
function setTT(el, stateName, p) {
  if (!el) return;
  el.dataset.state = stateName;
  el.style.setProperty('--down', stateName === 'playing' ? 1 : 0);
  if (p != null) el.style.setProperty('--p', p.toFixed(4));
}

/* ── 峰值波形（seek 条）────────────────────────────────────────────────── */
function drawPeaks(cv, peaks, p) {
  if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  // 用 clientWidth/clientHeight，不要读 width/height 属性 ——
  // 设置 cv.height 会同时改写属性，下次读回来会被 dpr 反复放大。
  const w = cv.clientWidth || 240, h = cv.clientHeight || 24;
  if (!w) return;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
  }
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);

  const on = css('--art') || '#6B6F76';
  const off = css('--pk-off') || 'rgba(20,22,26,.22)';
  const bw = 2, gap = 1;
  const n = Math.max(8, Math.floor(w / (bw + gap)));
  for (let i = 0; i < n; i++) {
    let v;
    if (peaks?.length) {
      // 把 peaks 重采样到 n 个可见条
      const a = Math.floor(i / n * peaks.length);
      const b = Math.max(a + 1, Math.floor((i + 1) / n * peaks.length));
      let m = 0;
      for (let j = a; j < b; j++) if (peaks[j] > m) m = peaks[j];
      v = m;
    } else {
      v = 0.34;                                   // 还没解出峰值：等高占位，不造假
    }
    const bh = Math.max(2, v * (h - 2));
    const x = i * (bw + gap), y = (h - bh) / 2;
    g.fillStyle = (i / n) <= p ? on : off;
    g.beginPath();
    g.roundRect(x, y, bw, bh, bw / 2);
    g.fill();
  }
}

/* ── 实时频谱（律动）────────────────────────────────────────────────────
   镜像柱状，与下面的峰值波形刻意做成两种形态：
   频谱是"此刻"，波形是"整首 + 位置"。                                 */
const specSmooth = new Float32Array(48);
function drawSpectrum(cv) {
  if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth || 300, h = cv.clientHeight || 46;
  if (!w) return;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  }
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);

  const bars = 40;
  const data = A.state.playing ? A.spectrum(bars) : null;
  const mid = h / 2, bw = Math.max(2, (w / bars) - 3);
  g.fillStyle = css('--art') || '#6B6F76';
  for (let i = 0; i < bars; i++) {
    const target = data ? data[i] : 0;
    // 自己再做一层衰减，停播时优雅落下而不是瞬间归零
    specSmooth[i] += (target - specSmooth[i]) * (target > specSmooth[i] ? 0.55 : 0.12);
    const bh = Math.max(2, specSmooth[i] * (h - 4));
    const x = i * (w / bars) + 1.5;
    g.globalAlpha = 0.35 + 0.65 * specSmooth[i];
    g.beginPath();
    g.roundRect(x, mid - bh / 2, bw, bh, bw / 2);
    g.fill();
  }
  g.globalAlpha = 1;
}

/* ── 每帧循环 ──────────────────────────────────────────────────────────── */
function tick() {
  const p = A.progress();
  setTT(plTT, A.state.playing ? 'playing' : (A.state.track ? 'cued' : 'idle'), p);
  if (npOpen) setTT(npTT, A.state.playing ? 'playing' : (A.state.track ? 'cued' : 'idle'), p);

  const peaks = A.peaksOf(A.state.track);
  drawPeaks($('plPeaks'), peaks, p);
  $('plCur').textContent = A.fmt(A.audioEl.currentTime);
  $('plDur').textContent = A.fmt(A.duration());
  setSlider($('plPeaks'), p);

  if (npOpen) {
    drawSpectrum($('npSpectrum'));
    const line = $('npLine');
    line.querySelector('.np-line-fill').style.width = (p * 100).toFixed(2) + '%';
    line.querySelector('.np-line-dot').style.left = (p * 100).toFixed(2) + '%';
    $('npCur').textContent = A.fmt(A.audioEl.currentTime);
    $('npDur').textContent = A.fmt(A.duration());
    setSlider(line, p);
  }
  raf = requestAnimationFrame(tick);
}
function startLoop() { if (!raf) raf = requestAnimationFrame(tick); }
function stopLoop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

function setSlider(cv, p) {
  if (!cv) return;
  cv.setAttribute('aria-valuenow', String(Math.round(p * 100)));
  cv.setAttribute('aria-valuetext', `${A.fmt(A.audioEl.currentTime)} / ${A.fmt(A.duration())}`);
}

/* ── 图标/状态同步 ─────────────────────────────────────────────────────── */
function icon(useEl, id) { useEl?.setAttribute('href', '#' + id); }

function syncPlayIcons() {
  const p = A.state.playing;
  icon($('plPlayIcon'), p ? 'i-pause' : 'i-play');
  icon($('npPlayIcon'), p ? 'i-pause' : 'i-play');
  $('plPlay').setAttribute('aria-label', t(p ? 'player.pause' : 'player.play'));
  $('npPlay').setAttribute('aria-label', t(p ? 'player.pause' : 'player.play'));
  if (A.state.track) document.body.dataset.playing = p ? '1' : '0';
}

function syncLike() {
  const id = A.state.track?.id;
  const on = id ? likes.has(id) : false;
  for (const b of [$('plLike'), $('npLike')]) {
    b.classList.toggle('liked', on);
    b.querySelector('use')?.setAttribute('href', '#i-heart');
    b.style.setProperty('--_f', on ? 1 : 0);
    b.querySelector('svg').setAttribute('fill', on ? 'currentColor' : 'none');
    b.setAttribute('aria-label', t(on ? 'player.unlike' : 'player.like'));
  }
}

function syncRepeat() {
  const r = A.state.repeat;
  const id = r === 'one' ? 'i-repeat-1' : 'i-repeat';
  icon($('plRepeatIcon'), id);
  icon($('npRepeatIcon'), id);
  for (const b of [$('plRepeat'), $('npRepeat')]) {
    b.style.color = r === 'off' ? '' : 'var(--art)';
    b.setAttribute('aria-label', t('player.repeat.' + r));
  }
}

function syncVolume() {
  const m = A.state.muted || A.state.volume === 0;
  icon($('plMuteIcon'), m ? 'i-volume-x' : 'i-volume');
  $('plMute').setAttribute('aria-label', t(m ? 'player.unmute' : 'player.mute'));
  $('plVol').value = String(Math.round(A.state.volume * 100));
}

/* ── 曲目变更 ──────────────────────────────────────────────────────────── */
function syncTrack() {
  const tr = A.state.track;
  if (!tr) return;
  const title = locField(tr, 'title');
  const tags = (locField(tr, 'tags') || []).join(' · ');
  $('plTitle').textContent = title;
  $('plTags').textContent = tags;
  $('plLabel').src = tr.cover;
  A.applyArt(tr.cover);
  A.updateMediaSession(tr, title, tags);
  document.body.dataset.playing = A.state.playing ? '1' : '0';
  if (!document.body.hasAttribute('data-playing')) document.body.dataset.playing = '0';
  if (npOpen) renderNP();
  syncLike();
  // 让当前播放的卡片显示外环与均衡器
  document.querySelectorAll('.card[aria-current="true"]').forEach(c => c.setAttribute('aria-current', 'false'));
  document.querySelectorAll(`.card[data-id="${tr.id}"]`).forEach(c => c.setAttribute('aria-current', 'true'));
}


/* ── 歌词解析 ──────────────────────────────────────────────────────────────
   逐行解析，不按空行分段。
   之前按 /\n{2,}/ 切块、只认每块第一行是结构标签 —— 用户手打歌词时
   段落之间通常不空行，于是只有第一个 [Verse 1] 被识别，后面的 [Chorus]
   全被当成普通歌词文本，既没配色也没大写。
   同时兼容接口偶尔返回**字面量 \n**（两个字符）而不是真换行的情况。 */
function normalizeLyrics(raw) {
  return String(raw || '')
    .replace(/\r\n?/g, '\n')                 // CRLF / CR → LF
    .replace(/\\r\\n|\\n|\\r/g, '\n');       // 字面量 "\n" → 真换行
}

function renderLyrics(raw) {
  const out = [];
  let buf = [];
  const flush = () => {
    if (buf.length) { out.push(`<p class="lyr-line">${buf.map(esc).join('<br>')}</p>`); buf = []; }
  };
  for (const line of normalizeLyrics(raw).split('\n')) {
    const s = line.trim();
    if (!s) { flush(); continue; }
    // 行首的 [xxx] 都算结构标签；标签后面若还有文字，另起一行当歌词
    const m = s.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (m) {
      flush();
      out.push(`<p class="lyr-sec">[${esc(m[1].trim())}]</p>`);   // 保留方括号，CSS 转大写
      if (m[2]) buf.push(m[2]);
      continue;
    }
    buf.push(s);
  }
  flush();
  return out.join('');
}

/* ── 展开面板 ──────────────────────────────────────────────────────────── */
function renderNP() {
  const tr = A.state.track;
  if (!tr) return;
  revokeInputUrls();
  const inst = !!tr.instrumental;
  npEl.dataset.mode = inst ? 'inst' : 'song';
  $('npTask').textContent = TASK_LABEL[inst ? 'instrumental' : tr.section] || TASK_LABEL.song;
  $('npTitle').textContent = locField(tr, 'title');
  $('npTags').textContent = [...(locField(tr, 'tags') || []), A.fmt(A.duration())].join(' · ');
  $('npLabel').src = tr.cover;
  $('npBg').style.backgroundImage = `url("${tr.cover}")`;

  const words = $('npWords');
  const parts = [];
  const cap = locField(tr, 'caption');

  /* 右栏是一个纵向栈：歌词（限高、内部滚动）→ 描述 → 输入音频。
     歌词不再占满整栏 —— 否则歌词一长，描述和输入音频就被推到看不见的地方。 */
  if (!inst && tr.lyrics) {
    parts.push(`<section class="np-lyrics">
      <h4>${t('np.lyrics')}</h4>
      <div class="np-lyrics-scroll">${renderLyrics(tr.lyrics)}</div>
    </section>`);
  }

  // 描述（不显示 rewritten_caption —— 那是内部信息，不给用户看）
  if (cap) {
    parts.push(`<section class="np-block"><p class="k">${t('np.caption')}</p>
      <p class="v">${esc(cap)}</p></section>`);
  }

  // 输入音频：示例作品用静态路径，创作出来的作品用 IndexedDB 里的 Blob
  const inputs = { ...(tr.inputs || {}) };
  if (tr.inputBlob && tr.inputKind) {
    const url = URL.createObjectURL(tr.inputBlob);
    inputUrls.push(url);
    inputs[tr.inputKind] = url;
  }
  const keys = Object.keys(inputs).filter(k => inputs[k]);
  if (keys.length) {
    parts.push(`<section class="np-block"><p class="k">${t('np.input')}</p>` + keys.map(k => `
      <div class="np-input">
        <span class="lab">${ICO_WAVES}${t('np.input.' + k)}</span>
        <audio controls preload="none" src="${esc(inputs[k])}"></audio>
      </div>`).join('') + `</section>`);
  }

  if (!parts.length) {
    parts.push(`<p class="np-none">${t(inst ? 'np.noLyrics' : 'np.noLyricsGiven')}</p>`);
  }

  words.innerHTML = parts.join('');
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function openNP() {
  if (!A.state.track) return;
  npOpen = true;
  renderNP();
  npEl.classList.add('on');
  npScrim.classList.add('on');
  $('npClose').focus();
}
export function closeNP() {
  npOpen = false;
  npEl.classList.remove('on');
  npScrim.classList.remove('on');
  // 关掉输入音频，避免与主播放器同时出声
  npEl.querySelectorAll('audio').forEach(a => a.pause());
  revokeInputUrls();
  $('plExpand').focus();
}

// 收起详情时保留当前音频和底部播放栏，黑胶仍可再次展开详情。
export function collapseNP() {
  closeNP();
}

/* ── seek 交互 ─────────────────────────────────────────────────────────── */
function wireSeek(cv) {
  if (!cv) return;
  const at = e => {
    const r = cv.getBoundingClientRect();
    A.seekRatio(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  };
  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId);
    at(e);
    const move = ev => { if (ev.buttons) at(ev); };
    const up = () => {
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up);
    };
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
  });
  cv.addEventListener('keydown', e => {
    const d = { ArrowLeft: -5, ArrowRight: 5, Home: -1e9, End: 1e9 }[e.key];
    if (d == null) return;
    e.preventDefault();
    A.seek(A.audioEl.currentTime + d);
  });
}

/* ── 初始化 ────────────────────────────────────────────────────────────── */
export function initPlayer() {
  wireSeek($('plPeaks'));
  wireSeek($('npLine'));

  $('plPlay').onclick = A.toggle;
  $('npPlay').onclick = A.toggle;
  $('plPrev').onclick = () => A.step(-1);
  $('plNext').onclick = () => A.step(1);
  $('npPrev').onclick = () => A.step(-1);
  $('npNext').onclick = () => A.step(1);
  $('plExpand').onclick = openNP;
  $('plTT').onclick = openNP;              // 点黑胶也展开
  $('npCollapse').onclick = collapseNP;
  // 详情面板关闭会停止当前播放；底部胶囊关闭按钮也执行真正停止。
  $('npClose').onclick = () => { closeNP(); A.stop(); };
  npScrim.onclick = collapseNP;

  // 关闭播放栏：停止播放并收起整条
  $('plClose').onclick = () => {
    closeNP();
    A.stop();
  };

  const like = () => {
    const tr = A.state.track; if (!tr) return;
    const on = toggleLike(tr.id);
    syncLike();
    toast(t(on ? 'toast.liked' : 'toast.unliked'));
  };
  $('plLike').onclick = like;
  $('npLike').onclick = like;

  const dl = () => {
    const tr = A.state.track; if (!tr) return;
    const a = document.createElement('a');
    a.href = tr.blob ? URL.createObjectURL(tr.blob) : tr.audio;
    a.download = `${locField(tr, 'title') || tr.id}.mp3`;
    a.click();
    if (tr.blob) setTimeout(() => URL.revokeObjectURL(a.href), 30000);
    toast(t('toast.downloaded'));
  };
  $('plDownload').onclick = dl;
  $('npDownload').onclick = dl;

  const rep = () => { A.cycleRepeat(); syncRepeat(); toast(t('player.repeat.' + A.state.repeat)); };
  $('plRepeat').onclick = rep;
  $('npRepeat').onclick = rep;

  $('plMute').onclick = () => { A.setMuted(!A.state.muted); syncVolume(); };
  $('plVol').oninput = e => { A.setVolume(e.target.value / 100); syncVolume(); };

  A.onAudio(type => {
    if (type === 'stop') {
      document.body.removeAttribute('data-playing');
      $('plTitle').textContent = '';
      $('plTags').textContent = '';
      setTT(plTT, 'idle', 0);
      document.querySelectorAll('.card[aria-current="true"]')
        .forEach(c => c.setAttribute('aria-current', 'false'));
      syncPlayIcons();
      document.body.removeAttribute('data-playing');
      return;
    }
    if (type === 'track') syncTrack();
    if (type === 'play' || type === 'pause') { syncPlayIcons(); syncTrack(); }
    if (type === 'error') toast(t('toast.playFailed'));
    if (type === 'volume') syncVolume();
    if (type === 'repeat') syncRepeat();
  });

  onLangChange(() => { syncPlayIcons(); syncRepeat(); syncVolume(); syncTrack(); if (npOpen) renderNP(); });

  // 页面切到后台时停掉绘制循环，音频继续播
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop(); else startLoop();
  });

  // 键盘：焦点不在输入框时才响应
  addEventListener('keydown', e => {
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if (e.key === 'Escape' && npOpen) { closeNP(); return; }
    if (inField || e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case ' ': if (A.state.track) { e.preventDefault(); A.toggle(); } break;
      case 'ArrowLeft':  if (A.state.track) { e.preventDefault(); A.seek(A.audioEl.currentTime - 5); } break;
      case 'ArrowRight': if (A.state.track) { e.preventDefault(); A.seek(A.audioEl.currentTime + 5); } break;
      case 'ArrowUp':    e.preventDefault(); A.setVolume(A.state.volume + 0.1); syncVolume(); break;
      case 'ArrowDown':  e.preventDefault(); A.setVolume(A.state.volume - 0.1); syncVolume(); break;
      case 'j': case 'J': A.step(-1); break;
      case 'l': case 'L': A.step(1); break;
      case 'm': case 'M': A.setMuted(!A.state.muted); syncVolume(); break;
      case 'e': case 'E': if (A.state.track) (npOpen ? closeNP() : openNP()); break;
    }
  });

  A.setVolume(A.state.volume);
  syncPlayIcons(); syncRepeat(); syncVolume();
  document.body.dataset.playing = '0';
  document.body.removeAttribute('data-playing');
  startLoop();
}

/** 播放一首（供页面调用）。queue 决定上一首/下一首的范围。 */
export function playTrack(track, queue) {
  A.load(track, queue);
  A.play();
}
