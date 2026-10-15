#!/usr/bin/env bash
# Minimal Chat Completions request without a system message.
#
# Usage: STEPFUN_API_KEY=<key> bash chat_no_system.sh ./audio.wav
#
# The audio is sent as an "input_audio" content block holding bare base64 data
# plus an explicit "format". This minimal example sends one audio file as one
# block; benchmark runners should apply the dataset-specific audio preparation
# described in realtime/EVALUATION.md.
set -euo pipefail

AUDIO_FILE=${1:?usage: $0 AUDIO_FILE}
: "${STEPFUN_API_KEY:?set STEPFUN_API_KEY first}"

python3 - "$AUDIO_FILE" <<'PY'
import base64
import json
import os
import sys
import urllib.request

audio_path = sys.argv[1]
audio_b64 = base64.b64encode(open(audio_path, "rb").read()).decode()

messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "请描述这段音频。"},
            {
                "type": "input_audio",
                "input_audio": {"data": audio_b64, "format": "wav"},
            },
        ],
    },
]

payload = {
    "model": "stepaudio-3-chat-preview",
    "temperature": 0.7,
    "max_tokens": 32000,
    "messages": messages,
}

request = urllib.request.Request(
    "https://api.stepfun.com/v1/chat/completions",
    data=json.dumps(payload).encode(),
    headers={
        "Authorization": f"Bearer {os.environ['STEPFUN_API_KEY']}",
        "Content-Type": "application/json",
    },
)
with urllib.request.urlopen(request) as response:
    print(response.read().decode())
PY
