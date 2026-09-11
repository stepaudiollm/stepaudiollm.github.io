(() => {
const productCopy = Object.freeze({
  zh: {
    ttsVoice3: "清朗男声",
    ttsVoice4: "温暖男声",
    ttsVoice11: "Mellow Lady",
    ttsVoice10: "Noble Cast",

    ttsVoice9: "Lively Girl",
    ttsPreviousPage: "上一页音色",
    ttsNextPage: "下一页音色",
    ttsPreviousText: "上一句",
    ttsNextText: "下一句",
    ttsPageLabel: "音色页",
    ttsExampleLabel: "案例",
    ttsVoice7: "Nick",
    ttsVoice8: "Dacey",

    bmkTts: "真人感TTS",
    bmkVd: "音色设计 · Voice Design",
    ttsVoice1: "清隽女声",
    ttsCase1: "吐槽记性",
    ttsVoice2: "轻熟女声",
    ttsCase2: "辅导作业",
    ttsVoice5: "Lisa",
    ttsCase5: "陪你坐一会儿",
    ttsVoice6: "Jake",
    ttsCase6: "为姐姐操心",
    ttsReferenceText: "音色",
    ttsPause: "暂停结果",
    ttsLoading: "正在加载",
    ttsRetry: "重新播放",

    ttsReferenceList: "音色列表",
    ttsResultHeading: "生成结果与文本",
    ttsSelectHint: "选择音色，试听生成结果",
    ttsPlay: "播放结果",

    ttsKicker: "真人感TTS",
    ttsTitle: "像真人一样，<span>自然表达。</span>",
    ttsDescription: "从轻声倾诉到生动讲述，细腻呈现语气、停顿与情绪。",
    ttsReference: "音色",

    ttsEloTitle: "评测表现",
    ttsEloComparison: "在盲测两两对比评估中，StepAudio 3 Gen 在 TTS 与 Voice Design 两项任务上均取得 SOTA 表现，分别以 1755.33 和 1668.5 的 Elo 分数排名第一，总体胜率达 82.0% 和 71.4%，展现出在语音真人感与音色设计能力上的一致领先优势。",
    ttsEloZh: "中文真人感",
    ttsEloModel: "模型",
    ttsEloHigher: "越高越好",
    modelKicker: "模型介绍",
    modelTitle: "像真人一样自然，不止于语音。",
    modelSummary: "StepAudio 3 Gen 具备<strong>业界领先的 TTS 与音色设计能力</strong>，为零样本语音生成带来自然逼真的表达与灵活的声音控制。",
    modelLead: "模型基于共享 RVQ 码元，采用<strong>离散自回归架构</strong>，还可生成歌声、音效、音乐及其混合声音，所有能力统一于同一个模型。",
    modelDetail: "",
    benchmarkTitle: "音色设计评测表现",
    pageTitle: 'StepAudio 3 Gen',
    pageDescription: 'StepAudio 3 Gen，用一句描述统一生成多角色对白、环境声、音效与音乐，构成完整声音世界。',
    startCreating: '体验中心',
    experienceStatus: '即将开放',
    heroTitle: 'TURN IMAGINATION INTO SOUND',
    heroLead: '多角色对白、环境声、音效与音乐，在一次生成中被统一编排成完整声场。',
    listenCases: '聆听主案例',
    caseKicker: '全要素生成',
    caseTitle: '一个模型，<br /><span>生成全声场。</span>',
    caseDescription: "用自然语言描述，即可在同一段音频中一并生成多角色对白、音效与环境音。",
    voiceKicker: "音色设计",
    voiceTitle: "用一句描述，<br /><span>塑造独特声音。</span>",
    voiceDescription: "设定音色、语气与情绪，塑造鲜明的角色声音。",
    soundKicker: '音效与音乐',
    soundTitle: '不止于语音，<br /><span>也能生成音效与音乐。</span>',
    soundDescription: '同一个模型，支持生成音效、音乐及其混合声音。',
    closingTitle: '准备好<span>开始创作</span>了吗？',
    closingDescription: '一句描述，生成完整声音。',
    backToTop: '回到顶部',
    languageLabel: '语言 / Language',
    brandHome: 'StepFun 官网',
    featuredRegion: '语音、音色、全要素、音效与音乐示例',
    caseCovers: '真实场景封面',
    caseControls: '切换真实场景案例',
    previousCase: '上一个真实场景案例',
    nextCase: '下一个真实场景案例',
    voiceGallery: "音色设计试听样例",
    voiceCards: "五个音色设计试听案例",
    voiceControls: '切换声音',
    orbLoading: '正在加载球体',
    orbLoadFailed: '球体加载失败 · 点击重试',
    previousVoice: '上一个声音',
    nextVoice: '下一个声音',
    soundGrid: '音效与音乐试听示例',
    pageInfo: '页面信息',
    playerControls: '播放控制',
    previousPlayableCase: '播放上一个案例',
    nextPlayableCase: '播放下一个案例',
    play: '播放',
    pause: '暂停',
    loading: '正在载入',
    retry: '重新载入',
    switchTo: '切换到',
    audioWaveform: '音频波形',
    preparingAudio: '准备音频',
    loadFailed: '加载失败 · 点击重试',
    loadTimeout: '载入超时 · 点击重试',
    vocalKicker: "人声清唱",
    vocalTitle: "人声清唱，<br /><span>让情绪被听见。</span>",
    vocalDescription: "描述唱法、音色与情绪，生成不含伴奏的纯人声清唱。",

  },
  en: {
    ttsVoice3: "Bright Gentleman",
    ttsVoice4: "Warm Gentleman",
    ttsVoice11: "Mellow Lady",
    ttsVoice10: "Noble Cast",

    ttsVoice9: "Lively Girl",
    ttsPreviousPage: "Previous voices page",
    ttsNextPage: "Next voices page",
    ttsPreviousText: "Previous text",
    ttsNextText: "Next text",
    ttsPageLabel: "Voices page",
    ttsExampleLabel: "Example",
    ttsVoice7: "Nick",
    ttsVoice8: "Dacey",

    bmkTts: "Human-like TTS",
    bmkVd: "Voice Design",
    ttsVoice1: "Gentle Lady",
    ttsCase1: "A forgetful moment",
    ttsVoice2: "Poised Lady",
    ttsCase2: "Homework frustrations",
    ttsVoice5: "Lisa",
    ttsCase5: "Here with you",
    ttsVoice6: "Jake",
    ttsCase6: "My sister is back with him",
    ttsReferenceText: "Voice",
    ttsPause: "Pause result",
    ttsLoading: "Loading",
    ttsRetry: "Retry playback",

    ttsReferenceList: "Voices",
    ttsResultHeading: "GENERATED SPEECH & TEXT",
    ttsSelectHint: "Select a voice and listen to the generated speech",
    ttsPlay: "Play result",

    ttsKicker: "Human-like TTS",
    ttsTitle: "Speak naturally. <span>Sound human.</span>",
    ttsDescription: "From quiet reflections to lively storytelling, capture the nuances of tone, pauses, and emotion.",
    ttsReference: "Voice",

    ttsEloTitle: "Benchmark results",
    ttsEloComparison: "In blind pairwise evaluations, StepAudio 3 Gen achieves state-of-the-art performance in both TTS and Voice Design, ranking first with Elo scores of 1755.33 and 1668.5 and overall win rates of 82.0% and 71.4%, respectively, demonstrating consistent leadership in speech human-likeness and voice design.",
    ttsEloZh: "Chinese human-likeness",
    ttsEloModel: "Model",
    ttsEloHigher: "Higher is better",
    modelKicker: "MODEL OVERVIEW",
    modelTitle: "Sounds human. Goes beyond speech.",
    modelSummary: "StepAudio 3 Gen delivers <strong>state-of-the-art TTS and voice design</strong>, bringing lifelike expression and flexible voice control to zero-shot speech generation.",
    modelLead: "Built on a <strong>discrete autoregressive architecture</strong> over shared RVQ tokens, it also generates vocals, sound effects, music, and their mixtures—all in one unified model.",
    modelDetail: "",
    benchmarkTitle: "Voice design benchmark results",
    pageTitle: 'StepAudio 3 Gen',
    pageDescription: 'StepAudio 3 Gen turns a single description into a complete soundscape with multi-character dialogue, ambience, sound effects, and music.',
    startCreating: 'Experience Center',
    experienceStatus: 'Coming soon',
    heroTitle: 'TURN IMAGINATION INTO SOUND',
    heroLead: 'Multi-character dialogue, ambience, sound effects, and music—composed together in one complete generation.',
    listenCases: 'Listen to Featured Cases',
    caseKicker: 'FULL-ELEMENT AUDIO GENERATION',
    caseTitle: 'One model.<br /><span>A complete soundscape.</span>',
    caseDescription: "Use natural language to generate multi-character dialogue, sound effects, and ambient sound together in a single audio track.",
    voiceKicker: "VOICE DESIGN",
    voiceTitle: "Describe a voice.<br /><span>Give it character.</span>",
    voiceDescription: "Shape distinctive character voices through timbre, delivery, and emotion.",
    soundKicker: 'SOUND & MUSIC',
    soundTitle: 'Beyond speech.<br /><span>Create sound and music.</span>',
    soundDescription: 'One model generates sound effects, music, and their mixtures.',
    closingTitle: 'Ready to <span>start creating</span>?',
    closingDescription: 'One description. A complete sound.',
    backToTop: 'Back to top',
    languageLabel: 'Language / 语言',
    brandHome: 'StepFun official website',
    featuredRegion: 'Speech, voice design, full-scene, sound effect, and music examples',
    caseCovers: 'Real-world scene covers',
    caseControls: 'Browse real-world scene cases',
    previousCase: 'Previous real-world scene case',
    nextCase: 'Next real-world scene case',
    voiceGallery: "Voice design audio samples",
    voiceCards: "Five voice design samples",
    voiceControls: "Browse voices",
    orbLoading: 'Loading preview',
    orbLoadFailed: 'Preview unavailable · Click to retry',
    previousVoice: "Previous voice",
    nextVoice: "Next voice",
    soundGrid: 'Sound effect and music samples',
    pageInfo: 'Page information',
    playerControls: 'Playback controls',
    previousPlayableCase: 'Play previous case',
    nextPlayableCase: 'Play next case',
    play: 'Play',
    pause: 'Pause',
    loading: 'Loading',
    retry: 'Reload',
    switchTo: 'Switch to',
    audioWaveform: 'audio waveform',
    preparingAudio: 'Preparing audio',
    loadFailed: 'Could not load · Click to retry',
    loadTimeout: 'Loading timed out · Click to retry',
    vocalKicker: "VOCAL",
    vocalTitle: "Vocals that<br /><span>move you.</span>",
    vocalDescription: "Describe the singing style, voice, and emotion to generate a cappella vocals without instrumental accompaniment.",

  },
})
const presetCopy = Object.freeze({
  teahouseCrosstalk: {"title": ["茶馆相声", "Teahouse Crosstalk"], "detail": ["京味对白 / 现场掌声 / 茶馆氛围", "Beijing-style banter / Live applause / Teahouse ambience"]},
  vocalBeWell: {"title": ["你要好好的", "Be Well"], "meta": ["抒情慢歌 · 女声 · 中文", "Slow ballad · Female · Chinese"]},
  roommatePodcast: {"title": ["纽约室友播客", "New York Roommate Podcast"], "detail": ["美式闲聊 / 抢话与笑声 / 近场人声", "American banter / Interruptions and laughter / Close-mic voices"]},
  surfingFinal: {"title": ["巨浪决赛", "Big Wave Final"], "detail": ["体育解说 / 巨浪轰鸣 / 观众欢呼", "Sports commentary / Roaring waves / Crowd cheers"]},
  overpassCall: {"title": ["天桥夜话", "Night Call on the Overpass"], "detail": ["电话音色 / 城市车流 / 轻快对话", "Phone-filtered voice / City traffic / Lively conversation"]},
  oldBuilding: {"title": ["旧楼往事", "Old Building, Old Secrets"], "detail": ["克制悲恸 / 空楼回声 / 情绪爆发", "Suppressed grief / Empty-building echoes / Emotional release"]},
  vocalMom: {"meta": ["流行抒情 · 女声 · 英文", "Pop ballad · Female · English"], "title": ["家书", "Home Is Fine"], "orbHeading": ["歌声 · 家书", "Vocal · Home Is Fine"], "orbDescription": ["温柔醇厚、带岁月感的女声，以舒缓深情的流行抒情唱法唱出对母亲的牵挂。", "A gentle, mellow female voice sings a slow pop ballad about missing Mom."], "card": ["歌声", "VOCAL"], "detail": ["温柔醇厚、带岁月感的女声，以舒缓深情的流行抒情唱法唱出对母亲的牵挂。", "A gentle, mellow female voice sings a slow pop ballad about missing Mom."]},
  englishBrightGirl: {"title": ["元气少女", "Bright Young Voice"], "orbHeading": ["元气少女", "Bright Young Voice"], "orbDescription": ["清亮通透的美式英文女声，轻快灵动，语调满是欢喜与雀跃。", "A bright, clear young female voice in American English, lively and full of delight."], "card": ["音色设计", "VOICE DESIGN"], "detail": ["清亮通透的美式英文女声，轻快灵动，语调满是欢喜与雀跃。", "A bright, clear young female voice in American English, lively and full of delight."]},
  ttsResult1: {"title": ["清隽女声生成结果", "Gentle Lady generated speech"]},
  ttsResult2: {"title": ["轻熟女声生成结果", "Poised Lady generated speech"]},
  ttsResult5: {"title": ["Lisa生成结果", "Lisa generated speech"]},
  ttsResult7: {"title": ["Nick生成结果", "Nick generated speech"]},
  ttsResult3: {"title": ["清朗男声生成结果", "Bright Gentleman generated speech"]},
  ttsResult4: {"title": ["温暖男声生成结果", "Warm Gentleman generated speech"]},
  ttsResult11: {"title": ["Mellow Lady生成结果", "Mellow Lady generated speech"]},
  ttsResult10: {"title": ["Noble Cast生成结果", "Noble Cast generated speech"]},
  ttsResult9: {"title": ["Lively Girl生成结果", "Lively Girl generated speech"]},
  ttsResult8: {"title": ["Dacey生成结果", "Dacey generated speech"]},
  ttsResult6: {"title": ["Jake生成结果", "Jake generated speech"]},
  lofi: { title: ['午夜 Lo-fi', 'Midnight Lo-fi'], card: ['音乐 · Lo-fi', 'MUSIC · LO-FI'] },
  forest: { title: ['森林鸟鸣', 'Forest Birds'], card: ['音效 · 自然', 'SOUND EFFECT · NATURE'] },
  sfxRain: { title: ['棚顶落雨', 'Roof Rain'], card: ['音效 · 环境', 'SOUND EFFECT · AMBIENCE'] },
  sfxStream: { title: ['林间溪流', 'Forest Stream'], card: ['音效 · 水流', 'SOUND EFFECT · WATER'] },
  sfxTrees: { title: ['风穿树梢', 'Wind in Trees'], card: ['音效 · 空间', 'SOUND EFFECT · SPACE'] },
  sfxImpact: { title: ['重物坠地', 'Heavy Thud'], card: ['音效 · 冲击', 'SOUND EFFECT · IMPACT'] },
  musicCyberpunk: { title: ['霓虹追逐', 'Neon Chase'], card: ['音乐 · 电子', 'MUSIC · ELECTRONIC'] },
  musicDesert: { title: ['沙漠商队', 'Desert Caravan'], card: ['音乐 · 世界', 'MUSIC · WORLD'] },
  musicPiano: { title: ['旧日钢琴', 'Old Piano'], card: ['音乐 · 钢琴', 'MUSIC · PIANO'] },
  musicTango: { title: ['午夜探戈', 'Midnight Tango'], card: ['音乐 · 探戈', 'MUSIC · TANGO'] },
  vocalFinalGoodbye: {"meta": ["抒情流行 · 男声 · 中文", "Pop ballad · Male · Chinese"], "title": ["告别余温", "The Warmth of Goodbye"], "orbHeading": ["歌声 · 告别余温", "Vocal · The Warmth of Goodbye"], "orbDescription": ["低沉温柔、略带沙哑的男声，以克制真挚的抒情流行唱出告别。", "A low, gentle male voice with a hint of rasp, singing a restrained, heartfelt pop ballad."], "card": ["歌声", "VOCAL"], "detail": ["低沉温柔、略带沙哑的男声，以克制真挚的抒情流行唱出告别。", "A low, gentle male voice with a hint of rasp, singing a restrained, heartfelt pop ballad."]},
  vocalBossa: {"meta": ["Bossa Nova · 女声 · 英文", "Bossa Nova · Female · English"], "title": ["椰风午后", "Coconut Afternoon"], "orbHeading": ["歌声 · 椰风午后", "Vocal · Coconut Afternoon"], "orbDescription": ["清甜柔软的英文女声，以轻盈慵懒的 Bossa nova 描绘午后。", "A soft, sweet female voice singing in English with a light, languid bossa nova feel."], "card": ["歌声", "VOCAL"], "detail": ["清甜柔软的英文女声，以轻盈慵懒的 Bossa nova 描绘午后。", "A soft, sweet female voice singing in English with a light, languid bossa nova feel."]},
  vocalBirthday: { title: ['偷偷说生日快乐', 'A Whispered Happy Birthday'] },
  breakfastStall: { title: ['清晨煎饼摊', 'Breakfast Stall'], detail: ['沙哑声线 / 连续煎锅声 / 熟客关系', 'Raspy voices / Sizzling griddle / Familiar regular'] },
  nightFoodStall: {"title": ["夏夜大排档", "Summer Night Food Stall"], "detail": ["微醺状态 / 爆炒声 / 江湖气", "Tipsy delivery / Wok sounds / Street-side energy"]},
  nightApron: { title: ['夜间停机坪', 'Night Apron'], detail: ['无线电压缩 / 引擎轰鸣 / 三角色', 'Radio compression / Engine roar / Three characters'] },
  riversideRun: { title: ['江边晨跑', 'Riverside Morning Run'], detail: ['边跑边说 / 喘息变化 / 持续风噪', 'Talking while running / Shifting breath / Constant wind'] },
  rainMarket: { title: ['暴雨菜市场', 'Rainy Market'], detail: ['本地口音 / 对讲机 / 持续暴雨', 'Local accent / Radio chatter / Heavy rain'] },
  sceneMusical: { title: ['音乐剧首演前', 'Before the Musical Premiere'], detail: ['后台化妆间 / 情绪铺垫 / 试唱', 'Backstage dressing room / Emotional build / Vocal warm-up'] },
  child: {"title": ["童真男孩", "Playful Boy"], "orbHeading": ["童真男孩", "Playful Boy"], "orbDescription": ["奶甜清脆的男童声，雀跃灵动，满是天真烂漫。", "A sweet, clear boyish voice, full of playful energy and wonder."], "card": ["音色设计", "VOICE DESIGN"], "detail": ["奶甜清脆的男童声，雀跃灵动，满是天真烂漫。", "A sweet, clear boyish voice, full of playful energy and wonder."]},
  dialect: {"title": ["东北青年", "Northeastern Voice"], "orbHeading": ["东北青年", "Northeastern Voice"], "orbDescription": ["松弛随性的东北口音，像和好友闲聊一样自然。", "An easygoing Northeastern Chinese accent, relaxed and conversational."], "card": ["音色设计", "VOICE DESIGN"], "detail": ["松弛随性的东北口音，像和好友闲聊一样自然。", "An easygoing Northeastern Chinese accent, relaxed and conversational."]},
  elder: {"title": ["病榻老人", "Frail Elder"], "orbHeading": ["病榻老人", "Frail Elder"], "orbDescription": ["虚弱沙哑的老年男声，气息短促，缓慢讲述旧事。", "A frail, raspy older voice, recalling the past through short breaths."], "card": ["音色设计", "VOICE DESIGN"], "detail": ["虚弱沙哑的老年男声，气息短促，缓慢讲述旧事。", "A frail, raspy older voice, recalling the past through short breaths."]},
  velvetFemale: {"title": ["温柔女中音", "Gentle Alto"], "orbHeading": ["温柔女中音", "Gentle Alto"], "orbDescription": ["丝绒般温暖的英文女声，轻声耳语，缓慢而笃定。", "A warm, velvety alto in English, whispering slowly and reassuringly."], "card": ["音色设计", "VOICE DESIGN"], "detail": ["丝绒般温暖的英文女声，轻声耳语，缓慢而笃定。", "A warm, velvety alto in English, whispering slowly and reassuringly."]},
  nightRadio: {"title": ["深夜电台", "Late-night Radio"], "orbHeading": ["深夜电台", "Late-night Radio"], "orbDescription": ["低沉醇厚的男声贴近话筒，温柔克制地念一封来信。", "A deep, mellow host reading a late-night letter close to the mic."], "card": ["音色设计", "VOICE DESIGN"], "detail": ["低沉醇厚的男声贴近话筒，温柔克制地念一封来信。", "A deep, mellow host reading a late-night letter close to the mic."]},
  wearyElder: {"title": ["疲惫独白", "Weary Monologue"], "orbHeading": ["疲惫独白", "Weary Monologue"], "orbDescription": ["沙哑低沉的英文老年男声，节奏拖慢，带着疲惫叹息。", "An older American English voice, slow and raspy, with weary sighs."], "card": ["音色设计", "VOICE DESIGN"], "detail": ["沙哑低沉的英文老年男声，节奏拖慢，带着疲惫叹息。", "An older American English voice, slow and raspy, with weary sighs."]},
})
const preferLanguage = (items, getLanguage, language) => [...items].sort((a, b) =>
  Number(getLanguage(b) === language) - Number(getLanguage(a) === language))
const createSceneCover = ({ index, sceneTitle, sceneDetail, source, videoSource }) => {
    const cover = document.createElement('button')
    const mediaFrame = document.createElement('span')
    const visual = document.createElement(videoSource ? 'video' : 'img')
    const shade = document.createElement('span')
    const copy = document.createElement('span')
    const number = document.createElement('small')
    const heading = document.createElement('strong')
    const detail = document.createElement('span')
    const play = document.createElement('i')

    cover.type = 'button'
    cover.className = 'case-cover'
    cover.dataset.vibeCover = String(index)
    cover.setAttribute('aria-label', sceneTitle)
    if (visual instanceof HTMLVideoElement) {
      visual.muted = true
      visual.defaultMuted = true
      visual.loop = true
      visual.playsInline = true
      visual.preload = 'metadata'
      visual.poster = source || ''
      visual.dataset.caseCoverVideo = ''
      visual.dataset.src = videoSource
      visual.disablePictureInPicture = true
      visual.setAttribute('aria-hidden', 'true')
    } else {
      visual.src = source || ''
      visual.alt = ''
      visual.loading = index < 3 ? 'eager' : 'lazy'
      visual.decoding = 'async'
    }
    mediaFrame.className = 'case-cover-media'
    shade.className = 'case-cover-shade'
    copy.className = 'case-cover-copy'
    number.textContent = String(index + 1).padStart(2, '0')
    heading.textContent = sceneTitle
    detail.textContent = sceneDetail
    play.className = 'case-cover-play'
    play.setAttribute('aria-hidden', 'true')
    mediaFrame.append(visual, shade)
    copy.append(number, heading, detail)
    cover.append(mediaFrame, copy, play)
    return cover
}
let stopInitialHeader = () => {}
const applyInitial = () => {
  let language = 'en'
  try { if (localStorage.getItem('stepaudio3-gen.language') === 'zh') language = 'zh' } catch {}
  const copy = productCopy[language], index = language === 'en' ? 1 : 0
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN'
  document.body.dataset.language = language
  document.title = copy.pageTitle
  document.querySelectorAll('[data-product-i18n]').forEach(element => {
    const value = copy[element.dataset.productI18n]
    if (value) element.textContent = value
  })
  document.querySelectorAll('[data-product-i18n-html]').forEach(element => {
    const value = copy[element.dataset.productI18nHtml]
    if (typeof value === 'string') element.innerHTML = value
  })
  const toggle = document.querySelector('#product-language-toggle')
  if (toggle) {
    toggle.dataset.language = language
    toggle.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.productLanguage === language)))
  }
  document.querySelectorAll('.sound-library-item[data-inline-player]').forEach(card => {
    const copy = presetCopy[card.dataset.inlinePlayer]
    const heading = card.querySelector('.sound-library-copy strong')
    const tag = card.querySelector('.sound-library-copy small')
    if (heading && copy) heading.textContent = copy.title[index]
    if (tag && copy) tag.textContent = copy.card[index]
  })
  document.querySelectorAll('.vocal-card').forEach(card => {
    const entry = presetCopy[card.dataset.inlinePlayer]
    card.querySelector('[data-vocal-title]').textContent = entry.title[index]
    card.querySelector('[data-vocal-meta]').textContent = entry.meta[index]
  })
  // Match the interactive default before deferred modules arrive.
  const list = document.querySelector('.tts-reference-list')
  const buttons = preferLanguage([...document.querySelectorAll('[data-tts-select]')], item => item.dataset.ttsLanguage, language)
  const selected = buttons[0]
  if (list && selected) {
    list.replaceChildren(...buttons.map(button => button.parentElement))
    buttons.forEach(button => {
      const active = button === selected
      button.setAttribute('aria-pressed', String(active))
      button.parentElement.classList.toggle('is-selected', active)
    })
    const panels = [...document.querySelectorAll('[data-tts-result]')]
    const cases = preferLanguage(panels.filter(panel => (panel.dataset.ttsVoice || panel.dataset.ttsResult) === selected.dataset.ttsSelect), panel => panel.querySelector('.tts-transcript').lang, language)
    cases.forEach(panel => document.querySelector('.tts-case-track').append(panel))
    panels.forEach(panel => {
      panel.hidden = !cases.includes(panel)
      panel.inert = panel !== cases[0]
      panel.setAttribute('aria-hidden', String(panel !== cases[0]))
      panel.classList.toggle('is-active', panel === cases[0])
    })
    if (cases[0]) selected.setAttribute('aria-controls', cases[0].id)
    document.querySelector('[data-tts-case-pager]').hidden = cases.length <= 1
    document.querySelector('.tts-output-pane').classList.toggle('has-case-pagination', cases.length > 1)
  }
  const sceneCards = [...document.querySelectorAll('[data-vibe-card]')]
  const coverflow = document.querySelector('[data-vibe-coverflow]')
  if (coverflow && sceneCards.length) {
    coverflow.replaceChildren()
    ;[sceneCards.length - 1, 0, 1].forEach((sceneIndex, slot) => {
      const card = sceneCards[sceneIndex]
      const entry = presetCopy[card.querySelector('[data-inline-player]').dataset.inlinePlayer]
      const media = card.querySelector('.vibe-card-media video, .vibe-card-media img')
      const cover = createSceneCover({ index: sceneIndex, sceneTitle: entry.title[index], sceneDetail: entry.detail[index], source: media.getAttribute('poster') || media.getAttribute('src'), videoSource: media.dataset.src || '' })
      cover.classList.add(['is-previous', 'is-active', 'is-next'][slot])
      cover.dataset.bootCover = ''
      cover.disabled = true
      cover.setAttribute('aria-busy', 'true')
      coverflow.append(cover)
    })
  }
  document.querySelectorAll('[data-voice-orb-slide]').forEach(slide => {
    slide.querySelector('[data-voice-orb-status]').textContent = copy.orbLoading
    slide.querySelector('[data-player-toggle]').setAttribute('aria-busy', 'true')
  })
  const captions = document.querySelector('[data-orb-caption-viewport]')
  document.querySelectorAll('[data-voice-orb-slide]').forEach((slide, i) => {
    if (!captions) return
    const initialIndex = Number(slide.closest('[data-voice-orb-carousel]').dataset.initialIndex) || 0
    const delta = i - initialIndex, copy = presetCopy[slide.dataset.inlinePlayer]
    const caption = document.createElement('div')
    caption.className = 'voice-orb-caption' + (delta === 0 ? ' is-current' : '') + (Math.abs(delta) > 1 ? ' is-away' : '')
    caption.dataset.bootCaption = ''
    caption.dataset.orbCaption = String(delta)
    caption.style.setProperty('--caption-offset', `calc(var(--voice-orb-step) * ${delta})`)
    caption.setAttribute('aria-hidden', String(Math.abs(delta) > 1))
    const title = document.createElement('strong'), description = document.createElement('p')
    title.textContent = copy.orbHeading[index]
    description.textContent = copy.orbDescription[index]
    caption.append(title, description)
    captions.append(caption)
  })
  const syncHeader = () => {
    const sentinel = document.querySelector('[data-light-header-sentinel]')
    document.querySelector('.site-header')?.classList.toggle('is-on-light', Boolean(sentinel && sentinel.getBoundingClientRect().top < 72))
  }
  syncHeader()
  window.addEventListener('scroll', syncHeader, { passive: true })
  stopInitialHeader = () => window.removeEventListener('scroll', syncHeader)
}
window.stepAudioProductCopy = Object.freeze({ productCopy, presetCopy, preferLanguage, createSceneCover, applyInitial, finishInitial: () => stopInitialHeader() })
})()
