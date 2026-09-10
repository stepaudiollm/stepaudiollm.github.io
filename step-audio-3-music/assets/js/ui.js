/* =============================================================================
   ui.js · Toast、卡片、音符粒子、通用小组件
   ============================================================================= */

import { t, locField } from './i18n.js';
import { fmt } from './audio.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const icon = (id, cls = 'icon-sm', sw = 1.8) =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}"
    stroke-linecap="round" stroke-linejoin="round"><use href="#${id}"/></svg>`;

/* ── Toast ─────────────────────────────────────────────────────────────── */
const toastHost = document.getElementById('toasts');
let toastTimer = null;
export function toast(msg) {
  if (!msg) return;
  // 一次只留一条，连续操作不堆成一面墙
  toastHost.querySelectorAll('.toast').forEach(el => el.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  toastHost.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.add('leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 2400);
}

/* ── 卡片 ──────────────────────────────────────────────────────────────── */
const ACT = (name, ico, on = false) =>
  `<span class="card-act${on ? ' liked' : ''}${name === 'del' ? ' danger' : ''}"
     role="button" tabindex="0" data-act="${name}">${icon(ico, 'icon-sm', 1.9)}</span>`;

export function cardHTML(track, { showRef = false, acts = false, liked = false } = {}) {
  const title = locField(track, 'title');
  const tags = locField(track, 'tags') || [];
  const meta = [...tags, fmt(track.duration)].join(' · ');
  const hasRef = showRef && track.inputs && Object.values(track.inputs).some(Boolean);
  return `<button class="card" data-id="${esc(track.id)}" aria-current="false"
      aria-label="${esc(title)}">
    <span class="card-art">
      <img src="${esc(track.cover)}" alt="" loading="lazy" decoding="async" width="512" height="512">
      <span class="card-play" aria-hidden="true">${icon('i-play', 'icon-sm', 2)}</span>
      ${hasRef ? `<span class="card-ref" aria-hidden="true">${icon('i-waves', 'icon-sm', 2)}${t('listen.in')}</span>` : ''}
    </span>
    <span class="card-title">
      <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
      <span>${esc(title)}</span>
      ${acts ? `<span class="card-acts">
        ${ACT('like', 'i-heart', liked)}${ACT('dl', 'i-download')}${ACT('del', 'i-trash')}
      </span>` : ''}
    </span>
    <span class="card-meta">${esc(meta)}</span>
  </button>`;
}

/** 网格里所有卡片共用一个点击委托 */
export function wireGrid(host, tracks, onPlay) {
  host.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const tr = tracks.find(x => x.id === card.dataset.id);
    if (tr) onPlay(tr, tracks);
  });
}

/* ── 音符粒子 ──────────────────────────────────────────────────────────── */
const NOTE_PATHS = [
  // ♪ 单音符
  'M9 3.2v9.1a2.6 2.6 0 1 0 1.6 2.4V6.6l4.2-1v6.1a2.6 2.6 0 1 0 1.6 2.4V2z',
  // ♫ 双音符
  'M6.4 5v8.6a2.4 2.4 0 1 0 1.5 2.2V7.9l7.1-1.6v6.3a2.4 2.4 0 1 0 1.5 2.2V3.4z',
];
const canvas = document.getElementById('notes');
const nctx = canvas.getContext('2d');
let particles = [];
let nraf = null;

function resizeNotes() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function spawnNotes(x, y, n = 3) {
  if (reduced()) return;
  if (particles.length > 40) particles = particles.slice(-30);
  for (let i = 0; i < n; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 26,
      vy: -(58 + Math.random() * 34),
      rot: (Math.random() - 0.5) * 0.5,
      vr: (Math.random() - 0.5) * 1.4,
      size: 18 + Math.random() * 8,
      path: NOTE_PATHS[Math.floor(Math.random() * NOTE_PATHS.length)],
      life: 0,
      ttl: 0.9,
    });
  }
  if (!nraf) { last = performance.now(); nraf = requestAnimationFrame(stepNotes); }
}

let last = 0;
const noteShapes = new Map();
function shape(d) {
  if (!noteShapes.has(d)) noteShapes.set(d, new Path2D(d));
  return noteShapes.get(d);
}

function stepNotes(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  nctx.clearRect(0, 0, innerWidth, innerHeight);
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#14161A';

  particles = particles.filter(p => {
    p.life += dt;
    if (p.life >= p.ttl) return false;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 26 * dt;                      // 轻微减速，像浮起来
    p.rot += p.vr * dt;
    const k = p.life / p.ttl;
    nctx.save();
    nctx.translate(p.x, p.y);
    nctx.rotate(p.rot);
    nctx.scale(p.size / 24, p.size / 24);
    nctx.translate(-12, -12);
    nctx.globalAlpha = 0.2 * (1 - k * k);
    nctx.fillStyle = ink;
    nctx.fill(shape(p.path));
    nctx.restore();
    return true;
  });

  if (particles.length) nraf = requestAnimationFrame(stepNotes);
  else { nraf = null; nctx.clearRect(0, 0, innerWidth, innerHeight); }
}

export function initNotes() {
  resizeNotes();
  addEventListener('resize', resizeNotes);

  // 只在内容区响应；按钮/输入/卡片/播放器有自己的反馈，叠加就成了噪音
  document.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    const bad = e.target.closest('button, a, input, textarea, select, label, .player, .np, .nav, canvas');
    if (bad) return;
    if (!e.target.closest('.main')) return;
    spawnNotes(e.clientX, e.clientY, 2 + Math.floor(Math.random() * 3));
  });

  // 输入框打字时从光标附近冒一个
  document.addEventListener('keydown', e => {
    const el = e.target;
    if (!(el instanceof HTMLTextAreaElement) && !(el instanceof HTMLInputElement)) return;
    if (el.type === 'range') return;
    if (e.key.length !== 1) return;
    const r = el.getBoundingClientRect();
    spawnNotes(r.left + Math.min(r.width - 20, 20 + (el.value.length % 30) * 7), r.top + 18, 1);
  });
}

/* ── 自定义下拉 ─────────────────────────────────────────────────────────────
   原生 <select> 即使 appearance:none，**展开后的选项列表仍由操作系统绘制**，
   CSS 完全管不到，在这套浅色界面里很突兀。所以自己实现一个 listbox。
   ========================================================================= */
export function selectHTML(id, options, value) {
  const cur = options.find(o => o.v === value) || options[0];
  return `<div class="cselect" id="${id}" data-value="${esc(cur.v)}">
    <button type="button" class="cselect-btn" aria-haspopup="listbox" aria-expanded="false">
      <span class="cselect-cur">${esc(cur.label)}</span>${icon('i-chev-down')}
    </button>
    <div class="cselect-list" role="listbox" hidden>
      ${options.map(o => `<button type="button" role="option" data-v="${esc(o.v)}"
        aria-selected="${o.v === cur.v}">${esc(o.label)}${icon('i-check')}</button>`).join('')}
    </div>
  </div>`;
}

export function wireSelect(root, onChange) {
  const btn = root.querySelector('.cselect-btn');
  const list = root.querySelector('.cselect-list');
  const opts = [...list.querySelectorAll('[role="option"]')];

  const close = () => {
    list.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    root.classList.remove('open');
  };
  const open = () => {
    // 同一时刻只允许一个下拉展开
    document.querySelectorAll('.cselect.open').forEach(o => {
      if (o !== root) { o.classList.remove('open'); o.querySelector('.cselect-list').hidden = true;
        o.querySelector('.cselect-btn').setAttribute('aria-expanded', 'false'); }
    });
    list.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    root.classList.add('open');
    (opts.find(o => o.getAttribute('aria-selected') === 'true') || opts[0])?.focus();
  };
  const pick = o => {
    root.dataset.value = o.dataset.v;
    root.querySelector('.cselect-cur').textContent = o.textContent.trim();
    opts.forEach(x => x.setAttribute('aria-selected', String(x === o)));
    close();
    btn.focus();
    onChange?.(o.dataset.v);
  };

  btn.onclick = e => { e.stopPropagation(); list.hidden ? open() : close(); };
  opts.forEach(o => { o.onclick = e => { e.stopPropagation(); pick(o); }; });

  root.addEventListener('keydown', e => {
    const i = opts.indexOf(document.activeElement);
    if (e.key === 'Escape') { close(); btn.focus(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.hidden) return open();
      opts[Math.max(0, Math.min(opts.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))]?.focus();
    }
    if ((e.key === 'Enter' || e.key === ' ') && i >= 0) { e.preventDefault(); pick(opts[i]); }
  });
  // 点外面关掉
  document.addEventListener('click', ev => { if (!root.contains(ev.target)) close(); });
}

export const selectValue = root => root?.dataset.value;

/* ── 通用弹层 ───────────────────────────────────────────────────────────────
   confirmDialog 只能「标题 + 一段纯文本 + 两个按钮」，装不下带输入框和实时
   校验状态的面板。这里提供一个自带遮罩 / Esc / 焦点循环的空壳，内容和按钮
   由调用方自己拼，拿到 host 后自行 wire。
   ========================================================================= */
export function modal(innerHTML, { onClose, labelledBy = 'mdlT' } = {}) {
  const host = document.createElement('div');
  host.className = 'dlg-scrim';
  host.innerHTML = `<div class="dlg dlg-wide" role="dialog" aria-modal="true"
    aria-labelledby="${labelledBy}">${innerHTML}</div>`;
  document.body.appendChild(host);
  requestAnimationFrame(() => host.classList.add('on'));

  const prevFocus = document.activeElement;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    host.classList.remove('on');
    setTimeout(() => host.remove(), 200);
    document.removeEventListener('keydown', onKey, true);
    prevFocus?.focus?.();
    onClose?.();
  };
  const onKey = e => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key === 'Tab') {
      // 只在可聚焦且可见的控件之间循环
      const f = [...host.querySelectorAll('button, input, a[href], textarea')]
        .filter(el => !el.disabled && el.offsetParent !== null);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  };
  document.addEventListener('keydown', onKey, true);
  host.onclick = e => { if (e.target === host) close(); };
  return { host, close };
}

/* ── 确认弹窗 ───────────────────────────────────────────────────────────────
   不用 window.confirm：它是浏览器原生弹窗，样式完全不受控，
   在这套界面里非常突兀，而且会阻塞主线程。
   ========================================================================= */
export function confirmDialog({ title, body = '', ok, cancel, danger = true }) {
  return new Promise(resolve => {
    const host = document.createElement('div');
    host.className = 'dlg-scrim';
    host.innerHTML = `
      <div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlgT">
        <h3 id="dlgT">${esc(title)}</h3>
        ${body ? `<p>${esc(body)}</p>` : ''}
        <div class="dlg-foot">
          <button type="button" class="btn btn-ghost" data-a="0">${esc(cancel || t('confirm.cancel'))}</button>
          <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-a="1">${esc(ok)}</button>
        </div>
      </div>`;
    document.body.appendChild(host);
    requestAnimationFrame(() => host.classList.add('on'));

    const prevFocus = document.activeElement;
    const done = v => {
      host.classList.remove('on');
      setTimeout(() => host.remove(), 200);
      document.removeEventListener('keydown', onKey, true);
      prevFocus?.focus?.();
      resolve(v);
    };
    const onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); done(false); }
      if (e.key === 'Tab') {                       // 简单焦点循环
        const f = [...host.querySelectorAll('button')];
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    host.querySelectorAll('[data-a]').forEach(b => {
      b.onclick = () => done(b.dataset.a === '1');
    });
    host.onclick = e => { if (e.target === host) done(false); };
    host.querySelector('[data-a="1"]').focus();
  });
}

/* ── 通用：把 DOM 里的 data-i18n 填上 ──────────────────────────────────── */
export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  root.querySelectorAll('[data-i18n-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nLabel));
  });
  root.querySelectorAll('[data-tip-i18n]').forEach(el => {
    const s = t(el.dataset.tipI18n);
    el.dataset.tip = s;
    if (!el.querySelector('.nav-label')) el.setAttribute('aria-label', s);
  });
}
