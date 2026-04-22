const DATA_URL = "./stepaudio_asr_showcase_cases.json";
const INLINE_DATA_KEY = "STEPAUDIO_ASR_SHOWCASE_DATA";
const UI_COPY = {
  zh: {
    localeLabel: "中文",
    nav: {
      top: "概览",
      highlights: "亮点",
      demo: "视频",
      cases: "样例",
      benchmarks: "指标",
    },
    hero: {
      title: "StepAudio 2.5 ASR：让语音识别进入闪电时代",
      lead: "Multi-Token Prediction技术加持，500 token/s 吞吐，速度与精度同步跃升；1小时音频转写0.15元，击穿行业底价。",
      actions: {
        demo: "观看视频",
        cases: "浏览识别样例",
        online: "在线体验",
      },
      stats: ["推理加速", "极速吞吐", "推理成本", "上下文窗口", "单次转写"],
    },
    highlights: {
      title: "核心亮点",
      summary: "围绕推理效率、转写精度与长音频能力，展示 StepAudio 2.5 ASR 在真实生产环境中的稳定表现。",
      cards: [
        {
          title: "极速推理效率",
          body: "ASR 与 MTP-5 深度融合，在真实业务请求链路中显著提升解码速度与单机吞吐。",
          pills: ["实测 +400%", "500 token/s", "成本 -80%"],
        },
        {
          title: "SOTA 转写精度",
          body: "在常见中英文转写评测中保持强竞争力，兼顾复杂术语与长段内容。",
          pills: ["中英文稳定", "术语覆盖", "长段转写强"],
        },
        {
          title: "原生超长音频",
          body: "依托 32K 上下文窗口，支持最长 30 分钟音频的一次性完整转写。",
          pills: ["原生 32K 上下文", "最长 30 分钟", "连续转写稳定"],
        },
      ],
    },
    video: {
      title: "视频展示",
      summary: "完整展示 StepAudio 2.5 ASR 的极速转写、复杂场景鲁棒性、长音频能力与中英文综合表现，更直接传达产品级 ASR 实力。",
    },
    examples: {
      title: "识别样例",
      featuredOutput: "识别结果",
      jump: "查看完整样例",
      tableHeaders: ["样例", "音频", "识别结果"],
      caseTitles: {
        "zh_tougue-twister1": "中文绕口令快板",
        zh_high_speed: "中文快语速",
        zh_yueyu: "粤语",
        zh_sing_bgm: "中文带BGM唱歌",
        zh_noise_speech: "中文嘈杂背景声人声",
        en_tougue_twister1: "英文绕口令1",
        en_tougue_twister2: "英文绕口令2",
        en_high_speed: "英文快语速",
        en_noise_speech: "英文嘈杂背景声人声",
        en_sing_bgm: "英文带BGM唱歌",
        zh_longform: "中文长文",
        en_longform: "英文长文",
      },
      showcaseSections: {
        zh: {
          title: "中文样例",
          summary: "覆盖中文快语速、粤语、噪声背景与带 BGM 场景，直观体现模型在真实复杂输入下依然稳定、准确的强转写效果。",
        },
        en: {
          title: "英文样例",
          summary: "聚焦英文绕口令、快语速与噪声录音，直观展示模型面对复杂英文语流时依然稳定、准确、表现出色的转写能力。",
        },
        longform: {
          title: "长文样例",
          summary: "展示中文与英文长段连续内容，充分体现模型在长上下文下依然保持稳定、完整且高质量输出的强长文转写能力。",
        },
      },
    },
    benchmarks: {
      title: "识别指标",
      summary: "围绕中英文与长音频场景的核心结果，直观展示 StepAudio 2.5 ASR 在识别精度与推理效率上的领先表现。",
      rtfTitle: "推理效率 / Real Time Factor (RTF)",
      rtfSummary: "单卡单并发测量，RTF 越低越好。注：除 Doubao-ASR-2603 为 API 调用外，其余模型均为本地部署。",
      rtfNext: "第二名",
      summaryLabels: ["中文场景", "英文场景", "长音频场景"],
      titles: {
        zh: "中文",
        en: "英文",
        longform: "长音频",
      },
      metrics: {
        cer: "平均 CER",
        wer: "平均 WER",
      },
    },
    loadError: "页面数据加载失败。",
    caseDetails: {
      "zh_tougue-twister1": {
        summary: "中文绕口令与快板场景，验证高密度音节下的清晰转写能力。",
        tags: ["中文", "绕口令", "快节奏"],
      },
      zh_high_speed: {
        summary: "高速连续语流下仍保持稳定断句与完整转写，适合展示实时识别效率。",
        tags: ["中文", "快语速", "连续语流"],
      },
      zh_yueyu: {
        summary: "覆盖粤语口语表达，展示方言与非普通话场景下的识别稳定性。",
        tags: ["粤语", "方言", "口语场景"],
      },
      zh_sing_bgm: {
        summary: "在人声与音乐混合的条件下，保持对主声部歌词内容的准确捕获。",
        tags: ["中文", "带 BGM", "唱歌"],
      },
      zh_noise_speech: {
        summary: "面对嘈杂背景与真实环境干扰，依然能够稳定锁定目标人声内容。",
        tags: ["中文", "噪声背景", "鲁棒性"],
      },
      en_tougue_twister1: {
        summary: "英文绕口令样例，检验模型对高相似音节与连续重复词的解析能力。",
        tags: ["英文", "绕口令", "密集重复"],
      },
      en_tougue_twister2: {
        summary: "英文高混淆短语识别样例，适合观察 tongue twister 场景中的稳定性。",
        tags: ["英文", "绕口令", "复杂发音"],
      },
      en_high_speed: {
        summary: "英文新闻式快语速样例，展示模型在高速信息流中的完整捕获能力。",
        tags: ["英文", "快语速", "资讯播报"],
      },
      en_noise_speech: {
        summary: "嘈杂背景中的英文口语识别，体现对真实录音环境的鲁棒性。",
        tags: ["英文", "噪声背景", "生活口语"],
      },
      en_sing_bgm: {
        summary: "英文带背景音乐演唱样例，展示对旋律与歌词混合内容的识别能力。",
        tags: ["英文", "带 BGM", "唱歌"],
      },
      fallback: {
        summary: "展示模型在真实语音输入下的稳定转写结果。",
        tags: ["识别样例"],
      },
    },
  },
  en: {
    localeLabel: "English",
    nav: {
      top: "Overview",
      highlights: "Highlights",
      demo: "Video",
      cases: "Samples",
      benchmarks: "Benchmarks",
    },
    hero: {
      title: "StepAudio 2.5 ASR: Bringing Speech Recognition into the Lightning Era",
      lead: "Powered by Multi-Token Prediction, with 500 token/s throughput, simultaneous gains in speed and accuracy, and transcription cost down to RMB 0.15 per hour.",
      actions: {
        demo: "Watch Video",
        cases: "Browse ASR Samples",
        online: "Try Online",
      },
      stats: ["Inference Speedup", "Throughput", "Inference Cost", "Context Window", "Single Pass Audio"],
    },
    highlights: {
      title: "Highlights",
      summary: "Faster decoding, stronger accuracy, and native long-form audio handling designed for real production environments.",
      cards: [
        {
          title: "Ultrafast Inference",
          body: "Deep integration between ASR and MTP-5 delivers much faster decoding and higher single-node throughput in real product traffic.",
          pills: ["Measured +400%", "500 token/s", "Cost -80%"],
        },
        {
          title: "SOTA Transcription Accuracy",
          body: "A carefully tuned 4B-scale model stays competitive across common Chinese and English transcription benchmarks.",
          pills: ["Stable bilingual ASR", "Terminology coverage", "Strong long-form ASR"],
        },
        {
          title: "Native Long-Form Audio",
          body: "Reusing the LLM's native 32K context window, the model can transcribe up to 30 minutes of audio in one pass.",
          pills: ["Native 32K context", "Up to 30 minutes", "Stable continuous decoding"],
        },
      ],
    },
    video: {
      title: "Video Showcase",
      summary: "A public-facing walkthrough of StepAudio 2.5 ASR, bringing together ultrafast transcription, strong robustness in challenging audio, long-form capability, and standout bilingual recognition in one complete showcase.",
    },
    examples: {
      title: "ASR Samples",
      featuredOutput: "Recognition Output",
      jump: "View full sample",
      tableHeaders: ["Sample", "Audio", "Transcript"],
      caseTitles: {
        "zh_tougue-twister1": "Chinese tongue twister",
        zh_high_speed: "Fast Chinese speech",
        zh_yueyu: "Cantonese",
        zh_sing_bgm: "Chinese singing with BGM",
        zh_noise_speech: "Chinese noisy speech",
        en_tougue_twister1: "English tongue twister 1",
        en_tougue_twister2: "English tongue twister 2",
        en_high_speed: "Fast English speech",
        en_noise_speech: "English noisy speech",
        en_sing_bgm: "English singing with BGM",
        zh_longform: "Chinese long-form",
        en_longform: "English long-form",
      },
      showcaseSections: {
        zh: {
          title: "Chinese Samples",
          summary: "Fast Chinese speech, Cantonese, noisy environments, and music-overlap cases that clearly demonstrate stable, accurate transcription in realistic listening conditions.",
        },
        en: {
          title: "English Samples",
          summary: "Tongue twisters, fast English speech, and noisy recordings that clearly showcase stable, accurate, high-quality transcription on complex spoken English.",
        },
        longform: {
          title: "Long-form Samples",
          summary: "Long continuous Chinese and English content that clearly demonstrates stable, complete, and high-quality transcription across extended context.",
        },
      },
    },
    benchmarks: {
      title: "Benchmarks",
      summary: "Core Chinese, English, and long-form results that clearly highlight StepAudio 2.5 ASR's leading accuracy and inference efficiency.",
      rtfTitle: "Inference Efficiency / Real Time Factor (RTF)",
      rtfSummary: "Measured with a single-card, single-concurrency setup. Lower RTF is better. Note: Doubao-ASR-2603 is evaluated via API, while all other models are locally deployed.",
      rtfNext: "Next best",
      summaryLabels: ["Chinese", "English", "Long-form"],
      titles: {
        zh: "Chinese",
        en: "English",
        longform: "Long-form",
      },
      metrics: {
        cer: "Average CER",
        wer: "Average WER",
      },
    },
    loadError: "Failed to load showcase data.",
    caseDetails: {
      "zh_tougue-twister1": {
        summary: "A Chinese tongue-twister clip that stresses dense syllable sequences and clean articulation.",
        tags: ["Chinese", "tongue twister", "rapid rhythm"],
      },
      zh_high_speed: {
        summary: "High-speed continuous speech with stable segmentation and complete transcription under dense information flow.",
        tags: ["Chinese", "fast speech", "continuous flow"],
      },
      zh_yueyu: {
        summary: "Cantonese conversational speech showing stability beyond standard Mandarin conditions.",
        tags: ["Cantonese", "dialect", "spoken style"],
      },
      zh_sing_bgm: {
        summary: "Speech mixed with music, testing the model's ability to focus on the dominant vocal signal.",
        tags: ["Chinese", "with BGM", "singing"],
      },
      zh_noise_speech: {
        summary: "Noisy real-world audio where the model still locks onto the target speaker content.",
        tags: ["Chinese", "noisy audio", "robustness"],
      },
      en_tougue_twister1: {
        summary: "An English tongue-twister case that stresses repeated patterns and similar phonetic units.",
        tags: ["English", "tongue twister", "dense repetition"],
      },
      en_tougue_twister2: {
        summary: "A highly confusable English phrase pattern for observing stability in tongue-twister recognition.",
        tags: ["English", "tongue twister", "complex pronunciation"],
      },
      en_high_speed: {
        summary: "Fast English news-style delivery that tests how well the model captures rapid information streams.",
        tags: ["English", "fast speech", "news-style"],
      },
      en_noise_speech: {
        summary: "Noisy English conversational audio that highlights robustness in consumer recording conditions.",
        tags: ["English", "noisy audio", "daily speech"],
      },
      en_sing_bgm: {
        summary: "English singing with background music, demonstrating mixed-source recognition behavior.",
        tags: ["English", "with BGM", "singing"],
      },
      fallback: {
        summary: "A playable recognition case showing the model's transcription behavior on real audio input.",
        tags: ["ASR case"],
      },
    },
  },
};

const BENCHMARK_SECTIONS = [
  {
    id: "zh",
    metricKey: "cer",
    datasets: ["aishell1", "aishell2_ios", "Wenet testnet", "Wenet testmeeting", "fleurs-zh"],
    models: [
      { name: "StepAudio 2.5 ASR", value: 2.97 },
      { name: "Qwen3 ASR (1.7B)", value: 3.17 },
      { name: "Doubao-ASR-2603", value: 3.34 },
      { name: "FunASR-Nano", value: 3.66 },
      { name: "VibeVoice-ASR", value: 10.19 },
    ],
  },
  {
    id: "en",
    metricKey: "wer",
    datasets: [
      "librispeech-clean",
      "librispeech-other",
      "common_voice_v11.0_en",
      "fleurs-en",
      "VoxPopuli_Cleaned_AA",
    ],
    models: [
      { name: "StepAudio 2.5 ASR", value: 3.68 },
      { name: "Qwen3 ASR (1.7B)", value: 3.85 },
      { name: "FunASR-Nano", value: 5.24 },
      { name: "Doubao-ASR-2603", value: 6.67 },
      { name: "VibeVoice-ASR", value: 7.14 },
    ],
  },
  {
    id: "longform",
    metricKey: "wer",
    datasets: [
      "librispeech-clean (long)",
      "librispeech-other (long)",
      "Wenet testnet (long)",
      "Earnings22_Cleaned_AA",
    ],
    models: [
      { name: "StepAudio 2.5 ASR", value: 3.7 },
      { name: "Qwen3 ASR (1.7B)", value: 4.2 },
      { name: "VibeVoice-ASR", value: 4.87 },
      { name: "FunASR-Nano", value: 5.59 },
      { name: "Doubao-ASR-2603", value: 6.11 },
    ],
  },
];

const RTF_BENCHMARK_MODELS = [
  {
    name: {
      zh: "VibeVoice-ASR",
      en: "VibeVoice-ASR",
    },
    value: 0.1039,
    displayValue: "0.1039",
  },
  {
    name: {
      zh: "FunASR-Nano",
      en: "FunASR-Nano",
    },
    value: 0.0591,
    displayValue: "0.0591",
  },
  {
    name: {
      zh: "Doubao-ASR-2603",
      en: "Doubao-ASR-2603",
    },
    value: 0.064,
    displayValue: "0.064",
  },
  {
    name: {
      zh: "Qwen3 ASR(1.7B)",
      en: "Qwen3 ASR(1.7B)",
    },
    value: 0.0094,
    displayValue: "0.0094",
  },
  {
    name: {
      zh: "StepAudio 2.5 ASR",
      en: "StepAudio 2.5 ASR",
    },
    value: 0.0053,
    displayValue: "0.0053",
  },
];

let currentLocale = "zh";
let showcaseData = null;
let navObserver = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMetric(value) {
  return Number(value).toFixed(2);
}

function formatBenchmarkValue(item) {
  if (item && item.displayValue !== undefined && item.displayValue !== null) {
    return String(item.displayValue);
  }

  return formatMetric(item?.value);
}

function getCopy() {
  return UI_COPY[currentLocale] || UI_COPY.zh;
}

function getSortedModels(models) {
  return [...models].sort((left, right) => left.value - right.value);
}

function getValuePosition(value, minValue, maxValue) {
  if (!Number.isFinite(value) || !Number.isFinite(minValue) || !Number.isFinite(maxValue) || minValue === maxValue) {
    return 6;
  }

  return 6 + (((value - minValue) / (maxValue - minValue)) * 88);
}

function normalizeData(data) {
  const cases = Array.isArray(data.cases) ? data.cases : [];
  const caseMap = new Map(cases.map((item) => [item.case_id, item]));
  const sections = Array.isArray(data.showcase_sections) ? data.showcase_sections : [];

  return {
    meta: data.meta || {},
    cases,
    caseMap,
    sections,
  };
}

function getInlineData() {
  if (typeof window === "undefined") {
    return null;
  }

  const inlineData = window[INLINE_DATA_KEY];
  return inlineData && typeof inlineData === "object" ? inlineData : null;
}

async function loadShowcaseData() {
  const inlineData = getInlineData();

  if (window.location.protocol === "file:" && inlineData) {
    return inlineData;
  }

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (inlineData) {
      console.warn("Falling back to inline showcase data.", error);
      return inlineData;
    }

    throw error;
  }
}

function buildMainRow(item) {
  const transcriptText = item.hyp_full || "—";
  const copy = getCopy();
  const displayTitle = copy.examples.caseTitles[item.case_id] || item.title || item.case_id;
  const isLongform = item.group_id === "longform-cases";
  const audioBlock = item.audio_path
    ? `
        <audio class="audio-player" controls preload="metadata" src="${escapeHtml(item.audio_path)}"></audio>
      `
    : '<span class="audio-empty">—</span>';

  return `
    <tr class="row-main" id="case-${escapeHtml(item.case_id)}">
      <td>
        <p class="scene-title">${escapeHtml(displayTitle)}</p>
      </td>
      <td>
        <div class="audio-cell">
          ${audioBlock}
        </div>
      </td>
      <td>
        <div class="result-cell">
          <div class="result-text${isLongform ? " result-text--scrollable" : ""}">${escapeHtml(transcriptText)}</div>
        </div>
      </td>
    </tr>
  `;
}

function getBenchmarkRows(models) {
  const displayModels = getSortedModels(models);
  const minValue = Math.min(...models.map((item) => item.value));
  const maxValue = Math.max(...models.map((item) => item.value));

  return displayModels
    .map((item) => {
      const isBest = item.value === minValue;
      const position = getValuePosition(item.value, minValue, maxValue);

      return `
        <div class="benchmark-row benchmark-row--metric${isBest ? " is-best" : ""}">
          <div class="benchmark-row__top">
            <span class="benchmark-model">${escapeHtml(item.name)}</span>
            <span class="benchmark-value">${escapeHtml(formatBenchmarkValue(item))}</span>
          </div>
          <div class="benchmark-track benchmark-track--metric">
            <span class="benchmark-point" style="left: ${position.toFixed(2)}%"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function getRtfRankingRows(models) {
  return getSortedModels(models)
    .slice(1)
    .map((item, index) => {
      return `
        <div class="rtf-rank-row">
          <span class="rtf-rank-row__index">#${index + 2}</span>
          <span class="rtf-rank-row__model">${escapeHtml(item.name)}</span>
          <span class="rtf-rank-row__value">${escapeHtml(formatBenchmarkValue(item))}</span>
        </div>
      `;
    })
    .join("");
}

function renderBenchmarks() {
  const container = document.querySelector("#benchmark-grid");
  const copy = getCopy();

  if (!container) {
    return;
  }

  container.innerHTML = BENCHMARK_SECTIONS.map((section) => {
    const rows = getBenchmarkRows(section.models);
    const datasetPills = section.datasets
      .map((dataset) => `<span class="meta-pill">${escapeHtml(dataset)}</span>`)
      .join("");
    const sectionTitle = copy.benchmarks.titles[section.id];
    const metricLabel = copy.benchmarks.metrics[section.metricKey];

    return `
      <article class="benchmark-card">
        <div class="benchmark-card__header">
          <h3>${escapeHtml(sectionTitle)}</h3>
          <span class="metric-pill">${escapeHtml(metricLabel)}</span>
        </div>
        <div class="benchmark-chart">
          ${rows}
        </div>
        <div class="benchmark-datasets">
          ${datasetPills}
        </div>
      </article>
    `;
  }).join("");
}

function renderRtfBenchmark() {
  const container = document.querySelector("#rtf-benchmark");
  const copy = getCopy();

  if (!container) {
    return;
  }

  const models = RTF_BENCHMARK_MODELS.map((item) => ({
    name: item.name[currentLocale] || item.name.zh,
    value: item.value,
    displayValue: Number(item.value).toFixed(3),
  }));
  const rankedModels = getSortedModels(models);
  const bestModel = rankedModels[0];
  const rankingRows = getRtfRankingRows(models);

  container.innerHTML = `
    <article class="benchmark-card benchmark-card--rtf">
      <div class="benchmark-card__header benchmark-card__header--stacked">
        <div>
          <h3>${escapeHtml(copy.benchmarks.rtfTitle)}</h3>
          <p class="benchmark-card__summary">${escapeHtml(copy.benchmarks.rtfSummary)}</p>
        </div>
        <span class="metric-pill">RTF</span>
      </div>
      <div class="rtf-list">
        <div class="rtf-hero">
          <div class="rtf-hero__main">
            <div class="rtf-hero__title">
              <span class="rtf-rank-row__index rtf-rank-row__index--hero">#1</span>
              <h4>${escapeHtml(bestModel.name)}</h4>
            </div>
            <strong>${escapeHtml(formatBenchmarkValue(bestModel))}</strong>
          </div>
        </div>
        ${
          rankingRows
            ? `<div class="rtf-ranking__list">
        ${rankingRows}
      </div>`
            : ""
        }
      </div>
    </article>
  `;
}

function buildSectionRows(section, caseMap) {
  const seen = new Set();
  return (section.groups || [])
    .flatMap((group) => group.case_ids || [])
    .filter((caseId) => {
      if (!caseId || seen.has(caseId)) {
        return false;
      }

      seen.add(caseId);
      return true;
    })
    .map((caseId) => caseMap.get(caseId))
    .filter(Boolean)
    .map((item) => buildMainRow(item))
    .join("");
}

function buildSectionTable(rows) {
  const copy = getCopy();

  if (!rows) {
    return "";
  }

  return `
    <div class="table-shell">
      <table class="showcase-table">
        <thead>
          <tr>
            <th>${escapeHtml(copy.examples.tableHeaders[0])}</th>
            <th>${escapeHtml(copy.examples.tableHeaders[1])}</th>
            <th>${escapeHtml(copy.examples.tableHeaders[2])}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderShowcaseSections(data) {
  const container = document.querySelector("#example-sections");
  const copy = getCopy();

  container.innerHTML = data.sections
    .map((section) => {
      const rows = buildSectionRows(section, data.caseMap);
      const table = buildSectionTable(rows);

      if (!table) {
        return "";
      }

      const meta = copy.examples.showcaseSections[section.id];

      return `
        <section class="language-section" id="${escapeHtml(section.id)}-cases">
          <div class="language-section__header">
            <h2>${escapeHtml(meta.title)}</h2>
            <p class="language-section__summary">${escapeHtml(meta.summary)}</p>
          </div>
          ${table}
        </section>
      `;
    })
    .join("");

}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value;
  }
}

function applyStaticCopy() {
  const copy = getCopy();
  document.documentElement.lang = currentLocale === "zh" ? "zh-CN" : "en";

  setText("nav-top-label", copy.nav.top);
  setText("nav-highlights-label", copy.nav.highlights);
  setText("nav-demo-label", copy.nav.demo);
  setText("nav-cases-label", copy.nav.cases);
  setText("nav-benchmarks-label", copy.nav.benchmarks);

  setText("hero-title", copy.hero.title);
  setText("hero-lead", copy.hero.lead);
  setText("hero-demo-link", copy.hero.actions.demo);
  setText("hero-cases-link", copy.hero.actions.cases);
  setText("hero-online-link", copy.hero.actions.online);
  copy.hero.stats.forEach((value, index) => setText(`stat-label-${index + 1}`, value));

  setText("highlights-title", copy.highlights.title);
  setText("highlights-summary", copy.highlights.summary);
  copy.highlights.cards.forEach((card, index) => {
    const cardIndex = index + 1;
    setText(`highlight-card-${cardIndex}-title`, card.title);
    setText(`highlight-card-${cardIndex}-body`, card.body);
    card.pills.forEach((pill, pillIndex) => setText(`highlight-card-${cardIndex}-pill-${pillIndex + 1}`, pill));
  });

  setText("video-title", copy.video.title);
  setText("video-summary", copy.video.summary);

  setText("examples-title", copy.examples.title);
  setText("benchmarks-title", copy.benchmarks.title);
  setText("benchmarks-summary", copy.benchmarks.summary);
  copy.benchmarks.summaryLabels.forEach((value, index) => setText(`benchmark-summary-label-${index + 1}`, value));
  setText("load-error", copy.loadError);
}

function updateLocaleSwitch() {
  document.querySelectorAll(".locale-switch__button").forEach((button) => {
    const isActive = button.dataset.locale === currentLocale;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setupSectionNav() {
  const links = [...document.querySelectorAll(".section-nav__link")];

  if (navObserver) {
    navObserver.disconnect();
    navObserver = null;
  }

  if (!links.length || typeof IntersectionObserver === "undefined") {
    return;
  }

  const targets = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!targets.length) {
    return;
  }

  const setActive = (id) => {
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);
    });
  };

  navObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (!visibleEntries.length) {
        return;
      }

      visibleEntries.sort((left, right) => right.intersectionRatio - left.intersectionRatio);
      setActive(visibleEntries[0].target.id);
    },
    {
      rootMargin: "-25% 0px -55% 0px",
      threshold: [0.1, 0.2, 0.35, 0.5],
    }
  );

  targets.forEach((target) => navObserver.observe(target));
  setActive("top");
}

function setupHeroVideoLink() {
  const trigger = document.getElementById("hero-demo-link");
  const player = document.querySelector(".media-demo-player");

  if (!trigger || !player || trigger.dataset.autoplayBound === "true") {
    return;
  }

  trigger.dataset.autoplayBound = "true";
  trigger.addEventListener("click", () => {
    player.currentTime = 0;
    const playPromise = player.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  });
}

function renderPage(data) {
  applyStaticCopy();
  updateLocaleSwitch();
  renderRtfBenchmark();
  renderBenchmarks();
  renderShowcaseSections(data);
  setupHeroVideoLink();
  setupSectionNav();
}

function setupLocaleSwitch(data) {
  document.querySelectorAll(".locale-switch__button").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLocale = button.dataset.locale;

      if (!nextLocale || nextLocale === currentLocale) {
        return;
      }

      currentLocale = nextLocale;
      renderPage(data);
    });
  });
}

async function init() {
  try {
    const rawData = await loadShowcaseData();
    showcaseData = normalizeData(rawData);
    setupLocaleSwitch(showcaseData);
    renderPage(showcaseData);
  } catch (error) {
    const errorNode = document.querySelector("#load-error");
    errorNode.classList.remove("hidden");
    applyStaticCopy();
    console.error(error);
  }
}

init();
