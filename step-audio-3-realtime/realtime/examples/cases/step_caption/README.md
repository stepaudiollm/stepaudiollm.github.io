# Step-Caption: one inference case

**Case ID:** `test_0005`

**Task:** Describe a short speech recording using the benchmark’s detailed acoustic-description instruction.

## What is sent

A single user message contains the audio followed by the complete Chinese description prompt. The prompt is copied verbatim in `request.json`, including all speaker, delivery, emotion and language requirements. The annotated reference description is never part of the request.

The requests use `stepaudio-3-chat-preview`, `temperature=0.7` and `max_tokens=32000`. The system message is omitted. No reference answer, checklist or scoring rubric is sent to the model. No `top_p`, `stop`, `tools`, `tool_choice`, reasoning-effort or assistant-prefill field is added.

**Output:** Natural-language paragraphs, as requested by the supplied Chinese instruction.

## Case and audio

[`case.json`](case.json) contains the case ID, question/options where applicable, turn structure, original field names, and SHA-256 checksums for every audio block. [`reference.json`](reference.json) contains scoring/inspection data only. [`observed_response.json`](observed_response.json) contains the saved answer from the previous run; it is an example response, not a guaranteed output of a new request.

The WAV files below are the prepared API input blocks. Encode their bytes directly as Base64; do not encode a file path, add a data-URL prefix, re-encode the WAVs, or translate the prompt text.

| Audio block | User turn | Duration (s) | Sample rate (Hz) | Channels |
| --- | ---: | ---: | ---: | ---: |
| [`audio/turn01_chunk01.wav`](audio/turn01_chunk01.wav) | 1 | 2.100 | 24000 | 1 |

## API request

`POST https://api.stepfun.com/v1/chat/completions` with `Content-Type: application/json` and `Authorization: Bearer $STEPFUN_API_KEY`.

The `${audio:...}` strings below are **local template markers**, not API syntax. The runner replaces each marker with the Base64 of the named WAV. All other request fields and content ordering are preserved.

### `request.json`

```json
{
  "model": "stepaudio-3-chat-preview",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_audio",
          "input_audio": {
            "data": "${audio:audio/turn01_chunk01.wav}",
            "format": "wav"
          }
        },
        {
          "type": "text",
          "text": "请对提供的音频进行详细的多模态语音描述分析，并以自然、连贯的段落形式输出分析结果。\n\n分析要求如下：\n1. 首先判断音频中是单人发言还是多人对话。\n2. 若为多人对话，请在段落中依次对每一位说话人进行详细分析，确保涵盖每位说话人的所有特征。\n3. 分析应基于语音特征本身，而非对文字内容的推测。\n4. 输出为纯文本的自然语言段落，不要输出JSON、代码块、Markdown等任何结构化格式，也不要添加任何解释性前缀或标题。\n5. 年龄估算允许±10岁的误差范围。\n\n请务必在分析中涵盖以下所有维度的信息，并自然地融入段落描述中：\n\n对于每位说话人：\n- 基本属性：性别、估计的年龄段。\n- 语音模式：语速（慢速/中速/快速）、节奏（平稳/急促/有停顿/波动明显）、音调范围（高音/中音/低音）、发音清晰度（清晰/含糊/咬字特点）。\n- 音色与风格：对声音音色的具体描述（如明亮、低沉、沙哑、圆润等）、语言风格或特色（如夸张、空灵、沉稳、活泼等）。\n- 副语言特征：是否包含笑声、叹息、咳嗽等非语言声音。\n- 情感状态：基于语调、节奏等语音特征判断的情感状态（如高兴、愤怒、悲伤、平静、焦虑等），并简要描述其语气（如压抑的愤怒、轻松的愉悦）。\n- 整体印象：声音给人带来的整体感知印象（如温暖感、压迫感、亲和力、权威感等）。\n- 语言特征：所使用的方言或口音类型、词汇的大致正式程度（如口语化、正式、专业）。\n\n最终要求：\n请将上述所有分析点，按照单人叙述或多角色对比的方式，组织成一个逻辑清晰、描述详尽的自然语言段落。"
        }
      ]
    }
  ],
  "max_tokens": 32000,
  "temperature": 0.7
}
```

## Run

From the `realtime/` directory, inspect the readable request without making an API call:

```bash
python3 examples/run_benchmark.py step_caption
```

Run the case with your own API key and save the actual requests and responses:

```bash
export STEPFUN_API_KEY="<your-step-api-key>"
python3 examples/run_benchmark.py step_caption --run --output-dir ./outputs/step_caption
```

See [the examples guide](../../README.md) for audio preparation, live multi-turn behavior, and the distinction between request construction and scoring.
