/* =============================================================================
   store.js · 本地持久化
   -----------------------------------------------------------------------------
   作品音频用 IndexedDB 存 Blob（localStorage 只有 5MB，一首 mp3 就爆）。
   小设置用 localStorage。
   ============================================================================= */

const DB_NAME = 'sa3m';
const DB_VER = 2;   // v2：新增 inputs（保存清唱/语音/原曲等输入音频）
let dbp = null;

function db() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('tracks')) d.createObjectStore('tracks', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('blobs')) d.createObjectStore('blobs', { keyPath: 'id' });
      // 输入音频（清唱配乐 / 歌曲翻唱），播放展示页要能回放
      if (!d.objectStoreNames.contains('inputs')) d.createObjectStore('inputs', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

function tx(store, mode, fn) {
  return db().then(d => new Promise((resolve, reject) => {
    const t = d.transaction(store, mode);
    const s = t.objectStore(store);
    const r = fn(s);
    t.oncomplete = () => resolve(r?.result ?? r);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

/**
 * 保存一首生成的作品。
 * meta / 成品音频 / 输入音频分三个 store，避免把大 Blob 塞进元数据里。
 * inputBlob 为清唱配乐等能力上传的原始音频，展开面板要回放它。
 */
export async function saveTrack(meta, blob, inputBlob, inputKind) {
  await tx('tracks', 'readwrite', s => s.put(meta));
  if (blob) await tx('blobs', 'readwrite', s => s.put({ id: meta.id, blob }));
  if (inputBlob) {
    await tx('inputs', 'readwrite', s => s.put({ id: meta.id, kind: inputKind, blob: inputBlob }));
  }
}

/** 读全部作品，按创建时间倒序；音频 Blob 一并带出 */
export async function allTracks() {
  const metas = await tx('tracks', 'readonly', s => s.getAll());
  const list = (metas || []).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const blobs = await tx('blobs', 'readonly', s => s.getAll());
  const map = new Map((blobs || []).map(b => [b.id, b.blob]));
  const ins = await tx('inputs', 'readonly', s => s.getAll());
  const imap = new Map((ins || []).map(b => [b.id, b]));
  for (const m of list) {
    m.blob = map.get(m.id) || null;
    const i = imap.get(m.id);
    if (i) { m.inputBlob = i.blob; m.inputKind = i.kind; }
  }
  return list;
}

export async function deleteTrack(id) {
  await tx('tracks', 'readwrite', s => s.delete(id));
  await tx('blobs', 'readwrite', s => s.delete(id));
  await tx('inputs', 'readwrite', s => s.delete(id));
}

export async function clearTracks() {
  await tx('tracks', 'readwrite', s => s.clear());
  await tx('blobs', 'readwrite', s => s.clear());
  await tx('inputs', 'readwrite', s => s.clear());
}

/* ── 小设置：localStorage ──────────────────────────────────────────────── */
const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const likes = new Set(read('sa3m.likes', []));
export function toggleLike(id) {
  if (likes.has(id)) likes.delete(id); else likes.add(id);
  write('sa3m.likes', [...likes]);
  return likes.has(id);
}

export const prefs = {
  get navMini() { return read('sa3m.navMini', false); },
  set navMini(v) { write('sa3m.navMini', !!v); },
};
