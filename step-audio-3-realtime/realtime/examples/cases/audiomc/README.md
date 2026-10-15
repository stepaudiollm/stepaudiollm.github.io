# Audio Multi-Challenge: one inference case

**Case ID:** `aptei3ykho74yxb5`

**Task:** Continue a travel conversation while avoiding the word “cheap” and answering in exactly ten words.

## What is sent

This case has three user turns but makes **one model call**. All three user turns are sent as audio, in chronological order. The two intervening assistant messages are the dataset-provided history, not fresh generations. The model generates only the third/final assistant turn. User transcripts are visible in `case.json` for inspection but are not inserted into the API request.

The requests use `stepaudio-3-chat-preview`, `temperature=0.7` and `max_tokens=32000`. The system message is omitted. No reference answer, checklist or scoring rubric is sent to the model. No `top_p`, `stop`, `tools`, `tool_choice`, reasoning-effort or assistant-prefill field is added.

**Output:** Only the final assistant reply, conditioned on the provided history.

## Case and audio

[`case.json`](case.json) contains the case ID, question/options where applicable, turn structure, original field names, and SHA-256 checksums for every audio block. [`reference.json`](reference.json) contains scoring/inspection data only. [`observed_response.json`](observed_response.json) contains the saved answer from the previous run; it is an example response, not a guaranteed output of a new request.

The WAV files below are the prepared API input blocks. Encode their bytes directly as Base64; do not encode a file path, add a data-URL prefix, re-encode the WAVs, or translate the prompt text.

| Audio block | User turn | Duration (s) | Sample rate (Hz) | Channels |
| --- | ---: | ---: | ---: | ---: |
| [`audio/turn01_chunk01.wav`](audio/turn01_chunk01.wav) | 1 | 29.900 | 16000 | 1 |
| [`audio/turn01_chunk02.wav`](audio/turn01_chunk02.wav) | 1 | 2.313 | 16000 | 1 |
| [`audio/turn02_chunk01.wav`](audio/turn02_chunk01.wav) | 2 | 14.507 | 16000 | 1 |
| [`audio/turn03_chunk01.wav`](audio/turn03_chunk01.wav) | 3 | 19.627 | 16000 | 1 |

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
          "type": "input_audio",
          "input_audio": {
            "data": "${audio:audio/turn01_chunk02.wav}",
            "format": "wav"
          }
        }
      ]
    },
    {
      "role": "assistant",
      "content": "Round-trip flights to Rome often range around eight hundred dollars."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_audio",
          "input_audio": {
            "data": "${audio:audio/turn02_chunk01.wav}",
            "format": "wav"
          }
        }
      ]
    },
    {
      "role": "assistant",
      "content": "Yes, the iconic Colosseum is located right in Rome, Italy."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_audio",
          "input_audio": {
            "data": "${audio:audio/turn03_chunk01.wav}",
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
python3 examples/run_benchmark.py audiomc
```

Run the case with your own API key and save the actual requests and responses:

```bash
export STEPFUN_API_KEY="<your-step-api-key>"
python3 examples/run_benchmark.py audiomc --run --output-dir ./outputs/audiomc
```

See [the examples guide](../../README.md) for audio preparation, live multi-turn behavior, and the distinction between request construction and scoring.
