(() => {
  const data = window.CONTEXTUAL_TTS_PAGE_DATA;

  if (!data) {
    return;
  }

  const byId = (id) => document.getElementById(id);
  const isChinesePage = document.documentElement.lang?.toLowerCase().startsWith("zh");
  const edgeNoteCopy = isChinesePage
    ? {
        context: "控制整体表达方式，不直接被朗读",
        script: "合成文本"
      }
    : {
        context: "Controls how it's expressed, not what is read",
        script: "Text for synthesis"
      };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const renderScriptText = (value) => {
    const text = String(value ?? "");
    const parts = text.split(/(（[^（）]*）|\([^()]*\))/g).filter(Boolean);

    return parts
      .map((part) =>
        /^(（[^（）]*）|\([^()]*\))$/.test(part)
          ? `<span class="inline-context-mark">${escapeHtml(part)}</span>`
          : escapeHtml(part)
      )
      .join("");
  };

  const renderContextText = (value) =>
    `<span class="inline-context-mark inline-context-mark--context">${escapeHtml(value ?? "")}</span>`;

  const renderFeatures = (features) =>
    features
      .map(
        (feature) => `
          <article class="feature-card">
            <p class="feature-card__body">
              <strong class="feature-card__title-inline">${escapeHtml(feature.title)}：</strong>${escapeHtml(feature.body)}
            </p>
          </article>
        `
      )
      .join("");

  const renderKeywords = (keywords) =>
    keywords
      .map(
        (keyword) => `
          <article class="keyword-card">
            <p class="keyword-card__name">${escapeHtml(keyword.name)}</p>
            ${keyword.note ? `<p class="keyword-card__note">${escapeHtml(keyword.note)}</p>` : ""}
          </article>
        `
      )
      .join("");

  const renderAudio = (src) =>
    `<audio controls preload="none" controlslist="nodownload noplaybackrate noremoteplayback" disableremoteplayback playsinline src="${escapeHtml(src)}"></audio>`;

  const renderContextNote = () =>
    `<span class="text-panel__edge-note text-panel__edge-note--context">${escapeHtml(edgeNoteCopy.context)}</span>`;

  const renderScriptNote = () =>
    `<span class="text-panel__edge-note text-panel__edge-note--script">${escapeHtml(edgeNoteCopy.script)}</span>`;

  const renderSectionDescription = (description) => {
    if (description && typeof description === "object" && !Array.isArray(description)) {
      if (description.type === "bullet-list") {
        return {
          html: description.items
            .map(
              (item) => `<span class="block-description__item">${escapeHtml(item)}</span>`
            )
            .join(""),
          classes: [
            "block-description--list",
            ...(description.highlightFirst === false ? ["block-description--list-plain"] : [])
          ]
        };
      }

      if (description.type === "nested-list") {
        return {
          html: `
            <div class="block-description__intro-list">
              ${description.intro
                .map((item) => `<span class="block-description__item">${escapeHtml(item)}</span>`)
                .join("")}
            </div>
            <div class="block-description__group-list">
              ${description.groups
                .map(
                  (group) => `
                    <section class="block-description__group">
                      <span class="block-description__group-title">${escapeHtml(group.title)}</span>
                      <div class="block-description__sublist">
                        ${group.items
                          .map(
                            (item) => `
                              <span class="block-description__subitem">${escapeHtml(item)}</span>
                            `
                          )
                          .join("")}
                      </div>
                    </section>
                  `
                )
                .join("")}
            </div>
          `,
          classes: ["block-description--nested"]
        };
      }

      if (description.type === "capability-spotlight") {
        return {
          html: `
            <div class="block-description__intro">
              ${description.intro
                .map(
                  (item, index) => `
                    <p class="${index === 0 ? "block-description__lead" : "block-description__copy"}">
                      ${escapeHtml(item)}
                    </p>
                  `
                )
                .join("")}
            </div>
            <div class="block-description__band-list">
              ${description.bands
                .map(
                  (item) => `
                    <p class="block-description__line">
                      <span class="block-description__line-label">${escapeHtml(item.label)}</span>
                      <span class="block-description__line-copy">${escapeHtml(item.text)}</span>
                    </p>
                  `
                )
                .join("")}
            </div>
            <div class="block-description__pillar-list">
              ${description.pillars
                .map(
                  (item, index) => `
                    <section class="block-description__text-block">
                      <p class="block-description__text-title">
                        <span class="block-description__text-index">${escapeHtml(item.index || String(index + 1))}.</span>
                        <span class="block-description__text-heading">${escapeHtml(item.title)}</span>
                      </p>
                      <div class="block-description__pillar-items">
                        ${item.items
                          .map(
                            (point) => `
                              <p class="block-description__pillar-item">${escapeHtml(point)}</p>
                            `
                          )
                          .join("")}
                      </div>
                    </section>
                  `
                )
                .join("")}
            </div>
          `,
          classes: ["block-description--spotlight"]
        };
      }
    }

    if (Array.isArray(description)) {
      return {
        html: description
          .map(
            (item) => `<span class="block-description__item">${escapeHtml(item)}</span>`
          )
          .join(""),
        classes: ["block-description--list"]
      };
    }

    return {
      html: `<span class="block-description__copy">${escapeHtml(description || "")}</span>`,
      classes: []
    };
  };

  const sidebarSections = isChinesePage
    ? [
        { id: "top", label: "回到概览" },
        { id: "global-demo", label: "一文多境" },
        { id: "local-demo", label: "一人多面" },
        { id: "scenes-demo", label: "多场景适配" },
        { id: "persona-demo", label: "多人设适配" }
      ]
    : [
        { id: "top", label: "Back to Overview" },
        { id: "global-demo", label: "One Text, Countless Expressions" },
        { id: "local-demo", label: "One Voice, Multiple Personas" },
        { id: "scenes-demo", label: "Multi-Scenario Adaptability" },
        { id: "persona-demo", label: "Multi-Persona Adaptation" }
      ];

  const renderSharedPromptGroup = (group, options = {}) => `
    <section class="shared-prompt-group" id="${escapeHtml(group.id || "")}">
      ${group.label ? `<p class="shared-prompt-group__label">${escapeHtml(group.label)}</p>` : ""}
      <div class="shared-prompt-row">
        <div class="text-panel text-panel--prompt">
          <span class="text-panel__label">Prompt Text</span>
          <p>${escapeHtml(group.sharedPrompt.text)}</p>
        </div>
        <div class="audio-panel audio-panel--prompt">
          <span class="audio-panel__label">Prompt Audio</span>
          ${renderAudio(group.sharedPrompt.audio)}
        </div>
      </div>

      <div class="shared-case-list">
        ${group.cases
          .map(
            (item) => `
              <article class="shared-case-row" id="${escapeHtml(item.id)}">
                <div class="shared-case-row__grid">
                  <div class="shared-case-row__texts">
                    <div class="text-panel text-panel--context">
                      <span class="text-panel__label">Global Context</span>
                      <p>${renderContextText(item.director)}</p>
                      ${renderContextNote()}
                    </div>
                    <div class="text-panel text-panel--script">
                      <span class="text-panel__label">${escapeHtml(options.scriptLabel || "Script")}</span>
                      <p>${renderScriptText(item.script)}</p>
                      ${renderScriptNote()}
                    </div>
                  </div>
                  <div class="output-panel output-panel--result">
                    <span class="audio-panel__label">Synthesis Audio</span>
                    ${renderAudio(item.outputAudio)}
                  </div>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;

  const renderSharedPromptCases = (section) => {
    if (section.layout === "shared-prompt-groups") {
      return `<div class="shared-prompt-group-list">${section.promptGroups
        .map((group) => renderSharedPromptGroup(group, { scriptLabel: section.scriptLabel }))
        .join("")}</div>`;
    }

    const sharedPrompt = section.sharedPrompt || {
      text: section.cases[0]?.promptText || "",
      audio: section.cases[0]?.promptAudio || ""
    };

    return renderSharedPromptGroup({
      id: section.id || "",
      sharedPrompt,
      cases: section.cases
    }, { scriptLabel: section.scriptLabel });
  };

  const renderCases = (cases, options = {}) =>
    cases
      .map(
        (item, index) => `
          <article class="case-card" id="${escapeHtml(item.id)}">
            <div class="case-card__head">
              <span class="case-card__index">Case ${index + 1}</span>
              <h3 class="case-card__title">${escapeHtml(item.title)}</h3>
            </div>

            <div class="case-card__body">
              <div class="text-panel text-panel--prompt case-card__prompt">
                <span class="text-panel__label">Prompt Text</span>
                <p>${escapeHtml(item.promptText)}</p>
              </div>

              <div class="audio-panel audio-panel--prompt case-card__prompt-audio">
                <span class="audio-panel__label">Prompt Audio</span>
                ${renderAudio(item.promptAudio)}
              </div>

              <div class="text-panel text-panel--context case-card__context">
                <span class="text-panel__label">Global Context</span>
                <p>${renderContextText(item.director)}</p>
                ${renderContextNote()}
              </div>

              <div class="text-panel text-panel--script case-card__script">
                <span class="text-panel__label">${escapeHtml(item.scriptLabel || options.scriptLabel || "Script")}</span>
                <p>${renderScriptText(item.script)}</p>
                ${renderScriptNote()}
              </div>

              <div class="output-panel output-panel--result case-card__result">
                <span class="audio-panel__label">Synthesis Audio</span>
                ${renderAudio(item.outputAudio)}
              </div>
            </div>
          </article>
        `
      )
      .join("");

  const renderHero = () => {
    byId("hero-kicker").textContent = data.hero.kicker;
    byId("hero-title").textContent = data.hero.title;
    byId("hero-lead").textContent = data.hero.lead;
    byId("hero-description").textContent = data.hero.description;
    const featureList = byId("feature-list");
    const keywordGrid = byId("keyword-grid");

    if (featureList) {
      featureList.innerHTML = renderFeatures(data.hero.features);
    }

    if (keywordGrid) {
      keywordGrid.innerHTML = renderKeywords(data.hero.keywords);
    }
  };

  const renderSidebar = () => {
    const sidebar = byId("demo-sidebar");

    if (!sidebar) {
      return;
    }

    sidebar.innerHTML = `
      <p class="demo-sidebar__title">Demo Nav</p>
      <div class="demo-sidebar__links">
        ${sidebarSections
          .map(
            (item) => `
              <a class="demo-sidebar__link" href="#${escapeHtml(item.id)}" data-demo-nav="${escapeHtml(item.id)}">
                ${escapeHtml(item.label)}
              </a>
            `
          )
          .join("")}
      </div>
    `;
  };

  const renderSection = (prefix, section) => {
    const kicker = byId(`${prefix}-kicker`);
    const title = byId(`${prefix}-title`);
    const description = byId(`${prefix}-description`);
    const cases = byId(`${prefix}-cases`);

    if (!kicker || !title || !description || !cases) {
      return;
    }

    kicker.textContent = section.kicker;
    title.textContent = section.title;
    const renderedDescription = renderSectionDescription(section.description);
    description.innerHTML = renderedDescription.html;
    description.classList.remove("block-description--list", "block-description--spotlight");
    renderedDescription.classes.forEach((className) => description.classList.add(className));
    cases.innerHTML =
      section.layout && section.layout.startsWith("shared-prompt")
        ? renderSharedPromptCases(section)
        : renderCases(section.cases, { scriptLabel: section.scriptLabel });
  };

  const bindSidebarActiveState = () => {
    const links = new Map(
      [...document.querySelectorAll("[data-demo-nav]")].map((node) => [node.dataset.demoNav, node])
    );

    if (!links.size) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          links.forEach((link) => link.classList.remove("is-active"));
          const link = links.get(entry.target.id);
          if (link) {
            link.classList.add("is-active");
          }
        });
      },
      {
        rootMargin: "-18% 0px -68% 0px",
        threshold: 0
      }
    );

    sidebarSections
      .filter((item) => item.id !== "top")
      .forEach((item) => {
      const section = byId(item.id);
      if (section) {
        observer.observe(section);
      }
      });

    const topLink = links.get("top");
    const setTopState = () => {
      if (!topLink) {
        return;
      }

      if (window.scrollY < 240) {
        links.forEach((link) => link.classList.remove("is-active"));
        topLink.classList.add("is-active");
      }
    };

    setTopState();
    window.addEventListener("scroll", setTopState, { passive: true });
  };

  const bindSharedPromptLinkedHover = () => {
    const groups = document.querySelectorAll(
      "#global-demo .shared-prompt-group, #local-demo .shared-prompt-group"
    );

    if (!groups.length) {
      return;
    }

    const timers = new WeakMap();

    const clearTimer = (group) => {
      const timerId = timers.get(group);

      if (timerId) {
        window.clearTimeout(timerId);
        timers.delete(group);
      }
    };

    const deactivate = (group) => {
      clearTimer(group);
      group.classList.remove("is-prompt-linked-active");
    };

    const activate = (group, retrigger = false) => {
      clearTimer(group);

      if (!retrigger) {
        group.classList.add("is-prompt-linked-active");
        return;
      }

      group.classList.remove("is-prompt-linked-active");

      const timerId = window.setTimeout(() => {
        group.classList.add("is-prompt-linked-active");
        timers.delete(group);
      }, 48);

      timers.set(group, timerId);
    };

    groups.forEach((group) => {
      group.addEventListener("pointerleave", () => {
        deactivate(group);
      });

      group.addEventListener("focusout", () => {
        window.setTimeout(() => {
          if (!group.contains(document.activeElement)) {
            deactivate(group);
          }
        }, 0);
      });

      group.querySelectorAll(".shared-case-row").forEach((row) => {
        row.addEventListener("pointerenter", () => {
          activate(group, group.classList.contains("is-prompt-linked-active"));
        });

        row.addEventListener("focusin", () => {
          activate(group, group.classList.contains("is-prompt-linked-active"));
        });
      });
    });
  };

  const bindAudioProtection = () => {
    const audioPanels = document.querySelectorAll(".audio-panel, .output-panel");
    const audios = document.querySelectorAll("audio");

    if (!audios.length) {
      return;
    }

    audioPanels.forEach((panel) => {
      panel.addEventListener("contextmenu", (event) => {
        event.preventDefault();
      });

      panel.addEventListener("dragstart", (event) => {
        event.preventDefault();
      });
    });

    audios.forEach((audio) => {
      audio.setAttribute(
        "controlslist",
        "nodownload noplaybackrate noremoteplayback"
      );
      audio.setAttribute("disableremoteplayback", "");
      audio.setAttribute("playsinline", "");

      if ("disableRemotePlayback" in audio) {
        audio.disableRemotePlayback = true;
      }

      audio.addEventListener("contextmenu", (event) => {
        event.preventDefault();
      });

      audio.addEventListener("dragstart", (event) => {
        event.preventDefault();
      });
    });
  };

  renderHero();
  renderSidebar();
  renderSection("scenes", data.sections.scenes);
  renderSection("persona", data.sections.persona);
  renderSection("global", data.sections.global);
  renderSection("local", data.sections.local);
  bindAudioProtection();
  bindSidebarActiveState();
  bindSharedPromptLinkedHover();
})();
