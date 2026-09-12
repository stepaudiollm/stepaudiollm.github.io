/* 首页文案与动效；聆听区和播放器复用 studio 组件。 */
import { setLang as setPlayerLang } from './i18n.js';
import { initShowcase } from './showcase.js';

const LS_KEY = 'sa3m.lang';          // 与 assets/js/i18n.js 保持一致

const DICT = {
  zh: {
    'skip': '跳到主内容',
    'nav.model': '模型', 'nav.caps': '能力', 'nav.uses': '场景',
    'nav.listen': '聆听示例', 'nav.create': '创作',
    'cta.start': '开始创作', 'cta.api': 'API', 'cta.experience': '体验中心', 'cta.comingSoon': '即将开放',
    'model.h': '先把歌想清楚，再唱出来。',
    "model.p": "StepAudio 3 Music 采用 MoE 架构与 AR + DiT 生成范式，将音乐结构规划与音频生成相结合。模型借助 ABC-COT，在生成前规划歌曲结构、段落衔接与编曲层次，为完整歌曲的生成提供结构化指导。ABC-COT 将自然语言中的创作意图转化为音乐规划，使风格、人声、情绪、乐器、调性与速度等控制条件贯穿生成过程。通过结构化规划与音频生成的协同，模型能够更准确地遵循描述，在歌曲结构、演唱表现与配器细节上实现更强的可控性。",
    "eval.h": "兼具音乐质量与可控性",
    "eval.quality": "StepAudio 3 Music 在衡量音乐质量的 Audiobox 和衡量可控性的 MuQ-Similarity 评测中均取得 SOTA 结果，展现出高质量音乐生成与精准遵循创作意图的能力。在评价生成歌曲审美质量的 SongBench 指标上，模型同样取得具有竞争力的结果，在音乐质量、可控性与歌曲审美之间呈现出均衡的综合表现。",
    'chain.1.h': '你的描述',
    'chain.1.p': '风格、人声、音色、情绪、乐器、调性、速度，用自然语言写就行。',
    'chain.2.h': '结构与编曲规划',
    'chain.2.p': '先定段落走向和配器分工，再进入生成。',
    'chain.3.h': '演唱与成曲',
    'chain.3.p': '按规划生成人声与伴奏，段落之间自然衔接。',
    'chain.4.h': '完整歌曲',
    'chain.4.p': '一首可直接试听、下载的成品，不是片段。',

    'caps.h': '四种功能，覆盖音乐创作多环节',
    'cap.song.h': '歌曲生成',
    'cap.song.p': '给歌词和一句风格描述，生成带人声的完整歌曲。歌词留空则由模型代笔。',
    'cap.inst.h': '纯音乐生成',
    'cap.inst.p': '只描述风格、乐器与质感，生成没有人声的器乐。',
    'cap.cover.h': '歌曲翻唱',
    'cap.cover.p': '给一首参考歌曲，换成另一种风格重唱，旋律跟着原曲走。',
    'cap.v2m.h': '清唱配乐',
    'cap.v2m.p': '给一段干声清唱，补齐编曲，旋律跟着你唱的走。',
    'io.text': '文字', 'io.song': '歌曲', 'io.inst': '器乐',
    'io.textsong': '文字 + 参考歌曲', 'io.textvocal': '文字 + 清唱',

    'uses.h': '谁在用它。',
    'use.1.h': '短视频与自媒体',
    'use.1.p': '按内容的情绪和节奏直接出背景音乐、片头与主题曲，不用再翻曲库谈授权。',
    'use.2.h': '词曲与 Demo',
    'use.2.p': '编曲方向先听到再决定往哪改，把灵感变成能试听的样片。',
    'use.3.h': '游戏与互动内容',
    'use.3.p': '围绕角色设定和剧情生成主题曲与氛围音乐，声音也能有辨识度。',

    'outro.h': '说一句，听一首。',
    'outro.note': '需要自备阶跃 API Key，开放平台可领免费额度。',
    'outro.link': '前往开放平台 ↗',
  },
  en: {
    'skip': 'Skip to content',
    'nav.model': 'Model', 'nav.caps': 'Capabilities', 'nav.uses': 'Use cases',
    'nav.listen': 'Examples', 'nav.create': 'Create',
    'cta.start': 'Start creating', 'cta.api': 'API', 'cta.experience': 'Voice Studio', 'cta.comingSoon': 'Coming Soon',
    'model.h': 'Plan the song first. Then sing it.',
    "model.p": "StepAudio 3 Music combines a MoE architecture with an AR + DiT generation framework, connecting musical planning with audio synthesis. Using ABC-COT, it plans song structure, transitions and arrangement before generation, providing structured guidance for a complete song. ABC-COT translates natural-language intent into a musical plan, carrying controls for style, vocals, mood, instruments, key and tempo through the generation process. This coordination between planning and synthesis enables closer adherence to the description, with greater control over song structure, vocal expression and instrumentation.",
    "eval.h": "Music quality meets controllability",
    "eval.quality": "StepAudio 3 Music achieves state-of-the-art results on Audiobox for music quality and MuQ-Similarity for controllability, demonstrating high-quality generation and precise adherence to creative intent. The model also delivers competitive results on SongBench, which evaluates the aesthetic quality of generated songs, showing balanced performance across music quality, controllability and musical aesthetics.",
    'chain.1.h': 'Your description',
    'chain.1.p': 'Style, vocal, timbre, mood, instruments, key and tempo — plain language is enough.',
    'chain.2.h': 'Structure & arrangement',
    'chain.2.p': 'Section flow and instrument roles get decided before a note is generated.',
    'chain.3.h': 'Performance',
    'chain.3.p': 'Vocals and backing follow the plan, so sections join naturally.',
    'chain.4.h': 'A finished song',
    'chain.4.p': 'Something you can play and download in full — not a clip.',

    'caps.h': 'Four capabilities across the music creation process.',
    'cap.song.h': 'Song generation',
    'cap.song.p': 'Give lyrics and one line of style, get a full song with vocals. Leave lyrics blank and the model writes them.',
    'cap.inst.h': 'Instrumental',
    'cap.inst.p': 'Describe style, instruments and texture only — no vocals.',
    'cap.cover.h': 'Cover',
    'cap.cover.p': 'Hand it a reference song and a new style; the melody follows the original.',
    'cap.v2m.h': 'Vocal to song',
    'cap.v2m.p': 'Hand it a dry vocal take and it builds the arrangement around what you sang.',
    'io.text': 'Text', 'io.song': 'Song', 'io.inst': 'Instrumental',
    'io.textsong': 'Text + reference song', 'io.textvocal': 'Text + dry vocal',

    'uses.h': 'Who uses it.',
    'use.1.h': 'Short video & creators',
    'use.1.p': 'Score to the mood and pace of your footage instead of digging through libraries and licences.',
    'use.2.h': 'Songwriting & demos',
    'use.2.p': 'Hear an arrangement direction before deciding what to change.',
    'use.3.h': 'Games & interactive',
    'use.3.p': 'Theme and ambient music built around a character or storyline, with a recognisable voice.',

    'outro.h': 'Say one line. Hear one song.',
    'outro.note': 'You bring your own StepFun API key — the platform hands out free credits.',
    'outro.link': 'Go to the platform ↗',
  },
};

/* ── 语言 ──────────────────────────────────────────────────────────────── */
let lang = 'en';
try {
  const saved = localStorage.getItem(LS_KEY);
  if (saved === 'zh' || saved === 'en') lang = saved;
} catch { /* 隐私模式下会抛，用默认值 */ }

const t = k => DICT[lang][k] ?? DICT.zh[k] ?? '';
const API_HREF = {
  zh: 'https://platform.stepfun.com/docs/zh/guides/models/stepaudio-3-music',
  en: 'https://platform.stepfun.ai/docs/en/guides/models/stepduio-3-music',
};
const EXPERIENCE_HREF = 'https://www.stepfun.com/studio/audio';

function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  setPlayerLang(lang);
  for (const el of document.querySelectorAll('[data-t]')) {
    const v = t(el.dataset.t);
    if (v) el.textContent = v;
  }
  for (const b of document.querySelectorAll('.llang button')) {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  }

  const api = document.getElementById('headerApi');
  if (api) api.href = API_HREF[lang];

  const experienceAvailable = lang === 'zh';
  for (const [linkId, statusId] of [['headerExperience', 'headerSoon'], ['outroExperience', 'outroSoon']]) {
    const link = document.getElementById(linkId);
    const status = document.getElementById(statusId);
    if (!link) continue;
    link.classList.toggle('soon', !experienceAvailable);
    if (experienceAvailable) {
      link.href = EXPERIENCE_HREF;
      link.removeAttribute('aria-disabled');
      link.removeAttribute('data-coming-soon');
      link.removeAttribute('aria-describedby');
      if (status) status.hidden = true;
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('data-coming-soon', '');
      link.setAttribute('aria-describedby', statusId);
      if (status) status.hidden = false;
    }
  }
}

for (const b of document.querySelectorAll('.llang button')) {
  b.addEventListener('click', () => {
    lang = b.dataset.lang;
    try { localStorage.setItem(LS_KEY, lang); } catch {}
    applyLang();
  });
}

/* ── 顶栏：离开首屏后转成浅色玻璃 ───────────────────────────────────────── */
const head = document.getElementById('lhead');
const hero = document.getElementById('intro');
// 用 IntersectionObserver 而不是 scroll 事件：不用自己节流，也不会每帧读布局
new IntersectionObserver(
  ([e]) => head.classList.toggle('stuck', !e.isIntersecting),
  // 首屏底部越过顶栏高度时切换
  { rootMargin: '-64px 0px 0px 0px', threshold: 0 },
).observe(hero);

/* ── 滚动入场 ──────────────────────────────────────────────────────────── */
const reveal = new IntersectionObserver((entries, obs) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    obs.unobserve(e.target);          // 只演一次，别来回闪
  }
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

for (const el of document.querySelectorAll('[data-reveal]')) {
  // 首屏的元素不等滚动，载入就依次现身
  if (hero.contains(el)) requestAnimationFrame(() => el.classList.add('in'));
  else reveal.observe(el);
}

/* ── 背景视频 ───────────────────────────────────────────────────────────
   preload="none" + 手动加载：首屏先用海报图顶上，视频晚一点再来，
   这样 LCP 不被 1 MiB 的视频拖累。
   两种情况根本不加载视频：用户要求减少动态效果、或者是省流量模式。       */
const video = document.getElementById('heroVideo');

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection?.saveData === true;
const wantsVideo = !reducedMotion && !saveData;

if (wantsVideo) {
  // 等首屏文字排完再拉视频
  addEventListener('load', () => {
    video.preload = 'auto';
    video.load();
    video.play().catch(() => { /* 自动播放被拒就停在海报图，不报错 */ });
  }, { once: true });
} else {
  // 关键：**不要** video.remove()。preload="none" 且不 play 时，<video> 会一直显示
  // poster —— 那正是我们要的静态背景。删掉元素等于把海报也删了，首屏会变成一块纯
  // 深色，素材全没了（踩过）。这里只撤掉播放开关。
  video.removeAttribute('autoplay');
  video.removeAttribute('loop');
}

/* 切到后台时暂停：省电，也避免回来时音画错位（虽然静音，但省 GPU） */
document.addEventListener('visibilitychange', () => {
  if (!wantsVideo || !video.isConnected) return;
  if (document.hidden) video.pause();
  else video.play().catch(() => {});
});

applyLang();


initShowcase();
