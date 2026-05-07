// 自定义音频播放器：同时只允许一个在播，404 时显示"即将上线"
// 用法：createAudioPlayer({ src, name }) → HTMLElement

let currentPlaying = null;

const PLAY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
const PAUSE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>`;

function checkAudioExists(src) {
  return new Promise((resolve) => {
    const audio = new Audio();
    let done = false;
    const finish = (ok) => { if (!done) { done = true; resolve(ok); } };
    audio.addEventListener('loadedmetadata', () => finish(true), { once: true });
    audio.addEventListener('error', () => finish(false), { once: true });
    audio.preload = 'metadata';
    audio.src = src;
    // 兜底超时
    setTimeout(() => finish(false), 2500);
  });
}

export function createAudioPlayer({ src, name }) {
  const root = document.createElement('div');
  root.className = 'audio-player disabled';
  root.innerHTML = `
    <button class="audio-btn" type="button" aria-label="play">${PLAY_ICON}</button>
    <div class="audio-info">
      <div class="audio-name">${name}</div>
      <div class="audio-progress"><div class="audio-progress-bar"></div></div>
    </div>
    <span class="audio-hint">即将上线</span>
  `;

  const btn = root.querySelector('.audio-btn');
  const bar = root.querySelector('.audio-progress-bar');
  const hint = root.querySelector('.audio-hint');

  let audio = null;

  checkAudioExists(src).then((ok) => {
    if (!ok) return;
    root.classList.remove('disabled');
    hint.remove();
    audio = new Audio(src);
    audio.preload = 'none';

    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        bar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
      }
    });
    audio.addEventListener('ended', () => {
      root.classList.remove('playing');
      btn.innerHTML = PLAY_ICON;
      bar.style.width = '0%';
    });
    audio.addEventListener('pause', () => {
      root.classList.remove('playing');
      btn.innerHTML = PLAY_ICON;
    });
    audio.addEventListener('play', () => {
      root.classList.add('playing');
      btn.innerHTML = PAUSE_ICON;
    });

    btn.addEventListener('click', () => {
      if (audio.paused) {
        if (currentPlaying && currentPlaying !== audio) {
          currentPlaying.pause();
        }
        audio.play().catch(() => {});
        currentPlaying = audio;
      } else {
        audio.pause();
      }
    });
  });

  btn.addEventListener('click', (e) => {
    if (root.classList.contains('disabled')) {
      e.preventDefault();
      // 轻微抖动提示
      root.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }],
        { duration: 220 }
      );
    }
  });

  return root;
}
