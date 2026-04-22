# StepAudio 2.5 ASR

StepAudio 2.5 ASR 的静态展示页，聚焦展示推理效率、识别精度、长音频处理能力，以及中英文实际转写效果。

## Quick Start

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`

## Features

- 核心卖点展示：极速推理、SOTA 转写精度、原生超长音频支持
- 实际案例试听：中文、英文、多种复杂场景音频样例
- 媒体总结 Demo：内置视频演示
- Benchmark 对比：中文 / 英文 / 长文识别指标可视化

## Project Structure

- `index.html`：页面结构与模块布局
- `styles.css`：视觉样式
- `app.js`：案例数据渲染、benchmark 渲染与音频时长绑定
- `model-card/`：面向开发者的模型卡静态页面
- `stepaudio_asr_showcase_cases.json`：展示案例数据
- `stepaudio_asr_showcase_notes.md`：案例与素材整理说明
- `assets/audio/`：音频样例
- `assets/asr_media_summary_demo.mp4`：视频 demo

## Development

- 这是纯静态页面，无需安装依赖或执行构建
- 修改文件后刷新浏览器即可查看最新效果
- 建议始终通过本地 HTTP 服务预览，避免直接打开 `index.html` 带来的资源加载问题

## Deployment

项目可直接部署到 GitHub Pages 或任意静态文件服务器。
