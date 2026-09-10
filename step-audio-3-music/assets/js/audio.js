/* =============================================================================
   audio.js · 音频引擎 + 峰值提取 + 实时频谱 + 封面取色
   -----------------------------------------------------------------------------
   全站只有一个 <audio> 元素，切曲只换 src —— 这是 SPA 的核心收益，
   翻页时音乐不断。
   ============================================================================= */

const el = document.getElementById('audio');
const listeners = new Set();
export const onAudio = fn => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = type => listeners.forEach(fn => fn(type));

export const audioEl = el;

/* ── 播放状态 ──────────────────────────────────────────────────────────── */
export const state = {
  track: null,
  playing: false,
  queue: [],
  repeat: 'off',           // off | all | one
  muted: false,
  volume: 0.85,
};

let objectUrl = null;      // 生成的作品用 blob URL，换曲时要回收

export function load(track, queue) {
  if (queue) state.queue = queue;
  if (state.track?.id === track.id) return;

  // 释放上一个 blob，一首 mp3 4MB，泄漏十首就 40MB
  if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }

  state.track = track;
  if (track.blob) {
    objectUrl = URL.createObjectURL(track.blob);
    el.src = objectUrl;
  } else {
    el.src = track.audio;
  }
  el.load();
  emit('track');
  getPeaks(track).then(() => emit('peaks'));
}

export async function play() {
  if (!state.track) return;
  try {
    await ensureGraph();          // 必须在用户手势里创建 AudioContext
    await el.play();
  } catch (e) {
    if (e?.name === 'AbortError') return;   // 快速切曲会打断上一个 play()
    emit('error');
  }
}
export const pause = () => el.pause();
export const toggle = () => (state.playing ? pause() : play());

/** 关闭播放：停播、清空曲目、收起播放栏。唱臂会摆回支架。 */
export function stop() {
  el.pause();
  el.removeAttribute('src');
  el.load();                                  // 断开当前媒体，避免继续缓冲
  if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
  state.track = null;
  state.playing = false;
  state.queue = [];
  emit('stop');
}

export function seek(sec) {
  if (!Number.isFinite(el.duration)) return;
  el.currentTime = Math.max(0, Math.min(el.duration, sec));
  emit('time');
}
export const seekRatio = r => seek(r * (el.duration || 0));

export function step(dir) {
  const q = state.queue;
  if (!q.length || !state.track) return;
  const i = q.findIndex(t => t.id === state.track.id);
  if (i < 0) return;
  const next = q[(i + dir + q.length) % q.length];
  load(next, q);
  play();
}

export function setVolume(v) {
  state.volume = Math.max(0, Math.min(1, v));
  el.volume = state.volume;
  if (state.volume > 0 && state.muted) setMuted(false);
  emit('volume');
}
export function setMuted(m) {
  state.muted = m;
  el.muted = m;
  emit('volume');
}
export function cycleRepeat() {
  state.repeat = state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off';
  el.loop = state.repeat === 'one';
  emit('repeat');
  return state.repeat;
}

el.addEventListener('play',  () => { state.playing = true;  emit('play'); });
el.addEventListener('pause', () => { state.playing = false; emit('pause'); });
el.addEventListener('timeupdate', () => emit('time'));
el.addEventListener('loadedmetadata', () => emit('time'));
el.addEventListener('error', () => { if (el.src) emit('error'); });
el.addEventListener('ended', () => {
  if (state.repeat === 'one') return;                 // loop 属性已处理
  const q = state.queue;
  const i = q.findIndex(t => t.id === state.track?.id);
  const isLast = i === q.length - 1;
  if (isLast && state.repeat === 'off') { emit('pause'); return; }
  step(1);
});

export const fmt = s => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};
export const duration = () => (Number.isFinite(el.duration) ? el.duration : (state.track?.duration || 0));
export const progress = () => { const d = duration(); return d ? el.currentTime / d : 0; };

/* ── 实时频谱（律动效果）─────────────────────────────────────────────────
   createMediaElementSource 对同一个元素**只能调一次**，之后所有音频都
   流经这张图，所以必须连到 destination，否则会静音。
   AudioContext 必须在用户手势里创建/resume，否则被浏览器策略挡住。      */
let ctx = null, srcNode = null, analyser = null, freqData = null;

async function ensureGraph() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      srcNode = ctx.createMediaElementSource(el);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.78;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      srcNode.connect(analyser);
      analyser.connect(ctx.destination);     // 忘了这行 = 全站静音
    } catch (e) {
      ctx = null; analyser = null;           // 取不到就降级：没有频谱，但音频照常
      return;
    }
  }
  if (ctx.state === 'suspended') { try { await ctx.resume(); } catch {} }
}

/** 返回 0–1 的能量数组；没有 analyser 时返回 null，调用方自行降级 */
const bandPeak = new Float32Array(64).fill(0.25);   // 每个频带自己的滚动峰值
let framePeak = 0.35;                              // 整帧峰值，用来保留频谱形状
export function spectrum(bars = 40) {
  if (!analyser || !freqData) return null;
  analyser.getByteFrequencyData(freqData);
  const n = freqData.length;
  // 只取 0–5kHz 左右。绝大部分乐器与人声的能量都在这个范围内；
  // 取满量程（到 22kHz）的话右边大半永远贴底。
  const top = n * 0.24;
  const raw = new Array(bars);
  let frame = 0;
  for (let i = 0; i < bars; i++) {
    const lo = Math.floor(Math.pow(i / bars, 1.55) * top);
    const hi = Math.max(lo + 1, Math.floor(Math.pow((i + 1) / bars, 1.55) * top));
    let sum = 0;
    for (let j = lo; j < hi; j++) sum += freqData[j];
    const v = (sum / (hi - lo) / 255) * (1 + (i / bars) * 1.6);   // 高频补偿
    raw[i] = v;
    if (v > frame) frame = v;
  }
  framePeak = frame > framePeak ? framePeak + (frame - framePeak) * 0.4
                                : framePeak + (frame - framePeak) * 0.02;

  const out = new Array(bars);
  for (let i = 0; i < bars; i++) {
    const v = raw[i];
    const p = bandPeak[i];
    bandPeak[i] = v > p ? v : p + (v - p) * 0.012;                // 快抓慢放

    // 两种归一化混合：
    //  · 逐频带（按自己的滚动峰值）—— 保证每根柱子都在动。只用它的话，
    //    密集的真实音乐会把所有柱子都推到各自峰值，画成一面平墙。
    //  · 整帧（按当前帧峰值）—— 保留真实的频谱形状，但低频顶满、高频贴底。
    // 六四混合后：既有起伏形状，又每根都在跳。
    const perBand = v / Math.max(0.06, bandPeak[i]);
    const perFrame = v / Math.max(0.06, framePeak);
    out[i] = Math.min(1, perBand * 0.6 + perFrame * 0.4);
  }
  return out;
}

/* ── 峰值提取（真实峰值，不是随机数）───────────────────────────────────── */
const PEAK_BUCKETS = 320;
const peakCache = new Map();

export function peaksOf(track) {
  return track ? peakCache.get(track.id) || null : null;
}

export async function getPeaks(track) {
  if (!track) return null;
  if (peakCache.has(track.id)) return peakCache.get(track.id);
  if (track.peaks?.length) { peakCache.set(track.id, track.peaks); return track.peaks; }

  peakCache.set(track.id, null);            // 占位，避免并发重复解码
  try {
    const buf = track.blob
      ? await track.blob.arrayBuffer()
      // 同一个 URL 浏览器 HTTP 缓存会复用，不会真的下载两次
      : await (await fetch(track.audio)).arrayBuffer();
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const tmp = new AC();
    const decoded = await tmp.decodeAudioData(buf);
    const ch = decoded.getChannelData(0);
    const per = Math.floor(ch.length / PEAK_BUCKETS) || 1;
    const out = new Array(PEAK_BUCKETS);
    let max = 0;
    for (let i = 0; i < PEAK_BUCKETS; i++) {
      let peak = 0;
      const s = i * per, e = Math.min(ch.length, s + per);
      for (let j = s; j < e; j++) { const v = Math.abs(ch[j]); if (v > peak) peak = v; }
      out[i] = peak;
      if (peak > max) max = peak;
    }
    const g = max ? 1 / max : 1;
    for (let i = 0; i < PEAK_BUCKETS; i++) out[i] = Math.max(0.04, out[i] * g);
    tmp.close?.();
    peakCache.set(track.id, out);
    return out;
  } catch {
    peakCache.set(track.id, null);          // 解不出来就画成平均条，不报错
    return null;
  }
}

/* ── 封面取色 --art ─────────────────────────────────────────────────────
   钳制不能省：没有它，纯黑宇宙封面会给出几乎不可见的深色，
   霓虹封面会给出刺眼的荧光色。钳制之后任何封面都产出可用的颜色。      */
const artCache = new Map();
const FALLBACK = '#6B6F76';

const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const unlin = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToOklab(r, g, b) {
  r = lin(r / 255); g = lin(g / 255); b = lin(b / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
          1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
          0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
function oklabToRgb(L, a, bb) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * bb) ** 3;
  return [ 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
          -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
          -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s]
    .map(v => Math.max(0, Math.min(255, Math.round(unlin(v) * 255))));
}
const hex = ([r, g, b]) =>
  '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();

function clampArt(r, g, b) {
  const [L, a, bb] = rgbToOklab(r, g, b);
  const C = Math.hypot(a, bb), H = Math.atan2(bb, a);
  const L2 = Math.min(0.60, Math.max(0.46, L));
  const C2 = Math.min(0.15, Math.max(0.06, C));
  return hex(oklabToRgb(L2, Math.cos(H) * C2, Math.sin(H) * C2));
}

function extract(img) {
  const N = 32;
  const cv = document.createElement('canvas');
  cv.width = cv.height = N;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.drawImage(img, 0, 0, N, N);
  const d = cx.getImageData(0, 0, N, N).data;
  const bins = new Map();
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const v = mx / 255;
    if (v < 0.12 || v > 0.92) continue;                 // 丢黑边与白底
    if (mx === 0 || (mx - mn) / mx < 0.12) continue;    // 丢低饱和灰
    const key = (r >> 6) * 16 + (g >> 6) * 4 + (b >> 6);
    const o = bins.get(key) || [0, 0, 0, 0];
    o[0] += r; o[1] += g; o[2] += b; o[3]++;
    bins.set(key, o);
  }
  if (!bins.size) return null;
  const best = [...bins.values()].sort((x, y) => y[3] - x[3])[0];
  return clampArt(best[0] / best[3], best[1] / best[3], best[2] / best[3]);
}

/** 取封面主色并写入 CSS 变量。失败静默退回中性灰，不报错。 */
export function applyArt(coverUrl) {
  const set = c => {
    document.documentElement.style.setProperty('--art', c);
    document.documentElement.style.setProperty('--art-wash', c + '24');
    document.documentElement.style.setProperty('--art-glow', c + '3D');
  };
  if (!coverUrl) return set(FALLBACK);
  if (artCache.has(coverUrl)) return set(artCache.get(coverUrl));
  try {
    const cached = localStorage.getItem('sa3m.art.' + coverUrl);
    if (cached) { artCache.set(coverUrl, cached); return set(cached); }
  } catch {}

  const img = new Image();
  img.onload = () => {
    let c = null;
    try { c = extract(img); } catch {}       // file:// 下 canvas 会被污染，静默降级
    c = c || FALLBACK;
    artCache.set(coverUrl, c);
    try { localStorage.setItem('sa3m.art.' + coverUrl, c); } catch {}
    set(c);
  };
  img.onerror = () => set(FALLBACK);
  img.src = coverUrl;
}

/** 读一个 Blob 的时长（秒）。生成的作品要靠它把卡片上的时长填对。 */
export function blobDuration(blob) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(blob);
    const a = new Audio();
    const done = v => { URL.revokeObjectURL(url); resolve(v); };
    a.preload = 'metadata';
    a.onloadedmetadata = () => done(Number.isFinite(a.duration) ? a.duration : 0);
    a.onerror = () => done(0);
    setTimeout(() => done(Number.isFinite(a.duration) ? a.duration : 0), 8000);
    a.src = url;
  });
}

/* ── Media Session：锁屏信息与耳机按键 ─────────────────────────────────── */

/* 封面库里混着 512×512 的 jpg 和 640×640 的 webp，锁屏封面的 type/sizes
   不能写死，按扩展名推。写错锁屏可能直接不显示封面。 */
const ART_TYPE = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
function artworkFor(cover) {
  const ext = (cover.split('.').pop() || '').toLowerCase();
  return {
    src: new URL(cover, location.href).href,
    sizes: ext === 'webp' ? '640x640' : '512x512',
    type: ART_TYPE[ext] || 'image/jpeg',
  };
}

export function updateMediaSession(track, title, artist) {
  if (!('mediaSession' in navigator) || !track) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title, artist, album: 'StepAudio-3-Music',
      artwork: [artworkFor(track.cover)],
    });
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('previoustrack', () => step(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => step(1));
  } catch {}
}
