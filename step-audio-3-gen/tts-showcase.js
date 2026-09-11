import { initVoiceOrbFlow } from './voice-orb-flow.js?v=20260911-cool-orbs-1'

export function initTtsShowcase({ playerController, getCopy }) {
  const root = document.querySelector('#tts-showcase')
  if (!root || !playerController) return
  const buttons = [...root.querySelectorAll('[data-tts-select]')]
  const panels = [...root.querySelectorAll('[data-tts-result]')]
  const flow = initVoiceOrbFlow(root, panels)
  const preparing = new WeakSet()
  const prepare = async (panel) => {
    if (preparing.has(panel)) return
    preparing.add(panel)
    try {
      const image = panel.querySelector('.voice-orb-texture')
      await image.decode()
      await flow.prepare(panel, image)
    } catch {
      preparing.delete(panel)
    }
  }
  const sync = () => {
    const copy = getCopy()
    panels.forEach(panel => {
      const button = panel.querySelector('[data-player-toggle]')
      button.title = panel.classList.contains('is-error') ? copy.ttsRetry
        : panel.classList.contains('is-loading') ? copy.ttsLoading : ''
      button.setAttribute('aria-pressed', String(playerController.isPlaybackRequested(panel)))
    })
  }
  const select = (button) => {
    const changed = button.getAttribute('aria-pressed') !== 'true'
    if (changed) playerController.pauseAll()
    buttons.forEach(item => {
      const active = item === button
      item.setAttribute('aria-pressed', String(active))
      item.parentElement.classList.toggle('is-selected', active)
    })
    panels.forEach(panel => {
      const active = panel.dataset.ttsResult === button.dataset.ttsSelect
      panel.hidden = !active
      panel.classList.toggle('is-active', active)
      if (active) void prepare(panel)
    })
    sync()
  }
  // Clear other players' in-flight requests before starting this one.
  // Preserve the current player's request so a second click can cancel it.
  root.addEventListener('click', event => {
    const toggle = event.target.closest('[data-player-toggle]')
    if (!toggle) return
    const player = toggle.closest('[data-inline-player]')
    if (!playerController.isPlaybackRequested(player)) playerController.pauseAll()
  }, true)
  root.addEventListener('stepaudio3:player-state', sync)
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(button))
    button.addEventListener('keydown', event => {
      const offset = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 0
      if (!offset && !['Home', 'End'].includes(event.key)) return
      event.preventDefault()
      event.stopPropagation()
      const next = buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + offset + buttons.length) % buttons.length]
      next.focus()
      select(next)
    })
  })
  window.addEventListener('stepaudio3:product-language-change', sync)
  window.addEventListener('pagehide', () => window.removeEventListener('stepaudio3:product-language-change', sync), { once: true })
  select(buttons.find(button => button.getAttribute('aria-pressed') === 'true') || buttons[0])
}
