import { benchmarkModels } from './benchmark-data.js?v=20260910-vd-table4-1';
const panels = document.querySelectorAll('.benchmark-dataset');
const labels = {
  zh: { metrics: ['声学属性控制', '描述式风格控制', '角色扮演'], chart: '指令遵循准确率' },
  en: { metrics: ['Acoustic parameters', 'Descriptive-Style Directive', 'Role-playing'], chart: 'Instruction-following accuracy' },
};
const score = (value) => Number.isInteger(value * 10) ? value.toFixed(1) : value.toFixed(2);
function renderChart(panel) {
  const dataset = panel.dataset.benchmarkDataset;
  const chart = panel.querySelector('.benchmark-chart');
  const lang = document.documentElement.lang === 'en' ? 'en' : 'zh';
  const t = labels[lang];
  const models = benchmarkModels.filter(model => model[dataset]);
  const legend = panel.querySelector('.benchmark-legend');
  legend.replaceChildren(...models.map(model => {
    const item = document.createElement('span');
    item.className = model.id === 'step' ? 'is-step' : '';
    const swatch = document.createElement('i'); swatch.style.background = model.color;
    item.append(swatch, model.name); return item;
  }));
  const W = 1040, H = 370, left = 44, right = 16, top = 30, bottom = 76;
  const plotH = H - top - bottom, groupW = (W-left-right)/3;
  const barW = Math.min(38, (groupW - 70) / models.length - 9);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="benchmark-svg-title-${dataset} benchmark-svg-desc-${dataset}"><title id="benchmark-svg-title-${dataset}">InstructTTSEval-${dataset.toUpperCase()} — ${t.chart}</title><desc id="benchmark-svg-desc-${dataset}">${models.map(m=>`${m.name}: APS ${score(m[dataset][0])}%, DSD ${score(m[dataset][1])}%, RP ${score(m[dataset][2])}%`).join('; ')}</desc>`;
  for(let tick=0;tick<=100;tick+=20){const y=top+plotH*(1-tick/100);svg+=`<line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}" stroke="#e9edf2"/><text x="${left-12}" y="${y+4}" text-anchor="end" class="chart-tick">${tick}</text>`;}
  ['APS','DSD','RP'].forEach((metric, index) => {
    const center = left + groupW*(index+.5);
    const total = models.length*(barW+9)-9;
    models.forEach((model,i)=>{
      const value = model[dataset][index], height = plotH*value/100, x = center-total/2+i*(barW+9), y = top+plotH-height;
      svg+=`<rect data-model="${model.id}" data-metric="${metric}" data-value="${value}" x="${x}" y="${y}" width="${barW}" height="${height}" rx="3" fill="${model.color}"><title>${model.name} · ${metric}: ${score(value)}%</title></rect><text x="${x+barW/2}" y="${y-9}" text-anchor="middle" class="chart-value${model.id==='step'?' is-step':''}">${score(value)}</text>`;
    });
    svg+=`<text x="${center}" y="${H-42}" text-anchor="middle" class="chart-metric">${metric}</text><text x="${center}" y="${H-20}" text-anchor="middle" class="chart-label">${t.metrics[index]}</text>`;
  });
  chart.innerHTML=svg+'</svg>';
}
function render() { panels.forEach(renderChart); }
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
render();
