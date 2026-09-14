import { initVocalCards } from './vocal-cards.js?v=20260912-vocal-no-arrows-38'
import { initTtsShowcase } from './tts-showcase.js?v=20260912-tts-male-additions-31'
import WaveSurfer from './vendor/wavesurfer.esm.js'
import { vibePeaks } from './vibe-peaks.js?v=20260911-stacked-scenes-7'
import { sceneMusicalPeaks } from './scene-musical-peaks.js?v=20260828-1'
import { initVoiceOrbCarousel } from './voice-orbs.js?v=20260914-vd-script-39'
import { createSceneVideoPlayback } from './scene-video.js?v=20260909-case-video-recovery-1'

const gsap = window.gsap
const ScrollTrigger = window.ScrollTrigger
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const heroCopyRevealTime = 2.5

if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger)
document.body.classList.add('is-ready')

const presets = {
  vocalOpera: {"title": "怒焰咏叹", "kind": "歌声 Vocal", "duration": "00:16", "src": "./audio/vocal-showcase/vocal-aria-of-fury.wav"},
  vocalNeon: {"title": "霓虹未眠", "kind": "歌声 Vocal", "duration": "00:30", "src": "./audio/vocal-showcase/vocal-neon-afterglow.wav"},

  ttsResult12: {"title": "自然男声", "kind": "TTS", "duration": "00:23", "src": "./audio/tts-showcase/tts-natural-male-generated.wav"},
  ttsResult13: {"title": "宿舍男声", "kind": "TTS", "duration": "00:17", "src": "./audio/tts-showcase/tts-dorm-male-generated.wav"},

  teahouseCrosstalk: {"title": "茶馆相声", "kind": "全要素声场", "duration": "00:49", "src": "./audio/vibespeech/vibespeech-teahouse-crosstalk.wav?v=20260911-full-scene-6"},
  vocalBeWell: { title: '你要好好的', kind: '歌声 Vocal', duration: '00:07', src: './audio/vocal-showcase/vocal-be-well.mp3' },
  ttsResult3: {"title": "清朗男声", "kind": "TTS", "duration": "00:18", "src": "./audio/tts-showcase/tts-candid-generated.wav"},
  ttsResult4: {"title": "温暖女声", "kind": "TTS", "duration": "00:26", "src": "./audio/tts-showcase/tts-warmth-generated.wav"},
  ttsResult11: {"title": "Mellow Lady", "kind": "TTS", "duration": "00:14", "src": "./audio/tts-showcase/tts-mellow-lady-generated.wav"},
  ttsResult10: {"title": "Noble Cast", "kind": "TTS", "duration": "00:22", "src": "./audio/tts-showcase/tts-noble-cast-generated.wav"},
  ttsResult9: {"title": "Lively Girl", "kind": "TTS", "duration": "00:15", "src": "./audio/tts-showcase/tts-lively-generated.wav"},
  ttsResult7: {"title": "Nick", "kind": "TTS", "duration": "00:22", "src": "./audio/tts-showcase/tts-nick-generated.wav"},
  ttsResult8: {"title": "Dacey", "kind": "TTS", "duration": "00:16", "src": "./audio/tts-showcase/tts-dacey-generated.wav"},
  roommatePodcast: {"title": "纽约室友播客", "kind": "全要素声场", "duration": "00:47", "src": "./audio/vibespeech/vibespeech-new-york-roommate-podcast.wav?v=20260911-selected-full-scenes-2"},
  surfingFinal: {"title": "巨浪决赛", "kind": "全要素声场", "duration": "00:44", "src": "./audio/vibespeech/vibespeech-big-wave-surfing-final.wav?v=20260911-selected-full-scenes-2"},
  overpassCall: {"title": "天桥夜话", "kind": "全要素声场", "duration": "01:04", "src": "./audio/vibespeech/vibespeech-overpass-night-call.wav?v=20260911-selected-full-scenes-2"},
  oldBuilding: {"title": "旧楼往事", "kind": "全要素声场", "duration": "01:03", "src": "./audio/vibespeech/vibespeech-old-building-reckoning.wav?v=20260911-selected-full-scenes-2"},
  vocalMom: {"title": "家书", "kind": "歌声 Vocal", "duration": "00:08", "src": "./audio/vocal-showcase/vocal-home-is-fine.wav"},
  englishBrightGirl: {"title": "元气少女", "kind": "音色设计", "duration": "00:06", "src": "./audio/vd-showcase/vd-bright-young-voice.wav"},
  ttsResult1: {"title": "清隽女声", "kind": "TTS", "duration": "00:26", "src": "./audio/tts-showcase/tts-softspoken-generated.wav"},
  ttsResult2: {"title": "轻熟女声", "kind": "TTS", "duration": "00:44", "src": "./audio/tts-showcase/tts-poise-generated.wav"},
  ttsResult5: {"title": "Lisa", "kind": "TTS", "duration": "00:22", "src": "./audio/tts-showcase/tts-lilt-generated.wav?v=20260911-english-tts-refresh-1"},
  ttsResult6: {"title": "Jake", "kind": "TTS", "duration": "00:18", "src": "./audio/tts-showcase/tts-jake-generated.wav"},
  lofi: { title: '午夜 Lo-fi', kind: '音乐', duration: '00:32', src: './audio/music/music-midnight-lofi.wav' },
  forest: { title: '森林鸟鸣', kind: '音效', duration: '00:05', src: './audio/sound-effects/sfx-forest-birds.wav' },
  sfxRain: { title: '棚顶落雨', kind: '音效', duration: '00:06', src: './audio/sound-effects/sfx-roof-rain.wav' },
  sfxStream: { title: '林间溪流', kind: '音效', duration: '00:06', src: './audio/sound-effects/sfx-forest-stream.wav' },
  sfxTrees: { title: '风穿树梢', kind: '音效', duration: '00:05', src: './audio/sound-effects/sfx-wind-in-trees.wav' },
  sfxImpact: { title: '重物坠地', kind: '音效', duration: '00:01', src: './audio/sound-effects/sfx-heavy-impact.wav' },
  musicCyberpunk: { title: '霓虹追逐', kind: '音乐', duration: '00:49', src: './audio/music/music-neon-chase.wav' },
  musicDesert: { title: '沙漠商队', kind: '音乐', duration: '00:40', src: './audio/music/music-desert-caravan.wav' },
  musicPiano: { title: '旧日钢琴', kind: '音乐', duration: '00:23', src: './audio/music/music-old-piano.wav' },
  musicTango: { title: '午夜探戈', kind: '音乐', duration: '00:21', src: './audio/music/music-midnight-tango.wav' },
  vocalFinalGoodbye: { title: '告别余温', kind: '歌声 Vocal', duration: '00:14', src: './audio/vocal-showcase/vocal-warmth-of-goodbye.mp3' },
  vocalBossa: { title: '椰风午后', kind: '歌声 Vocal', duration: '00:13', src: './audio/vocal-showcase/vocal-coconut-afternoon.wav' },
  vocalBirthday: { title: '偷偷说生日快乐', kind: '人声 Vocal', duration: '00:20', src: './audio/vocal-showcase/vocal-whispered-happy-birthday.wav' },
  breakfastStall: { title: '清晨煎饼摊', kind: '市井双人对话', duration: '00:21', src: './audio/vibespeech/vibespeech-breakfast-stall.wav' },
  nightFoodStall: {"title": "夏夜大排档", "kind": "全要素声场", "duration": "00:25", "src": "./audio/vibespeech/vibespeech-summer-night-food-stall.wav?v=20260911-selected-full-scenes-2"},
  nightApron: { title: '夜间停机坪', kind: '专业媒介与空间层次', duration: '00:29', src: './audio/vibespeech/vibespeech-night-apron.wav' },
  riversideRun: { title: '江边晨跑', kind: '运动状态与真实呼吸', duration: '00:40', src: './audio/vibespeech/vibespeech-riverside-morning-run.mp3' },
  rainMarket: { title: '暴雨菜市场', kind: '写实现场连线', duration: '00:39', src: './audio/vibespeech/vibespeech-rainy-market.mp3' },
  sceneMusical: { title: '音乐剧首演前', kind: '多要素声场', duration: '00:41', src: './audio/vibespeech/vibespeech-before-the-musical-premiere.mp3' },
  child: { title: "童真男孩", kind: '音色设计', duration: '00:26', src: './audio/vd-showcase/vd-playful-boy.wav' },
  dialect: { title: "东北青年", kind: '音色设计', duration: '00:07', src: './audio/vd-showcase/vd-northeastern-voice.wav' },
  elder: { title: "病榻老人", kind: '音色设计', duration: '00:30', src: './audio/vd-showcase/vd-frail-elder.wav' },
  velvetFemale: { title: "温柔女中音", kind: '音色设计', duration: '00:10', src: './audio/vd-showcase/vd-gentle-alto.wav' },
  nightRadio: { title: "深夜电台", kind: '音色设计', duration: '00:27', src: './audio/vd-showcase/vd-late-night-radio.wav' },
  wearyElder: { title: "疲惫独白", kind: '音色设计', duration: '00:07', src: './audio/vd-showcase/vd-weary-monologue.wav' },
}

const productLanguageKey = 'stepaudio3-gen.language'
const { productCopy, presetCopy } = window.stepAudioProductCopy


let productLanguage = 'en'
try {
  const savedLanguage = localStorage.getItem(productLanguageKey)
  if (savedLanguage === 'zh' || savedLanguage === 'en') productLanguage = savedLanguage
} catch {}

const languageIndex = () => productLanguage === 'en' ? 1 : 0
const copyFor = () => productCopy[productLanguage]
const presetText = (id, field = 'title') => presetCopy[id]?.[field]?.[languageIndex()] || presets[id]?.title || id
const actionLabel = (action, title) => productLanguage === 'en' ? `${action} ${title}` : `${action}${title}`
const waveformLabel = (title) => productLanguage === 'en' ? `${title} ${copyFor().audioWaveform}` : `${title}${copyFor().audioWaveform}`

const syncPlayerLanguage = (root) => {
  const id = root.dataset.inlinePlayer
  const title = presetText(id)
  const copy = copyFor()
  const action = root.classList.contains('is-playing')
    ? copy.pause
    : root.classList.contains('is-error')
      ? copy.retry
      : copy.play
  root.querySelector('[data-player-toggle]')?.setAttribute('aria-label', actionLabel(action, title))
  root.querySelector('[data-player-waveform]')?.setAttribute('aria-label', waveformLabel(title))
  const time = root.querySelector('[data-player-time]')
  if (time && root.classList.contains('is-loading')) {
    const progress = root.style.getPropertyValue('--player-load').trim() || '0%'
    time.textContent = `${copy.preparingAudio} ${progress}`
  } else if (time && root.classList.contains('is-error')) {
    time.textContent = copy.loadFailed
  }
}

const applyProductLanguage = () => {
  const copy = copyFor()
  document.documentElement.lang = productLanguage === 'en' ? 'en' : 'zh-CN'
  document.body.dataset.language = productLanguage
  document.title = copy.pageTitle
  document.querySelector('meta[name="description"]')?.setAttribute('content', copy.pageDescription)

  document.querySelectorAll('[data-product-i18n]').forEach((element) => {
    const value = copy[element.dataset.productI18n]
    if (value) element.textContent = value
  })
  document.querySelectorAll('[data-product-i18n-html]').forEach((element) => {
    const value = copy[element.dataset.productI18nHtml]
    if (typeof value === 'string') element.innerHTML = value
  })

  const toggle = document.querySelector('#product-language-toggle')
  if (toggle) {
    toggle.dataset.language = productLanguage
    toggle.setAttribute('aria-label', copy.languageLabel)
    toggle.querySelectorAll('[data-product-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.productLanguage === productLanguage))
    })
  }

  const apiLink = document.querySelector('#header-api-link')
  if (apiLink) {
    apiLink.href = copy.apiHref
    apiLink.setAttribute('aria-label', copy.apiLabel)
  }

  // The Chinese Voice Studio entry is live; the English entry intentionally
  // remains a non-link and exposes the localized Coming Soon status.
  const experienceAvailable = productLanguage === 'zh' && Boolean(copy.experienceHref)
  ;[
    ['#header-experience-link', '#header-experience-status'],
    ['#closing-experience-link', '#closing-experience-status'],
  ].forEach(([linkSelector, statusSelector]) => {
    const link = document.querySelector(linkSelector)
    const status = document.querySelector(statusSelector)
    if (!link) return
    if (experienceAvailable) {
      link.href = copy.experienceHref
      link.removeAttribute('aria-disabled')
      link.removeAttribute('data-coming-soon')
      link.removeAttribute('tabindex')
      if (status) status.hidden = true
    } else {
      link.removeAttribute('href')
      link.setAttribute('aria-disabled', 'true')
      link.setAttribute('data-coming-soon', '')
      link.setAttribute('tabindex', '0')
      if (status) status.hidden = false
    }
  })

  document.querySelector('.tts-reference-list')?.setAttribute('aria-label', copy.ttsReferenceList)
  document.querySelector('.brand')?.setAttribute('aria-label', copy.brandHome)
  document.querySelector('[data-vibe-carousel]')?.setAttribute('aria-label', copy.featuredRegion)
  document.querySelector('[data-vibe-coverflow]')?.setAttribute('aria-label', copy.caseCovers)
  document.querySelector('.voice-design-gallery')?.setAttribute('aria-label', copy.voiceGallery)
  document.querySelector('.voice-orb-stage')?.setAttribute('aria-label', copy.voiceCards)
  document.querySelector('[data-voice-orb-prev]')?.setAttribute('aria-label', copy.previousVoice)
  document.querySelector('[data-voice-orb-next]')?.setAttribute('aria-label', copy.nextVoice)
  document.querySelector('.sound-library-grid')?.setAttribute('aria-label', copy.soundGrid)
  document.querySelector('.site-footer')?.setAttribute('aria-label', copy.pageInfo)

  document.querySelectorAll('.voice-design-sample[data-inline-player]').forEach((card) => {
    const id = card.dataset.inlinePlayer
    const translation = presetCopy[id]
    const title = presetText(id)
    const cardCopy = card.querySelector('.voice-design-sample-copy')
    if (cardCopy && translation) {
      const [eyebrow, heading, detail] = [cardCopy.querySelector('small'), cardCopy.querySelector('strong'), cardCopy.querySelector('span')]
      if (eyebrow) eyebrow.textContent = presetText(id, 'card')
      if (heading) heading.textContent = title
      if (detail) detail.textContent = presetText(id, 'detail')
    }
    card.querySelector(':scope > img')?.setAttribute('alt', productLanguage === 'en' ? `${title} character portrait` : `${title}角色形象`)
  })

  document.querySelectorAll('.vocal-card').forEach(card => {
    const id = card.dataset.inlinePlayer
    card.querySelector('[data-vocal-title]').textContent = presetText(id)
    card.querySelector('[data-vocal-meta]').textContent = presetText(id, 'meta')
  })

  document.querySelectorAll('.sound-library-item[data-inline-player]').forEach((card) => {
    const id = card.dataset.inlinePlayer
    const copyBlock = card.querySelector('.sound-library-copy')
    if (!copyBlock) return
    const eyebrow = copyBlock.querySelector('small')
    const title = copyBlock.querySelector('strong')
    if (eyebrow) eyebrow.textContent = presetText(id, 'card')
    if (title) title.textContent = presetText(id)
  })

  document.querySelectorAll('[data-vibe-card]').forEach((card) => {
    const id = card.querySelector('[data-inline-player]')?.dataset.inlinePlayer
    if (!id) return
    const title = presetText(id)
    card.setAttribute('aria-label', title)
    const heading = card.querySelector('.vibe-card-head h4')
    const detail = card.querySelector('.vibe-card-head > span')
    if (heading) heading.textContent = title
    if (detail) detail.textContent = presetText(id, 'detail')
    card.querySelector('.vibe-player-transport')?.setAttribute('aria-label', copy.playerControls)
    card.querySelector('[data-vibe-player-prev]')?.setAttribute('aria-label', copy.previousPlayableCase)
    card.querySelector('[data-vibe-player-next]')?.setAttribute('aria-label', copy.nextPlayableCase)
  })

  document.querySelectorAll('[data-inline-player]').forEach(syncPlayerLanguage)
  window.dispatchEvent(new CustomEvent('stepaudio3:product-language-change', { detail: { language: productLanguage } }))
}

const initProductLanguage = () => {
  const toggle = document.querySelector('#product-language-toggle')
  toggle?.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-product-language]')
    const nextLanguage = button && toggle.contains(button)
      ? button.dataset.productLanguage
      : productLanguage === 'zh' ? 'en' : 'zh'
    if (nextLanguage !== 'zh' && nextLanguage !== 'en') return
    if (nextLanguage === productLanguage) return
    productLanguage = nextLanguage
    try { localStorage.setItem(productLanguageKey, productLanguage) } catch {}
    applyProductLanguage()
  })
  applyProductLanguage()
}

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

const initHeader = () => {
  const header = document.querySelector('[data-header]')
  const lightSentinel = document.querySelector('[data-light-header-sentinel]')
  if (!header) return

  let heroObserver = null
  let lightTrigger = null
  if ('IntersectionObserver' in window) {
    if (lightSentinel && (!gsap || !ScrollTrigger)) {
      heroObserver = new IntersectionObserver(([entry]) => {
        header.classList.toggle('is-on-light', entry.boundingClientRect.top < 72)
      }, { rootMargin: '-72px 0px 0px 0px', threshold: 0 })
      heroObserver.observe(lightSentinel)
    }
  }

  if (lightSentinel && gsap && ScrollTrigger) {
    lightTrigger = ScrollTrigger.create({
      trigger: lightSentinel,
      start: 'top 72px',
      end: 'max',
      onEnter: () => header.classList.add('is-on-light'),
      onLeaveBack: () => header.classList.remove('is-on-light'),
    })
  }

  window.addEventListener('pagehide', () => {
    heroObserver?.disconnect()
    lightTrigger?.kill()
  }, { once: true })
}

const initHeroVideo = () => {
  const video = document.querySelector('[data-hero-video]')
  const copy = document.querySelector('.hero-copy')
  if (!copy) return

  let watchdog = null
  let fallback = null
  let revealed = false

  const cleanup = () => {
    window.clearTimeout(watchdog)
    window.clearTimeout(fallback)
    video?.removeEventListener('timeupdate', revealWhenReady)
    video?.removeEventListener('error', revealFallback)
  }

  const reveal = () => {
    if (revealed) return
    revealed = true
    copy.classList.add('is-visible')
    cleanup()
  }

  const revealWhenReady = () => {
    if (video.currentTime >= heroCopyRevealTime) reveal()
  }

  const revealFallback = () => {
    fallback = window.setTimeout(reveal, 300)
  }

  if (!video) {
    reveal()
    return
  }

  if (reducedMotion) {
    video.pause()
    reveal()
    return
  }

  video.addEventListener('timeupdate', revealWhenReady)
  video.addEventListener('error', revealFallback, { once: true })
  revealWhenReady()

  watchdog = window.setTimeout(reveal, 10000)
  video.play()?.catch(revealFallback)

  window.addEventListener('pagehide', cleanup, { once: true })
}

const initHeroScrollTransition = () => {
  const hero = document.querySelector('.hero')
  if (!hero) return

  let frame = null
  const update = () => {
    frame = null
    const transitionDistance = Math.max(1, hero.offsetHeight * 0.72)
    const progress = Math.max(0, Math.min(1, window.scrollY / transitionDistance))
    const transitionOpacity = Math.max(0, Math.min(1, (progress - 0.08) / 0.36))
    document.body.classList.toggle('is-product-content', progress >= 0.35)
    document.body.style.setProperty('--hero-scroll-progress', progress.toFixed(4))
    document.body.style.setProperty('--hero-transition-opacity', transitionOpacity.toFixed(4))
    document.body.style.setProperty('--hero-stage-opacity', (1 - progress * 0.14).toFixed(4))
    document.body.style.setProperty('--hero-stage-scale', (1 - progress * 0.008).toFixed(4))
    document.body.style.setProperty('--hero-video-shift', `${(-progress * 2.8).toFixed(3)}vh`)
    document.body.style.setProperty('--hero-video-scale', (1 + progress * 0.018).toFixed(4))
    document.body.style.setProperty('--hero-copy-opacity', Math.max(0, 1 - progress * 1.62).toFixed(4))
    document.body.style.setProperty('--hero-copy-shift', `${(-progress * 34).toFixed(2)}px`)
  }
  const requestUpdate = () => {
    if (frame !== null) return
    frame = window.requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', requestUpdate, { passive: true })
  window.addEventListener('resize', requestUpdate, { passive: true })
  window.addEventListener('pagehide', () => {
    if (frame !== null) window.cancelAnimationFrame(frame)
    window.removeEventListener('scroll', requestUpdate)
    window.removeEventListener('resize', requestUpdate)
  }, { once: true })
}

const initReveals = () => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (preference.matches || !window.IntersectionObserver || !Element.prototype.animate) return

  // Reveal individual content groups, not the full carousel/section ancestors.
  // Individual translate leaves the coverflow and centered sections' transforms intact.
  const targets = new Map()
  const add = (selector, delay = 0, distance = 18) => {
    document.querySelectorAll(selector).forEach(element => {
      if (element.getClientRects().length) targets.set(element, { delay, distance })
    })
  }
  // Keep each heading/description lockup together, followed by its visual panel.
  add('.case-portal-copy, .voice-design-copy, .sound-library-intro, .closing-copy')
  add('.case-portal-gallery, .voice-design-gallery', 90, 24)
  add('.vocal-card-grid', 90, 16)
  document.querySelectorAll('.sound-library-item').forEach((element, index) => {
    if (element.getClientRects().length) targets.set(element, { delay: (index % 4) * 55, distance: 20 })
  })

  const animations = new Map()
  const finish = element => {
    element.dataset.scrollEnter = 'done'
    element.style.removeProperty('--scroll-enter-distance')
    animations.get(element)?.cancel()
    animations.delete(element)
    observer.unobserve(element)
  }
  const reveal = element => {
    if (element.dataset.scrollEnter !== 'pending') return
    element.dataset.scrollEnter = 'entering'
    observer.unobserve(element)
    const { delay, distance } = targets.get(element)
    const animation = element.animate([
      { opacity: 0, translate: `0 ${distance}px` },
      { opacity: 1, translate: '0 0' },
    ], {
      duration: 720,
      delay,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'both',
    })
    animations.set(element, animation)
    animation.onfinish = () => finish(element)
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target) })
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 })

  targets.forEach(({ distance }, element) => {
    const rect = element.getBoundingClientRect()
    // Deep links and restored scroll positions render immediately, without flashing.
    if (rect.top < window.innerHeight) {
      element.dataset.scrollEnter = 'done'
    } else {
      element.style.setProperty('--scroll-enter-distance', `${distance}px`)
      element.dataset.scrollEnter = 'pending'
      observer.observe(element)
    }
  })
  const onInteraction = event => {
    for (const element of targets.keys()) {
      if (element.contains(event.target)) finish(element)
    }
  }
  const finishAll = () => {
    targets.forEach((delay, element) => finish(element))
    observer.disconnect()
  }
  const onPreferenceChange = () => { if (preference.matches) finishAll() }
  document.addEventListener('focusin', onInteraction)
  document.addEventListener('pointerdown', onInteraction, { passive: true })
  preference.addEventListener('change', onPreferenceChange)
  window.addEventListener('pagehide', () => {
    finishAll()
    document.removeEventListener('focusin', onInteraction)
    document.removeEventListener('pointerdown', onInteraction)
    preference.removeEventListener('change', onPreferenceChange)
  }, { once: true })
}

const initOverviewMotion = () => {
  if (!gsap || !ScrollTrigger || reducedMotion) return
  const sentenceLine = document.querySelector('.sentence-line')
  const sentenceMarker = sentenceLine?.querySelector('i')
  if (!sentenceLine || !sentenceMarker) return
  gsap.to(sentenceMarker, {
    x: () => Math.max(0, sentenceLine.clientWidth - sentenceMarker.clientWidth),
    ease: 'none',
    scrollTrigger: { trigger: '.sound-sentence', start: 'top 82%', end: 'bottom 35%', scrub: 0.8, invalidateOnRefresh: true },
  })
}

const initCapabilityEditorial = () => {
  const root = document.querySelector('[data-capability-editorial]')
  const nodes = root ? [...root.querySelectorAll('[data-capability-node]')] : []
  const panels = root ? [...root.querySelectorAll('[data-capability-panel]')] : []
  const demos = root ? [...root.querySelectorAll('[data-capability-demo]')] : []
  const visuals = root ? [...root.querySelectorAll('[data-capability-visual]')] : []
  if (!root || nodes.length < 2 || panels.length !== nodes.length || demos.length !== nodes.length || visuals.length !== nodes.length) return

  let activeIndex = -1
  const wrapIndex = (value) => ((value % nodes.length) + nodes.length) % nodes.length

  const setActive = (requestedIndex, moveFocus = false) => {
    const index = wrapIndex(requestedIndex)
    if (activeIndex === index) {
      if (moveFocus) nodes[index].focus()
      return
    }

    const previousIndex = activeIndex
    const direction = previousIndex < 0 || index > previousIndex ? 1 : -1
    activeIndex = index
    const label = nodes[index].querySelector('strong')?.textContent.trim() || nodes[index].textContent.trim()
    root.style.setProperty('--capability-active-index', String(index))
    root.style.setProperty('--capability-active-offset', `${index * 100}%`)
    root.setAttribute('aria-label', `全场景能力，当前能力：${label}。点击能力名称或使用方向键切换`)

    nodes.forEach((node, nodeIndex) => {
      const isActive = nodeIndex === index
      node.classList.toggle('is-active', isActive)
      node.setAttribute('aria-selected', String(isActive))
      node.tabIndex = isActive ? 0 : -1
    })

    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === index
      panel.classList.toggle('is-active', isActive)
      panel.setAttribute('aria-hidden', String(!isActive))
      if (isActive) panel.removeAttribute('inert')
      else panel.setAttribute('inert', '')
    })

    visuals.forEach((visual, visualIndex) => {
      visual.classList.toggle('is-active', visualIndex === index)
    })

    demos.forEach((demo, demoIndex) => {
      const isActive = demoIndex === index
      demo.classList.toggle('is-active', isActive)
      demo.setAttribute('aria-hidden', String(!isActive))
      if (isActive) demo.removeAttribute('inert')
      else {
        demo.setAttribute('inert', '')
        demo.querySelector('audio')?.pause()
      }
    })

    if (previousIndex >= 0 && !reducedMotion && gsap) {
      const previousPanel = panels[previousIndex]
      const nextPanel = panels[index]
      const previousDemo = demos[previousIndex]
      const nextDemo = demos[index]
      const animated = [previousPanel, nextPanel, previousDemo, nextDemo]
      gsap.killTweensOf(animated)

      gsap.fromTo(nextPanel, { opacity: 0, y: direction * 34 }, { opacity: 1, y: 0, duration: 0.68, delay: 0.12, ease: 'power3.out', clearProps: 'transform' })
      gsap.to(previousPanel, { opacity: 0, y: direction * -18, duration: 0.3, ease: 'power2.in' })
      gsap.fromTo(nextDemo, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, delay: 0.25, ease: 'power3.out', clearProps: 'transform' })
      gsap.to(previousDemo, { opacity: 0, y: -8, duration: 0.24, ease: 'power2.in' })
    }
    if (moveFocus) nodes[index].focus()
  }

  const seekTo = (index, moveFocus = false) => {
    setActive(index, moveFocus)
  }

  nodes.forEach((node, index) => node.addEventListener('click', () => seekTo(index)))
  root.addEventListener('keydown', (event) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    if (event.key === 'Home') return seekTo(0, true)
    if (event.key === 'End') return seekTo(nodes.length - 1, true)
    const direction = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1
    seekTo(wrapIndex(activeIndex + direction), true)
  })

  setActive(0)
  root.classList.remove('is-scroll-story')
  ScrollTrigger?.getById('capability-story')?.kill(true)
}

const initVoiceOrbit = (pausePlayers) => {
  const root = document.querySelector('[data-voice-orbit]')
  const orbit = root?.querySelector('.voice-orbit')
  const cards = root ? [...root.querySelectorAll('[data-orbit-card]')] : []
  if (!root || !orbit || !cards.length) return

  const motionState = { phase: 0 }
  let targetPhase = 0
  let activeIndex = -1

  const wrapIndex = (value) => ((value % cards.length) + cards.length) % cards.length

  const setActive = (index) => {
    if (activeIndex === index) return
    if (activeIndex !== -1) pausePlayers?.()
    activeIndex = index
    const activeName = cards[index].dataset.orbitName || ''
    root.setAttribute('aria-label', `角色音色圆环，当前角色：${activeName}。滚动页面或使用上下方向键循环切换角色`)
    cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === index
      card.classList.toggle('is-active', isActive)
      card.setAttribute('aria-hidden', String(!isActive))
      if (isActive) card.removeAttribute('inert')
      else card.setAttribute('inert', '')
    })
  }

  const render = () => {
    const radiusY = Math.min(196, Math.max(158, orbit.clientHeight * 0.37))
    const nearest = wrapIndex(Math.round(motionState.phase))
    setActive(nearest)

    cards.forEach((card, index) => {
      const angle = (index - motionState.phase) * ((Math.PI * 2) / cards.length)
      const sine = Math.sin(angle)
      const depth = (Math.cos(angle) + 1) / 2
      const x = sine * -42 + (1 - depth) * 28
      const y = sine * radiusY
      const z = -170 + depth * 350
      const scale = 0.68 + depth * 0.32
      const opacity = 0.12 + depth * 0.88
      const rotationX = sine * -18
      const rotationY = -8 + (1 - depth) * -5
      const rotationZ = sine * -4

      if (gsap) {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x,
          y,
          z,
          scale,
          rotationX,
          rotationY,
          rotationZ,
          opacity,
          zIndex: Math.round(depth * 10) + 1,
        })
      } else {
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg) scale(${scale})`
        card.style.opacity = String(opacity)
        card.style.zIndex = String(Math.round(depth * 10) + 1)
      }
    })
  }

  const goBy = (direction) => {
    targetPhase = Math.round(targetPhase) + direction
    pausePlayers?.()
    if (!gsap || reducedMotion) {
      motionState.phase = targetPhase
      render()
      return
    }
    gsap.to(motionState, {
      phase: targetPhase,
      duration: 0.82,
      ease: 'power3.inOut',
      overwrite: true,
      onUpdate: render,
      onComplete: render,
    })
  }

  const onWheel = (event) => {
    if (reducedMotion || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return
    if (Math.abs(event.deltaY) < 1) return
    event.preventDefault()
    const delta = Math.max(-160, Math.min(160, event.deltaY))
    targetPhase += delta / 180
    pausePlayers?.()
    if (!gsap) {
      motionState.phase = targetPhase
      render()
      return
    }
    gsap.to(motionState, {
      phase: targetPhase,
      duration: 0.68,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: render,
      onComplete: render,
    })
  }

  const onKeydown = (event) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const direction = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1
    goBy(direction)
  }

  root.addEventListener('wheel', onWheel, { passive: false })
  root.addEventListener('keydown', onKeydown)
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(render) : null
  resizeObserver?.observe(orbit)
  render()

  window.addEventListener('pagehide', () => {
    gsap?.killTweensOf(motionState)
    resizeObserver?.disconnect()
    root.removeEventListener('wheel', onWheel)
    root.removeEventListener('keydown', onKeydown)
  }, { once: true })
}

const initInlinePlayers = () => {
  const roots = [...document.querySelectorAll('[data-inline-player]')]
  const instances = new Map()
  let activePlayer = null

  const notifyPlayerState = (root, state) => {
    root.dispatchEvent(new CustomEvent('stepaudio3:player-state', {
      bubbles: true,
      detail: { state },
    }))
  }

  const setPlayingState = (root, playing) => {
    const button = root.querySelector('[data-player-toggle]')
    const preset = presets[root.dataset.inlinePlayer]
    root.classList.toggle('is-playing', playing)
    if (button && preset) button.setAttribute('aria-label', actionLabel(playing ? copyFor().pause : copyFor().play, presetText(root.dataset.inlinePlayer)))
    notifyPlayerState(root, playing ? 'playing' : instances.get(root)?.loading ? 'loading' : 'paused')
  }

  const pauseAll = (except = null) => {
    instances.forEach((state) => {
      if (state.root === except) return
      state.pendingPlay = false
      if (state.wavesurfer.isPlaying()) state.wavesurfer.pause()
    })
  }

  const ensurePlayer = (root) => {
    if (!root) return null
    if (instances.has(root)) return instances.get(root)

    const preset = presets[root.dataset.inlinePlayer]
    const audio = root.querySelector('audio')
    const waveform = root.querySelector('[data-player-waveform]')
    const time = root.querySelector('[data-player-time]')
    const button = root.querySelector('[data-player-toggle]')
    if (!preset || !audio || !waveform || !time || !button) return null

    audio.crossOrigin = 'anonymous'
    const isVibePlayer = root.classList.contains('vibe-player')
    const isVoiceOrb = root.classList.contains('voice-orb-slide')
    const wavesurfer = WaveSurfer.create({
      container: waveform,
      media: audio,
      height: root.classList.contains('voice-card-player') ? 34 : isVibePlayer ? 36 : isVoiceOrb ? 22 : 45,
      waveColor: isVoiceOrb ? '#a5afb4' : isVibePlayer ? '#7f8b8c' : '#a8adb2',
      progressColor: isVoiceOrb ? '#188e9d' : '#176c70',
      cursorColor: isVoiceOrb ? '#188e9d' : '#176c70',
      cursorWidth: 1,
      barWidth: isVibePlayer ? 4 : isVoiceOrb ? 2 : 2,
      barGap: isVibePlayer ? 3 : isVoiceOrb ? 2 : 3,
      barRadius: isVibePlayer ? 4 : isVoiceOrb ? 2 : 2,
      normalize: true,
      dragToSeek: true,
      blobMimeType: preset.src.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav',
    })
    const state = { root, wavesurfer, preset, time, ready: false, previewReady: false, previewing: false, loading: false, pendingPlay: false, loadTimer: null }
    instances.set(root, state)

    wavesurfer.on('ready', () => {
      if (state.previewing) {
        state.previewing = false
        state.previewReady = true
        state.ready = false
        root.classList.remove('is-idle', 'is-error')
        root.classList.add('is-preview')
        time.textContent = `00:00 / ${preset.duration}`
        notifyPlayerState(root, 'preview')
        return
      }
      window.clearTimeout(state.loadTimer)
      state.loadTimer = null
      state.ready = true
      state.loading = false
      root.classList.remove('is-idle', 'is-preview', 'is-loading', 'is-error')
      root.classList.add('is-ready')
      root.removeAttribute('aria-busy')
      root.style.removeProperty('--player-load')
      time.textContent = `00:00 / ${formatTime(wavesurfer.getDuration()) || preset.duration}`
      notifyPlayerState(root, 'ready')
      if (state.pendingPlay) {
        state.pendingPlay = false
        pauseAll(root)
        wavesurfer.play()
      }
    })
    wavesurfer.on('play', () => {
      pauseAll(root)
      activePlayer = root
      setPlayingState(root, true)
    })
    wavesurfer.on('pause', () => {
      if (activePlayer === root) activePlayer = null
      setPlayingState(root, false)
    })
    wavesurfer.on('finish', () => {
      if (activePlayer === root) activePlayer = null
      setPlayingState(root, false)
    })
    wavesurfer.on('timeupdate', (current) => {
      const total = formatTime(wavesurfer.getDuration()) || preset.duration
      time.textContent = `${formatTime(current)} / ${total}`
    })
    wavesurfer.on('loading', (progress) => {
      if (!state.loading) return
      const boundedProgress = Math.max(0, Math.min(100, Math.round(progress)))
      root.style.setProperty('--player-load', `${boundedProgress}%`)
      time.textContent = `${copyFor().preparingAudio} ${boundedProgress}%`
    })
    wavesurfer.on('error', () => {
      window.clearTimeout(state.loadTimer)
      state.loadTimer = null
      state.loading = false
      state.ready = false
      state.pendingPlay = false
      root.classList.remove('is-loading')
      root.classList.add('is-error')
      root.removeAttribute('aria-busy')
      root.style.removeProperty('--player-load')
      time.textContent = copyFor().loadFailed
      button.setAttribute('aria-label', actionLabel(copyFor().retry, presetText(root.dataset.inlinePlayer)))
      notifyPlayerState(root, 'error')
    })
    return state
  }

  const loadPlayer = (state, pendingPlay = false) => {
    if (!state || state.loading) return
    const { root, wavesurfer, preset, time } = state
    state.pendingPlay = pendingPlay
    state.previewing = false
    state.loading = true
    root.classList.remove('is-idle', 'is-ready', 'is-error')
    root.classList.add('is-loading')
    root.setAttribute('aria-busy', 'true')
    root.style.setProperty('--player-load', '0%')
    root.querySelector('[data-player-toggle]')?.setAttribute('aria-label', actionLabel(copyFor().play, presetText(root.dataset.inlinePlayer)))
    time.textContent = `${copyFor().preparingAudio} 0%`
    notifyPlayerState(root, 'loading')
    state.loadTimer = window.setTimeout(() => {
      if (!state.loading) return
      state.loading = false
      state.pendingPlay = false
      root.classList.remove('is-loading')
      root.classList.add('is-error')
      root.removeAttribute('aria-busy')
      root.style.removeProperty('--player-load')
      time.textContent = copyFor().loadTimeout
      root.querySelector('[data-player-toggle]')?.setAttribute('aria-label', actionLabel(copyFor().retry, presetText(root.dataset.inlinePlayer)))
      notifyPlayerState(root, 'error')
    }, 15000)
    wavesurfer.load(preset.src).catch(() => {})
  }

  const primePlayer = (root) => {
    const state = ensurePlayer(root)
    const preview = root
      ? vibePeaks[root.dataset.inlinePlayer] || (root.dataset.inlinePlayer === 'sceneMusical' ? sceneMusicalPeaks : null)
      : null
    if (!state || !preview || state.ready || state.previewReady || state.previewing || state.loading) return
    state.previewing = true
    state.wavesurfer.load('', [preview.peaks], preview.duration).catch(() => {})
  }

  const playPlayer = (root) => {
    const state = ensurePlayer(root)
    if (!state) return
    if (state.loading) {
      state.pendingPlay = true
      return
    }
    if (!state.ready) return loadPlayer(state, true)
    pauseAll(root)
    state.wavesurfer.play()
  }

  const togglePlayer = (root) => {
    const state = ensurePlayer(root)
    if (!state) return
    if (state.loading) {
      state.pendingPlay = !state.pendingPlay
      return
    }
    if (!state.ready) return loadPlayer(state, true)
    state.wavesurfer.playPause()
  }

  roots.forEach((root) => {
    root.classList.add('is-idle')
    root.querySelector('[data-player-toggle]')?.addEventListener('click', () => togglePlayer(root))
  })

  window.addEventListener('pagehide', () => {
    instances.forEach(({ wavesurfer, loadTimer }) => {
      window.clearTimeout(loadTimer)
      wavesurfer.destroy()
    })
    instances.clear()
  }, { once: true })

  return {
    ensurePlayer, primePlayer, playPlayer, togglePlayer, pauseAll: () => pauseAll(),
    isPlaybackRequested: (root) => {
      const state = instances.get(root)
      return Boolean(state && (state.pendingPlay || state.wavesurfer.isPlaying()))
    },
  }
}

const initVibeCarousel = (playerController) => {
  const carousel = document.querySelector('[data-vibe-carousel]')
  const stage = carousel?.querySelector('[data-vibe-stage]')
  const cards = carousel ? [...carousel.querySelectorAll('[data-vibe-card]')] : []
  const title = carousel?.querySelector('[data-vibe-title]')
  const coverflow = carousel?.querySelector('[data-vibe-coverflow]')
  if (!carousel || !stage || cards.length < 2) return

  const pausePlayers = playerController?.pauseAll
  const primePlayer = playerController?.primePlayer
  const playPlayer = playerController?.playPlayer
  const togglePlayer = playerController?.togglePlayer
  const backgroundVideos = cards.map((card) => card.querySelector('[data-vibe-video]'))
  const covers = coverflow ? cards.map((card, index) => {
    const sceneTitle = card.getAttribute('aria-label') || `${productLanguage === 'en' ? 'Scene' : '场景'} ${index + 1}`
    const sceneDetail = card.querySelector('.vibe-card-head > span')?.textContent?.trim() || (productLanguage === 'en' ? 'Full-scene audio' : '全要素声场')
    const media = card.querySelector('.vibe-card-media video, .vibe-card-media img')
    const source = media?.tagName === 'VIDEO' ? media.getAttribute('poster') : media?.getAttribute('src')
    const videoSource = media?.tagName === 'VIDEO' ? media.dataset.src || media.getAttribute('src') : ''
    const cover = coverflow.querySelector(`[data-vibe-cover="${index}"]`) ||
      window.stepAudioProductCopy.createSceneCover({ index, sceneTitle, sceneDetail, source, videoSource })
    cover.removeAttribute('data-boot-cover')
    cover.removeAttribute('aria-hidden')
    cover.removeAttribute('aria-busy')
    cover.disabled = false
    coverflow.append(cover)
    return cover
  }) : []
  const coverVideos = covers.map((cover) => cover.querySelector('[data-case-cover-video]'))

  let activeIndex = 0
  let pointerId = null
  let pointerStart = 0
  let pointerScrollStart = 0
  let scrollFrame = null
  let scrollingToIndex = null
  let stageVisible = !('IntersectionObserver' in window)
  let coverflowVisible = !('IntersectionObserver' in window)
  let visibilityObserver = null

  const normalizedIndex = (index) => (index + cards.length) % cards.length
  const scrollLeftForCard = (index) => Math.min(cards[index].offsetLeft, stage.scrollWidth - stage.clientWidth)
  const syncCoverLabel = (cover, index) => {
    const isActive = index === activeIndex
    const sceneTitle = cards[index].getAttribute('aria-label') || `${productLanguage === 'en' ? 'Scene' : '场景'} ${index + 1}`
    const playerState = cover.dataset.playerState || 'idle'
    const action = playerState === 'playing'
      ? copyFor().pause
      : playerState === 'loading'
        ? copyFor().loading
        : playerState === 'error'
          ? copyFor().retry
          : copyFor().play
    cover.setAttribute('aria-label', actionLabel(isActive ? action : copyFor().switchTo, sceneTitle))
    if (isActive && playerState === 'loading') cover.setAttribute('aria-busy', 'true')
    else cover.removeAttribute('aria-busy')
    if (isActive) cover.setAttribute('aria-pressed', String(playerState === 'playing'))
    else cover.removeAttribute('aria-pressed')
  }

  const syncCoverPlayerState = (root, playerState) => {
    const index = cards.findIndex((card) => card.contains(root))
    const cover = covers[index]
    if (!cover) return
    cover.dataset.playerState = playerState
    cover.classList.toggle('is-loading', playerState === 'loading')
    cover.classList.toggle('is-playing', playerState === 'playing')
    cover.classList.toggle('is-error', playerState === 'error')
    syncCoverLabel(cover, index)
  }

  // The supplied visual loops with the complete scene audio and follows its playback position.
  const pairedVideos = new Map()
  cards.forEach((card, index) => {
    if (!card.hasAttribute('data-vibe-sync-audio')) return
    const audio = card.querySelector('audio')
    for (const video of [backgroundVideos[index], coverVideos[index]].filter(Boolean)) {
      video.loop = true
      pairedVideos.set(video, { audio, index })
    }
  })
  const syncPairedVideos = () => {
    pairedVideos.forEach(({ audio, index }, video) => {
      const visible = index === activeIndex && !document.hidden && (
        (stageVisible && video === backgroundVideos[index]) ||
        (coverflowVisible && video === coverVideos[index])
      )
      if (!visible) { video.pause(); return }
      if (!video.getAttribute('src') && video.dataset.src) video.src = video.dataset.src
      video.muted = true
      const visualTime = Number.isFinite(video.duration) && video.duration > 0
        ? audio.currentTime % video.duration : 0
      if (video.readyState > 0 && Math.abs(video.currentTime - visualTime) > .18) {
        video.currentTime = visualTime
      }
      if (!audio.paused && !audio.ended && video.paused) video.play().catch(() => {})
      else if (audio.paused || audio.ended) video.pause()
    })
  }
  const pairedAudio = [...new Set([...pairedVideos.values()].map(({ audio }) => audio))]
  const pairedEvents = ['play', 'pause', 'seeking', 'seeked', 'timeupdate', 'ended']
  pairedAudio.forEach(audio => pairedEvents.forEach(event => audio.addEventListener(event, syncPairedVideos)))
  pairedVideos.forEach((_, video) => video.addEventListener('loadedmetadata', syncPairedVideos))
  window.addEventListener('pagehide', () => {
    pairedAudio.forEach(audio => pairedEvents.forEach(event => audio.removeEventListener(event, syncPairedVideos)))
    pairedVideos.forEach((_, video) => { video.pause(); video.removeEventListener('loadedmetadata', syncPairedVideos) })
  }, { once: true })

  const sceneVideoPlayback = createSceneVideoPlayback({
    videos: [...backgroundVideos, ...coverVideos].filter(video => !pairedVideos.has(video)),
    shouldPlay: video => !document.hidden && !reducedMotion && (
      (stageVisible && video === backgroundVideos[activeIndex]) ||
      (coverflowVisible && video === coverVideos[activeIndex])
    ),
  })
  const syncSceneVideos = (options) => {
    sceneVideoPlayback.sync(options)
    syncPairedVideos()
  }

  const render = ({ prime = true } = {}) => {
    cards.forEach((card, index) => {
      const isActive = index === activeIndex
      card.classList.toggle('is-active', isActive)
      card.toggleAttribute('aria-current', isActive)
      card.removeAttribute('aria-hidden')
      card.inert = false
    })

    if (prime) primePlayer?.(cards[activeIndex].querySelector('[data-inline-player]'))
    if (title) title.textContent = cards[activeIndex].getAttribute('aria-label') || ''
    const focusedCover = covers.find(cover => cover === document.activeElement)
    // Wrap neighbours so the selected scene always has one card on either side.
    covers.forEach((cover, index) => {
      const forward = (index - activeIndex + covers.length) % covers.length
      const offset = forward > covers.length / 2 ? forward - covers.length : forward
      const isActive = offset === 0
      const isVisible = Math.abs(offset) <= 1
      // Keep the offstage neighbours mounted so entry/exit can interpolate.
      // Only their hit targets and accessibility exposure follow visibility.
      cover.hidden = false
      cover.inert = !isVisible
      cover.setAttribute('aria-hidden', String(!isVisible))
      cover.classList.toggle('is-active', isActive)
      cover.classList.toggle('is-previous', offset === -1)
      cover.classList.toggle('is-next', offset === 1)
      cover.classList.toggle('is-before', offset < -1)
      cover.classList.toggle('is-after', offset > 1)
      cover.classList.toggle('is-offstage', !isVisible)
      cover.tabIndex = isVisible ? 0 : -1
      cover.toggleAttribute('aria-current', isActive)
      syncCoverLabel(cover, index)
    })
    if (focusedCover?.inert) covers[activeIndex]?.focus({ preventScroll: true })
    syncSceneVideos()
  }

  const goTo = (index, autoplay = false) => {
    const nextIndex = normalizedIndex(index)
    if (nextIndex === activeIndex) {
      if (autoplay) playPlayer?.(cards[activeIndex].querySelector('[data-inline-player]'))
      return
    }
    pausePlayers?.()
    activeIndex = nextIndex
    scrollingToIndex = nextIndex
    render()
    stage.scrollTo({
      left: scrollLeftForCard(activeIndex),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
    if (autoplay) playPlayer?.(cards[activeIndex].querySelector('[data-inline-player]'))
  }

  const goPrevious = () => goTo(activeIndex - 1)
  const goNext = () => goTo(activeIndex + 1)

  covers.forEach((cover, index) => {
    cover.addEventListener('click', () => {
      if (index === activeIndex) {
        syncSceneVideos({ userInitiated: true })
        togglePlayer?.(cards[index].querySelector('[data-inline-player]'))
        return
      }
      goTo(index)
    })
  })

  carousel.addEventListener('stepaudio3:player-state', (event) => {
    syncCoverPlayerState(event.target, event.detail?.state || 'idle')
    if (event.detail?.state === 'playing') syncSceneVideos()
  })

  const syncCarouselLanguage = () => {
    covers.forEach((cover, index) => {
      const card = cards[index]
      const heading = cover.querySelector('.case-cover-copy strong')
      const detail = cover.querySelector('.case-cover-copy > span')
      if (heading) heading.textContent = card.getAttribute('aria-label') || ''
      if (detail) detail.textContent = card.querySelector('.vibe-card-head > span')?.textContent?.trim() || ''
    })
    render({ prime: false })
  }
  window.addEventListener('stepaudio3:product-language-change', syncCarouselLanguage)

  const updateActiveFromScroll = () => {
    scrollFrame = null
    if (scrollingToIndex !== null) {
      if (Math.abs(stage.scrollLeft - scrollLeftForCard(scrollingToIndex)) < 2) scrollingToIndex = null
      return
    }

    const stageLeft = stage.getBoundingClientRect().left
    const maxScrollLeft = stage.scrollWidth - stage.clientWidth
    const nextIndex = Math.abs(stage.scrollLeft - maxScrollLeft) < 2
      ? cards.length - 1
      : cards.reduce((closest, card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - stageLeft)
        return distance < closest.distance ? { index, distance } : closest
      }, { index: activeIndex, distance: Number.POSITIVE_INFINITY }).index

    if (nextIndex === activeIndex) return
    pausePlayers?.()
    activeIndex = nextIndex
    render()
  }

  stage.addEventListener('scroll', () => {
    if (scrollFrame) return
    scrollFrame = window.requestAnimationFrame(updateActiveFromScroll)
  }, { passive: true })

  cards.forEach((card, index) => {
    card.querySelector('[data-vibe-player-prev]')?.addEventListener('click', () => goTo(index - 1, true))
    card.querySelector('[data-vibe-player-next]')?.addEventListener('click', () => goTo(index + 1, true))
    card.querySelector('[data-player-toggle]')?.addEventListener('pointerdown', () => {
      if (index === activeIndex) return
      pausePlayers?.()
      activeIndex = index
      render()
    })
  })

  carousel.addEventListener('keydown', (event) => {
    if (event.target.closest('[data-player-toggle], [data-player-waveform]')) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goPrevious()
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
    }
  })

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('button, [data-player-waveform]')) return
    pointerId = event.pointerId
    pointerStart = event.clientX
    pointerScrollStart = stage.scrollLeft
    stage.classList.add('is-dragging')
    scrollingToIndex = null
    stage.setPointerCapture?.(event.pointerId)
  })

  stage.addEventListener('pointermove', (event) => {
    if (pointerId !== event.pointerId) return
    const distance = event.clientX - pointerStart
    if (Math.abs(distance) > 5) stage.scrollLeft = pointerScrollStart - distance
  })

  const endPointer = (event) => {
    if (pointerId !== event.pointerId) return
    stage.classList.remove('is-dragging')
    stage.releasePointerCapture?.(event.pointerId)
    pointerId = null
    updateActiveFromScroll()
    stage.scrollTo({
      left: scrollLeftForCard(activeIndex),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  stage.addEventListener('pointerup', endPointer)
  stage.addEventListener('pointercancel', endPointer)

  const handleVisibilityChange = () => syncSceneVideos()
  document.addEventListener('visibilitychange', handleVisibilityChange)

  if ('IntersectionObserver' in window) {
    visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === stage) stageVisible = entry.isIntersecting
        if (entry.target === coverflow) coverflowVisible = entry.isIntersecting
      })
      syncSceneVideos()
    }, { threshold: 0.05 })
    visibilityObserver.observe(stage)
    if (coverflow) visibilityObserver.observe(coverflow)
  }

  const handlePageShow = () => sceneVideoPlayback.resume()
  window.addEventListener('pageshow', handlePageShow)
  window.addEventListener('pagehide', (event) => {
    sceneVideoPlayback.suspend()
    // Back/forward cache keeps this page alive; retain its recovery listeners.
    if (event.persisted) return
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    visibilityObserver?.disconnect()
    window.removeEventListener('stepaudio3:product-language-change', syncCarouselLanguage)
    window.removeEventListener('pageshow', handlePageShow)
    sceneVideoPlayback.destroy()
  })

  render()
  // Preserve the static cover positions through hydration, then enable motion.
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => coverflow?.classList.add('is-ready')))
}

const initSoundAssembly = () => {
  const assembly = document.querySelector('[data-sound-assembly]')
  const status = assembly?.querySelector('[data-assembly-status]')
  if (!assembly || !status) return

  const timers = new Set()
  let observer = null

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer))
    timers.clear()
  }

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer)
      callback()
    }, delay)
    timers.add(timer)
  }

  const play = () => {
    clearTimers()
    assembly.classList.remove('is-complete', 'is-assembling')
    status.textContent = '理解完整描述'

    if (reducedMotion) {
      assembly.classList.add('is-complete')
      status.textContent = '完整声场生成完成'
      return
    }

    void assembly.offsetWidth
    assembly.classList.add('is-assembling')
    schedule(() => { status.textContent = '组织人声与音效' }, 620)
    schedule(() => { status.textContent = '铺开环境与音乐' }, 1280)
    schedule(() => { status.textContent = '沿时间轴完成编排' }, 1880)
    schedule(() => {
      assembly.classList.add('is-complete')
      status.textContent = '完整声场生成完成'
    }, 2520)
  }

  if ('IntersectionObserver' in window && !reducedMotion) {
    observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer?.disconnect()
      observer = null
      play()
    }, { threshold: 0.32 })
    observer.observe(assembly)
  } else {
    play()
  }

  window.addEventListener('pagehide', () => {
    clearTimers()
    observer?.disconnect()
  }, { once: true })
}


// Availability remains available to keyboard users; Escape dismisses the tooltip.
const experienceEntries = document.querySelectorAll('.experience-entry')
experienceEntries.forEach(entry => {
  const reset = () => entry.removeAttribute('data-tooltip-dismissed')
  entry.addEventListener('pointerenter', reset)
  entry.addEventListener('focusin', reset)
})
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return
  experienceEntries.forEach(entry => {
    if (entry.matches(':hover, :focus-within')) entry.setAttribute('data-tooltip-dismissed', '')
  })
})

initProductLanguage()
initHeroVideo()
initHeroScrollTransition()
initHeader()
window.stepAudioProductCopy.finishInitial()
initReveals()
initOverviewMotion()
initCapabilityEditorial()
initSoundAssembly()
const playerController = initInlinePlayers()
initTtsShowcase({ playerController, getCopy: copyFor })
initVocalCards({ getCopy: copyFor, playerController })
initVoiceOrbit(playerController?.pauseAll)
initVoiceOrbCarousel({
  pausePlayers: playerController?.pauseAll,
  playPlayer: playerController?.playPlayer,
  isPlaybackRequested: playerController?.isPlaybackRequested,
  getCopy: copyFor,
  getTitle: presetText,
  getCaption: (id) => ({ title: presetText(id, 'orbHeading'), description: presetText(id, 'orbDescription') }),
  syncScript: window.stepAudioProductCopy.syncVdScript,
  syncPlayerLanguage,
})
initVibeCarousel(playerController)

window.addEventListener('pagehide', () => {
  ScrollTrigger?.getAll().forEach((trigger) => trigger.kill())
}, { once: true })
