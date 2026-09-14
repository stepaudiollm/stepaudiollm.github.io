import { initVoiceOrbFlow } from './voice-orb-flow.js?v=20260911-cool-orbs-1'

export const initVoiceOrbCarousel = ({
  pausePlayers,
  playPlayer,
  isPlaybackRequested,
  getCopy,
  getTitle,
  getCaption,
  syncPlayerLanguage,
  syncScript,
} = {}) => {
  const root = document.querySelector('[data-voice-orb-carousel]')
  const stage = root?.querySelector('[data-voice-orb-stage]')
  const slides = root ? [...root.querySelectorAll('[data-voice-orb-slide]')] : []
  if (!root || !stage || slides.length === 0) return
  const flow = initVoiceOrbFlow(root, slides)

  let activeIndex = Math.min(slides.length - 1, Math.max(0, Number(root.dataset.initialIndex) || 0))
  const previous = root.querySelector('[data-voice-orb-prev]')
  const next = root.querySelector('[data-voice-orb-next]')
  const captionViewport = root.querySelector('[data-orb-caption-viewport]')
  captionViewport?.querySelectorAll('[data-boot-caption]').forEach(caption => caption.remove())
  const announcement = root.querySelector('[data-orb-announcement]')
  const captions = slides.map(slide => {
    const element = document.createElement('div')
    element.className = 'voice-orb-caption'
    element.dataset.voice = slide.dataset.inlinePlayer
    element.append(document.createElement('strong'), document.createElement('p'))
    captionViewport?.append(element)
    return element
  })
  const fitCaptions = () => {
    const height = Math.max(114, ...captions.map(element => element.offsetHeight));
    root.style.setProperty('--voice-caption-height', `${height}px`);
  }
  const captionResizeObserver = new ResizeObserver(fitCaptions);
  captions.forEach(element => captionResizeObserver.observe(element));
  let suppressClickUntil = 0

  let grainTask = null
  const prepareGrain = (retry = false) => {
    if (!grainTask) {
      const decodeGrain = async (extension) => {
        const image = new Image()
        const url = new URL(`./assets/voice-orbs/noise.${extension}`, import.meta.url)
        if (retry) url.searchParams.set('retry', String(Date.now()))
        image.src = url.href
        await image.decode()
        return url
      }
      grainTask = decodeGrain('avif').catch(() => decodeGrain('png')).then((url) => {
        root.style.setProperty('--voice-orb-noise', `url("${url.href}")`)
      }).catch((error) => {
        grainTask = null
        throw error
      })
    }
    return grainTask
  }

  const syncTextureStatus = (slide) => {
    const copy = getCopy?.() || {}
    const state = slide.dataset.orbState
    const status = slide.querySelector('[data-voice-orb-status]')
    const button = slide.querySelector('[data-player-toggle]')
    const message = state === 'error'
      ? copy.orbLoadFailed || 'Preview unavailable · Click to retry'
      : state === 'loading' ? copy.orbLoading || 'Loading preview' : ''
    if (status) status.textContent = message
    button?.setAttribute('aria-busy', String(state === 'loading'))
    if (slide.classList.contains('is-active') && message) button?.setAttribute('aria-label', message)
  }

  const prepareTexture = async (slide, retry = false) => {
    const image = slide.querySelector('[data-voice-orb-texture]')
    if (!image || (retry && slide.dataset.orbState === 'loading')) return
    slide.dataset.orbState = 'loading'
    syncTextureStatus(slide)
    if (retry) {
      const url = new URL(image.src)
      url.searchParams.set('retry', String(Date.now()))
      image.src = url.href
    }
    try {
      await Promise.all([image.decode(), prepareGrain(retry)])
      await flow.prepare(slide, image, retry)
      slide.dataset.orbState = 'ready'
      if (slide.classList.contains('is-active')) syncPlayerLanguage?.(slide)
    } catch {
      slide.dataset.orbState = 'error'
    }
    syncTextureStatus(slide)
  }

  const clampIndex = index => Math.max(0, Math.min(slides.length - 1, index))
  // Fixed slots keep every voice on its own side of the finite rail.
  const slotOffset = delta => Math.sign(delta) * [0, 1, 36.75 / 21.375, 47.5 / 21.375][Math.min(3, Math.abs(delta))]

  const render = () => {
    const copy = getCopy?.() || {}
    slides.forEach((slide, index) => {
      const delta = index - activeIndex
      const active = delta === 0
      slide.classList.toggle('is-active', active)
      slide.classList.toggle('is-prev', delta === -1)
      slide.classList.toggle('is-next', delta === 1)
      slide.classList.toggle('is-far-prev', delta === -2)
      slide.classList.toggle('is-far-next', delta === 2)
      slide.classList.toggle('is-away', Math.abs(delta) > 2)
      slide.style.setProperty('--voice-slide-x', `calc(var(--voice-orb-step) * ${slotOffset(delta)})`)
      slide.setAttribute('aria-hidden', String(Math.abs(delta) > 1))
      slide.setAttribute('aria-current', active ? 'true' : 'false')
      const button = slide.querySelector('[data-player-toggle]')
      if (button) {
        button.disabled = Math.abs(delta) > 1
        button.tabIndex = active ? 0 : -1
        if (active) syncPlayerLanguage?.(slide)
        else {
          const title = getTitle?.(slide.dataset.inlinePlayer) || slide.dataset.inlinePlayer
          const action = copy.play || 'Play'
          button.setAttribute('aria-label', `${action}${copy.play === '播放' ? '' : ' '}${title}`)
        }
      }
      syncTextureStatus(slide)
    })
    captions.forEach((element, index) => {
      const delta = index - activeIndex
      const caption = getCaption?.(slides[index].dataset.inlinePlayer)
      element.querySelector('strong').textContent = caption?.title || getTitle?.(slides[index].dataset.inlinePlayer) || ''
      element.querySelector('p').textContent = caption?.description || ''
      element.dataset.orbCaption = String(delta)
      element.classList.toggle('is-current', delta === 0)
      element.classList.toggle('is-away', Math.abs(delta) > 1)
      element.setAttribute('aria-hidden', String(Math.abs(delta) > 1))
      element.style.setProperty('--caption-offset', `calc(var(--voice-orb-step) * ${delta})`)
    })
    if (previous) previous.disabled = activeIndex === 0
    if (next) next.disabled = activeIndex === slides.length - 1
    if (announcement) announcement.textContent = getTitle?.(slides[activeIndex].dataset.inlinePlayer) || ''
    root.dataset.activeIndex = String(activeIndex)
    syncScript?.(slides[activeIndex].dataset.inlinePlayer)
  }

  const goTo = (index, { focus = false, audition = false } = {}) => {
    const nextIndex = clampIndex(index)
    if (nextIndex === activeIndex) return
    const continuePlaying = audition || isPlaybackRequested?.(slides[activeIndex]) || slides[activeIndex].classList.contains('is-playing')
    pausePlayers?.()
    activeIndex = nextIndex
    render()
    flow.holdTransition()
    const selected = slides[activeIndex]
    if (focus) selected.querySelector('[data-player-toggle]')?.focus({ preventScroll: true })
    if (continuePlaying) {
      const media = selected.querySelector('audio')
      if (media?.readyState) media.currentTime = 0
      playPlayer?.(selected)
    }
  }

  root.addEventListener('click', (event) => {
    if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); return }
    const slide = event.target.closest?.('[data-voice-orb-slide]')
    if (!slide || !root.contains(slide)) return
    const index = slides.indexOf(slide)
    if (index < 0 || Math.abs(index - activeIndex) > 1) return
    if (index === activeIndex) {
      if (!event.target.closest('[data-player-toggle]') || slide.dataset.orbState === 'ready') return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (slide.dataset.orbState === 'error') void prepareTexture(slide, true)
      return
    }
    event.preventDefault()
    event.stopImmediatePropagation()
    goTo(index, { audition: true })
  }, true)

  previous?.addEventListener('click', () => goTo(activeIndex - 1))
  next?.addEventListener('click', () => goTo(activeIndex + 1))

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    goTo(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1), { focus: true })
  })

  let drag = null
  stage.addEventListener('dragstart', event => event.preventDefault())
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY }
  })
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return
    const dx = Math.abs(event.clientX - drag.x), dy = Math.abs(event.clientY - drag.y)
    if (dx >= 24 && dx > dy) stage.setPointerCapture(event.pointerId)
  })
  stage.addEventListener('pointerup', event => {
    if (!drag || event.pointerId !== drag.id) return
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y
    drag = null
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId)
    if (Math.abs(dx) < 24 || Math.abs(dx) <= Math.abs(dy)) return
    suppressClickUntil = performance.now() + 300
    goTo(activeIndex + (dx > 0 ? -1 : 1))
  })
  stage.addEventListener('pointercancel', () => { drag = null })

  window.addEventListener('stepaudio3:product-language-change', render)
  window.addEventListener('pagehide', () => {
    window.removeEventListener('stepaudio3:product-language-change', render)
  }, { once: true })

  render()
  slides.forEach((slide) => { void prepareTexture(slide) })
}
