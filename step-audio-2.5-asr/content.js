window.MODEL_CARD_CONTENT = {
  links: {
    apiDocs: 'https://platform.stepfun.com/docs/zh/api-reference/audio/asr-stream',
    demoPage: 'https://stepaudiollm.github.io/step-audio-2.5-asr/showcase/',
    studio: 'https://www.stepfun.com/studio/audio?tab=speech-recognition',
  },
  zh: {
    defaultLocale: true,
    meta: {
      pageTitle: 'StepAudio 2.5 ASR Model Card',
      pageDescription:
        'StepAudio 2.5 ASR 双语 model card，覆盖模型信息、训练数据、评测结果、公开接口信息与使用边界。',
    },
    nav: [
      { id: 'overview', label: '引言' },
      { id: 'model-information', label: '模型信息' },
      { id: 'model-data', label: '训练数据' },
      { id: 'evaluation', label: '评测' },
      { id: 'distribution', label: '分发' },
      { id: 'intended-usage-limitations', label: '用途与限制' },
      { id: 'ethics-content-safety', label: '伦理与内容安全' },
    ],
    sidebarNote:
      '本页面向技术开发者，汇总模型结构、训练数据规模、评测结果和公开接入方式。协议细节与模型标识以平台最新文档为准。',
    header: {
      title: 'StepAudio 2.5 ASR',
      subtitle: 'Model Card',
      intro:
        'StepAudio 2.5 ASR 是一款面向实时转写与长音频转写场景的自动语音识别模型。本文档提供模型结构、数据概况、评测结果和公开接口信息。',
      notes: ['Document snapshot: 2026-04-22'],
      links: [
        { label: 'API 文档', hrefKey: 'apiDocs' },
        { label: 'Demo page', hrefKey: 'demoPage' },
        { label: '体验中心', hrefKey: 'studio' },
      ],
    },
    modelInformation: {
      title: 'Model Information',
      entries: [
        {
          term: 'Description',
          paragraphs: [
            'StepAudio 2.5 ASR 是一款面向实时转写、会议纪要与长音频转写任务的自动语音识别模型，在保持较强语言建模能力的同时兼顾高吞吐解码效率。',
          ],
        },
        {
          term: 'Model Structure',
          paragraphs: ['整体结构为 Audio Encoder + Linear Adapter + LLM + MTP-5。'],
          items: [
            '0.6B Transformer audio encoder，将输入音频转化为 12.5 Hz 的 audio embedding。',
            'Linear Adapter 负责隐藏维度对齐。',
            '4B Qwen3 LLM 作为模型主干，负责上下文建模与自回归文本生成。',
            'MTP-5 采用与 Step 3.5 Flash 一致的 MTP 设计，单次前向可额外预测 5 个 token。',
          ],
        },
        {
          term: 'Inputs',
          paragraphs: ['OGG、mp3、wav、PCM 等格式的音频。'],
        },
        {
          term: 'Outputs',
          paragraphs: ['流式返回转写文本。'],
        },
      ],
    },
    modelData: {
      title: 'Training Data',
      entries: [
        {
          term: 'Pre-training data',
          paragraphs: [
            '预训练阶段使用千万小时量级的 speech and audio data，用于建立通用的音频表征与语言建模能力。',
          ],
        },
        {
          term: 'ASR training data',
          items: [
            'ASR 训练数据由 10wh 高质量短音频与 5wh 长音频组成。',
            '短音频最长不超过 30 秒，以中英文数据为主，并引入方言、带口音普通话、少量日语、阿拉伯语与 TTS 合成数据以增强鲁棒性。',
            '长音频最长 30 分钟，用于覆盖会议、播客、访谈等长上下文转写场景。',
          ],
        },
      ],
    },
    evaluation: {
      title: 'Evaluation',
      entries: [
        {
          term: 'Benchmark scope',
          paragraphs: [
            '评测覆盖中文开源集、英文开源集和长文开源集三组，按数据集分别统计 CER 或 WER，并保留逐测试集结果。',
          ],
        },
        {
          term: 'Reading guide',
          paragraphs: [
            '所有表格均为 lower is better。Average 列仅用于辅助阅读，更重要的是逐测试集上的稳定表现与长音频套件上的整体均值。',
          ],
        },
      ],
      suites: [
        {
          title: 'Chinese open-source sets (CER, lower is better)',
          columns: ['Model', 'AISHELL-1', 'AISHELL-2 iOS', 'Wenet testnet', 'Wenet testmeeting', 'FLEURS-zh', 'Average'],
          rows: [
            ['VibeVoice-ASR', '5.19', '5.10', '14.79', '17.09', '8.77', '10.19'],
            ['FunASR-Nano', '1.88', '2.61', '5.30', '5.31', '3.19', '3.66'],
            ['Doubao-ASR-2603', '2.07', '2.70', '4.03', '5.09', '2.83', '3.34'],
            ['Qwen3 ASR (1.7B)', '1.49', '2.50', '4.44', '4.66', '2.74', '3.17'],
            ['StepAudio 2.5 ASR', '0.71', '2.29', '4.54', '4.70', '2.63', '2.97'],
          ],
          highlightRow: 'StepAudio 2.5 ASR',
        },
        {
          title: 'English open-source sets (WER, lower is better)',
          columns: ['Model', 'LibriSpeech clean', 'LibriSpeech other', 'Common Voice v11.0 en', 'FLEURS-en', 'VoxPopuli Cleaned AA', 'Average'],
          rows: [
            ['VibeVoice-ASR', '2.30', '5.79', '20.03', '5.20', '2.38', '7.14'],
            ['FunASR-Nano', '1.80', '4.43', '11.05', '4.96', '3.97', '5.24'],
            ['Doubao-ASR-2603', '2.94', '5.98', '14.06', '6.74', '3.61', '6.67'],
            ['Qwen3 ASR (1.7B)', '1.69', '3.57', '7.50', '3.23', '3.28', '3.85'],
            ['StepAudio 2.5 ASR', '1.38', '3.16', '7.57', '3.55', '2.76', '3.68'],
          ],
          highlightRow: 'StepAudio 2.5 ASR',
        },
        {
          title: 'Long-form open-source sets (WER, lower is better)',
          columns: ['Model', 'LibriSpeech clean (long)', 'LibriSpeech other (long)', 'Wenet testnet (long)', 'Earnings22 Cleaned AA', 'Average'],
          rows: [
            ['VibeVoice-ASR', '1.66', '3.48', '8.73', '5.62', '4.87'],
            ['FunASR-Nano', '2.34', '4.89', '4.74', '10.38', '5.59'],
            ['Doubao-ASR-2603', '2.81', '5.59', '3.72', '12.33', '6.11'],
            ['Qwen3 ASR (1.7B)', '1.95', '3.81', '4.15', '6.90', '4.20'],
            ['StepAudio 2.5 ASR', '1.27', '2.90', '4.09', '6.52', '3.70'],
          ],
          highlightRow: 'StepAudio 2.5 ASR',
        },
      ],
      protocolTitle: 'Long-form set construction',
      protocolItems: ['Wenet testnet (long) 由原始长音频 segment 信息回溯重建。'],
      acceptedLengthTitle: 'Accepted length',
      acceptedLengthItems: [
        '解码分析显示，平均 accepted length 接近 5.0 / 6，说明额外预测 token 具有较高接受率。',
      ],
      ablationTitle: 'Ablation',
      ablationItems: [
        '消融实验表明，MTP 模块的加入并不牺牲识别率，在中文评测集上仍保持与基线一致的精度水平。',
      ],
    },
    distribution: {
      title: 'Distribution',
      entries: [
        {
          term: 'Channels',
          items: [
            '公开页面入口包括 Demo page 与 StepFun 体验中心。',
            '面向开发者的程序化接入请前往 API 文档。',
            '协议说明、参数定义、可用模型标识与最新示例以平台文档为准。',
          ],
        },
        {
          term: 'Developer guidance',
          paragraphs: [
            '如需查看流式 ASR 的具体调用方式、参数说明与示例代码，请直接前往对应的 API 文档页面。',
          ],
        },
      ],
      channelTitle: 'Public entry points',
      channelTable: {
        columns: ['入口', '说明'],
        rows: [
          ['Demo page', '查看公开示例与模型效果展示。'],
          ['体验中心', '上传音频进行在线体验。'],
          ['API 文档', '查看流式 ASR 接入说明、参数定义与最新示例。'],
        ],
      },
      docsLabel: '前往 API 文档',
    },
    intendedUsageLimitations: {
      title: 'Intended Usage and Limitations',
      entries: [
        {
          term: 'Benefit and intended usage',
          items: [
            '实时字幕、会议纪要、长音频转写和媒资预处理。',
            '需要持续消费增量文本并拼接最终结果的后端链路。',
            '重视术语一致性、时延与长文稳定性的工业接入场景。',
          ],
        },
        {
          term: 'Known limitations',
          items: [
            '长音频表现仍依赖音频质量、采样配置与领域词汇。',
            '对低资源语种、强口音或重叠说话场景，调用侧仍应保留人工抽检与兜底流程。',
          ],
        },
        {
          term: 'Operational considerations',
          items: [
            '上线前建议使用目标场景中的代表性音频做专项评测。',
            '长音频任务建议结合音频预处理、分段策略与结果复核流程。',
            '对高价值领域内容，建议维护术语表并保留下游人工校对机制。',
          ],
        },
      ],
    },
    ethicsContentSafety: {
      title: 'Ethics and Content Safety',
      entries: [
        {
          term: 'Scope of this card',
          paragraphs: ['本页重点给出识别质量、长音频行为与公开接口信息；未单列独立的安全基准表。'],
        },
        {
          term: 'Deployment considerations',
          items: [
            'ASR 输出可能包含事实性误转、文本归一化偏差或个人信息。',
            '高风险场景中的自动转写结果不应替代人工复核。',
            '下游产品仍需结合自身合规、隐私与存储策略做额外控制。',
          ],
        },
      ],
    },
    footer: 'StepAudio 2.5 ASR Model Card',
  },
  en: {
    defaultLocale: false,
    meta: {
      pageTitle: 'StepAudio 2.5 ASR Model Card',
      pageDescription:
        'A bilingual StepAudio 2.5 ASR model card covering model information, training data, evaluation results, public interfaces, and usage boundaries.',
    },
    nav: [
      { id: 'overview', label: 'Introduction' },
      { id: 'model-information', label: 'Model Information' },
      { id: 'model-data', label: 'Training Data' },
      { id: 'evaluation', label: 'Evaluation' },
      { id: 'distribution', label: 'Distribution' },
      { id: 'intended-usage-limitations', label: 'Intended Usage & Limitations' },
      { id: 'ethics-content-safety', label: 'Ethics & Content Safety' },
    ],
    sidebarNote:
      'This page is written for technical developers and summarizes the model structure, training-data scale, evaluation results, and public access surfaces. Protocol details and model identifiers should follow the latest platform documentation.',
    header: {
      title: 'StepAudio 2.5 ASR',
      subtitle: 'Model Card',
      intro:
        'StepAudio 2.5 ASR is an automatic speech recognition model for realtime transcription and long-form transcription workloads. This document summarizes the model structure, data profile, evaluation results, and public interfaces.',
      notes: ['Document snapshot: 2026-04-22'],
      links: [
        { label: 'API Docs', hrefKey: 'apiDocs' },
        { label: 'Demo page', hrefKey: 'demoPage' },
        { label: 'Experience Center', hrefKey: 'studio' },
      ],
    },
    modelInformation: {
      title: 'Model Information',
      entries: [
        {
          term: 'Description',
          paragraphs: [
            'StepAudio 2.5 ASR is an automatic speech recognition model for realtime transcription, meeting transcription, and long-form transcription tasks, balancing strong language modeling with high-throughput decoding.',
          ],
        },
        {
          term: 'Model Structure',
          paragraphs: ['The overall stack is Audio Encoder + Linear Adapter + LLM + MTP-5.'],
          items: [
            'A 0.6B Transformer audio encoder converts input audio into 12.5 Hz audio embeddings.',
            'The Linear Adapter aligns hidden dimensions between the encoder and the backbone.',
            'A 4B Qwen3 LLM serves as the backbone for context modeling and autoregressive text generation.',
            'MTP-5 follows the same MTP design used in Step 3.5 Flash and predicts five additional tokens per forward pass.',
          ],
        },
        {
          term: 'Inputs',
          paragraphs: ['Audio in formats such as OGG, mp3, wav, and PCM.'],
        },
        {
          term: 'Outputs',
          paragraphs: ['Streamed transcription text.'],
        },
      ],
    },
    modelData: {
      title: 'Training Data',
      entries: [
        {
          term: 'Pre-training data',
          paragraphs: [
            'The pre-training stage uses speech and audio data at the scale of tens of millions of hours to build general audio representation and language modeling capability.',
          ],
        },
        {
          term: 'ASR training data',
          items: [
            'The ASR training data consists of 10wh curated short-form audio and 5wh long-form audio.',
            'Short-form audio is capped at 30 seconds. It is primarily Chinese and English, with additional dialectal speech, accented Mandarin, limited Japanese and Arabic data, and TTS-synthesized data for robustness.',
            'Long-form audio is capped at 30 minutes and is used to cover meetings, podcasts, interviews, and other longer-context transcription scenarios.',
          ],
        },
      ],
    },
    evaluation: {
      title: 'Evaluation',
      entries: [
        {
          term: 'Benchmark scope',
          paragraphs: [
            'Evaluation is reported on Chinese open-source sets, English open-source sets, and long-form open-source sets, with CER or WER computed per dataset and retained in full.',
          ],
        },
        {
          term: 'Reading guide',
          paragraphs: [
            'All tables are lower is better. The Average column is included only as a reading aid; the more important signal is per-dataset stability and the overall average on the long-form suite.',
          ],
        },
      ],
      suites: [
        {
          title: 'Chinese open-source sets (CER, lower is better)',
          columns: ['Model', 'AISHELL-1', 'AISHELL-2 iOS', 'Wenet testnet', 'Wenet testmeeting', 'FLEURS-zh', 'Average'],
          rows: [
            ['VibeVoice-ASR', '5.19', '5.10', '14.79', '17.09', '8.77', '10.19'],
            ['FunASR-Nano', '1.88', '2.61', '5.30', '5.31', '3.19', '3.66'],
            ['Doubao-ASR-2603', '2.07', '2.70', '4.03', '5.09', '2.83', '3.34'],
            ['Qwen3 ASR (1.7B)', '1.49', '2.50', '4.44', '4.66', '2.74', '3.17'],
            ['StepAudio 2.5 ASR', '0.71', '2.29', '4.54', '4.70', '2.63', '2.97'],
          ],
          highlightRow: 'StepAudio 2.5 ASR',
        },
        {
          title: 'English open-source sets (WER, lower is better)',
          columns: ['Model', 'LibriSpeech clean', 'LibriSpeech other', 'Common Voice v11.0 en', 'FLEURS-en', 'VoxPopuli Cleaned AA', 'Average'],
          rows: [
            ['VibeVoice-ASR', '2.30', '5.79', '20.03', '5.20', '2.38', '7.14'],
            ['FunASR-Nano', '1.80', '4.43', '11.05', '4.96', '3.97', '5.24'],
            ['Doubao-ASR-2603', '2.94', '5.98', '14.06', '6.74', '3.61', '6.67'],
            ['Qwen3 ASR (1.7B)', '1.69', '3.57', '7.50', '3.23', '3.28', '3.85'],
            ['StepAudio 2.5 ASR', '1.38', '3.16', '7.57', '3.55', '2.76', '3.68'],
          ],
          highlightRow: 'StepAudio 2.5 ASR',
        },
        {
          title: 'Long-form open-source sets (WER, lower is better)',
          columns: ['Model', 'LibriSpeech clean (long)', 'LibriSpeech other (long)', 'Wenet testnet (long)', 'Earnings22 Cleaned AA', 'Average'],
          rows: [
            ['VibeVoice-ASR', '1.66', '3.48', '8.73', '5.62', '4.87'],
            ['FunASR-Nano', '2.34', '4.89', '4.74', '10.38', '5.59'],
            ['Doubao-ASR-2603', '2.81', '5.59', '3.72', '12.33', '6.11'],
            ['Qwen3 ASR (1.7B)', '1.95', '3.81', '4.15', '6.90', '4.20'],
            ['StepAudio 2.5 ASR', '1.27', '2.90', '4.09', '6.52', '3.70'],
          ],
          highlightRow: 'StepAudio 2.5 ASR',
        },
      ],
      protocolTitle: 'Long-form set construction',
      protocolItems: ['Wenet testnet (long) is reconstructed from the original long-source segment metadata.'],
      acceptedLengthTitle: 'Accepted length',
      acceptedLengthItems: [
        'Decode analysis shows that the average accepted length is close to 5.0 / 6, indicating a high acceptance rate for the additional predicted tokens.',
      ],
      ablationTitle: 'Ablation',
      ablationItems: [
        'The ablation study indicates that the MTP module can be added without sacrificing recognition quality, while preserving accuracy on the Chinese evaluation set at the same level as the baseline.',
      ],
    },
    distribution: {
      title: 'Distribution',
      entries: [
        {
          term: 'Channels',
          items: [
            'Public entry points include the demo page and the StepFun experience center.',
            'For developer integration, the primary destination is the API documentation.',
            'Protocol details, parameter definitions, available model identifiers, and the latest examples should follow the platform docs.',
          ],
        },
        {
          term: 'Developer guidance',
          paragraphs: [
            'For concrete streaming ASR invocation patterns, parameter descriptions, and example code, developers should go directly to the API documentation page.',
          ],
        },
      ],
      channelTitle: 'Public entry points',
      channelTable: {
        columns: ['Interface', 'Description'],
        rows: [
          ['Demo page', 'Inspect public examples and transcript outputs.'],
          ['Experience Center', 'Upload audio for interactive hands-on testing.'],
          ['API Docs', 'Review streaming ASR integration guidance, parameter definitions, and the latest examples.'],
        ],
      },
      docsLabel: 'Open the API documentation',
    },
    intendedUsageLimitations: {
      title: 'Intended Usage and Limitations',
      entries: [
        {
          term: 'Benefit and intended usage',
          items: [
            'Live captioning, meeting transcription, long-form transcription, and media preprocessing.',
            'Back-end pipelines that continuously consume incremental text and assemble final transcripts.',
            'Industrial deployments that prioritize terminology consistency, latency, and long-form stability.',
          ],
        },
        {
          term: 'Known limitations',
          items: [
            'Long-form behavior still depends on audio quality, sampling configuration, and domain vocabulary.',
            'For low-resource languages, strong accents, or overlapping speech, downstream systems should retain human spot checks and fallback handling.',
          ],
        },
        {
          term: 'Operational considerations',
          items: [
            'Before rollout, validate the model on representative audio from the target scenario.',
            'Long-form workloads benefit from audio preprocessing, segmentation strategy, and result-review workflows.',
            'For high-value domains, maintain terminology glossaries and downstream human review mechanisms.',
          ],
        },
      ],
    },
    ethicsContentSafety: {
      title: 'Ethics and Content Safety',
      entries: [
        {
          term: 'Scope of this card',
          paragraphs: ['This page focuses on recognition quality, long-form behavior, and public interface details; it does not include a separate safety benchmark table.'],
        },
        {
          term: 'Deployment considerations',
          items: [
            'ASR outputs may contain factual transcription errors, normalization artifacts, or personal information.',
            'Automatic transcripts in high-stakes scenarios should not replace human review.',
            'Downstream products still need their own compliance, privacy, and retention controls.',
          ],
        },
      ],
    },
    footer: 'StepAudio 2.5 ASR Model Card',
  },
};
