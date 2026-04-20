// Generated from stepaudio_asr_showcase_cases.json for file:// fallback.
window.STEPAUDIO_ASR_SHOWCASE_DATA = {
  "meta": {
    "model_name": "StepAudio 2.5 ASR",
    "page_intent": "静态 demo page 数据，只保留本地可播放、适合直接试听的中英文样例。",
    "data_note": "转写结果已回填为完整文本；新增英文与中文长音频样本来自 long_chunked 本地 chunk_wavs 拼接。",
    "video_asset": "./assets/asr_media_summary_demo.mp4"
  },
  "showcase_sections": [
    {
      "id": "zh",
      "title": "StepAudio 2.5 ASR中文效果展示",
      "groups": [
        {
          "id": "zh-tougue-twister",
          "title": "中文快语速转写",
          "case_ids": [
            "zh_tougue-twister1",
            "zh_high_speed"
          ]
        },
        {
          "id": "zh_sing_bgm",
          "title": "中文带BGM唱歌",
          "case_ids": [
            "zh_sing_bgm"
          ]
        },
        {
          "id": "zh-noise-speech",
          "title": "中文嘈杂背景声人声",
          "case_ids": [
            "zh_noise_speech"
          ]
        },
        {
          "id": "zh-yueyu",
          "title": "粤语转写",
          "case_ids": [
            "zh_yueyu"
          ]
        }
      ]
    },
    {
      "id": "en",
      "title": "StepAudio 2.5 ASR英文效果展示",
      "groups": [
        {
          "id": "en-tougue-twister",
          "title": "英文快语速转写",
          "case_ids": [
            "en_tougue_twister1",
            "en_tougue_twister2",
            "en_high_speed"
          ]
        },
        {
          "id": "en-noise-speech",
          "title": "英文嘈杂背景声人声",
          "case_ids": [
            "en_noise_speech"
          ]
        }
      ]
    },
    {
      "id": "longform",
      "title": "StepAudio 2.5 ASR长文效果展示",
      "groups": [
        {
          "id": "longform-cases",
          "title": "长文样例",
          "case_ids": [
            "zh_longform",
            "en_longform"
          ]
        }
      ]
    }
  ],
  "cases": [
    {
      "case_id": "zh_tougue-twister1",
      "title": "中文绕口令快板",
      "group_id": "zh-tougue-twister",
      "language": "zh",
      "audio_path": "./assets/audio/zh_tougue_twister_1.wav",
      "hyp_full": "正月里正月正，姐俩人去逛灯。大姑娘名叫粉红女，二姑娘名叫女粉红。粉红女身穿的一件粉红袄，女粉红身穿的一件袄粉红。粉红女怀抱的一瓶粉红酒，女粉红怀抱的一瓶酒粉红。他们二人来到了无人处，推杯换盏饮流零。女粉红喝了粉红女的粉红酒，粉红。"
    },
    {
      "case_id": "zh_high_speed",
      "title": "中文快语速",
      "group_id": "zh-high-speed",
      "language": "zh",
      "audio_path": "./assets/audio/zh_high_speed.wav",
      "hyp_full": "我们这段时间主要是练中期跟中后期的团战吧，因为我们之前比赛很多都是那种前期优势就很大，然后中期就莫名其妙就死掉，然后要么就被翻盘，要么就是打的就很艰难。所以我们之前主要是因为这方面做的不够好，然后我们就已经练的这方面比较多，然后主要是BP上面的调整吧，因为可能以前是这个英雄优先级很高，但是我们看了别的队伍的比赛，感觉其实对我们来说优先级很高，但是对别的来说，别的队伍来说其实优先级没有那么高。"
    },
    {
      "case_id": "zh_yueyu",
      "title": "粤语",
      "group_id": "zh-yueyu",
      "language": "zh",
      "audio_path": "./assets/audio/yueyu.wav",
      "hyp_full": "大家好，我系佘诗曼，唔系man姐，唔系佘诗曼，我唔知自己系边个。"
    },
    {
      "case_id": "zh_sing_bgm",
      "title": "中文带BGM唱歌",
      "group_id": "zh_sing_bgm",
      "language": "zh",
      "audio_path": "./assets/audio/zh_sing_bgm.wav",
      "hyp_full": "乌云在我们心里打下一块阴影。我聆听这记忆中的心情。"
    },
    {
      "case_id": "zh_noise_speech",
      "title": "中文嘈杂背景声人声",
      "group_id": "zh-noise-speech",
      "language": "zh",
      "audio_path": "./assets/audio/zh_noise_speech.wav",
      "hyp_full": "迪拜时间的中午12点，然后跟国内相差四个小时，然后第一次做长途飞行，并没有想象中那种特别累的感觉。"
    },
    {
      "case_id": "en_tougue_twister1",
      "title": "英文绕口令1",
      "group_id": "en-tougue-twister",
      "language": "en",
      "audio_path": "./assets/audio/en_tougue_twister_1.wav",
      "hyp_full": "the boughter bought some butter, but she said the butter's bitter. Butter, butter's bitter. Bitter butter, butter bitter. But she bought some butter, but she said the butter's bitter."
    },
    {
      "case_id": "en_tougue_twister2",
      "title": "英文绕口令2",
      "group_id": "en-tougue-twister",
      "language": "en",
      "audio_path": "./assets/audio/en_tougue_twister_2.wav",
      "hyp_full": "there Is how much wood would a woodchuck chuck if a woodchuck could chuck wood? How much wood would a woodchuck chuck if a woodchuck could chuck wood?"
    },
    {
      "case_id": "en_high_speed",
      "title": "英文快语速",
      "group_id": "en-tougue-twister",
      "language": "en",
      "audio_path": "./assets/audio/en_high_speed.wav",
      "hyp_full": "I'm Ellen lavey L A. Mayor Karen Bass is expected to speak at any moment now about what the city of Los Angeles is doing to prepare for this historic weather event."
    },
    {
      "case_id": "en_noise_speech",
      "title": "英文嘈杂背景声人声",
      "group_id": "en-noise-speech",
      "language": "en",
      "audio_path": "./assets/audio/en_noise_speech.wav",
      "hyp_full": "I usually don't like these cookies. These loft house cookies. I actually kind of despise them, but for some reason, it's enticing right now. So let's see if I still don't like it. I actually kind of don't hate it. I used to hate."
    },
    {
      "case_id": "en_sing_bgm",
      "title": "英文带BGM唱歌",
      "group_id": "en_sing_bgm",
      "language": "en",
      "audio_path": "./assets/audio/en_sing_bgm.wav",
      "hyp_full": "There ain't no gold in this river, and that I've been washing my hands in forever. I know there is hope in."
    },
    {
      "case_id": "zh_longform",
      "title": "中文长文",
      "group_id": "longform-cases",
      "language": "zh",
      "audio_path": "./assets/audio/zh_longform.wav",
      "hyp_full": "作为美国二流棒球联盟的后援投手，布鲁斯特帮队伍获得了胜利。但由于他和好友在酒吧里调戏了对手的未婚妻，对此毫不知情的他们最终与对方大打出手，并因醉酒闹事被抓了起来。除此之外，球队已经决定招募更年轻的球员。布鲁斯特与好友不仅没有被保释，还被球队当场开除。而就在两人即将被关押之际，一个名为唐纳德的男人突然挺身而出，他立刻帮布鲁斯特缴清了保释金，并带他前往了纽约。起初，布鲁斯特以为是大球队看中了他的技术，可当他到达纽约后，却得知自己竟然有一个颇为富有的舅公，而这个舅公因为死后没有子嗣，便准备将遗产交由他继承。可这个老人性格十分古怪，他在临死前立下了一个挑战如果布鲁斯特能在三十天内花光三千万美元，那他就可以继承三亿美元的财产。可如果没有按时花光三千万，他便会一无所有。三亿美元也将由信托公司管理。除此之外，为了增加挑战的难度，舅公不仅设置了很多限制条款，还需要布鲁斯特向所有人隐瞒自己挑战的内容，否则他的花销便会视为无效。而信托公司则告诉布鲁斯特，如果不想接受这个考验，他就可以当即领走一百万美元。可面对这样唾手可得的巨额现金，布鲁斯特还是决定挑战更为丰厚的三亿美元。而为了确认布鲁斯特按照规定花钱，信托公司雇佣了会计安吉拉，以记录布鲁斯特的每一笔支出和收据。布鲁斯特则赶忙将自己继承了三千万美元的情况告诉了自己的好友斯派克。而随着挑战开始，布鲁斯特也来到街对面的银行，看到了这笔从天而降的三千万美元。为了尽快将这些钱按照规定花光，他立刻以一周一万美元雇佣了带他来到此地的私家侦探唐纳德，让对方用相机全程记录自己这段时间的经历。除此之外，布鲁斯特不仅放弃了每年七百二十万美元的利息，还表示要给银行一笔保管费，这让一旁的安吉拉震惊无比。接着，布鲁斯特又立刻取出了三百万美元，并以优渥的薪资待遇雇佣了银行的保安小队为他保驾护航。在完成这一切后，身为球员的布鲁斯特便打电话联系自己的球队经理，并想以高昂的价格租下整个球队。可对方却以为布鲁斯特在发神经，随即就挂断了电话。而由于布鲁斯特过于张扬，得知他继承高额遗产的围观者都聚在他的身边，希望能从中捞到一些好处。而大方的布鲁斯特则带领大家前往附近最好的餐厅纵情享乐。由于布鲁斯特对认真善良的安吉拉一见钟情，在得知她的未婚夫沃伦因为忙于工作无暇陪伴她后，布鲁斯特便主动提出支付金钱购买对方的时间。但安吉拉却认为自己的未婚夫不可能被金钱收买。与此同时，布鲁斯特一夜暴富的消息很快被新闻媒体获知。而面对媒体的镜头，布鲁斯特一边侃侃而谈自己的投资意向，一边任命好友斯派克为公司副总裁。得知他看中的酒店已经被高额出租后，布鲁斯特又立刻支付了一百万美元现金，让经理把酒店的最高两层租给了他们。当晚，布鲁斯特见到了安吉拉的未婚夫沃伦，在发现沃伦对家装颇有研究后，布鲁斯特随即以二十五万美元的报酬说服沃伦为他装修办公室。在金钱的诱惑下，身为律师的沃伦立刻答应了这个请求。而得知沃伦的前妻是一个室内设计师后，布鲁斯特又顺便雇佣了沃伦的前妻。可布鲁斯特并不知道，沃伦也就职于信托公司。起初，公司高层并不想让沃伦为布鲁斯特卖命，但得知布鲁斯特开始搞事情后，公司高层便批准了沃伦的休假申请，并让沃伦负责监视布鲁斯特这一个月来的所有动向。而对于安吉拉来说，布鲁斯特这一系列的荒诞之举，让他看到了金钱的力量。随着求职的人群蜂拥而至，无厘头的投资项目也越来越多。其中最让安吉拉无语的是，布鲁斯特竟然花一百万美元投资了一个冰山项目，而项目的内容则是将冰山运送到缺水的阿拉伯国家。可即便所有人都不理解自己的决定，布鲁斯特还是将钱如流水一般花了出去。除此之外，他还高价租赁直升机，将队友们接到了纽约，并准备安排队员们与知名的纽约洋基队一决雌雄。对于壮志难酬的布鲁斯特来说，与洋基队比赛是他毕生的愿望，因此他积极参与备赛，并为所有队员提供了最好的食宿。由于三十天后不能留下任何资产，布鲁斯特只能另辟蹊径。他购买了几张高额的古董邮票，并将这些邮票当做普通邮票一样寄出。收到明信片的信托公司高层这才意识到，布鲁斯特并没有他们想象中的愚蠢。于是，他们将真相告诉了沃伦，并拉沃伦一起为布鲁斯特设下陷阱。为了说服沃伦，公司高层又谎称布鲁斯特已经看上了安吉拉。而如果沃伦能让布鲁斯特输掉赌局，那他不仅可以留住未婚妻，还能成为公司的合伙人。另一边，布鲁斯特已然想要尽快将钱花光，但让他无语的是，石油公司为了税收优惠，竟然高额收购了那个冰山项目，这让布鲁斯特成为了最后的赢家。无奈之下，布鲁斯特只能让好友抛售冰山项目的股票，并将赚来的钱全部捐给慈善机构，这让安吉拉立刻对布鲁斯特产生了好感。此时，沃伦与前妻也完成了办公室的装修，但在布鲁斯特看来，这还远远不够，因此他调高了工人们的工资，并让他们继续努力。接着，布鲁斯特又送给了安吉拉一辆价值不菲的豪车，而在他的劝说下，安吉拉最终同意与他共进晚餐。可汽车刚刚启动，他们便被人追尾。而得知布鲁斯特就是那个四处散财的有钱人后，原本准备赔偿的男人也开始趁机讹钱。布鲁斯特则顺势配合了男人的表演。可在支付了高达三十万美元的赔偿金后，看不惯布鲁斯特乱花钱的安吉拉和他大吵了一架。而两人在路上争执的场景，竟然被沃伦尽收眼底。加上前妻在一旁添油加醋，沃伦更加确信安吉拉已经被布鲁斯特的金钱收买。当晚在餐厅用餐时，布鲁斯特再次慷慨的请大家随便吃喝，而他之前高价购买的好酒也被他以买醉的名义消耗一空。可让布鲁斯特无语的是，好友竟然瞒着他偷偷进行了投资，而这笔投资竟然再次让他赚回了一千万美元。可得知此事的布鲁斯特却毫无喜悦，他面如死灰的表情也让所有人都陷入了迷茫。开始实施计划的沃伦见状，则以购买家具为由，趁机要走了两万美元。此时，随着一千万美元到账，布鲁斯特再次为如何花掉他们而发愁。但幸运的是，他刚巧看到了纽约市市长的竞选新闻。在得知竞选会花掉大量金钱后，布鲁斯特竟然在最后十天以新人的身份参与了竞选。可让民众大跌眼镜的是，布鲁斯特的口号竟然是谁也不选。他极力呼吁民众不要为竞选浪费钱财，并花费大量金钱将自己的理念推广了出去。布鲁斯特史无前例的做法让民众深感意外，尤其是他不断自己贴钱做宣传的行为，竟然无意中得到了大量选民的支持。"
    },
    {
      "case_id": "en_longform",
      "title": "英文长文",
      "group_id": "longform-cases",
      "language": "en",
      "audio_path": "./assets/audio/en_longform.wav",
      "hyp_full": "He hoped there would be stew for dinner, turnips and carrots and bruised potatoes and fat mutton pieces to be ladled out in thick peppered flour fattened sauce. Stuff it into you, his belly counselled him. It would be a gloomy secret night. After early nightfall, the yellow lamps would light up here and there the squalid quarter of the brothels. He would follow a devious course up and down the streets, circling always nearer and nearer in a tremor of fear and joy, until his feet led him suddenly round a dark corner. He would pass by them calmly, waiting for a sudden movement of his own will or a sudden call to his sin loving soul from their soft, perfumed flesh. Yet, as he prowled in quest of that call, his senses stultified only by his desire would note keenly all that wounded or shamed them. His eyes, a ring of porter froth on a clothless table, or a photograph of two soldiers standing to attention, or a gaudy playbill. His ears, the drawling jargon of greeting. Hello, Bertie. Any good in your mind? Number ten. Fresh Nelly is waiting on you. Good night, husband. Coming in to have a short time. The equation on the page of his scribbler began to spread out a widening tail, eyed and starred like a peacock's, and when the eyes and stars of its indices had been eliminated, began slowly to fold itself together again. The indices appearing and disappearing were eyes opening and closing. The eyes opening and closing were stars being born and being quenched. The vast cycle of starry life bore his weary mind outward to its verge and inward to its centre. A distant music accompanying him outward and inward. What music? The music came nearer, and he recalled the words the words of Shelley's fragment upon the moon, wandering companionless, pale for weariness. The stars began to crumble, and a cloud of fine star dust fell through space. The dull light fell more faintly upon the page whereon another equation began to unfold itself slowly and to spread abroad its widening tail. It was his own soul going forth to experience, unfolding itself sin by sin, spreading abroad the bale fire of its burning stars, and folding back upon itself, fading slowly, quenching its own lights and fires. They were quenched, and the cold darkness filled chaos. A cold, lucid indifference reigned in his soul. At his first violent sin, he had felt a wave of vitality pass out of him, and had feared to find his body or his soul maimed by the excess. Instead, the vital wave had carried him on its bosom out of himself and back again when it receded, and no part of body or soul had been maimed, but a dark peace had been established between them. The chaos in which his ardour extinguished itself was a cold, indifferent knowledge of himself. He had sinned mortally, not once but many times, and he knew that while he stood in danger of eternal damnation for the first sin alone, by every succeeding sin he multiplied his guilt and his punishment. His days and works and thoughts could make no atonement for him. The fountains of sanctifying grace having ceased to refresh his soul."
    }
  ]
};
