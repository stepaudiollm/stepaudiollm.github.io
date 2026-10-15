#!/usr/bin/env python3
"""Inspect or run a real benchmark case with the public Chat Completions API.

Default: print readable request templates without making an API call.
--run: use STEPFUN_API_KEY and save fresh requests/responses outside the fixtures.
Only the Python standard library is required; prepared WAV blocks are bundled.
"""
from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import urllib.error
import urllib.request

CASES = Path(__file__).resolve().parent / "cases"
ENDPOINT = "https://api.stepfun.com/v1/chat/completions"
AUDIO_MARKER = re.compile(r"\$\{audio:([^}]+)\}\Z")


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value):
    # Refuse to replace an existing run artifact.
    with path.open("x", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def load_case(name: str):
    case_dir = CASES / name
    case = load_json(case_dir / "case.json")
    requests = [load_json(case_dir / file) for file in case["request_files"]]
    for audio in case["audio"]:
        data = (case_dir / audio["file"]).read_bytes()
        if hashlib.sha256(data).hexdigest() != audio["sha256"]:
            raise ValueError(f"Audio checksum mismatch: {audio['file']}")
    for payload in requests:
        if set(payload) != {"model", "messages", "max_tokens", "temperature"}:
            raise ValueError("Unexpected request fields")
        if (payload["model"], payload["temperature"], payload["max_tokens"]) != (
            "stepaudio-3-chat-preview", 0.7, 32000
        ):
            raise ValueError("Request settings differ from the example protocol")
        if any(m["role"] == "system" for m in payload["messages"]):
            raise ValueError("These examples use the system-message-omitted setting")
    return case_dir, case, requests


def materialize(payload: dict, case_dir: Path, case: dict) -> dict:
    """Replace only explicit audio markers, without re-encoding any WAV."""
    result = copy.deepcopy(payload)
    allowed = {audio["file"] for audio in case["audio"]}
    for message in result["messages"]:
        content = message["content"]
        if not isinstance(content, list):
            continue
        for part in content:
            if part.get("type") != "input_audio":
                continue
            match = AUDIO_MARKER.fullmatch(part["input_audio"]["data"])
            if not match or match.group(1) not in allowed:
                raise ValueError("Unrecognized audio marker")
            part["input_audio"]["data"] = base64.b64encode(
                (case_dir / match.group(1)).read_bytes()
            ).decode("ascii")
    return result


def replace_live_history(payload: dict, prior_answers: list[str]) -> dict:
    """MTalk history must use answers from this run, not fixture answers."""
    result = copy.deepcopy(payload)
    history = [m for m in result["messages"] if m["role"] == "assistant"]
    if len(history) != len(prior_answers):
        raise ValueError("MTalk turn/history count mismatch")
    for message, answer in zip(history, prior_answers):
        message["content"] = answer
    return result


def call_api(payload: dict, api_key: str, timeout: float) -> dict:
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read())


def answer_text(response: dict) -> str:
    choices = response.get("choices") or []
    if not choices:
        raise ValueError("API response has no choices; see the saved raw response")
    choice = choices[0]
    if choice.get("finish_reason") in {"length", "content_filter"}:
        raise ValueError(f"Incomplete response: finish_reason={choice['finish_reason']}")
    content = (choice.get("message") or {}).get("content")
    if not isinstance(content, str) or not content.strip():
        raise ValueError("API returned no answer text; reasoning alone is not an answer")
    return content


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("benchmark", choices=sorted(p.name for p in CASES.iterdir() if p.is_dir()))
    parser.add_argument("--run", action="store_true", help="Make paid API requests using STEPFUN_API_KEY")
    parser.add_argument("--materialize", action="store_true", help="Print Base64-filled requests without calling the API")
    parser.add_argument("--output-dir", type=Path, help="New directory for a live run's requests and responses")
    parser.add_argument("--timeout", type=float, default=1800, help="HTTP timeout in seconds")
    args = parser.parse_args(argv)
    if args.timeout <= 0:
        parser.error("--timeout must be positive")
    if args.run and args.materialize:
        parser.error("Choose --run or --materialize")
    case_dir, case, templates = load_case(args.benchmark)
    if not args.run:
        if args.materialize:
            templates = [materialize(p, case_dir, case) for p in templates]
        print(json.dumps({"case_id": case["case_id"], "mode": case["mode"], "requests": templates}, ensure_ascii=False, indent=2))
        return 0

    api_key = os.environ.get("STEPFUN_API_KEY", "").strip()
    if not api_key:
        parser.error("Set STEPFUN_API_KEY before using --run")
    if args.output_dir is None:
        parser.error("--run requires --output-dir")
    output = args.output_dir.resolve()
    if output == CASES or CASES in output.parents:
        parser.error("Output directory must be outside the checked-in cases")
    if output.exists() and any(output.iterdir()):
        parser.error("Use an empty output directory to preserve previous runs")
    output.mkdir(parents=True, exist_ok=True)
    answers = []
    for index, template in enumerate(templates, 1):
        prepared = (
            replace_live_history(template, answers)
            if case["mode"] == "mtalk_sequential" else template
        )
        payload = materialize(prepared, case_dir, case)
        # Save the actual JSON body, but never the Authorization header.
        write_json(output / f"request_{index:02d}.json", payload)
        response = call_api(payload, api_key, args.timeout)
        write_json(output / f"response_{index:02d}.json", response)
        answer = answer_text(response)
        answers.append(answer)
        print(f"Completed request {index}/{len(templates)}", file=sys.stderr)
    write_json(output / "answers.json", {"case_id": case["case_id"], "mode": case["mode"], "answers": answers})
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.HTTPError as exc:
        # Do not dump the request or authentication headers into error messages.
        print(f"API HTTP error {exc.code}; no score produced. Inspect the service response before retrying.", file=sys.stderr)
        raise SystemExit(1)
    except (OSError, ValueError, KeyError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1)
