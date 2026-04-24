const MODEL_CARD_CONTENT = window.MODEL_CARD_CONTENT;
let currentLocale = 'zh';
let navObserver = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getContent() {
  return MODEL_CARD_CONTENT[currentLocale] || MODEL_CARD_CONTENT.zh;
}

function linkFor(key) {
  return MODEL_CARD_CONTENT.links[key];
}

function tableHtml(table, highlightRow, extraClass = '', columnWeights = null) {
  const className = ['table-wrap', extraClass].filter(Boolean).join(' ');
  const colgroup = Array.isArray(columnWeights) && columnWeights.length === table.columns.length
    ? (() => {
        const totalWeight = columnWeights.reduce((sum, weight) => sum + weight, 0);
        return `
          <colgroup>
            ${columnWeights
              .map((weight) => `<col style="width: ${(weight / totalWeight) * 100}%">`)
              .join('')}
          </colgroup>
        `;
      })()
    : '';

  return `
    <div class="${className}">
      <table class="data-table">
        ${colgroup}
        <thead>
          <tr>
            ${table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${table.rows
            .map((row) => {
              const isHighlight = highlightRow && row[0] === highlightRow;
              return `
                <tr${isHighlight ? ' class="is-highlight"' : ''}>
                  ${row
                    .map((value, index) => (index === 0 ? `<th>${escapeHtml(value)}</th>` : `<td>${escapeHtml(value)}</td>`))
                    .join('')}
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function codePanel(title, code, copyLabel) {
  return `
    <div class="code-panel">
      <div class="code-panel__header">
        <span>${escapeHtml(title)}</span>
        <button class="copy-button" type="button" data-copy="${escapeHtml(code)}">${escapeHtml(copyLabel)}</button>
      </div>
      <pre><code>${escapeHtml(code)}</code></pre>
    </div>
  `;
}

function renderNav(content) {
  const nav = document.getElementById('section-nav');
  nav.innerHTML = `
    <div class="top-nav__list">
      ${content.nav
        .map(
          (item) =>
            `<a class="top-nav__link" href="#${escapeHtml(item.id)}" data-target="${escapeHtml(item.id)}">${escapeHtml(item.label)}</a>`,
        )
        .join('')}
    </div>
  `;
}

function renderSidebar(content) {
  document.getElementById('sidebar-note').innerHTML = `<p>${escapeHtml(content.sidebarNote)}</p>`;
}

function renderSectionTitle(title) {
  return `
    <div class="section-heading">
      <h2>${escapeHtml(title)}</h2>
    </div>
  `;
}

function renderEntryBody(entry) {
  const paragraphs = (entry.paragraphs || []).map((text) => `<p>${escapeHtml(text)}</p>`).join('');
  const items = entry.items?.length
    ? `<ul class="bullet-list">${entry.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '';

  return `
    ${paragraphs}
    ${items}
  `;
}

function renderFieldRow(entry) {
  const hasTerm = Boolean(entry.term);

  return `
    <div class="field-row${hasTerm ? '' : ' field-row--full'}">
      ${hasTerm ? `<h3 class="field-term">${escapeHtml(entry.term)}</h3>` : ''}
      <div class="field-body">
        ${renderEntryBody(entry)}
      </div>
    </div>
  `;
}

function renderFieldList(entries) {
  return `<div class="field-list">${entries.map(renderFieldRow).join('')}</div>`;
}

function renderEntryFlow(entries) {
  return `
    <div class="prose-stack">
      ${entries.map(renderEntryBody).join('')}
    </div>
  `;
}

function renderEntries(entries) {
  return entries.every((entry) => !entry.term) ? renderEntryFlow(entries) : renderFieldList(entries);
}

function renderProseSection(section) {
  return `
    ${renderSectionTitle(section.title)}
    <div class="prose-stack">
      ${renderEntryBody(section)}
    </div>
  `;
}

function renderHeader(content) {
  const target = document.getElementById('header-content');
  target.innerHTML = `
    <p class="header-eyebrow">${escapeHtml(content.header.subtitle)}</p>
    <h1>${escapeHtml(content.header.title)}</h1>
    <p class="header-intro">${escapeHtml(content.header.intro)}</p>
    <ul class="meta-list">
      ${content.header.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}
    </ul>
    <p class="supporting-links">
      ${content.header.links
        .map(
          (link, index) =>
            `<a href="${escapeHtml(linkFor(link.hrefKey))}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>${index < content.header.links.length - 1 ? '<span class="separator">·</span>' : ''}`,
        )
        .join('')}
    </p>
  `;
}

function renderBasicSection(targetId, section) {
  const target = document.getElementById(targetId);
  target.innerHTML = `
    ${renderSectionTitle(section.title)}
    ${renderEntries(section.entries)}
  `;
}

function renderModelInformation(content) {
  const target = document.getElementById('model-information-content');
  target.innerHTML = renderProseSection(content.modelInformation);
}

function renderModelData(content) {
  const target = document.getElementById('model-data-content');
  target.innerHTML = `
    ${renderSectionTitle(content.modelData.title)}
    ${renderEntries(content.modelData.entries)}
  `;
}

function benchmarkColumnWeights(columnCount) {
  const referenceWeight = 1.35;
  const referenceColumnCount = 6;
  const remainingColumnCount = Math.max(0, columnCount - 1);
  if (!remainingColumnCount) {
    return [referenceWeight];
  }

  const referenceRatio = referenceWeight / (referenceWeight + (referenceColumnCount - 1));
  const modelWeight = Number(((referenceRatio * remainingColumnCount) / (1 - referenceRatio)).toFixed(2));
  return [modelWeight, ...Array.from({ length: remainingColumnCount }, () => 1)];
}

function renderEvaluation(content) {
  const target = document.getElementById('evaluation-content');
  const protocolSection = content.evaluation.protocolItems?.length
    ? `
      <section class="subsection subsection--detail">
        <h3 class="subsection-title">${escapeHtml(content.evaluation.protocolTitle)}</h3>
        <ul class="bullet-list">
          ${content.evaluation.protocolItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </section>
    `
    : '';
  const acceptedLengthSection = content.evaluation.acceptedLengthItems?.length
    ? `
      <section class="subsection subsection--detail">
        <h3 class="subsection-title">${escapeHtml(content.evaluation.acceptedLengthTitle)}</h3>
        <ul class="bullet-list">
          ${content.evaluation.acceptedLengthItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </section>
    `
    : '';
  const ablationSection = content.evaluation.ablationItems?.length
    ? `
      <section class="subsection subsection--detail">
        <h3 class="subsection-title">${escapeHtml(content.evaluation.ablationTitle)}</h3>
        <ul class="bullet-list">
          ${content.evaluation.ablationItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
        ${content.evaluation.ablationTable ? tableHtml(content.evaluation.ablationTable, content.evaluation.ablationTable.highlightRow, 'table-wrap--plain table-wrap--compact') : ''}
      </section>
    `
    : '';

  target.innerHTML = `
    ${renderSectionTitle(content.evaluation.title)}
    ${renderEntries(content.evaluation.entries)}
    ${content.evaluation.suites
      .map(
        (suite) => `
          <section class="subsection subsection--benchmark">
            <h3 class="subsection-title">${escapeHtml(suite.title)}</h3>
            ${tableHtml(
              { columns: suite.columns, rows: suite.rows },
              suite.highlightRow,
              'table-wrap--plain table-wrap--compact',
              benchmarkColumnWeights(suite.columns.length),
            )}
          </section>
        `,
      )
      .join('')}
    ${protocolSection}
    ${acceptedLengthSection}
    ${ablationSection}
  `;
}

function renderDistribution(content) {
  const target = document.getElementById('distribution-content');

  target.innerHTML = `
    ${renderSectionTitle(content.distribution.title)}
    ${renderFieldList(content.distribution.entries)}
    <section class="subsection">
      <h3 class="subsection-title">${escapeHtml(content.distribution.channelTitle)}</h3>
      ${tableHtml(content.distribution.channelTable, null, 'table-wrap--plain')}
    </section>
    <p class="supporting-links supporting-links--block">
      <a href="${escapeHtml(linkFor('apiDocs'))}" target="_blank" rel="noreferrer">${escapeHtml(content.distribution.docsLabel)}</a>
    </p>
  `;
}

function renderFooter(content) {
  document.getElementById('footer').textContent = content.footer;
}

function updateMeta(content) {
  document.documentElement.lang = currentLocale === 'zh' ? 'zh-CN' : 'en';
  document.title = content.meta.pageTitle;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute('content', content.meta.pageDescription);
  }
}

function bindCopyButtons() {
  document.querySelectorAll('.copy-button').forEach((button) => {
    button.onclick = async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy || '');
        const original = button.textContent;
        button.textContent = currentLocale === 'zh' ? '已复制' : 'Copied';
        window.setTimeout(() => {
          button.textContent = original;
        }, 1200);
      } catch {
        button.textContent = currentLocale === 'zh' ? '失败' : 'Failed';
        window.setTimeout(() => {
          button.textContent = currentLocale === 'zh' ? '复制' : 'Copy';
        }, 1200);
      }
    };
  });
}

function setupLocaleSwitch() {
  document.querySelectorAll('.locale-switch__button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.locale === currentLocale);
    button.onclick = () => {
      if (button.dataset.locale && button.dataset.locale !== currentLocale) {
        currentLocale = button.dataset.locale;
        renderPage();
      }
    };
  });
}

function setupNavObserver() {
  if (navObserver) {
    navObserver.disconnect();
  }

  const sections = document.querySelectorAll('section[id], footer[id], header[id]');
  const links = Array.from(document.querySelectorAll('.top-nav__link'));

  navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      links.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.target === visible.target.id);
      });
    },
    {
      rootMargin: '-18% 0px -58% 0px',
      threshold: [0.18, 0.45, 0.7],
    },
  );

  sections.forEach((section) => navObserver.observe(section));
}

function renderPage() {
  const content = getContent();
  updateMeta(content);
  renderNav(content);
  renderSidebar(content);
  renderHeader(content);
  renderModelInformation(content);
  renderModelData(content);
  renderEvaluation(content);
  renderDistribution(content);
  renderBasicSection('intended-usage-limitations-content', content.intendedUsageLimitations);
  renderBasicSection('ethics-content-safety-content', content.ethicsContentSafety);
  renderFooter(content);
  setupLocaleSwitch();
  bindCopyButtons();
  setupNavObserver();
}

renderPage();
