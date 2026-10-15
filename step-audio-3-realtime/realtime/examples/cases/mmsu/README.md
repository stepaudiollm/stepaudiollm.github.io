# MMSU: one inference case

**Case ID:** `volume_comparison_62f4a21c-c7dc-42b1-8841-9a4171423654`

**Task:** Read the question and four options, then listen to the audio and answer the volume-pattern question.

## What is sent

A single user message contains the question, the exact answer-format instruction and A–D options, followed by the audio. There are no demonstration examples. The leading newline in the question block is retained.

The requests use `stepaudio-3-chat-preview`, `temperature=0.7` and `max_tokens=32000`. The system message is omitted. No reference answer, checklist or scoring rubric is sent to the model. No `top_p`, `stop`, `tools`, `tool_choice`, reasoning-effort or assistant-prefill field is added.

**Output:** A choice label or answer text; the recorded response is in `observed_response.json`.

## Case and audio

[`case.json`](case.json) contains the case ID, question/options where applicable, turn structure, original field names, and SHA-256 checksums for every audio block. [`reference.json`](reference.json) contains scoring/inspection data only. [`observed_response.json`](observed_response.json) contains the saved answer from the previous run; it is an example response, not a guaranteed output of a new request.

The WAV files below are the prepared API input blocks. Encode their bytes directly as Base64; do not encode a file path, add a data-URL prefix, re-encode the WAVs, or translate the prompt text.

| Audio block | User turn | Duration (s) | Sample rate (Hz) | Channels |
| --- | ---: | ---: | ---: | ---: |
| [`audio/turn01_chunk01.wav`](audio/turn01_chunk01.wav) | 1 | 13.470 | 16000 | 1 |

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
          "type": "text",
          "text": "\nWhich volume pattern best matches the audio?\nPlease choose the answer from the following options, do not provide any additional explanations or content: \nA. medium-low-high\nB. high-low-medium\nC. low-high-medium\nD. low-medium-high\n"
        },
        {
          "type": "input_audio",
          "input_audio": {
            "data": "${audio:audio/turn01_chunk01.wav}",
            "format": "wav"
          }
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
python3 examples/run_benchmark.py mmsu
```

Run the case with your own API key and save the actual requests and responses:

```bash
export STEPFUN_API_KEY="<your-step-api-key>"
python3 examples/run_benchmark.py mmsu --run --output-dir ./outputs/mmsu
```

See [the examples guide](../../README.md) for audio preparation, live multi-turn behavior, and the distinction between request construction and scoring.
