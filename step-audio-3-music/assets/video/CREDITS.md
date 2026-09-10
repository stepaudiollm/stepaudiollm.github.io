# 首页背景视频素材

首屏背景是**五个画面剪成的无缝循环蒙太奇**，1920x1080，循环 13.1s，
由 `tools/build_hero_video.py` 生成。

全部来自 **Coverr**（https://coverr.co）。
Coverr 授权：免费用于商业与非商业用途，**无需署名**。取用日期 2026-08-29。

| 段 | 画面 | 原片 |
|---|---|---|
| 1 / 6 | 乐手架麦录制（拆前后两半，接住循环） | [coverr-a-guy-setting-up-his-phone-camera-to-record-his-music-performance-3437](https://cdn.coverr.co/videos/coverr-a-guy-setting-up-his-phone-camera-to-record-his-music-performance-3437/1080p.mp4) |
| 2 | 吉他手弹奏 | [coverr-guitarist-5928](https://cdn.coverr.co/videos/coverr-guitarist-5928/1080p.mp4) |
| 3 | 现场演出灯光 | [coverr-live-music-concert-5249](https://cdn.coverr.co/videos/coverr-live-music-concert-5249/1080p.mp4) |
| 4 | 对麦演唱 | [coverr-a-guy-singing-into-a-microphone-745](https://cdn.coverr.co/videos/coverr-a-guy-singing-into-a-microphone-745/1080p.mp4) |
| 5 | 吉他手（近景） | [coverr-man-playing-a-guitar-4433](https://cdn.coverr.co/videos/coverr-man-playing-a-guitar-4433/1080p.mp4) |

## 换素材前必读

原片不入库（`assets/video/_source/` 已在 .gitignore）。改 `tools/build_hero_video.py`
里的 `CLIPS` 后重跑即可，缺的原片会自动下载。

**选片四条硬性要求**，都是踩过的：

1. **不要手部特写。** 弹吉他/弹钢琴的手部特写看不出在做什么，五个画面都要有人、
   有乐器、有场景。
2. **原生 1920x1080、无信箱黑边。** 输出是 16:9；源也是 16:9 才能零放大。
   带黑边的素材要先裁再放大，反而更糊（音乐厅钢琴那条 1920x1012、内容仅
   1920x800，就是因此被排除的）。
3. **slug 带 `premium-` 的不能用** —— 画面正中压着 coverr+ 水印。
4. **锐度要够。** 用拉普拉斯方差量：`guitarist-5928` 是 75，被换掉的三人舞台演出
   只有 6 —— 那条"看起来糊掉了"是可以量出来的，不是主观感觉。

两件事由脚本自动处理，**不要手动调**：

- **亮度配平**：先无校正切一遍、逐段实测平均亮度，再反解 gamma 重切。
  五条原片实测 64.9～152.6，配平后全部落在 100 上下。整体明暗用 `--target-y` 调。
- **无缝循环**：第一条素材拆成相邻两片，排成 `A2 → B → C → D → E → A1`，
  首帧与末帧是同一时刻。实测接缝帧差 2.0/255，镜头内正常帧间差 1.5/255。

> 曾经用"末尾补一段第一条素材的开头"，结果那个镜头连播两遍，循环时明显卡一下。
> 不要退回那个做法。

## 曾被否掉的素材

三人舞台演出（锐度仅 6，糊）· 手弹木吉他 / 钢琴键特写（手部特写）· 调音台按按钮 ·
吉他调弦 · 翻黑胶（白墙正脸，是"听"不是"做"）· 电吉他静物（冷蓝调、无人）·
mic drop（灰底扁平）· DJ（过暗且糊）· 唱机特写（大虚焦）· premium 系列（水印）。
