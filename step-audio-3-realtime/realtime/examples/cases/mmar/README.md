# MMAR: one inference case

**Case ID:** `UgPbbpEQ1B0_00-00-00_00-00-13`

**Task:** Infer what the news anchor would do without the sudden scream.

## What is sent

A single user message contains the question, the exact answer-format instruction and A–D options, followed by the audio. The selected WAV is stereo at 48 kHz: it is not automatically downmixed or resampled in this setting.

The requests use `stepaudio-3-chat-preview`, `temperature=0.7` and `max_tokens=32000`. The system message is omitted. No reference answer, checklist or scoring rubric is sent to the model. No `top_p`, `stop`, `tools`, `tool_choice`, reasoning-effort or assistant-prefill field is added.

**Output:** A choice label or answer text.

## Case and audio

[`case.json`](case.json) contains the case ID, question/options where applicable, turn structure, original field names, and SHA-256 checksums for every audio block. [`reference.json`](reference.json) contains scoring/inspection data only. [`observed_response.json`](observed_response.json) contains the saved answer from the previous run; it is an example response, not a guaranteed output of a new request.

The WAV files below are the prepared API input blocks. Encode their bytes directly as Base64; do not encode a file path, add a data-URL prefix, re-encode the WAVs, or translate the prompt text.

| Audio block | User turn | Duration (s) | Sample rate (Hz) | Channels |
| --- | ---: | ---: | ---: | ---: |
| [`audio/turn01_chunk01.wav`](audio/turn01_chunk01.wav) | 1 | 13.000 | 48000 | 2 |

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
          "text": "\nWhat would the female anchor do if there was no sudden scream\nPlease choose the answer from the following options, do not provide any additional explanations or content: \nA. The female anchor would immediately end the report\nB. The female anchor would continue with the live report\nC. The female anchor would begin discussing the cause of the scream\nD. The female anchor would switch to an advertisement break\n"
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
python3 examples/run_benchmark.py mmar
```

Run the case with your own API key and save the actual requests and responses:

```bash
export STEPFUN_API_KEY="<your-step-api-key>"
python3 examples/run_benchmark.py mmar --run --output-dir ./outputs/mmar
```

See [the examples guide](../../README.md) for audio preparation, live multi-turn behavior, and the distinction between request construction and scoring.
