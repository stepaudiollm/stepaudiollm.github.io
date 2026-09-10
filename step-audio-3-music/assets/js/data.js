/* =============================================================================
   示例曲目数据 —— **正式示例，不是占位数据**
   -----------------------------------------------------------------------------
   本文件由 tools/build_showcase_data.py 从素材目录生成，不要手改：
       /data/projects/stepmusic/music-demo/showcases/<分区>/<case>.txt
   改了素材或想调标签/英文译文，改那个脚本里的 META 表再重跑：
       python3 tools/build_showcase_audio.py   # 音频 → 128k mp3
       python3 tools/build_showcase_data.py    # 本文件

   几个口径：
     * caption 是**源 txt 里 prompt 的原文**，不改写 —— 展示的价值就在于「真实
       输入长什么样」。所以中文界面上也会出现英文 prompt（源里 8 个 case 的输入
       本来就是英文写的），这是有意的；caption_en 给的是英文渲染。
     * duration 由产物 mp3 实测取整；播放器 loadedmetadata 还会再校正一次。
     * 歌词已归一化成「段内不空行、段间空一行」，与 player.js 的逐行解析对齐。
   四个分区与接口 task 的对应关系见 assets/js/api.js 的 TASK_MAP。
   每个分区 5 首 —— 聆听页一排放 5 张，首页精选正好 4 排 × 5 列 = 20 首。
   ============================================================================= */

export const SECTIONS = [
  { id: 'song',         task: 'text_to_music',  instrumental: false },
  { id: 'instrumental', task: 'text_to_music',  instrumental: true  },
  { id: 'vocal2music',  task: 'vocal_to_music', instrumental: false },
  { id: 'cover',        task: 'music_cover',    instrumental: false },
];

export const TRACKS = [
  /* ── 歌曲创作 text_to_music ──────────────────────────────────────────────── */
  {
    id: "t-01", section: "song", cover: "assets/covers/cover-s02-sculpture-01.webp",
    audio: "assets/audio/tracks/t-01.mp3", duration: 153,
    title: "怎么两清", title_en: "Call It Even",
    tags: ["流行抒情", "女声", "G minor"], tags_en: ["Pop ballad", "Female", "G minor"],
    caption: "一首中文现场感流行抒情歌，女声演唱，G小调，74 BPM，4/4拍。真实乐队单遍演奏，无电子铺底和电子效果。钢琴、木吉他、真实贝斯、毛刷鼓与小编制弦乐，保留自然房间空气和演奏动态。无前奏，直接进入歌词。主歌低声克制，后段逐渐加入弦乐并轻微抬高情绪。歌词强调关系中的空缺、反问、重复与留白。人声近距离、真实自然、轻微颤音与呼吸感，仅轻微修音，禁止Vocoder、自动和声、合成人声及任何明显电音或机器人修音效果。",
    caption_en: "A Chinese pop ballad with a live-room feel, female vocal, G minor, 74 BPM, 4/4. A real band playing in one take, no electronic bed or effects. Piano, acoustic guitar, real bass, brushed drums and a small string section, keeping the natural room air and playing dynamics. No intro — straight into the lyrics. Verses low and restrained, strings gradually entering later to lift the emotion slightly. The lyrics dwell on absence in a relationship, rhetorical questions, repetition and silence. Vocal close-mic, natural and real, light vibrato and audible breath, only minimal tuning; no vocoder, no auto-harmony, no synthetic voice, and no obvious autotune or robotic processing.",
    lyrics: "[Verse 1]\n走到这里算什么。\n靠近以后又沉默。\n那些没说完的呢。\n还在心里反复着。\n\n[Verse 2]\n明明已经放下了。\n偏偏又想起什么。\n如果重来一次呢。\n你还会不会认错。\n\n[Refrain]\n我们怎么两清呢。\n怎么把爱说成路过。\n如果没有谁亏欠谁。\n为什么还是难过。\n\n[Verse 2, repeat melody with variation]\n后来也遇见很多人。\n没有一个像你那么沉默。\n我以为时间会替我说。\n却越安静越听见心里的褶皱。\n\n[Refrain]\n我们怎么两清呢。\n怎么把爱说成路过。\n如果没有谁亏欠谁。\n为什么还是难过。\n\n[Final Refrain]\n我们终于两清了。\n不是原谅也不是解脱。\n只是这一回转身以后。\n我不再等你回头看我。",
  },
  {
    id: "t-02", section: "song", cover: "assets/covers/cover-warm-03.jpg",
    audio: "assets/audio/tracks/t-02.mp3", duration: 220,
    title: "檐下听雨", title_en: "Rain Under the Eaves",
    tags: ["国风", "女声", "古筝 · 笛子"], tags_en: ["Guofeng", "Female", "Guzheng"],
    caption: "想听一首比较唯美伤感的国风歌曲，女声演唱，有古筝和笛子，旋律要有东方韵味，整体像电影主题曲一样。",
    caption_en: "I want a beautiful, wistful guofeng song, female vocal, with guzheng and bamboo flute. The melody should carry an oriental flavour, the whole thing like a film theme.",
    lyrics: "[Intro, soft guzheng arpeggio with distant rain sound]\n青石板 又漫过一层浅寒\n旧伞沿 还沾着去年的云烟\n檐下风铃 晃过三两句闲谈\n我数着 瓦当上的雨痕慢慢\n\n[Verse 1, soft groove with guzheng and bamboo flute accents, gentle vocal delivery]\n你走后 茶盏总温到半晚\n窗外的 芭蕉叶又绿了一盏\n纸鸢断了线 飞过了山南\n我还停在 初遇的那扇门环\n\n[Pre-Chorus 1, strings gradually enter, vocal builds with quiet intensity]\n故事里 总说缘分会重走\n可我的 伞面已经绣满了秋\n你留下的 半阙词还在案头\n墨色里 藏着没说出口的挽留\n\n[Chorus 1, warm percussion joins, vocal swells with emotional nuance]\n檐下雨 滴答滴答敲着石栏\n我提笔 却写不完半阙遗憾\n你送的 那支竹簪还别在领边\n风一吹 就晃过旧时容颜\n阶上苔 又漫过了第三遍\n我还等 一个不会来的人\n\n[Verse 2, stripped back to guzheng and soft beat, intimate vocal tone]\n秋千索 已经生了薄薄的锈\n巷口卖 花灯的老伯换了新袖\n我折了 第三枝桂花藏进袖口\n怕香气 惊扰了记忆的渡口\n\n[Pre-Chorus 2, tension builds with rising string layers]\n后来我 走过了许多的山川\n见过更 明媚的春和暖的岸\n可每当 雨声敲过青石板的晚\n我还是 会想起你递伞的瞬间\n\n[Chorus 2, fuller arrangement, vocal carries more ache and resolve]\n檐下雨 滴答滴答敲着石栏\n我提笔 却写不完半阙遗憾\n你送的 那支竹簪已经生了锈边\n风一吹 就落满旧时尘埃\n阶上苔 又漫过了第三遍\n我还等 一个不会来的人\n\n[Bridge, arrangement pulls back to piano and rain sound, vocal is soft and reflective]\n原来最难忘 是檐下那阵风\n吹过了 就不再回头\n\n[Final Chorus, full arrangement returns with emotional release, vocal is warm and resolved]\n檐下雨 滴答滴答敲着石栏\n我提笔 终于写完半阙遗憾\n你送的 那支竹簪我收进了箱奁\n风一吹 就封存旧时容颜\n阶上苔 已经漫过了好几遍\n我放下 那个不会来的人\n\n[Outro, guzheng fades out with soft rain sound]",
  },
  {
    id: "t-03", section: "song", cover: "assets/covers/cover-s19-diorama-05.webp",
    audio: "assets/audio/tracks/t-03.mp3", duration: 172,
    title: "Start Fresh Today", title_en: "Start Fresh Today",
    tags: ["民谣流行", "男声", "D major"], tags_en: ["Folk-pop", "Male", "D major"],
    caption: "A folk-pop song with orchestral influences, with a male vocal, in D major. The vocal is warm, raspy, and intimate, delivered gently and reflectively. The groove is soft, steady, and unhurried. The texture feels organic, warm, and delicate. The emotional tone is bittersweet, nostalgic, tender, and melancholic.",
    caption_en: "A folk-pop song with orchestral influences, with a male vocal, in D major. The vocal is warm, raspy, and intimate, delivered gently and reflectively. The groove is soft, steady, and unhurried. The texture feels organic, warm, and delicate. The emotional tone is bittersweet, nostalgic, tender, and melancholic.",
    lyrics: "[Intro]\n\n[Verse 1]\nThe iron gate stands tall and cold\nWhere stories of my childhood were told\nYour calloused palm, it finds my own\nA warmth that I have always known\n\n[Chorus 1]\n\"Start fresh today,\" you softly say\nThe shadows of the child fade away\nUnder the sky of grey and blue\nI'm beginning again because of you\n\n[Verse 2]\nI remember how I gripped your sleeve\nToo small to want to let you leave\nBut you still see the boy inside\nWith nowhere left for me to hide\n\n[Chorus 2]\n\"Start fresh today,\" you softly say\nThe shadows of the child fade away\nUnder the sky of grey and blue\nI'm beginning again because of you\n\n[Verse 3]\nThe morning bell begins to chime\nA ritual from a distant time\nI'll carry your strength in every stride\nWith nothing left to push aside\n\n[Outro]",
  },
  {
    id: "t-04", section: "song", cover: "assets/covers/cover-s05-portrait-01.webp",
    audio: "assets/audio/tracks/t-04.mp3", duration: 192,
    title: "Pixel Love", title_en: "Pixel Love",
    tags: ["Soul", "男声", "E minor"], tags_en: ["Soul", "Male", "E minor"],
    caption: "A soul song with orchestral and reggae influences, with a male vocal, in E minor. The vocal is warm, wounded, and restrained, delivered quietly and tiredly, with subtle tremolo. The groove is steady, sparse, and connected. The texture feels dark, spacious, and rain-soaked. The emotional tone is painful, rejected, quiet, and broken.",
    caption_en: "A soul song with orchestral and reggae influences, with a male vocal, in E minor. The vocal is warm, wounded, and restrained, delivered quietly and tiredly, with subtle tremolo. The groove is steady, sparse, and connected. The texture feels dark, spacious, and rain-soaked. The emotional tone is painful, rejected, quiet, and broken.",
    lyrics: "[Verse 1]\nConcrete walls are sweating in the dark\nI hear your footsteps turn into a spark\nYou said the things you typed were never real\nNow I'm just a ghost you'll never feel\n\n[Chorus 1]\nAnd the typhoon screams outside the door\nYou walked away, I'm shattered on the floor\nA pixel love, a flicker on a screen\nGone like the signal, lost in the machine\n\n[Verse 2]\nThe generator hums a funeral drone\nI trace the cracks, a king upon a broken throne\nYou couldn't love the shadow that you made\nSo you just left the promise to decay\n\n[Chorus 2]\nAnd the typhoon screams outside the door\nYou walked away, I'm shattered on the floor\nA pixel love, a flicker on a screen\nGone like the signal, lost in the machine\n\n[Bridge]\nWas any of it true behind the glass?\nOr just a way to make the lonely pass?\nThe water's rising, but I feel so dry\nNo tears left for another goodbye\n\n[Coda]",
  },
  {
    id: "t-05", section: "song", cover: "assets/covers/cover-s20-botanical-01.webp",
    audio: "assets/audio/tracks/t-05.mp3", duration: 207,
    title: "Fluorescent Goodbye", title_en: "Fluorescent Goodbye",
    tags: ["另类摇滚", "男声", "Cinematic"], tags_en: ["Alt-rock", "Male", "Cinematic"],
    caption: "A cinematic alternative rock song with trap and blues influences, featuring a raspy male vocal and a quiet yet determined mood.",
    caption_en: "A cinematic alternative rock song with trap and blues influences, featuring a raspy male vocal and a quiet yet determined mood.",
    lyrics: "[Verse 1]\nBlue light dripping on the linoleum floor\nThree a.m. buzzing through an automatic door\nYour shadow cut across me like a blade in white\nI had a thousand words, they died under that light\n\n[Chorus 1]\nIn this fluorescent goodbye, I bite my tongue till it bleeds\nYou walk away so clean, while the whole hall shakes in me\nI wanna break the silence, I wanna tear through the night\nBut all I do is stand there under hospital light\n\n[Verse 2]\nThe vending machine hummed like a cheap old choir\nPaper cups, cold coffee, a mouth full of wire\nI loved you in the dark where nobody could see\nNow even my anger won't speak up for me\n\n[Chorus 2]\nIn this fluorescent goodbye, I bite my tongue till it bleeds\nYou walk away so clean, while the whole hall shakes in me\nI wanna break the silence, I wanna tear through the night\nBut all I do is stand there under hospital light\n\n[Bridge]\nMaybe mercy ain't soft, maybe mercy is steel\nMaybe letting you go is the first thing that's real\nIf I can't make you turn, I can carry my name\nOut of this freezing corridor, out of your frame\n\n[Outro]\nThe hallway stays cold, but my heartbeat won't bow\nYou don't look back at me, and I don't need it now\nBb dawn in the windows, pale gold on the wall\nI didn't make you love me, but I won't lose it all",
  },
  /* ── 纯音乐创作 text_to_music + instrumental ──────────────────────────────── */
  {
    id: "t-06", section: "instrumental", cover: "assets/covers/cover-s12-archive-04.webp",
    audio: "assets/audio/tracks/t-06.mp3", duration: 133,
    title: "First Snow in Town", title_en: "First Snow in Town",
    tags: ["钢琴", "器乐", "C major"], tags_en: ["Piano", "No vocals", "C major"],
    caption: "能不能帮我做一首温柔的钢琴曲，电影配乐那种感觉，C大调、85拍，用主题和变奏展开，带点八十年代的暖意，像安静小镇落下第一场雪，不要人声。",
    caption_en: "Could you make me a gentle piano piece, the film-score kind of feel, C major at 85 BPM, built as theme and variations, with a touch of eighties warmth — like the first snow falling on a quiet small town. No vocals.",
    instrumental: true,
  },
  {
    id: "t-07", section: "instrumental", cover: "assets/covers/cover-s03-collage-04.webp",
    audio: "assets/audio/tracks/t-07.mp3", duration: 171,
    title: "Neon Taiko", title_en: "Neon Taiko",
    tags: ["Bebop", "器乐", "太鼓"], tags_en: ["Bebop", "No vocals", "Taiko"],
    caption: "经典 bebop, Jupiter-8, 太鼓合奏, 空旷混响, 精致制作",
    caption_en: "classic bebop, Jupiter-8, taiko ensemble, cavernous reverb, polished production",
    instrumental: true,
  },
  {
    id: "t-08", section: "instrumental", cover: "assets/covers/cover-city-01.jpg",
    audio: "assets/audio/tracks/t-08.mp3", duration: 163,
    title: "Quiet Majesty", title_en: "Quiet Majesty",
    tags: ["管弦", "器乐", "Cinematic"], tags_en: ["Orchestral", "No vocals", "Elegant"],
    caption: "An elegant and contemplative orchestral piece.",
    caption_en: "An elegant and contemplative orchestral piece.",
    instrumental: true,
  },
  {
    id: "t-09", section: "instrumental", cover: "assets/covers/cover-s09-science-03.webp",
    audio: "assets/audio/tracks/t-09.mp3", duration: 99,
    title: "Level One", title_en: "Level One",
    tags: ["游戏配乐", "器乐", "复古"], tags_en: ["Game score", "No vocals", "Retro"],
    caption: "复古游戏配乐，开头只有一条低沉的固定音型，慢慢堆叠成饱满的完整编曲",
    caption_en: "Retro video-game score. It opens on a single low ostinato and slowly stacks up into a full, rich arrangement.",
    instrumental: true,
  },
  {
    id: "t-10", section: "instrumental", cover: "assets/covers/cover-s04-retrofuture-04.webp",
    audio: "assets/audio/tracks/t-10.mp3", duration: 91,
    title: "Neon Horizon", title_en: "Neon Horizon",
    tags: ["City Pop", "器乐", "808"], tags_en: ["City Pop", "No vocals", "808"],
    caption: "City Pop with soaring melodies and crisp 808 claps",
    caption_en: "City Pop with soaring melodies and crisp 808 claps",
    instrumental: true,
  },
  /* ── 清唱配乐 vocal_to_music（旋律跟随清唱） ─────────────────────────────────────── */
  {
    id: "t-11", section: "vocal2music", cover: "assets/covers/cover-s01-minimal-03.webp",
    audio: "assets/audio/tracks/t-11.mp3", duration: 238,
    title: "那颗星星", title_en: "That Star",
    tags: ["City Pop", "女声", "Bossa Nova"], tags_en: ["City Pop", "Female", "Bossa Nova"],
    caption: "一首温暖治愈的 City Pop 女声歌曲，带一点 Bossa Nova 和轻摇滚风格，轻松摇曳，温柔又充满希望。",
    caption_en: "A warm, healing City Pop song with a female vocal, with a touch of bossa nova and soft rock — easy and swaying, tender and full of hope.",
    lyrics: "[Intro]\n\n[Verse 1]\n被你看着的那颗星星悬在天上的那颗星星似曾相识的位置曾经坐着我和你\n\n[Verse 2]\n像个傻子似的想着你小心翼翼到错过时机最后也会像那颗星星淹没在云际\n\n[Pre-Chorus 1]\n总是会闻到你的味道\n想着会看到你的容貌\n\n[Chorus 1]\n所有的你脑海中的你 oh你是因为这个他想要为你找到你的心\n\n[Instrumental 1]\n嗯嗯\n\n[Instrumental 2]\n\n[Verse 3]\n现在天上的那颗星星也曾牢牢被我握在手心那个没有特别人的东西全部都是你\n\n[Verse 4]\n并不是那么难以忘记也没有那么刻骨铭心我们从平行直到相遇也算幸运\n\n[Pre-Chorus 2]\n总是会闻到你的味道再来再去收拾残局会看到你的容貌\n\n[Chorus 2]\n所有的你脑海中的 melody是因为这个他想要为你找到你的心\n\n[Bridge 1]\n我想问你有没有这一世想起要问自己是否也会独自叹息想问你有没有你曾在别的房间来不及对你再说最后一句对不起\n\n[Pre-Chorus 3]\n我不再闻到你的味道\n我也不记得\n你的容貌\n\n[Chorus 3]\n所有的你所有的你脑海中的你透明是因为这个他想要为你找到你的心\n\n[Outro]\n想要为你找到你的心",
    inputs: { vocal_audio: "assets/audio/refs/ref-vocal-01.mp3" },
  },
  {
    id: "t-12", section: "vocal2music", cover: "assets/covers/cover-s04-retrofuture-05.webp",
    audio: "assets/audio/tracks/t-12.mp3", duration: 134,
    title: "烟雨书签", title_en: "Misty-Rain Bookmark",
    tags: ["City Pop", "男声", "爵士 · 轻摇滚"], tags_en: ["City Pop", "Male", "Jazz · Soft rock"],
    caption: "一首温暖柔和的 City Pop 男声歌曲，带一点爵士和轻摇滚的感觉，氛围朦胧浪漫。",
    caption_en: "A warm, mellow City Pop song with a male vocal, with a touch of jazz and soft rock — hazy and romantic in mood.",
    lyrics: "[Intro]\n\n[Verse 1]\n雨丝沾湿青石板\n油纸伞斜过墙沿\n艾草香漫过巷口\n寒食的风慢半拍\n\n[Chorus 1]\n转拐角那瞬的对视\n像时间突然打了个颤\n我看见年轻的眉眼\n和旧照片里的春衫\n\n[Verse 2]\n她指尖沾着草叶绿\n发梢别着白木兰\n眼神清亮像我昨夜\n刚翻完的旧相册边\n\n[Chorus 2]\n隔着半米的烟雨天\n岁月突然递来书签\n我没敢上前说什么\n怕碰碎这片刻的缘\n\n[Instrumental, Warm brushed jazz drums and soft electric piano melody]\n\n[Bridge]\n风停了三秒的瞬间\n宿命轻轻绕我肩\n原来我寻了半生的暖\n早站在很多年前\n\n[Chorus 3]\n青砖缝里长出新藓\n她转身往雾里走远\n我攥紧手里的清明果\n把这份软埋在心间\n\n[Outro]",
    inputs: { vocal_audio: "assets/audio/refs/ref-vocal-02.mp3" },
  },
  {
    id: "t-13", section: "vocal2music", cover: "assets/covers/cover-s15-scanner-02.webp",
    audio: "assets/audio/tracks/t-13.mp3", duration: 275,
    title: "Golden Afternoon", title_en: "Golden Afternoon",
    tags: ["民谣", "男声", "Latin"], tags_en: ["Folk", "Male", "Latin"],
    caption: "A warm and nostalgic folk song with Latin and orchestral influences, featuring gentle male vocals.",
    caption_en: "A warm and nostalgic folk song with Latin and orchestral influences, featuring gentle male vocals.",
    lyrics: "[Intro, Soft acoustic guitar strums]\n\n[Verse 1, restrained and conversational]\nConcrete still warm under my scuffed-up shoes\nCloudless blue stretching over the roofs\nI lean against the rail of the overpass now\nWind carries the smell of cut grass somehow\nThe city hums a lazy half-beat down below\nAnd I'm pulled back to a day I still know\n\n[Chorus 1, wider and warm]\nI still recall that golden afternoon\nYou smiled instead of asking for a due\nBroken clay across your garden stone\nAll my worry melted in the sun alone\nA small mistake that could've turned into a fight\nYou gave me grace that still glows in the light\n\n[Verse 2, intimate and nostalgic]\nI was just a kid running wild down the street\nTripped and sent your favorite planter to its feet\nMy heart was pounding, I thought I'd done wrong\nI hung my head and waited for the words of blame\nBut you just knelt down and brushed the shards away\nSaid, \"Some things break, but that's alright\"\nThen took my shaking hand and held it tight\nAnd somehow all the fear just slipped away\n\n[Chorus 2, wider and gently uplifting]\nI still recall that golden afternoon\nYou smiled instead of asking for a due\nBroken clay across your garden stone\nAll my worry melted in the sun alone\nA small mistake that could've turned into a fight\nYou gave me grace that still glows in the light\n\n[Bridge, reflective and gently uplifting]\nYears have passed, but I still hear your voice\nIn every moment kindness asks for choice\nMaybe growing up is learning how to see\nThe ones who gave us room to just be\nAnd when I find somebody lost and scared\nWith shaking hands and something broken there\nI hope the way I hold them in that light\nFeels a little like that golden afternoon\n\n[Outro, soft and nostalgic]\nConcrete still warm under my scuffed-up shoes\nCloudless blue stretching over the roofs\nThe city hums a lazy half-beat down below\nAnd I finally understand what you showed\nSome things break and some things fade away\nBut kindness finds a way to stay\nI leave the overpass and walk into the light\nCarrying that golden afternoon tonight",
    inputs: { vocal_audio: "assets/audio/refs/ref-vocal-03.mp3" },
  },
  {
    id: "t-14", section: "vocal2music", cover: "assets/covers/cover-s06-mascot-03.webp",
    audio: "assets/audio/tracks/t-14.mp3", duration: 163,
    title: "橘子糖", title_en: "Orange Candy",
    tags: ["民谣摇滚", "女声", "Latin"], tags_en: ["Folk rock", "Female", "Latin"],
    caption: "一首带拉丁风情的民谣摇滚女声歌曲，温柔略带沙哑，充满疲惫忧伤却又释然的感觉。",
    caption_en: "A folk-rock song with a Latin flavour and a female vocal — gentle, a little husky, full of weary sadness that finally lets go.",
    lyrics: "[Intro, Soft nylon-string guitar arpeggios]\n\n[Verse 1]\n纸箱堆在门旁边\n地板还留着打扫过的灰\n我靠在半装的柜边\n数着电梯上来的位\n\n[Chorus 1, Subtle distorted electric guitar layer]\n连熬了三晚的累\n都泡在玄关的风里碎\n楼梯口传来的脚步\n踩散了我所有的惶惑\n\n[Verse 2]\n钥匙转开第二圈\n门锁咔哒响得像安慰\n你拎着半袋橘子糖\n说晚了点但我没迷路\n\n[Chorus 2]\n连熬了三晚的累\n都泡在玄关的风里碎\n楼梯口传来的脚步\n踩散了我所有的惶惑\n\n[Bridge, Gentle ambient reverb swell]\n墙还是新的灰还没退\n灯还没挂影子零碎\n但只要你站在那门口\n我就知道 不用再怕黑\n\n[Outro, Fading acoustic strum]\n风碰着半开的窗\n橘子香漫过旧沙发\n嗯",
    inputs: { vocal_audio: "assets/audio/refs/ref-vocal-04.mp3" },
  },
  {
    id: "t-15", section: "vocal2music", cover: "assets/covers/cover-s14-textile-01.webp",
    audio: "assets/audio/tracks/t-15.mp3", duration: 127,
    title: "Laundry Wish", title_en: "Laundry Wish",
    tags: ["民谣流行", "男声", "Acoustic"], tags_en: ["Folk-pop", "Male", "Acoustic"],
    caption: "A warm and intimate acoustic folk-pop song with gentle male vocals, carrying a bittersweet and grateful mood.",
    caption_en: "A warm and intimate acoustic folk-pop song with gentle male vocals, carrying a bittersweet and grateful mood.",
    lyrics: "[Intro]\n\n[Verse 1, restrained and inward]\nCoin slot clicks, fluorescent hum\nMy birthday shirt’s still covered in rum\nFrom the office party last night\nI’m folding slow, out of time and light\n\n[Pre-Chorus]\nYou pushed the door, the bell above it rang\nSmiled and said you had an empty hang\nFor the dryer next to mine\nI froze up, almost dropped the line\n\n[Chorus 1]\nDirty socks and worn out jeans\nYou folded mine like it was a dream\nBirthday wish I didn’t dare to say\nYou’re already giving it away\n\n[Bridge]\nI don’t have cake, I don’t have champagne\nJust this small room, and your easy rain\nOf kindness I don’t know how to repay\nJust a quiet heart that’s starting to sway\n\n[Chorus 2]\nStained tee and faded sheets\nYou smoothed the creases like you know my needs\nThis little moment’s all I’ll ever need\nMore than any candle on any birthday\n\n[Ad-lib]\nMm, happy birthday to me\nYeah...\n\n[Outro]",
    inputs: { vocal_audio: "assets/audio/refs/ref-vocal-05.mp3" },
  },
  /* ── 歌曲翻唱 music_cover（旋律跟随参考歌曲） ──────────────────────────────────────── */
  {
    id: "t-16", section: "cover", cover: "assets/covers/cover-s09-science-05.webp",
    audio: "assets/audio/tracks/t-16.mp3", duration: 114,
    title: "两只老虎-cover", title_en: "Two Tigers (Cover)",
    tags: ["Pop · Jazz", "男声", "强节奏"], tags_en: ["Pop · Jazz", "Male", "Groove"],
    caption: "male vocal, pop and jazz genre, strong rhythm",
    caption_en: "male vocal, pop and jazz genre, strong rhythm",
    lyrics: "[Verse 1]\n两只老虎，两只老虎\n跑得快，跑得快\n一只没有耳朵，一只没有尾巴\n真奇怪，真奇怪\n\n[Verse 2]\n两只老虎，两只老虎\n跑得快，跑得快\n一只没有耳朵，一只没有尾巴\n真奇怪\n\n[Chorus 1]\n真奇怪，两只老虎\n两只老虎跑得快\n跑得快\n一只没有耳朵，一只没有尾巴\n真奇怪，真奇怪\n\n[Chorus 2]\n两只老虎，两只老虎\n跑得快，跑得快\n一只没有耳朵，一只没有尾巴\n真奇怪，真奇怪\n\n[Outro]\n一只没有耳朵，一只没有尾巴\n真奇怪，真奇怪",
    inputs: { song_audio: "assets/audio/refs/ref-song-01.mp3" },
  },
  {
    id: "t-17", section: "cover", cover: "assets/covers/cover-s06-mascot-05.webp",
    audio: "assets/audio/tracks/t-17.mp3", duration: 152,
    title: "烟雨书签-cover", title_en: "Misty-Rain Bookmark (Cover)",
    tags: ["Pop · R&B · Metal", "女声", "快节奏"], tags_en: ["Pop/R&B/Metal", "Female", "Fast"],
    caption: "Pop，R&B，metal，快节奏，女声",
    caption_en: "Pop, R&B, metal, up-tempo, female vocal",
    lyrics: "[Intro]\n\n[Verse 1]\n雨丝沾湿青石板\n油纸伞斜过墙沿\n艾草香漫过巷口\n寒食的风慢半拍\n\n[Chorus 1]\n转拐角那瞬的对视\n像时间突然打了个颤\n我看见年轻的眉眼\n和旧照片里的春衫\n\n[Verse 2]\n她指尖沾着草叶绿\n发梢别着白木兰\n眼神清亮像我昨夜\n刚翻完的旧相册边\n\n[Chorus 2]\n隔着半米的烟雨天\n岁月突然递来书签\n我没敢上前说什么\n怕碰碎这片刻的缘\n\n[Instrumental, Warm brushed jazz drums and soft electric piano melody]\n\n[Bridge]\n风停了三秒的瞬间\n宿命轻轻绕我肩\n原来我寻了半生的暖\n早站在很多年前\n\n[Chorus 3]\n青砖缝里长出新藓\n她转身往雾里走远\n我攥紧手里的清明果\n把这份软埋在心间\n\n[Outro]",
    inputs: { song_audio: "assets/audio/refs/ref-song-02.mp3" },
  },
  {
    id: "t-18", section: "cover", cover: "assets/covers/cover-s15-scanner-04.webp",
    audio: "assets/audio/tracks/t-18.mp3", duration: 190,
    title: "漏不掉你回眸-cover", title_en: "Your Backward Glance (Cover)",
    tags: ["Soul", "男声", "抒情"], tags_en: ["Soul", "Male", "Ballad"],
    caption: "Soul，温柔男声，抒情，心碎",
    caption_en: "Soul, gentle male vocal, lyrical, heartbroken",
    lyrics: "[Chorus 1]\n你背影没收 黄昏的温柔\n风把余温都吹成 冷的褶皱\n我在河堤这头 把沉默当朋友\n以为藏得住 却湿透 了眼眸\n\n[Verse 1]\n芦苇在摇 像那年 你握我的手\n夕阳只肯借 半分钟 停在我肩头\n有些话卡在 最轻 的呼吸里头\n说出来了 是不是 就能算旧\n\n[Chorus 2]\n你背影没收 黄昏的温柔\n风把余温都吹成 冷的褶皱\n我在河堤这头 把沉默当朋友\n以为藏得住 却湿透 了眼眸\n\n[Verse 2]\n晚风推着我 往回忆里走\n那些没说出口 现在更说不出口\n原来想念是 一种 戒不掉的酒\n你背影越淡 我心越满 越难受\n\n[Bridge]\n如果再见 不过是 擦肩的时差\n如果告别 早被时间 悄悄风化\n我为何还站在 原地说着 无人听的话\n像一座 退潮后 搁浅的沙\n\n[Outro]\n天快黑了 影子 被河水流走\n我也该走了 带着 满口袋的愁\n只是这河堤 太像 记忆的漏斗\n漏掉了快乐 漏不掉 你回眸",
    inputs: { song_audio: "assets/audio/refs/ref-song-03.mp3" },
  },
  {
    id: "t-19", section: "cover", cover: "assets/covers/cover-s03-collage-05.webp",
    audio: "assets/audio/tracks/t-19.mp3", duration: 178,
    title: "法庭外的风-cover", title_en: "Courthouse Wind (Cover)",
    tags: ["Trap", "男声", "激昂"], tags_en: ["Trap", "Male", "Anthemic"],
    caption: "Trap，快节奏，男生，激昂，壮阔",
    caption_en: "Trap, up-tempo, male vocal, impassioned, expansive",
    lyrics: "[Verse 1]\n头盔还带着午后的灰\n外套有风一路在吹\n法院门前人来人往\n我站得比影子还累\n\n[Pre-Chorus]\n我本来准备了千万句\n准备和命运争个错对\n可看见你低下眼睛\n忽然只剩一声算了，别追\n\n[Chorus 1]\n就在法庭外的风里\n我把执念慢慢放回\n不再问谁欠谁一生\n不再让旧伤反复来催\n\n[Verse 2]\n这些年我穿过大街小巷\n红灯绿灯都像轮回\n凌晨的桥，深夜的胃\n都比一句再见更锋锐\n\n[Pre-Chorus]\n原来最难不是说分开\n是承认我们都尽过力对\n你抬头那一刻的沉默\n让我听见心里冰雪在退\n\n[Chorus 2]\n就在法庭外的风里\n我把执念慢慢放回\n不再问谁欠谁一生\n不再让旧伤反复来催\n\n[Bridge]\n愿你此后也有灯火可归\n愿我此后也敢爱敢飞\n我们没赢过年少轻狂\n却能输得坦荡一点，温柔一点面对\n\n[Outro]\n风吹过台阶，天色微微亮\n我扶正车把，也扶正余味\n城市还在等下一单\n而我已经能笑着向前飞",
    inputs: { song_audio: "assets/audio/refs/ref-song-04.mp3" },
  },
  {
    id: "t-20", section: "cover", cover: "assets/covers/cover-s10-zine-04.webp",
    audio: "assets/audio/tracks/t-20.mp3", duration: 179,
    title: "玻璃门外的蓝天-cover", title_en: "Blue Sky Outside (Cover)",
    tags: ["Trap", "男声", "D major"], tags_en: ["Trap", "Male", "D major"],
    caption: "A trap song, with a male vocal, in D major. The vocal is aggressive and confident. The groove is fast-paced and driving. The texture feels gritty and layered with heavy 808s. The emotional tone is intense and triumphant.",
    caption_en: "A trap song, with a male vocal, in D major. The vocal is aggressive and confident. The groove is fast-paced and driving. The texture feels gritty and layered with heavy 808s. The emotional tone is intense and triumphant.",
    lyrics: "[Intro]\n\n[Verse 1]\n又是这种雨天 走廊弥漫消毒水的咸\n白色墙壁 映着记忆里那张疲惫的脸\n消毒液的味道 曾让你眉头紧锁了一年\n我守在阴影里 算着时间 却看不见终点\n\n[Chorus 1]\n你推开沉重的玻璃门 没再回头看一眼\n在那一秒 我看见光落在你眉宇之间\n那是重获自由的轻松 像风挣脱了锁链\n虽然错过 但我为你此刻的笑而庆幸满点\n\n[Verse 2]\n雨刷在摆动 节奏像我们在重新律动\n那些沉重的吊瓶 终于都消失在半空\n你踏进雨帘 步履轻盈得像是一场梦\n我站在门后 所有的遗憾都变得很轻很从容\n\n[Chorus 2]\n你推开沉重的玻璃门 没再回头看一眼\n在那一秒 我看见光落在你眉宇之间\n那是重获自由的轻松 像风挣脱了锁链\n虽然错过 但我为你此刻的笑而庆幸满点\n\n[Bridge]\n原来放手也是一种成全 不必非要并肩\n看着你奔向广阔世界 我也学会了告别\n这走廊的冷清 终将被新的一天溶解\n你眼里的光 是我见过最美的季节\n\n[Coda]\n自由地走吧 别再回这阴影里面\n雨后的世界 才是你应有的蓝天\n玻璃门合上 故事在那一刻完结",
    inputs: { song_audio: "assets/audio/refs/ref-song-05.mp3" },
  },
];

/* 首页「精选作品」：4 排 × 5 首，就是全部 20 首。
   刻意打散成一个拉丁方 —— 5 列布局下任意一列都不出现重复的能力分区，
   这样首页看上去是「作品集」，而不是按能力分好组的目录（那是「聆听」页的事）。
   （每排 5 格但只有 4 个分区，所以行内必然有一个分区出现两次，这个躲不掉。）

   排序为整排轮转过一次：原先的最后一排提到了最前面，其余依次下移。
   轮转只是重新排列每一列的内部顺序，所以上面的拉丁方性质不受影响。 */
export const FEATURED_ORDER = [
  't-19', 't-05', 't-10', 't-15', 't-20',
  't-01', 't-06', 't-11', 't-16', 't-02',
  't-07', 't-12', 't-17', 't-03', 't-08',
  't-13', 't-18', 't-04', 't-09', 't-14',
];

/* 灵感示例：点一下填进输入框。取自上面 20 个正式示例里真实用过的 prompt，
   长的那几条按输入框的体量做了截取。structured prompt 比一句话信息量大。 */
export const RECIPES = [
  { label: "温柔钢琴", label_en: "Gentle Piano", instrumental: true,
    caption: "能不能帮我做一首温柔的钢琴曲，电影配乐那种感觉，C大调、85拍，用主题和变奏展开，带点八十年代的暖意，像安静小镇落下第一场雪，不要人声。",
    caption_en: "Could you make me a gentle piano piece, the film-score kind of feel, C major at 85 BPM, built as theme and variations, with a touch of eighties warmth — like the first snow falling on a quiet small town. No vocals." },
  { label: "治愈 City Pop", label_en: "Healing City Pop", instrumental: false,
    caption: "一首温暖治愈的 City Pop 女声歌曲，带一点 Bossa Nova 和轻摇滚风格，轻松摇曳，温柔又充满希望。",
    caption_en: "A warm, healing City Pop song with a female vocal, with a touch of bossa nova and soft rock — easy and swaying, tender and full of hope." },
  { label: "唯美国风", label_en: "Wistful Guofeng", instrumental: false,
    caption: "想听一首比较唯美伤感的国风歌曲，女声演唱，有古筝和笛子，旋律要有东方韵味，整体像电影主题曲一样。",
    caption_en: "I want a beautiful, wistful guofeng song, female vocal, with guzheng and bamboo flute. The melody should carry an oriental flavour, the whole thing like a film theme." },
  { label: "复古游戏", label_en: "Retro Game", instrumental: true,
    caption: "复古游戏配乐，开头只有一条低沉的固定音型，慢慢堆叠成饱满的完整编曲",
    caption_en: "Retro video-game score. It opens on a single low ostinato and slowly stacks up into a full, rich arrangement." },
  { label: "Bebop × 太鼓", label_en: "Bebop × Taiko", instrumental: true,
    caption: "经典 bebop, Jupiter-8, 太鼓合奏, 空旷混响, 精致制作",
    caption_en: "classic bebop, Jupiter-8, taiko ensemble, cavernous reverb, polished production" },
  { label: "拉丁民谣摇滚", label_en: "Latin Folk Rock", instrumental: false,
    caption: "一首带拉丁风情的民谣摇滚女声歌曲，温柔略带沙哑，充满疲惫忧伤却又释然的感觉。",
    caption_en: "A folk-rock song with a Latin flavour and a female vocal — gentle, a little husky, full of weary sadness that finally lets go." },
  { label: "电影感另类摇滚", label_en: "Cinematic Alt-Rock", instrumental: false,
    caption: "A cinematic alternative rock song with trap and blues influences, featuring a raspy male vocal and a quiet yet determined mood.",
    caption_en: "A cinematic alternative rock song with trap and blues influences, featuring a raspy male vocal and a quiet yet determined mood." },
  { label: "沉静管弦", label_en: "Contemplative Orchestral", instrumental: true,
    caption: "An elegant and contemplative orchestral piece.",
    caption_en: "An elegant and contemplative orchestral piece." },
  { label: "City Pop 器乐", label_en: "City Pop Instrumental", instrumental: true,
    caption: "City Pop with soaring melodies and crisp 808 claps",
    caption_en: "City Pop with soaring melodies and crisp 808 claps" },
  { label: "凶悍 Trap", label_en: "Hard Trap", instrumental: false,
    caption: "A trap song, with a male vocal, in D major. The vocal is aggressive and confident. The groove is fast-paced and driving. The texture feels gritty and layered with heavy 808s. The emotional tone is intense and triumphant.",
    caption_en: "A trap song, with a male vocal, in D major. The vocal is aggressive and confident. The groove is fast-paced and driving. The texture feels gritty and layered with heavy 808s. The emotional tone is intense and triumphant." },
];

export const TRACK_BY_ID = new Map(TRACKS.map(t => [t.id, t]));
