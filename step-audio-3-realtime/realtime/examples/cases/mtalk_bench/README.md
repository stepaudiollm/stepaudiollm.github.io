# MTalk-Bench: one inference case

**Case ID:** `para_1-11`

**Task:** Respond to an angry complaint about a washing machine, then follow a change of topic.

## What is sent

This example is the paralinguistic scene `para_1-11`. The same input construction applies to the semantic and ambient subsets. It makes **two sequential model calls**. Each current user turn is audio only. Before the next call, that earlier user turn is replaced by its official transcription (including the `(Angry emotion)` annotation), followed by the assistant response actually generated for that turn. Never expose the current turn’s transcription before generating its response.

The checked-in second request contains the **recorded first-turn answer**, so its structure and historical context can be inspected. When running the example, the runner replaces that answer with the **new first-turn answer**. It does not mix a fresh run with the saved answer.

The requests use `stepaudio-3-chat-preview`, `temperature=0.7` and `max_tokens=32000`. The system message is omitted. No reference answer, checklist or scoring rubric is sent to the model. No `top_p`, `stop`, `tools`, `tool_choice`, reasoning-effort or assistant-prefill field is added.

**Output:** One text response for each user turn, without synthesizing speech.

## Case and audio

[`case.json`](case.json) contains the case ID, question/options where applicable, turn structure, original field names, and SHA-256 checksums for every audio block. [`reference.json`](reference.json) contains scoring/inspection data only. [`observed_response.json`](observed_response.json) contains the saved answer from the previous run; it is an example response, not a guaranteed output of a new request.

The WAV files below are the prepared API input blocks. Encode their bytes directly as Base64; do not encode a file path, add a data-URL prefix, re-encode the WAVs, or translate the prompt text.

| Audio block | User turn | Duration (s) | Sample rate (Hz) | Channels |
| --- | ---: | ---: | ---: | ---: |
| [`audio/turn01_chunk01.wav`](audio/turn01_chunk01.wav) | 1 | 7.320 | 24000 | 1 |
| [`audio/turn02_chunk01.wav`](audio/turn02_chunk01.wav) | 2 | 13.320 | 24000 | 1 |

## API request

`POST https://api.stepfun.com/v1/chat/completions` with `Content-Type: application/json` and `Authorization: Bearer $STEPFUN_API_KEY`.

The `${audio:...}` strings below are **local template markers**, not API syntax. The runner replaces each marker with the Base64 of the named WAV. All other request fields and content ordering are preserved.

### `request_turn01.json`

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
        }
      ]
    }
  ],
  "max_tokens": 32000,
  "temperature": 0.7
}
```
### `request_turn02.json`

```json
{
  "model": "stepaudio-3-chat-preview",
  "messages": [
    {
      "role": "user",
      "content": "The washing machine had problems again today. It got stuck when I started washing the sheets. (Angry emotion)"
    },
    {
      "role": "assistant",
      "content": "That sounds frustrating! Based on the context, it's almost certain you meant **\"when I started *washing* the sheets\"** (not \"watching\"). \"Washing\" makes perfect sense here—\"watching\" is likely a slip of the tongue or typo.\n\nHere’s what might be happening and how to fix it:\n\n### 🔧 Common Causes & Quick Fixes:\n1. **Overloaded Drum (Most Likely)**  \n   - Sheets are bulky and absorbent. If the machine was packed too tight, the drum got unbalanced and stalled.  \n   - **Fix:** Unplug the machine, redistribute the sheets evenly, and restart. *Never overload*—leave 10-15% empty space at the top.\n\n2. **Drain Pump Blockage**  \n   - Fabric lint, coins, or small items from pockets can clog the pump, causing the machine to stall mid-cycle.  \n   - **Fix:** Check the drain filter (usually at the front bottom—consult your manual). Clean out debris. [Here’s how](https://www.youtube.com/watch?v=hhJ9VfkpMxg).\n\n3. **Unbalanced Load**  \n   - Sheets clump in one area, throwing the drum off balance during spin cycle.  \n   - **Fix:** Pause the cycle, open the door, and manually separate the sheets. Restart slowly.\n\n4. **Error Code Trigger**  \n   - Modern machines pause if they detect imbalance, overheating, or sensor faults.  \n   - **Fix:** Unplug for 5 minutes to reset the control board, then restart. Check your manual for error codes (e.g., \"F01\" for drain issues).\n\n### 🚨 When to Call a Pro:\n- If it **won’t drain at all** → Could be a broken pump motor ($100-$200 to repair).  \n- If you hear **grinding/scraping noises** → Worn bearings or spider bracket (repair often costs 50% of a new machine).  \n- If it’s **still under warranty** → Contact the manufacturer first!\n\n### 💡 Prevention Tip:\n- Wash sheets **separately** from towels or clothes (they create imbalance).  \n- Use **cold water** for sheets (hot water can damage fibers and increase friction).  \n- Clean your **lint filter** after every 3-4 washes.\n\nIf you share your machine’s **brand/model** or describe exactly what happened (e.g., \"filled with water but wouldn’t spin\"), I can give more specific steps! For now, try unplugging it for 5 minutes—this resolves 60% of \"stuck\" issues. 😊"
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
    }
  ],
  "max_tokens": 32000,
  "temperature": 0.7
}
```

## Run

From the `realtime/` directory, inspect the readable request without making an API call:

```bash
python3 examples/run_benchmark.py mtalk_bench
```

Run the case with your own API key and save the actual requests and responses:

```bash
export STEPFUN_API_KEY="<your-step-api-key>"
python3 examples/run_benchmark.py mtalk_bench --run --output-dir ./outputs/mtalk_bench
```

See [the examples guide](../../README.md) for audio preparation, live multi-turn behavior, and the distinction between request construction and scoring.
