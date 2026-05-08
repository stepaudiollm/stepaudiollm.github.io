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
    id: 'iqeq-emotion',
    index: '01',
    title: '情绪安抚',
    subtitle: 'Emotional Support',
    tagline: '赛前焦虑时的接住 + 打气',
    desc: '先接住你的崩溃情绪，再从你自身经历里找出真实优势，帮你重拾信心。不是鸡汤，是真的懂你。',
    scenes: [
      '赛前抽签，抽到了国家一级运动员',
      '模型先共情，再引导回忆自身优势',
      '帮你重拾信心，充满期待地去迎战',
    ],
    audio: 'assets/audio/iqeq-emotion-update.WAV',
    audioLabel: '情绪安抚 · 打气鼓励',
    image: 'emotion.png',
    accent: '#ff8ab0',
    accent2: '#ff5577',
  },
  {
    id: 'iqeq-iq',
    index: '02',
    title: '知识快答',
    subtitle: 'Knowledge QA',
    tagline: '常识题、脑筋急转弯，一秒切换',
    desc: '从珠峰海拔 8848.86 米到「什么东西越洗越脏」，硬核地理知识和脑筋急转弯来回跳跃，反应不掉拍、节奏不打折。',
    scenes: [
      '精准报出珠峰 8848.86 米',
      '秒接脑筋急转弯：球门 / 瀑布',
      '题型切换不换节奏，始终在状态',
    ],
    audio: 'assets/audio/iqeq-iq.mp3',
    audioLabel: '知识快问快答',
    image: 'IQ.png',
    accent: '#5ed4ff',
    accent2: '#0160ff',
  },
  {
    id: 'iqeq-feihualing',
    index: '03',
    title: '飞花令',
    subtitle: 'Poem Relay',
    tagline: '"日"字固定首位，意境还不重样',
    desc: '关键字必须在第一位——这个限制下，模型接出了白居易、曹操、苏东坡等不同风格的名句，每轮气势和意境都没有掉档。',
    scenes: [
      '用「日出江花红胜火」对上萧瑟的「日暮乡关」',
      '接「日暮苍山远」换一种边塞意境',
      '用「日啖荔枝三百颗」反转为苏轼豁达',
    ],
    audio: 'assets/audio/iqeq-feihualing.mp3',
    audioLabel: '飞花令 · 日字首位',
    image: 'feihualing.png',
    accent: '#9b7bff',
    accent2: '#5ed4ff',
  },
  {
    id: 'iqeq-instruct',
    index: '04',
    title: '复杂命令理解',
    subtitle: 'Complex Instructions',
    tagline: '来回改了七次，最终版一字不差',
    desc: '点咖啡时反复推翻：冰→热、脱脂→燕麦奶、草莓→香草、超大杯→大杯。模型追踪每一个「啊不对」，最终准确复述四项最终定论，还调侃「脑回路比咖啡机转得还快」。',
    scenes: [
      '识别每次反悔，只记最终决定',
      '准确归纳：热拿铁·燕麦奶·香草·大杯',
      '幽默感在线，没有任何不耐烦',
    ],
    audio: 'assets/audio/iqeq-instruct.mp3',
    audioLabel: '复杂命令理解 · 订咖啡',
    image: 'instruct.png',
    accent: '#fbbf24',
    accent2: '#f59e0b',
  },
  {
    id: 'iqeq-interview',
    index: '05',
    title: '高强度面试',
    subtitle: 'Interview Coach',
    tagline: '语音大模型工程师岗，深度追问',
    desc: '扮演面试官对语音大模型候选人深度追问：自回归 vs 非自回归、低延迟与音质 trade-off、反讽语气识别方案。全程逻辑严密，还主动提供技术流和个人色彩两版参考答案。',
    scenes: [
      '问出「自回归 vs 非自回归」这类硬核题',
      '根据候选人答案即时 follow-up 追问',
      '主动给出技术流 + 个人色彩两版模板',
    ],
    audio: 'assets/audio/iqeq-interview.mp3',
    audioLabel: '高强度面试 · 语音大模型岗',
    image: 'interview.png',
    accent: '#00b4d8',
    accent2: '#0077b6',
  },
];

// === § 副语言感知 cases（诊断面板式） ===
export const PARALINGUISTIC_CASES = [
  {
    id: 'para-lang-0',
    index: '01',
    title: '情绪感知 · 读懂疲惫',
    tagline: '你没说累，但声音出卖了你',
    desc: '用户只是随口问了句「你觉得我现在情绪怎么样」，模型从尾音、语气和节奏里嗅出了那种「想躺平但还得硬撑」的疲惫，连「陷在沙发里」的姿态都说准了。',
    detects: [
      { icon: '🎭', label: '情绪', value: '疲惫 · 想吐槽' },
      { icon: '🛋️', label: '姿态', value: '陷在沙发里' },
      { icon: '🪫', label: '状态', value: '硬撑中' },
      { icon: '🎙️', label: '尾音', value: '出卖了真心话' },
    ],
    audio: 'assets/audio/para-lang-0.mp3',
    audioLabel: '情绪感知 · 读懂疲惫',
    accent: '#5ed4ff',
  },
  {
    id: 'para-lang-1',
    index: '02',
    title: '声音解析 · 年龄音色全读透',
    tagline: '不只听内容，连你多少岁都猜到了',
    desc: '用户没透露任何个人信息，模型从咬字松弛度、节奏感和尾音习惯，把年龄范围精准到 28–31 岁，还点出了「尾音带气声」这个高级小习惯，最后连唱功都夸到点上。',
    detects: [
      { icon: '👤', label: '性别', value: '女生，性格飒' },
      { icon: '🎂', label: '年龄', value: '28–31 岁' },
      { icon: '🎙️', label: '音色', value: '透亮 · 有亲和力' },
      { icon: '🎵', label: '唱功', value: '气息稳 · 情感表达准' },
    ],
    audio: 'assets/audio/para-lang-1.mp3',
    audioLabel: '声音解析 · 年龄音色全读透',
    accent: '#2be4c0',
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
    accent2: '#5ed4ff',
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
    video: 'assets/video/persona/tianfeifei.mp4',
    accent: '#ff8ab0',
  },
  {
    id: 'sujinyan',
    name: '苏烬言',
    tag: '冷淡贵公子',
    desc: '语气克制，关心藏在字里行间，逐字都得品。',
    avatar: 'assets/img/avatars/sujinyan.png',
    video: 'assets/video/persona/sujinyan.mp4',
    accent: '#5ed4ff',
  },
  {
    id: 'xiaoyuer',
    name: '小鱼儿',
    tag: '吐槽搭子',
    desc: '嘴硬心软，一边怼你一边为你出主意的损友。',
    avatar: 'assets/img/avatars/xiaoyuer.png',
    video: 'assets/video/persona/xiaoyuer.mp4',
    accent: '#a7f3d0',
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
  jingLan: { name: '婧岚', color1: '#9b7bff', color2: '#5ed4ff' },
  chenYu:  { name: '陈鋆', color1: '#b794ff', color2: '#e694ff' },
  yuXin:   { name: '宇欣', color1: '#ff8ab0', color2: '#ff5577' },
  tianFei: { name: '田飞', color1: '#2be4c0', color2: '#00a9ff' },
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
