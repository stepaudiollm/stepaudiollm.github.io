// 所有页面内容的单一数据源。改文案只改这个文件即可。

// === § 情绪价值 cases（左 grid 卡片 + 右详情） ===
export const EMOTION_CASES = [
  {
    id: 'b2b10e2e',
    title: '情绪安抚，支招',
    hint: '崩溃深夜，先稳住你、再给可执行的 tips。',
    summary: '情绪崩溃的深夜，它不给空洞的安慰，而是先稳住你、再给出可执行的 tips。',
    quote: '它没有绕圈子说"你已经做得很好了"，而是直接问我——"现在最让你崩溃的是哪一件？"',
    tags: ['共情', '情绪引导', '可执行建议'],
    audio: 'assets/audio/goodcase_b2b10e2e.mp3',
    audioLabel: '情绪安抚 · 支招',
  },
];

// === § 双商领跑 cases（弧形转盘） ===
export const IQ_EQ_CASES = [
  {
    id: 'b2b10e2e',
    index: '01',
    title: '情绪安抚',
    subtitle: 'Emotional Support',
    tagline: '情绪崩溃时的实打实支招',
    desc: '先稳住你，再给具体可执行的 tips。不套话、不讲大道理，更像是懂你的朋友。',
    scenes: [
      '深夜 emo 时跟模型诉说职场焦虑',
      '它会先识别情绪颗粒，再针对性回应',
      '给的建议具体可操作，而非鸡汤',
    ],
    audio: 'assets/audio/goodcase_b2b10e2e.mp3',
    audioLabel: '情绪安抚，支招',
    accent: '#ff8ab0',
    accent2: '#ff5577',
  },
  {
    id: '734032ff',
    index: '02',
    title: '知识快答',
    subtitle: 'Knowledge QA',
    tagline: '不张口就来，先求证再回答',
    desc: '面对"长江是最长的河吗"这类常识提问，不会机械地套模板，而是先考虑再回答。',
    scenes: [
      '快问快答形式，对边界条件敏感',
      '发现自己可能答错时会主动纠正',
      '能引导对话走向更深入的知识探索',
    ],
    audio: 'assets/audio/goodcase_734032ff.mp3',
    audioLabel: '知识快问快答',
    accent: '#818cf8',
    accent2: '#6366f1',
  },
  {
    id: '5dab6299',
    index: '03',
    title: '飞花令',
    subtitle: 'Poem Relay',
    tagline: '不只押字，还押意境',
    desc: '飞花令这种古典语言游戏里，它能把诗句的意境和场景一起接住，而不是机械找字。',
    scenes: [
      '每一轮回应都贴合前句的意象',
      '拒绝机械字面匹配，追求意境传承',
      '能主动引入典故和历史背景',
    ],
    audio: 'assets/audio/goodcase_5dab6299.mp3',
    audioLabel: '飞花令 · 意境递增',
    accent: '#9b7bff',
    accent2: '#a78bfa',
  },
  {
    id: '87fdb2b7',
    index: '04',
    title: '飞花令 · 战争题材',
    subtitle: 'Poem Relay · Warfare',
    tagline: '同题异构，意境在逐渐递增',
    desc: '同样是飞花令，加入"战争"题材后，意境逐轮递增，从"折戟沉沙"到"一将功成万骨枯"。',
    scenes: [
      '相比豆包，意境把握更到位',
      '能根据题材主动调整诗句选择',
      '展现文学素养的深度',
    ],
    audio: 'assets/audio/goodcase_87fdb2b7.mp3',
    audioLabel: '飞花令 · 战争题材',
    accent: '#a855f7',
    accent2: '#6d28d9',
  },
  {
    id: 'ac0e7b4f',
    index: '05',
    title: '飞花令 · 固定首字',
    subtitle: 'Constrained Relay',
    tagline: '难度拉满：固定第一字',
    desc: '固定第一个字的飞花令，比普通版本难很多。对词汇储备和即兴能力是双重考验。',
    scenes: [
      '在严苛限制下依然产出优质诗句',
      '展现模型的真实词汇储备',
      '即兴创作能力远超豆包',
    ],
    audio: 'assets/audio/goodcase_ac0e7b4f.mp3',
    audioLabel: '飞花令 · 固定首字',
    accent: '#a5b4fc',
    accent2: '#818cf8',
  },
  {
    id: '9c08129a',
    index: '06',
    title: '复杂命令理解',
    subtitle: 'Complex Instructions',
    tagline: '预判边界条件，不机械执行',
    desc: '面对多步骤复杂指令，它不止按字面执行，还会预判可能的边界条件并主动补齐。',
    scenes: [
      '自动识别指令中的潜在冲突',
      '必要时主动确认模糊的参数',
      '比豆包考虑的多、更周到',
    ],
    audio: 'assets/audio/goodcase_9c08129a.mp3',
    audioLabel: '记复杂命令理解',
    accent: '#fbbf24',
    accent2: '#f59e0b',
  },
  {
    id: 'mianshi',
    index: '07',
    title: '高强度面试',
    subtitle: 'Interview Coach',
    tagline: '算法工程师面试陪练',
    desc: '扮演 AI 公司算法工程师面试官，基于你的简历深度追问，一问一答、有 1-2 次 follow-up，节奏专业。',
    scenes: [
      '不套话，追问细节到位',
      '按照职业面试的节奏推进',
      '面试深度比豆包强很多',
    ],
    audio: 'assets/audio/mianshi.WAV',
    audioLabel: '高强度面试',
    accent: '#00b4d8',
    accent2: '#0077b6',
  },
];

// === § 副语言感知 cases（诊断面板式） ===
export const PARALINGUISTIC_CASES = [
  {
    id: '85b444df',
    index: '01',
    title: '情绪识别 · 环境识别',
    tagline: '从声音里嗅到你所处的场景和状态',
    desc: '用户没有明说自己在床上、也没说自己在难过，模型从语气、呼吸、背景声里把这些都嗅出来了。',
    detects: [
      { icon: '🎭', label: '情绪', value: '委屈 · 低落' },
      { icon: '🏠', label: '环境', value: '卧室，安静' },
      { icon: '🛌', label: '姿态', value: '躺着' },
      { icon: '🫁', label: '呼吸', value: '浅而慢' },
    ],
    audio: 'assets/audio/goodcase_85b444df.mp3',
    audioLabel: '情绪识别 · 环境识别',
    accent: '#818cf8',
  },
  {
    id: '288a72d5',
    index: '02',
    title: '副语言理解 · 歌声评价',
    tagline: '不止听内容，还听音色、节奏和共鸣',
    desc: '用户唱了一段，模型给出了相当专业的评价：音准稳定，但共鸣偏前、气息不够支撑，并给了改进方向。',
    detects: [
      { icon: '🎵', label: '音准', value: '稳定' },
      { icon: '🎤', label: '共鸣', value: '偏前，可下沉' },
      { icon: '💨', label: '气息', value: '支撑不足' },
      { icon: '⏱', label: '节奏', value: '微赶拍' },
    ],
    audio: 'assets/audio/case_288a72d5.mp3',
    audioLabel: '副语言理解 · 歌声评价',
    accent: '#a5b4fc',
  },
];

// === § 贴合语境神级表现力 cases（中心 stage） ===
export const EXPRESSION_CASES = [
  {
    id: '87e80eec',
    title: '共情能力拉满',
    subtitle: 'Context-Aware Expression',
    tagline: '每一次开口，都和当下的氛围完美契合',
    desc: 'Global 全局场景定调 + 句内细节雕琢。语速、重音、停顿都跟着对话氛围精细调整，轻笑和叹息自然融入。',
    performs: [
      '轻笑', '叹息', '语速跃迁', '重音强调',
      '停顿留白', '气声表达', '情绪递进',
    ],
    audio: 'assets/audio/goodcase_87e80eec.mp3',
    audioLabel: '共情能力拉满 · 小鱼儿',
    accent: '#a855f7',
    accent2: '#a78bfa',
  },
];

// === Personas（不变） ===
// 添加新人设：放头像到 assets/img/avatars/，视频到 assets/video/persona/，
// 音频到 assets/audio/，然后在下方数组追加一项。
export const PERSONAS = [
  {
    id: 'tianfeifei',
    name: '田菲菲',
    tag: '元气少女',
    desc: '咋呼又暖心，吐槽和宠你之间反复横跳。',
    avatar: 'assets/img/avatars/tianfeifei.png',
    video: 'assets/video/persona/tianfeifei_subbed.mp4',
    accent: '#ff8ab0',
  },
  {
    id: 'sujinyan',
    name: '苏烬言',
    tag: '冷淡贵公子',
    desc: '语气克制，关心藏在字里行间，逐字都得品。',
    avatar: 'assets/img/avatars/sujinyan.png',
    video: 'assets/video/persona/sujinyan_subbed.mp4',
    accent: '#818cf8',
  },
];

export const MODEL = {
  name: 'StepAudio-2.5-Realtime',
  displayName: 'StepAudio-2.5 Realtime',
  tagline: '真正具备「活人感」的实时语音大模型',
  subTagline: '全维度打造专属人设，连每一次呼吸和轻笑都不掉戏。',
  intro: '你的活人感 AI 聊天伴侣',
  introBody:
    'StepAudio-2.5-Realtime 是 StepFun 新一代实时语音对话大模型，从「是否像个真人」出发，重构语音交互的温度与密度。它懂你语气里的迟疑、能精准拿捏重音与轻笑、会在合适的时机叹一口气——不再是冰冷的 AI，而是有脾气、有态度、懂接梗的鲜活搭子。',
  links: {
    arxiv: '#',
    github: '#',
  },
};

// 宣发重点四大亮点
export const HIGHLIGHTS = [
  {
    id: 'xiaoyue',
    tag: '标杆 IP',
    title: '「小跃」首发',
    size: 'large',
    desc: '主打同频唠嗑的松弛感与拉满的情绪价值。它不再是冰冷的 AI，而是有脾气、有态度、懂接梗的鲜活搭子，为你带来最自然、好玩的陪伴体验。',
    iconPath:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z',
  },
  {
    id: 'persona',
    tag: '千万人设',
    title: '完全自定义',
    size: 'small',
    desc: '真正实现「全维灵魂捏脸」，彻底打破预设模板束缚。支持细颗粒度定义性格特征、专属口癖与情绪边界。',
    iconPath:
      'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  },
  {
    id: 'context',
    tag: '神级表现力',
    title: '贴合语境',
    size: 'small',
    desc: '精准洞察对话氛围，极细颗粒度地拿捏语速、重音与潜台词；发声时自然融入轻笑、叹息等真实细节。',
    iconPath:
      'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
  },
  {
    id: 'iq-eq',
    tag: '对话双商',
    title: '智商情商双领跑',
    size: 'large',
    desc: '不仅能深度理解复杂语意、机智抛梗，更具备行业顶级副语言感知力——瞬间读懂你语气中的迟疑与轻笑，极速输出契合度拉满的高情商反馈。',
    iconPath:
      'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
];

// 技术路线优势
export const TECH_POINTS = [
  {
    step: '01',
    title: '百万级语料裂变',
    subtitle: '构筑全场景泛化底座',
    desc: '基于 10,000+ 高质量原生人设，通过算法裂变出百万级人设特征矩阵，并融合百万级真实场景对话语料进行训练。即使面对极具挑战的长尾话题，也能表现出稳健的应对与延展能力。',
  },
  {
    step: '02',
    title: '专属 RLHF 对齐',
    subtitle: '重塑复杂交互稳定性',
    desc: '针对 Roleplay 场景进行了深度的 RLHF 对齐优化。在极端压力测试下，StepAudio-2.5-Realtime 依然能够「死死咬住」设定的人设，展现出了极高稳定的角色演绎能力。',
  },
  {
    step: '03',
    title: '理解与生成融合',
    subtitle: '全局与局部的精细声控',
    desc: '全面继承业内顶尖的 StepAudio-2.5-TTS 能力。结合强化学习训练，实现「Global 全局场景定调」与「句内细节雕琢」的双重能力，能够精准洞察对话氛围。',
  },
];

// 指标对比
export const METRICS = {
  dims: [
    { key: 'human_eval', label: 'step_chat_human_eval', hint: '主观评估' },
    { key: 'general', label: 'step_chat_general', hint: '客观评估' },
    { key: 'car', label: 'step_chat_car', hint: '客观评估' },
    { key: 'au', label: 'step_chat_au', hint: '客观评估' },
    { key: 'spqa', label: 'step_chat_spqa', hint: '客观评估' },
  ],
  rows: [
    {
      name: 'DouBao APP-202604',
      isOurs: false,
      values: { human_eval: 70.7, general: null, car: null, au: null, spqa: null },
    },
    {
      name: 'Gemini live-202604',
      isOurs: false,
      values: { human_eval: 67.16, general: null, car: null, au: null, spqa: null },
    },
    {
      name: 'GPT-realtime-1.5',
      isOurs: false,
      values: { human_eval: 68.01, general: null, car: null, au: null, spqa: null },
    },
    {
      name: 'Grok',
      isOurs: false,
      values: { human_eval: null, general: null, car: null, au: null, spqa: null },
    },
    {
      name: 'StepAudio-2.5-Realtime',
      isOurs: true,
      values: { human_eval: 80.41, general: 86.36, car: 84.8, au: 82.18, spqa: 79.8 },
    },
  ],
};

// 人设头像配色（胶囊）
const AVATARS = {
  jingLan: { name: '婧岚', color1: '#9b7bff', color2: '#818cf8' },
  chenYu:  { name: '陈鋆', color1: '#b794ff', color2: '#e694ff' },
  yuXin:   { name: '宇欣', color1: '#ff8ab0', color2: '#ff5577' },
  tianFei: { name: '田飞', color1: '#a5b4fc', color2: '#6366f1' },
  wuYan:   { name: '吴燕', color1: '#5ce1a8', color2: '#00c4a1' },
};

// GOOD CASES, 分类
export const CASES = {
  categories: [
    {
      id: 'paralinguistic',
      title: '副语言感知',
      subtitle: '情绪、呼吸、轻笑、叹息，尽在掌握',
      authors: [AVATARS.jingLan, AVATARS.chenYu],
      items: [
        {
          title: '情绪识别 · 环境识别',
          desc: '「确实也在床上」——从语气和背景声里嗅到对话者的真实状态。',
          audio: 'goodcase_85b444df.mp3',
        },
        {
          title: '睡前谈心 · 跟着一起吐槽',
          desc: '"理发师把我的刘海剪得像个条形码一样"——小跃能接住这种破碎感，一起 emo 一起乐。',
          audio: 'goodcase_85a8322e.mp3',
        },
      ],
    },
    {
      id: 'iq-eq',
      title: '双商领跑',
      subtitle: '情绪安抚 × 知识硬核 × 机智接梗',
      authors: [AVATARS.jingLan, AVATARS.chenYu],
      items: [
        {
          title: '情绪安抚，稳稳支招',
          desc: '当你焦虑发作的深夜，不是机械安慰，而是带着同理心给出可执行的 tips。',
          audio: 'goodcase_b2b10e2e.mp3',
        },
        {
          title: '知识快问快答',
          desc: '最长的河考虑得更全面，仔细求证而不是张口就来，比豆包的效果更细腻。',
          audio: 'goodcase_734032ff.mp3',
        },
        {
          title: '共情能力拉满',
          desc: '面对复杂情绪，模型能识别潜台词并主动反问，让对话越聊越深。',
          audio: 'goodcase_87e80eec.mp3',
        },
      ],
    },
    {
      id: 'persona',
      title: '千万人设',
      subtitle: '从「田菲菲」到「苏烬言」，千人千面',
      authors: [AVATARS.yuXin, AVATARS.tianFei],
      items: [
        {
          title: '田菲菲 · 鲜活少女感',
          desc: '随手捏出的元气人设，口癖、语气、叙事节奏都在线。',
          audio: 'goodcase_d63b4905.mp3',
        },
        {
          title: '田菲菲 · 进阶对话',
          desc: '同一人设持续对话，人物性格和回应方式保持稳定。',
          audio: 'goodcase_fda43728.mp3',
        },
        {
          title: '苏烬言 · 冷静沉稳',
          desc: '男性低沉嗓音人设，情绪起伏克制但有张力。',
          audio: 'goodcase_3b74bdd1.mp3',
        },
        {
          title: '副语言理解 · 歌声评价',
          desc: '让模型对一段歌声做出专业而不失温度的点评。',
          audio: 'case_288a72d5.mp3',
        },
      ],
    },
    {
      id: 'expression',
      title: '语境神级表现力',
      subtitle: '飞花令、面试、复杂命令——全局定调 + 细节雕琢',
      authors: [AVATARS.yuXin, AVATARS.tianFei],
      items: [
        {
          title: '飞花令 · 意境递增',
          desc: '相比豆包，加入战争题材，意境逐层递进，不只押字还要押情绪。',
          audio: 'goodcase_5dab6299.mp3',
        },
        {
          title: '飞花令 · 高难变体',
          desc: '固定第一个字的飞花令，模型仍能稳定产出且保留文采。',
          audio: 'goodcase_ac0e7b4f.mp3',
        },
        {
          title: '记复杂命令理解',
          desc: '比豆包多考虑一步：不仅接住指令，还能预判边界条件。',
          audio: 'goodcase_9c08129a.mp3',
        },
        {
          title: '高强度面试',
          desc: '面试深度比豆包强很多，追问自然，节奏紧凑。',
          audio: 'mianshi.WAV',
        },
        {
          title: '无聊解闷',
          desc: '在没话找话的场景里维持节奏，随机丢梗，像个朋友。',
          audio: 'goodcase_a28bfb41.mp3',
        },
        {
          title: '闲聊 · 副业小助手',
          desc: '陪聊不跑题，最后一轮还能复读关键点。',
          audio: 'goodcase_aab0f745.mp3',
        },
      ],
    },
  ],
};
