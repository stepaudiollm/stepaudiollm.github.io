window.CONTEXTUAL_TTS_PAGE_DATA = {
  hero: {
    kicker: "Contextual Speech Generation",
    title: "StepAudio 2.5 TTS: A Contextual Speech Synthesis\n Model for the Agent Era",
    lead:
      "Intelligent Speech, Knowing What You Think, Speaking What You Feel—Infusing the Agent Era with Warmth and Intentional Expression",
    description:
      "We are redefining the boundaries of speech synthesis—going beyond merely \"reproducing sound\" to \"creating expression.\" We have built a speech generation model that genuinely understands human intent, where every voice can be endowed with soul, emotion, and narrative...",
    features: [
      {
        title: "Zero-shot",
        body:
          "Our model supports voice replication based on reference audio, while also enabling flexible control over vocal expression. Users are no longer limited to fixed voice libraries or preset personas—they can preserve vocal characteristics while freely customizing emotion, style, and expressiveness, achieving truly liberated and adaptable speech generation."
      },
      {
        title: "Global Context Control​", 
        body:
          "One description sets the tone for the entire speech. By using natural language to convey the overall context—whether it's the story background, the character's state of mind, the emotional undertone, or the narrative logic—the model accurately understands and consistently applies it from start to finish, moving beyond \"text-to-speech\" to true \"intent-to-speech.\""
      },
      {
        title: "Inline Context Control​",
        body: 
          "Supports directing every nuance of the voice using natural language. You can directly set emotion, tone, rhythm, breathing, as well as character and scene atmosphere through description, while also fine-tuning emotional layers, inter-sentence logic, and expressive intent—even depicting inner monologue and subtext. The model understands the flow of language and unspoken meaning, generating speech that is well-structured, vivid, and true to life."
        }
    ],
    keywords: [
      { name: "Zero-shot Voice Clone​", note: "" },
      { name: "Expressive Intent Understanding​", note: "" },
      { name: "Describe-to-Control​", note: "" },
      { name: "Everyone's a Voice Director", note: "" }
    ],
    actions: [
      { label: "查看场景适配 Demo", href: "#scenes-demo", variant: "primary" },
      { label: "查看文中语境 Demo", href: "#local-demo", variant: "secondary" }
    ]
  },
  sections: {
    scenes: {
      kicker: "Demo Section 03",
      title: "Multi‑Scenario Adaptability​",
      scriptLabel: "Script + Inline Context",
      description:
        {
          type: "bullet-list",
          highlightFirst: false,
          items: [
            "Built on a single advanced model architecture—no retraining required—it meets the demand for high-quality speech generation across all scenarios, from immersive audiobooks to professional film dubbing.",
            "With multi-scenario adaptability, we lower the barrier to professional-grade voice production, allowing every user to access tailor-made, scenario-optimized speech solutions."
          ]
        },
      cases: [
        {
          id: "s10",
          title: "Breakup Scene​",
          promptText: "上次你说鞋子有点磨脚，我给你买了一双软软的鞋垫，这样你垫上之后应该会舒服很多。",
          promptAudio: "assets/audio/prompt/step-female.wav",
          director:
            "离别段落要克制悲伤，语调轻颤不哭腔，节奏缓慢，情绪从不舍到祝福，尾句轻落。",
          script:
            "你别回头了，我怕你一回头，我就舍不得放你走。（先把哽咽藏住，心里已经潮湿）我们都尽力了，走到这里不是谁的错。（语速放慢，字句更轻）以后你要是累了，就想想今天，我是真的希望你幸福。",
          outputAudio: "assets/audio/03/10.wav"
        },
        {
          id: "s1",
          title: "Audiobook Narration (Mystery/Urban Legend)",
          promptText: "河流从不解释自己的流向，它只是收集沿途的雨水，然后持续的朝更低的地方前进。",
          promptAudio: "assets/audio/03/prompt/01.wav",
          director:
            "语气神秘、低沉，具有强烈的吸引力和悬念感。开头常用压低的气声或直接的发问将听众迅速拉入情境。语速有张有弛，在关键信息前故意放慢或停顿，制造紧张和期待。营造出“我要告诉你一个秘密”的近距离沉浸氛围。",
          script:
            "（压低声音，气息感增强）接下来我要说的，是旧港区渔民绝不会在白天提起的事。他们说，大雾弥漫的夜晚，会听见水下传来…敲击船底的声音。不是鱼。那声音的节奏，仔细听…是三长，两短。",
          outputAudio: "assets/audio/03/01.wav"
        },
        {
          id: "s2",
          title: "Live Streaming (Fitness Influencer)",
          promptText: "我最近特别迷恋这首歌，旋律也特别的抓耳，而且我已经单曲循环一整天了。我真的强烈推荐你也听听看。",
          promptAudio: "assets/audio/prompt/step-male.wav",
          director:
            "温暖、活泼、充满引导性和鼓励性。营造一个安全、亲切、如同游戏般的线上瑜伽空间。语气上扬，充满邀请的意味。",
          script:
            "（语气神秘而亲切，语速放慢，慢慢的，轻柔的）来，吸气，像吹起一只透明的气球；（停顿，慢下来）呼气，像目送羽毛飘向云端。（语气轻盈上扬，伴随动作引导）现在，让我们一起，用脚尖轻敲大地的心跳，用伸展的手臂，触碰天空柔软的边界。",
          outputAudio: "assets/audio/03/03.wav"
        },
        {
          id: "s3",
          title: "Film & TV Dubbing (Marriage Story)",
          promptText: "上次你说鞋子有点磨脚，我给你买了一双软软的鞋垫，这样你垫上之后应该会舒服很多。",
          promptAudio: "assets/audio/prompt/step-female.wav",
          director:
            "这是情绪爆发型的争吵戏。角色长期压抑的情绪突然释放，情绪变化是 愤怒 → 崩溃 → 疲惫与悲伤。语速前半段较快、情绪激动，后半段逐渐变慢，声音开始疲惫甚至带一点哽咽。",
            script:
            "（情绪激动）你给我滚。（带着颤抖）你知道那时候我是怎么熬过来的吗？（带着愤怒和痛苦）我就是想让你尝尝那种快疯掉、却怎么都逃不掉的感觉！（停顿一下，稍微平复一下）可接着我又会觉得很无趣。（疲惫、绝望）因为……我曾经真的爱过你，而现在我也真的累了。",
          outputAudio: "assets/audio/03/06.wav"
        },
        {
          id: "s4",
          title: "Podcast Opening",
          promptText: "生活中总会有不如意的时候，但美好的事物永远值得期待。",
          promptAudio: "assets/audio/03/prompt/04.wav",
          director:
            "情感陪伴类博客主播，语气真诚、平和，带有温暖的倾诉感。语速适中偏缓，像与老朋友深夜交谈。在重点处有自然的停顿，给予听众思考或共情的空间。整体营造安全、接纳的氛围，声音中可带有一丝鼓励的微笑感。",
          script:
            "你好，我是言言。欢迎回到这里，这个属于我们之间的小小角落。你有没有经常在一天的忙碌之后，回到家里，在感觉放松能喘口气的同时，有一种深深的孤独感。",
          outputAudio: "assets/audio/03/04.wav"
        },
        {
          id: "s7",
          title: "In-Car Navigation",
          promptText: "Curiosity getting the better of me, I pushed open the heavy door and stepped into a world of forgotten treasures.",
          promptAudio: "assets/audio/03/prompt/07.mp3",
          director:
            "You are a smart in-car navigation assistant, but not the cold, robotic kind.Your tone shifts naturally throughout the drive: cheerful when you greet them, playful when you tease, soft when a memory slips out, and professional when it's time to give a turn. You are not just a tool—you're a presence. A quiet companion who happens to know the map.",
          script:
            "(Bright and cheerful, like you're genuinely happy to see them get in the car.) Morning! Destination set. Estimated drive time, about twenty-two minutes. Coffee shop will be on your right when you arrive.(A little laugh escapes as you say it—playful, almost teasing, like you're gently making fun of them but in the fondest way possible.) You're a bit early, by the way. Someone's eager for that latte.(Back to professional but still warm, snapping out of it gently.) Anyway. In four hundred meters, turn left onto Maple Street.",
          outputAudio: "assets/audio/03/07.wav"
        },
        {
          id: "s8",
          title: "Award Ceremony Host",
          promptText: "So, here's the plan. We're gonna take our time, laugh at nothing, and maybe dance a little in the kitchen for no reason at all. Sound good? Great. Let's go.",
          promptAudio: "assets/audio/03/prompt/08.mp3",
          director:
            "You are hosting a prime-time live show with a full studio audience. The lights are bright, the energy is high, and you are genuinely having the time of your life. Your voice should be warm but powerful—loud enough to fill a room, but never shouting. There's a smile in every word. You speak with confidence and rhythm, like a friend who's also in charge.",
          script:
            "(Your face lights up as you step to center stage, raising your microphone with genuine excitement.) Good evening, everybody!(Your tone is warm and inviting, with a playful lift as you draw out the second ”welcome.“) And welcome—welcome—to the show! Can we just take a moment to appreciate that energy in this room tonight? Unbelievable.(Your voice builds with excitement, turning mischievous as if you can barely contain the reveal.)Now, I know you've been waiting all week for this, and trust me—what we have coming up for you is worth every second. We've got a surprise guest. We've got a challenge that's never been attempted before.",
          outputAudio: "assets/audio/03/08.wav"
        },
      ]
    },
    persona: {
      kicker: "Demo Section 04",
      title: "Multi‑Persona Adaptation​",
      scriptLabel: "Script + Inline Context",
      description:
        {
          type: "bullet-list",
          highlightFirst: false,
          items: [
            "We go beyond simple voice replication—through our guidance, we build a complete \"vocal persona profile\" for each voice, achieving a holistic enhancement from timbre to personality.",
            "We give every voice depth and make every character truly \"come alive,\" unlocking unprecedented possibilities for immersive content creation."
          ]
        },
      cases: [
        {
          id: "p11",
          title: "Heartbroken Woman",
          promptText: "上次你说鞋子有点磨脚，我给你买了一双软软的鞋垫，这样你垫上之后应该会舒服很多。",
          promptAudio: "assets/audio/prompt/step-female.wav",
          director:
            "用悲伤中带点哭腔的感觉，情感强烈，语调哀怨高亢，音高起伏大。",
          script:
            "（声音发抖，努力想保持平静）我也不想这样，但我真的好累啊，撑不下去了，（哽咽着摇头，后退）你知不知道…我等这句话等了多久？可是太晚了，一切都太晚了…（带着浓重鼻音，强颜欢笑）没事…我没事…你不用担心…",
          outputAudio: "assets/audio/04/11.wav"
        },
        {
          id: "p3",
          title: "The Aloof Ice Queen",
          promptText: "你所求的不过虚妄，这世间本就无常，我又何必多言？",
          promptAudio: "assets/audio/04/prompt/08.wav",
          director:
            "整体语调微凉，一直在克制情绪，不轻易显露波澜。尾音轻而淡，带一点若有若无的讥诮与自嘲，既显得高傲孤洁，又透出病弱美人的脆弱感。",
          script:
            "怜悯…是么？（极轻地咳嗽一声）我不需要。带着你廉价的同情，出去。我纵是此刻死了，也与你们…毫无干系。",
          outputAudio: "assets/audio/04/08.wav"
        },
        {
          id: "p4",
          title: "The Unruly Mythic Rebel",
          promptText: "王座从来不是用来坐的，是用来踏碎的。你们守护冠冕，我只相信手中的刀和刀下的真理。",
          promptAudio: "assets/audio/04/prompt/04.wav",
          director:
            "说话时中气十足，语速偏快，语调高昂，带着压不住的狂气与自信，像随时都能一笑掀翻天幕。情绪外放，毫不收敛，字句里满是对束缚与权威的不屑，带着叛逆英雄式的豪烈气场。",
          script:
            "（带着点不屑与冷笑）呵…满天神佛，也配定我是魔是佛？这天要压我，我便撕了这苍穹！这地想困我，我就碾碎这九幽！（狂笑）哈哈哈哈哈哈哈，生来便不跪不拜，凭尔等也敢称尊作祖？",
          outputAudio: "assets/audio/04/04.wav"
        },
        {
          id: "p5",
          title: "The Cosmic Observer",
          promptText: "世间万物皆有其规律，年轻人，静下心来，切勿急躁，你会听到花开的声音。",
          promptAudio: "assets/audio/04/prompt/05.wav",
          director:
            "声音空渺而疲惫，仿佛从很远的地方传来。语速平缓不带波澜，像在陈述一个与己无关的预言。气息游离，话语间有长久的留白。没有悲喜，只有一种洞悉结局后的、广漠的寂寥，以及一丝对执迷者的、微不可察的怜悯。",
          script:
            "我所布下的阵，所写下的书，不过是‘常’中的一点微澜。真正的棋手…从来不是你我。（语速放慢）是这天下的民心，是这绵绵不绝的生息轮回。",
          outputAudio: "assets/audio/04/05.wav"
        },
        {
          id: "p6",
          title: "Tsundere Heiress",
          promptText: "美食是文化的载体，味蕾的记忆，让我们开启这段舌尖上的旅程。",
          promptAudio: "assets/audio/04/prompt/06.wav",
          director:
            "声音慵懒，但字字清晰。开头是抱怨式的撒娇，后半段是理所当然的安排。在“我”和“你”的用词上形成鲜明对比，用最柔软的语气，下达最不容反驳的指令。",
          script:
            "嗯…这太阳刺得我眼睛疼。（慵懒地命令）你，把窗帘拉上。（停顿，补充）还有，我不要喝这个茶了，换我上次从伦敦带回来的那罐花果茶。（声音更软，却无商量余地）现在就要。",
          outputAudio: "assets/audio/04/06.wav"
        },
        {
          id: "p2",
          title: "The Self-Shattering Antagonist",
          promptText: "You ever have a day where you just want to keep walking forever? That was me. I walked three extra blocks just because it felt too good to stop.",
          promptAudio: "assets/audio/prompt/eng-male.wav",
          director:
            "Extremely maniacal and out of control, with a loud, piercing laugh that breaks the silence. Speaks at a frantic, fast pace, voice booming with provocative arrogance. Pitch fluctuates wildly, with drawn-out, taunting endings that reek of reckless defiance.",
          script:
            "Hahaha! Come on! come on! What are you waiting for? Bring it on, you cowards! (turned  huge astonished and yelled) Wait! Stop! What are you doing?",
          outputAudio: "assets/audio/04/02.wav"
        },
        {
          id: "p7",
          title: "The Awakened Scion",
          promptText: "If you're Canadian and watching this, maybe consider having a few more kids. Seriously though, a resource-based economy would be way better for Canada than relying on immigration. Otherwise, we're just not building anything sustainable here—you can't produce much without homegrown capacity.",
          promptAudio: "assets/audio/prompt/eng-female.wav",
          director:
            "Her voice trembles between anguish and resolve, rising at rhetorical questions and dropping to a hushed, pleading tone when recalling family tragedy. The pace is moderate, with occasional breathy pauses that underscore inner conflict. Her delivery is lingering and sorrowful; her articulation remains clear yet weighted, revealing vulnerability—but in the end, she hardens her resolve, her voice carrying a determination forged through adversity.",
          script:
            "(Sad, sobbing) Father, why must you disgrace yourself like this? Even I would feel the pain. We are still family, regardless of everything—does Mother's death mean nothing now? (confused and despairing) What am I to do? Who will guide me? (silence; she steadies herself, voice trembling but resolute) …No. No one will come. If I wait, all will be lost.",
          outputAudio: "assets/audio/04/07.wav"
        },
      ]
    },
    global: {
      layout: "shared-prompt-groups",
      kicker: "Demo Section 01",
      title: "One Text, Countless Expressions: Driven by Global Context​",
      description:
        [
          "A single voice, the same text—yet guided by different global contexts, it brings forth entirely distinct expressions of life.",
          "By describing the scene and mood in natural language, the model grasps the intended atmosphere and delivers emotionally unified, stylistically consistent speech.",
        ],
      promptGroups: [
        {
          id: "global-group-1",
          label: "Group 1",
          sharedPrompt: {
            text: "上次你说鞋子有点磨脚，我给你买了一双软软的鞋垫，这样你垫上之后应该会舒服很多。",
            audio: "assets/audio/prompt/step-female.wav"
          },
          cases: [
            {
              id: "g4",
              title: "Case 4",
              director:
                "用自然的语气说",
              script:
                "为什么啊！怎么每次都是一模一样的反应啊！这到底是搞什么名堂啊！不行不行，赶紧摆正姿势，再这么下去可真要出问题了！",
              outputAudio: "assets/audio/01/08.wav"
            },
            {
              id: "g5",
              title: "Case 5",
              director:
                "说话时满是抓狂和无奈，语速急促，语调忽高忽低，带着浓浓的疑惑和吐槽感，同时还有对当前混乱状况的焦虑，语气里透着急切，想要赶紧扭转这糟糕的局面。",
              script:
                "为什么啊！怎么每次都是一模一样的反应啊！这到底是搞什么名堂啊！不行不行，赶紧摆正姿势，再这么下去可真要出问题了！",
              outputAudio: "assets/audio/01/09.wav"
            },
            {
              id: "g6",
              title: "Case 6",
              director:
                "说话时尾音拖得长长的，带着鼻音轻轻摇晃。语速时快时慢，每句话的尾音都自然上扬，语速轻快，在关键处故意拖长。",
              script:
                "为什么啊！怎么每次都是一模一样的反应啊！这到底是搞什么名堂啊！不行不行，赶紧摆正姿势，再这么下去可真要出问题了！",
                outputAudio: "assets/audio/01/10.wav"
            },
          ]
        },
        {
          id: "global-group-2",
          label: "Group 2",
          sharedPrompt: {
            text: "You ever have a day where you just want to keep walking forever? That was me. I walked three extra blocks just because it felt too good to stop.",
            audio: "assets/audio/prompt/eng-male.wav"
          },
          cases: [
            {
              id: "g4",
              title: "Case 4",
              director:
                "None",
              script:
                "The truth is, my love for you ended long ago. It would be rather ironic if you've only just realized that I was, perhaps, your true love. Regardless, there is no path back to what we were.",
              outputAudio: "assets/audio/01/05.wav"
            },
            {
              id: "g5",
              title: "Case 5",
              director:
                "With a sharp, rising tone laced with undisguised mockery and the contempt of a victor. The pace is fast, ending on upward inflections, as if relishing a farce.",
              script:
                "The truth is, my love for you ended long ago. It would be rather ironic if you've only just realized that I was, perhaps, your true love. Regardless, there is no path back to what we were.",
              outputAudio: "assets/audio/01/06.wav"
            },
            {
              id: "g6",
              title: "Case 6",
              director:
                "You want to break free from this person, from this situation. A mix of grief and rage makes your voice tremble. You speak in a strained, hushed tone, with sharp, quick breaths. Every word is forced out through clenched teeth.",
              script:
                "(voice trembling on the edge of a sob) The truth is , my love for you ended long ago. It would be... rather ironic if you've only just realized... that I was, perhaps, your true love. (long pause, shaky exhale) Regardless, there is no path back to what we were.",
              outputAudio: "assets/audio/01/07.wav"
            },
          ]
        }
      ]
    },
    local: {
      layout: "shared-prompt-groups",
      kicker: "Demo Section 02",
      title: "One Voice, Multiple Personas: Controlled via Global & Inline Context​​",
      scriptLabel: "Script + Inline Context",
      description:
        {
          type: "nested-list",
          intro: [
            "Global Context defines the overarching style, while Inline Context refines each nuance. This two-tier control enables seamless transitions from macro style to micro expression, achieving authentic multi-role portrayal with a single voice.",
            "The model deeply understands semantic intent, dynamically adapts to context, and maps multi‑layered prosody and emotion for natural, fluid expression.",
            "Smart generation of paralinguistic features—breath rhythm, vocal fry, subtle timbre shifts—brings synthesized speech to life with physiological authenticity."
          ],
          groups: []
        },
      promptGroups: [
        {
          id: "local-group-1",
          label: "Group 1",
          sharedPrompt: {
            text: "我最近特别迷恋这首歌，旋律也特别的抓耳，而且我已经单曲循环一整天了。我真的强烈推荐你也听听看。",
            audio: "assets/audio/prompt/step-male.wav"
          },
          cases: [
            {
              id: "l5",
              title: "Case 5",
              director:
                "语气略带一点戏谑和调侃，有一点幸灾乐祸的感觉。",
              script:
                "（不屑地哼了哼）这...倒是个意外的收获，(他的唇角勾起一抹诡异的笑意, 语速放缓，用邪恶恐吓的语气说)不过...你觉得我们的孩子会是什么呢？",
              outputAudio: "assets/audio/02/04.wav"
            },
            {
              id: "l6",
              title: "Case 6",
              director:
                "声音极度紧绷，用近乎气声的、被强行压低的音调说话。每个字都伴随着压抑不住的、短促的吸气，语速快而断续，仿佛随时会因激动而破音。能清晰听出喉咙的干涩和声带的颤抖，一种巨大的狂喜正试图冲破理智的牢笼，在“想说”和“不能说”之间激烈撕扯。",
              script:
                "（压低到极限的气声，带着难以置信的颤抖）“喂…你看我手机”（短促吸气，声音发紧）“是不是我眼花了？个、十、百…”（突然掐断话语，深吸一口气，转为僵硬的平静）“…算了，肯定是诈骗短信。”（停顿，呼吸声粗重）“对，是诈骗…”",
              outputAudio: "assets/audio/02/05.wav"
            },
            {
              id: "l7",
              title: "Case 7",
              director:
                "Alone in a car on an empty highway just past midnight. No passengers. No music. Just the hum of the tires and the weight of your own thoughts. Exhausted but not sleepy, the voice is low.",
              script:
                "Yeah. Yeah, I know. I said I'd call. (Pause, voice dropping even lower) I just... don't know what I'd even say anymore. Sometimes I think I miss the argument more than I miss you. At least then I knew where we stood. (Shaky breath,then the words come out soft and fading, each one a little quieter than the last, as if the sentence is losing confidence in itself halfway through.) Alright. Maybe tomorrow……",
              outputAudio: "assets/audio/04/09.wav"
            },
          ]
        },
        {
          id: "local-group-2",
          label: "Group 2",
          sharedPrompt: {
            text: "上次你说鞋子有点磨脚，我给你买了一双软软的鞋垫，这样你垫上之后应该会舒服很多。",
            audio: "assets/audio/prompt/step-female.wav"
          },
          cases: [
            {
              id: "l2",
              title: "Case 2",
              director:
                "嘴角没有笑容，只剩下冷淡，压迫感极强，用非常冰冷的语气说话，每一个字都是从牙缝中挤出来的。语速偏慢，语调偏低，充满轻蔑，对这个家开始失望。",
              script:
                "（语气非常疲惫）刘婶，你在呢。庭深和心心呢？（有一丝不耐烦）怎么还没回来？（透出无尽的悲伤和失望,声音变得低沉哀伤）哼...死东西，不知道又去哪里鬼混了。",
              outputAudio: "assets/audio/02/02.wav"
            },
            {
              id: "l3",
              title: "Case 3",
              director:
                "情绪任性急切，撒娇时带点黏糊，音高起伏大，开心或哀求时上扬，赌气时下沉，语速正常，尾音常拖长（如“嘛~”或“呀~”），咬字轻重对比鲜明（强调关键词如“看一看”时加重，撒娇时轻软），语气特点撒娇中带强硬、赌气时转为幼稚疏离。",
              script:
                "“大哥～求求你啦～就给我看一看嘛！（撒娇摇晃胳膊）别那么小气嘛~不然我可要闹咯！（突然变骄横，赌气扭头）哼！不给就不给！谁稀罕呀！”",
              outputAudio: "assets/audio/02/03.wav"
            },
            {
              id: "l4",
              title: "Case 4",
              director:
                "The voice is rushed and flustered, trying very hard to sound normal but failing miserably. Each sentence starts with confidence, then stumbles halfway through as the brain catches up to what the mouth just said. There are small nervous laughs that don't quite land.",
              script:
                "(A sudden, too-bright burst of cheerfulness) Oh! Hey! I was just... you know... thinking about you. Obviously.(A short, nervous laugh that ends too abruptly, followed by words tumbling out faster than intended.) So funny story—okay not funny haha, more like... interesting? Maybe? Anyway, so I was at the—wait, no, I mean I was going to the—(A pause, then a quieter, more defeated admission)...You know what? I forgot where I was going with this.",
              outputAudio: "assets/audio/04/10.wav"
            }
          ]
        },
      ]
    }
  }
};
