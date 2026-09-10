/* Studio renderListen 的首页适配：保留四组案例、原始卡片和同一个播放器。 */
import { SECTIONS, TRACKS } from './data.js';
import { t, onLangChange } from './i18n.js';
import { cardHTML, esc } from './ui.js';
import { initPlayer, playTrack, openNP } from './player.js';
import { state } from './audio.js';

export function initShowcase() {
  const host = document.getElementById('listenShowcase');

  function render() {
    host.innerHTML = SECTIONS.map(sec => `
      <section class="listen-section" aria-labelledby="listen-${sec.id}">
        <div class="cap-head"><div>
          <h3 id="listen-${sec.id}">${esc(t('sec.' + sec.id))}</h3>
          <p>${esc(t('sec.' + sec.id + '.desc'))}</p>
        </div></div>
        <div class="grid" data-sec="${sec.id}">
          ${TRACKS.filter(x => x.section === sec.id).map(tr => cardHTML(tr, { showRef: true })).join('')}
        </div>
      </section>`).join('');
    host.querySelectorAll('.card').forEach(card => {
      card.setAttribute('aria-current', String(card.dataset.id === state.track?.id));
    });
    const labels = {
      plTT: 'player.expand', plExpand: 'player.expand', npClose: 'player.close',
      plClose: 'player.close', plPrev: 'player.prev', npPrev: 'player.prev',
      plNext: 'player.next', npNext: 'player.next',
      plDownload: 'player.download', npDownload: 'player.download',
      plVol: 'player.volume',
    };
    for (const [id, key] of Object.entries(labels)) {
      document.getElementById(id).setAttribute('aria-label', t(key));
    }
  }

  host.addEventListener('click', event => {
    const card = event.target.closest('.card');
    if (!card) return;
    const list = TRACKS.filter(x => x.section === card.closest('.grid').dataset.sec);
    const track = list.find(x => x.id === card.dataset.id);
    if (!track) return;
    playTrack(track, list);
    if (event.target.closest('.card-ref')) openNP();
  });

  initPlayer();
  render();
  onLangChange(render);
}
