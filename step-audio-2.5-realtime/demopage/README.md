# StepAudio-2.5-Realtime Demo Page

StepFun 新一代实时语音对话大模型的单页宣传 demo。

## 技术栈

- 纯 HTML + ES Module + Three.js（通过 importmap CDN 加载）
- **零构建**：没有 npm、webpack、node_modules
- 只需要一个静态文件服务器即可运行

## 本地启动

任选一种方式：

```bash
cd step2p5-demopage

# 方式 1：Python 3（最简单）
python3 -m http.server 8080

# 方式 2：Node（如果装了 Node）
npx serve -p 8080

# 方式 3：任何静态服务器都行（nginx / caddy / live-server 皆可）
```

然后浏览器打开 `http://localhost:8080`。

> ⚠️ 不要直接双击 `index.html` 用 `file://` 打开 —— ES Module 需要 HTTP 协议才能加载，直接打开会报 CORS 错误。

## 页面结构

| 章节 | 内容 | 视觉特点 |
|------|------|----------|
| § Hero | 3D 点云 logo + 模型名 | 深蓝渐变背景，粒子聚合入场 + 呼吸漂浮 + 鼠标视差 |
| § Intro | 介绍 + arxiv / github 链接 | 浅色背景，左文右装饰性声波 |
| § Highlights | 四大宣发亮点 | 深色背景，错位 Bento Grid（2 大 + 2 小） |
| § Tech | 三条技术路线 | 浅色背景，垂直时间线 |
| § Metrics | 五维度对比评测 | 深色背景，bar chart + 表格，数字滚动动画 |
| § Cases | 真实对话 case（分 4 类 tab） | 浅色背景，tab 切换卡片墙 |
| § Footer | logo + 链接 + 版权 | 回到深蓝，呼应 Hero |

## 添加音频 Case

所有音频 case 的元信息都在 `assets/js/data.js` 的 `CASES` 字段里，音频文件路径为：

```
assets/audio/<audio_name>.mp3
```

目前 `data.js` 里已经配置了 17 个 case 的文件名（从 PDF 宣发材料整理出来的）。你只需要：

1. 把 mp3 / wav 文件命名成 `data.js` 里对应的文件名，例如 `goodcase_85b444df.mp3`
2. 放到 `assets/audio/` 目录下
3. 刷新页面即可

没有对应音频文件时，播放按钮会自动显示 "即将上线"，不会报错。

## 修改内容

**所有文案内容都集中在 `assets/js/data.js`**，包括：
- `MODEL`：模型名、tagline、intro 正文、arxiv/github 链接
- `HIGHLIGHTS`：四大亮点（标题、描述、大小、图标路径）
- `TECH_POINTS`：三条技术路线
- `METRICS`：五维度指标对比数据
- `CASES`：所有 good case，按类别组织

改文案不需要动 HTML/CSS/其他 JS。

## 目录结构

```
step2p5-demopage/
├── index.html                              # 主页面
├── README.md                               # 你正在看的这个文件
├── planning.md                             # 原始需求
├── StepAudio-2.5-Realtime宣传材料.pdf      # 原始资料
├── stepfun-color.svg                       # 原始 logo
└── assets/
    ├── css/
    │   └── style.css                       # 全部样式
    ├── js/
    │   ├── main.js                         # 入口：渲染 + 滚动 + 交互
    │   ├── pointcloud.js                   # Three.js 3D 点云 logo
    │   ├── audio-player.js                 # 音频播放器组件
    │   └── data.js                         # 所有页面内容（单一数据源）
    ├── img/
    │   └── stepfun-color.svg               # logo（主页引用）
    └── audio/                              # 放 goodcase_xxx.mp3 的地方
```

## 下一步 TODO

- [ ] 收齐 17 个 case 的音频文件放到 `assets/audio/`
- [ ] 在 `data.js` 里把 arxiv 和 github 的 `#` 占位符替换成真实链接
- [ ] （可选）根据你的审美微调 `--accent-warm` 等 CSS 变量
