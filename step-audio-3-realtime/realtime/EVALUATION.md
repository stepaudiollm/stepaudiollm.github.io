# StepAudio 3 Realtime Evaluation

This document describes the public request configuration and scoring conventions used for the StepAudio 3 Realtime audio-understanding results. The model is evaluated through the Chat Completions API with audio input and text output.

## Request Configuration

| Parameter | Value |
| --- | --- |
| Endpoint | `POST https://api.stepfun.com/v1/chat/completions` |
| Model | `stepaudio-3-chat-preview` |
| Temperature | `0.7` |
| Max tokens | `32000` |
| Main system-message setting | No system message |

The equivalent request examples are:

- [`configs/chat_no_system.yaml`](./configs/chat_no_system.yaml)
- [`configs/chat_explicit_empty_system.yaml`](./configs/chat_explicit_empty_system.yaml)

The main setting omits the system message. The control setting sends an explicitly empty system message. All other request parameters remain unchanged.

## Audio Input

Audio is sent as a base64-encoded `input_audio` content block:

```json
{
  "type": "input_audio",
  "input_audio": {
    "data": "<base64 audio>",
    "format": "wav"
  }
}
```

The request client sends the base64 payload without a data-URL prefix and declares the audio format explicitly. Audio longer than 29.9 seconds is split into segments no longer than 29.9 seconds when required by the benchmark request format.

The content order follows each benchmark's task definition:

| Benchmark | Request content |
| --- | --- |
| MMSU, MMAR, MMAU mini | The question, output-format instruction, options, and audio |
| Big Bench Audio | Audio followed by the fixed answer instruction |
| Step-Caption | Audio followed by the description instruction |
| WildSpeech-Bench | Audio; the spoken question is contained in the recording |
| MTalk-Bench | Current-turn audio plus text history from previous turns |
| Audio Multi-Challenge | Audio and text history for the multi-turn task |

## Scoring

The model response is scored against the benchmark answer or rubric. Benchmarks that require open-ended assessment use a text-only LLM judge; the judge does not receive the audio. Multiple-choice and rubric-based tasks preserve the benchmark's task structure and report the benchmark-specific primary metric.

The judge configurations used for the reported results are:

- `gpt-oss-120b` for the general text-based judge tasks.
- `o4-mini` for Audio Multi-Challenge, following its reported evaluation protocol.

Judge requests use `temperature=0.8`, `top_p=0.9`, `frequency_penalty=0.1`, and `presence_penalty=0.1` where supported. Incomplete or unparsable judge responses are retried before aggregation.

## Benchmark Overview

| Benchmark | Task | Primary metric |
| --- | --- | --- |
| MMSU | Audio multiple-choice questions | Accuracy |
| MMAR | Audio reasoning multiple-choice questions | Accuracy |
| MMAU mini | Audio multiple-choice questions | Accuracy |
| Big Bench Audio | Audio-grounded reasoning questions | Accuracy |
| Audio Multi-Challenge | Multi-turn interaction with rubrics | APR / ARS |
| WildSpeech-Bench | Long-audio open-ended questions | Mean score on a 0–100 scale |
| Step-Caption | Structured audio description | Overall score |
| MTalk-Bench | Multi-turn spoken dialogue in S2T format | Macro-averaged pass rate |

The benchmark scores retain their native primary metrics. When a single summary is needed, each metric is first expressed on a 0–100 scale and then averaged across benchmarks without sample-count weighting.

## MTalk-Bench

MTalk-Bench contains `semantic`, `paralinguistic`, and `ambient` subsets. This repository evaluates the speech-to-text (S2T) setting:

- The current turn is sent as audio, without exposing its reference transcription to the model.
- Previous turns are passed as text using the official transcripts, including the available paralinguistic and ambient annotations.
- Previous model replies are retained as text context.
- The model returns a text reply.
- The text reply is judged against the official rubric.

The primary score is the macro average of case-level pass rates: rubric items are averaged within each case, and cases are then averaged with equal weight.

## WildSpeech-Bench

WildSpeech-Bench is evaluated as audio input and text output. The model answers directly in text rather than synthesizing speech. The judge uses the benchmark question and scoring checklist to produce a 1–10 score, which is linearly mapped to the reported 0–100 scale.

## Dataset Alignment

The benchmark audio and annotations follow the released benchmark versions used by the corresponding evaluation protocols. Local request formatting is limited to the input modality and output-format instructions described above; the benchmark answer keys and rubrics are retained for scoring.
