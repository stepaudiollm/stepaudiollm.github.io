const DATA_URL = "./mtp_asr_showcase_cases.json";
const BENCHMARK_SECTIONS = [
  {
    id: "zh",
    title: "中文",
    metric: "Average CER",
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
    title: "英文",
    metric: "Average WER",
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
    title: "长文",
    metric: "Average WER",
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDuration(durationSec) {
  if (durationSec === null || durationSec === undefined || Number.isNaN(Number(durationSec))) {
    return "时长未知";
  }

  return `${Number(durationSec).toFixed(2)}s`;
}

function formatMetric(value) {
  return Number(value).toFixed(2);
}

function getDisplayModels(models) {
  return [...models].sort((left, right) => {
    const leftIsStep = left.name === "StepAudio 2.5 ASR";
    const rightIsStep = right.name === "StepAudio 2.5 ASR";

    if (leftIsStep && !rightIsStep) {
      return -1;
    }

    if (!leftIsStep && rightIsStep) {
      return 1;
    }

    return left.value - right.value;
  });
}

function getPresentationWidths(models) {
  const ranked = [...models].sort((left, right) => left.value - right.value);
  const widthByName = new Map();
  const baseWidths = [100, 88, 76, 64, 52];

  ranked.forEach((item, index) => {
    const fallbackWidth = Math.max(40, 100 - index * 12);
    widthByName.set(item.name, baseWidths[index] ?? fallbackWidth);
  });

  return widthByName;
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

function buildMainRow(item) {
  const transcriptText = item.hyp_full || "—";
  const durationLabel = item.audio_path ? "时长加载中" : "时长未知";
  const audioBlock = item.audio_path
    ? `
        <audio class="audio-player" controls preload="metadata" src="${escapeHtml(item.audio_path)}"></audio>
      `
    : '<span class="audio-empty">—</span>';

  return `
    <tr class="row-main">
      <td>
        <p class="scene-title">${escapeHtml(item.title || item.case_id)}</p>
        <div class="scene-meta">
          <span class="meta-pill js-duration">${escapeHtml(durationLabel)}</span>
        </div>
      </td>
      <td>
        <div class="audio-cell">
          ${audioBlock}
        </div>
      </td>
      <td>
        <div class="result-cell">
          <div class="result-text">${escapeHtml(transcriptText)}</div>
        </div>
      </td>
    </tr>
  `;
}

function bindAudioDurations(root) {
  root.querySelectorAll(".row-main").forEach((row) => {
    const audio = row.querySelector(".audio-player");
    const durationNode = row.querySelector(".js-duration");

    if (!audio || !durationNode) {
      return;
    }

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        durationNode.textContent = formatDuration(audio.duration);
        return;
      }

      durationNode.textContent = "时长未知";
    };

    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("error", () => {
      durationNode.textContent = "时长未知";
    });

    if (audio.readyState >= 1) {
      syncDuration();
    }
  });
}

function getBenchmarkRows(models) {
  const displayModels = getDisplayModels(models);
  const widthByName = getPresentationWidths(models);
  const minValue = Math.min(...models.map((item) => item.value));

  return displayModels
    .map((item) => {
      const width = widthByName.get(item.name) ?? 48;
      const isBest = item.value === minValue;

      return `
        <div class="benchmark-row${isBest ? " is-best" : ""}">
          <div class="benchmark-row__top">
            <span class="benchmark-model">${escapeHtml(item.name)}</span>
            <span class="benchmark-value">${escapeHtml(formatMetric(item.value))}</span>
          </div>
          <div class="benchmark-track">
            <span class="benchmark-bar" style="width: ${width.toFixed(2)}%"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderBenchmarks() {
  const container = document.querySelector("#benchmark-grid");

  if (!container) {
    return;
  }

  container.innerHTML = BENCHMARK_SECTIONS.map((section) => {
    const rows = getBenchmarkRows(section.models);
    const datasetPills = section.datasets
      .map((dataset) => `<span class="meta-pill">${escapeHtml(dataset)}</span>`)
      .join("");

    return `
      <article class="benchmark-card">
        <div class="benchmark-card__header">
          <h3>${escapeHtml(section.title)}</h3>
          <span class="metric-pill">${escapeHtml(section.metric)}</span>
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

function buildGroup(group, caseMap) {
  const rows = (group.case_ids || [])
    .map((caseId) => caseMap.get(caseId))
    .filter(Boolean)
    .map((item) => buildMainRow(item))
    .join("");

  if (!rows) {
    return "";
  }

  return `
    <article class="example-block">
      <div class="example-block__header">
        <h3>${escapeHtml(group.title || group.id)}</h3>
      </div>
      <div class="table-shell">
        <table class="showcase-table">
          <thead>
            <tr>
              <th>场景</th>
              <th>音频</th>
              <th>识别结果</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function renderShowcaseSections(data) {
  const container = document.querySelector("#example-sections");

  container.innerHTML = data.sections
    .map((section) => {
      const groups = (section.groups || []).map((group) => buildGroup(group, data.caseMap)).join("");

      if (!groups) {
        return "";
      }

      return `
        <section class="language-section">
          <div class="language-section__header">
            <h2>${escapeHtml(section.title || section.id)}</h2>
          </div>
          <div class="example-sections">
            ${groups}
          </div>
        </section>
      `;
    })
    .join("");

  bindAudioDurations(container);
}

function updateFooter(data) {
  const footer = document.querySelector("#footer-meta");
  footer.textContent = `${data.cases.length} curated playable cases · ${data.sections.length} showcase sections · StepAudio 2.5 ASR`;
}

async function init() {
  renderBenchmarks();

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const rawData = await response.json();
    const data = normalizeData(rawData);

    renderShowcaseSections(data);
    updateFooter(data);
  } catch (error) {
    const errorNode = document.querySelector("#load-error");
    errorNode.classList.remove("hidden");
    console.error(error);
  }
}

init();
