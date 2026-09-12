import { initVoiceOrbFlow } from './voice-orb-flow.js?v=20260912-tts-male-additions-31'

export function initTtsShowcase({ playerController, getCopy }) {
  const root = document.querySelector('#tts-showcase')
  if (!root || !playerController) return
  const list = root.querySelector('.tts-reference-list')
  const buttons = [...root.querySelectorAll('[data-tts-select]')]
  const panels = [...root.querySelectorAll('[data-tts-result]')]
  if (!list || !buttons.length || !panels.length) return
  const caseTrack = root.querySelector('.tts-case-track')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const scrollToPage = (track, index, smooth = true) => track.scrollTo({ left: index * track.clientWidth, behavior: smooth && !reduced.matches ? 'smooth' : 'instant' })
  const casePager = root.querySelector('[data-tts-case-pager]')
  const casePrev = root.querySelector('[data-tts-case-prev]')
  const caseNext = root.querySelector('[data-tts-case-next]')
  const flow = initVoiceOrbFlow(root, panels)
  const preparing = new WeakSet()
  let ordered = buttons
  let selected = null
  let activePanel = null
  let activeCases = []
  let caseIndex = 0
  const language = () => document.body.dataset.language === 'zh' ? 'zh' : 'en'
  const preferLanguage = (items, getLanguage) => window.stepAudioProductCopy.preferLanguage(items, getLanguage, language())
  const prepare = async (panel) => {
    if (preparing.has(panel)) return
    preparing.add(panel)
    try {
      const image = panel.querySelector('.voice-orb-texture')
      await image.decode()
      if (!panel.classList.contains('is-active')) { preparing.delete(panel); return }
      await flow.prepare(panel, image)
      if (!panel.classList.contains('is-active')) { flow.release(panel); preparing.delete(panel) }
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
  const syncPagination = () => {
    const copy = getCopy()
    casePager.hidden = activeCases.length <= 1
    root.querySelector('.tts-output-pane').classList.toggle('has-case-pagination', activeCases.length > 1)
    casePrev.disabled = caseIndex === 0
    caseNext.disabled = caseIndex === activeCases.length - 1
    casePrev.setAttribute('aria-label', copy.ttsPreviousText)
    caseNext.setAttribute('aria-label', copy.ttsNextText)
    const caseStatus = root.querySelector('[data-tts-case-status]')
    caseStatus.textContent = `${caseIndex + 1} / ${activeCases.length}`
    caseStatus.setAttribute('aria-label', `${copy.ttsExampleLabel} ${caseIndex + 1} / ${activeCases.length}`)
  }
  const showCase = (index, smooth = true, scroll = true) => {
    const panel = activeCases[index]
    if (!panel) return
    if (activePanel !== panel) {
      playerController.pauseAll()
      if (activePanel) { flow.release(activePanel); preparing.delete(activePanel) }
    }
    caseIndex = index
    activePanel = panel
    panels.forEach(item => {
      const active = item === panel
      item.hidden = !activeCases.includes(item)
      item.inert = !active
      item.setAttribute('aria-hidden', String(!active))
      item.classList.toggle('is-active', active)
    })
    if (scroll) scrollToPage(caseTrack, index, smooth)
    selected.setAttribute('aria-controls', panel.id)
    panel.querySelector('.tts-transcript').scrollTop = 0
    void prepare(panel)
    syncPagination()
    sync()
  }
  const revealSelected = () => {
    if (!selected) return
    const bounds = list.getBoundingClientRect()
    const row = selected.parentElement.getBoundingClientRect()
    const top = row.top - bounds.top + list.scrollTop
    if (top < list.scrollTop) list.scrollTop = top
    else if (top + row.height > list.scrollTop + list.clientHeight) {
      list.scrollTop = top + row.height - list.clientHeight
    }
  }
  const select = (button) => {
    const changed = selected !== button
    if (changed) playerController.pauseAll()
    selected = button
    buttons.forEach(item => {
      const active = item === button
      item.setAttribute('aria-pressed', String(active))
      item.parentElement.classList.toggle('is-selected', active)
    })
    activeCases = preferLanguage(panels.filter(panel =>
      (panel.dataset.ttsVoice || panel.dataset.ttsResult) === button.dataset.ttsSelect),
    panel => panel.querySelector('.tts-transcript').lang)
    activeCases.forEach(panel => caseTrack.append(panel))
    showCase(changed ? 0 : Math.max(0, activeCases.indexOf(activePanel)), false)
    revealSelected()
  }
  const selectLanguageGroup = (group) => {
    playerController.pauseAll()
    ordered = window.stepAudioProductCopy.setTtsLanguageGroup(buttons, group, language())
    list.scrollTop = 0
    selected = null
    select(ordered[0])
  }
  const resetLanguage = () => selectLanguageGroup(language())
  root.querySelectorAll('[data-tts-language-group]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') !== 'true') selectLanguageGroup(button.dataset.ttsLanguageGroup)
    })
  })
  const settleCases = () => {
    if (!caseTrack.clientWidth) return
    const next = Math.round(caseTrack.scrollLeft / caseTrack.clientWidth)
    if (next !== caseIndex) showCase(next, false, false)
  }
  caseTrack.addEventListener('scrollend', settleCases)
  const resize = new ResizeObserver(() => {
    revealSelected()
    scrollToPage(caseTrack, caseIndex, false)
  })
  resize.observe(list)
  resize.observe(caseTrack)
  casePrev.addEventListener('click', () => showCase(caseIndex - 1))
  caseNext.addEventListener('click', () => showCase(caseIndex + 1))
  // Cancel other in-flight playback before a new player starts, preserving
  // the current request so a second click can cancel its own loading state.
  root.addEventListener('click', event => {
    const toggle = event.target.closest('[data-player-toggle]')
    if (!toggle) return
    const player = toggle.closest('[data-inline-player]')
    if (!playerController.isPlaybackRequested(player)) playerController.pauseAll()
  }, true)
  root.addEventListener('stepaudio3:player-state', sync)
  buttons.forEach(button => {
    button.addEventListener('click', () => select(button))
    button.addEventListener('keydown', event => {
      const offset = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 0
      if (!offset && !['Home', 'End'].includes(event.key)) return
      event.preventDefault()
      event.stopPropagation()
      const index = ordered.indexOf(button)
      const next = ordered[event.key === 'Home' ? 0 : event.key === 'End' ? ordered.length - 1 : (index + offset + ordered.length) % ordered.length]
      select(next)
      next.focus({ preventScroll: true })
    })
  })
  window.addEventListener('stepaudio3:product-language-change', resetLanguage)
  window.addEventListener('pagehide', () => {
    resize.disconnect()
    window.removeEventListener('stepaudio3:product-language-change', resetLanguage)
  }, { once: true })
  resetLanguage()
}
