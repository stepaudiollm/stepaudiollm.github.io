# StepAudio 2.5 ASR Demo 数据整理

## 当前版本

- 页面数据已经收敛成“可直接做静态展示”的结构，只保留本地可试听案例。
- 例子分成两大章节：`StepAudio 2.5 ASR中文效果展示` 和 `StepAudio 2.5 ASR英文效果展示`。
- 表格列固定为：场景 / 音频 / StepAudio 2.5 ASR，转写结果全部展示完整文本。

## 新补数据

- 新增中文长段样本：`fleurs_zh_test / 5655534691025010514`
- 新增英文样本：
  - `librispeech / lbi-1995-1836-0004`
  - `librispeech_test_other / lbi-4294-14317-0014`
  - `librispeech_test_other / lbi-6070-86744-0018`
  - `librispeech_test_other / lbi-6128-63240-0008`
  - `librispeech_test_other / lbi-7018-75789-0029`
- 这些音频都由 `/home/i-liyuxin/asr_eval_results/it10000_hf_long_chunked/chunk_wavs` 下的 chunk 本地拼接生成，并已复制到 `assets/audio/`。

## 页面分组

### 中文效果展示

- 快语速与品牌型号
- 生活口播与领域术语
- 会议口语与语气词
- 长段说明类转写

### 英文效果展示

- 人名与专名密集
- 文学长段转写
- 复杂书面表达

## 文件

- 数据：`stepaudio_asr_showcase_cases.json`
- 页面：`index.html` / `app.js` / `styles.css`
- 音频：`assets/audio/`
- 视频：`assets/asr_media_summary_demo.mp4`
