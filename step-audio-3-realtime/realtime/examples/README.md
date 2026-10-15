# Benchmark inference examples

These examples show one actual case from each of the eight audio-understanding benchmarks evaluated with `stepaudio-3-chat-preview`. They include the case structure, prepared audio, readable API request, and a saved model answer. The examples use **audio input and text output** through `POST https://api.stepfun.com/v1/chat/completions`.

| Benchmark | Example | Input and conversation pattern | Model calls |
| --- | --- | --- | ---: |
| MMSU | [Volume comparison](cases/mmsu/README.md) | Question + format instruction + four options → audio | 1 |
| MMAR | [Counterfactual news-report question](cases/mmar/README.md) | Question + format instruction + four options → audio | 1 |
| MMAU mini | [Flowing-water source](cases/mmau/README.md) | Question + format instruction + four options → audio; zero-shot | 1 |
| Big Bench Audio | [Formal fallacy](cases/big_bench/README.md) | Audio containing the problem → fixed answer instruction | 1 |
| Audio Multi-Challenge | [Constrained travel conversation](cases/audiomc/README.md) | All user audio turns + dataset-provided assistant history → generate final reply | 1 |
| WildSpeech-Bench | [Meaning and punctuation](cases/wild_speech/README.md) | Audio-only user request → text answer | 1 |
| Step-Caption | [Acoustic speech description](cases/step_caption/README.md) | Audio → full Chinese description instruction | 1 |
| MTalk-Bench | [Emotion and topic change](cases/mtalk_bench/README.md) | Current audio + prior user transcriptions and newly generated assistant replies | 2 |

MTalk's semantic, paralinguistic, and ambient subsets share the same S2T inference construction. The included scene is from the paralinguistic subset and demonstrates preserving an official emotion annotation in the **previous** turn's text. It is one example, not a separate case for every MTalk subset.

## Request settings

All examples use the same top-level fields:

```json
{
  "model": "stepaudio-3-chat-preview",
  "messages": [],
  "max_tokens": 32000,
  "temperature": 0.7
}
```

`messages` is populated from the benchmark-specific request file. The main setting sends **no system message**, which is different from sending an empty system message and does not make a claim about the service's internal default. No `top_p`, `stop`, `tools`, `tool_choice`, reasoning-effort, or assistant-prefill parameter is added. Authentication is supplied separately with your own `STEPFUN_API_KEY`.

The question and Chinese/English prompt text are preserved as used by the evaluator; translating them would change the request. Audio markers such as `${audio:audio/turn01_chunk01.wav}` are replaced with bare Base64 strings. They are **not** file-upload URLs or valid audio data as written.

## Inspect or run a case

Run these commands from the `realtime/` directory. The bundled-case runner requires **Python 3.10+ and no third-party packages**.

```bash
# Inspect a complete readable request; no network call and no API key needed.
python3 examples/run_benchmark.py mmsu

# Fill the audio markers with the actual bundled WAV bytes, still without a call.
python3 examples/run_benchmark.py mmsu --materialize > /tmp/mmsu-request-preview.json

# Make a real API call and save the request body, raw response, and answer text.
export STEPFUN_API_KEY="<your-step-api-key>"
python3 examples/run_benchmark.py mmsu --run --output-dir ./outputs/mmsu

# For MTalk, generate each reply before constructing the next turn's request.
python3 examples/run_benchmark.py mtalk_bench --run --output-dir ./outputs/mtalk_bench

# For Audio Multi-Challenge, keep the supplied history and generate only the final reply.
python3 examples/run_benchmark.py audiomc --run --output-dir ./outputs/audiomc
```

Inspection output groups the request objects inside a `requests` array. When using your own HTTP client, send one object from that array as the request body, not the outer preview wrapper.

The runner defaults to inspection, verifies audio checksums, and never reads `reference.json` to construct requests. `--run` saves the JSON request bodies and complete API responses, including any returned usage or reasoning fields, without saving the API key. It keeps reasoning metadata out of the assistant conversation history. It does not overwrite existing run outputs and does not automatically retry paid requests. Empty, truncated, or filtered replies cause an error; no benchmark score is produced by this example runner.

## Files in each case directory

- `README.md`: task, input ordering, audio properties, full readable request(s), and run commands.
- `case.json`: case ID, inspection-only question/options/transcripts, turn structure, source field names, and audio checksums.
- `request.json` or `request_turnNN.json`: API request template(s). These files contain only request fields, with explicit Base64 placeholders.
- `audio/*.wav`: prepared audio blocks used to materialize the request. The SHA-256, sample rate, channels, frame count, and duration are recorded in `case.json`.
- `reference.json`: reference answer, rubric or checklist for inspection/scoring. This is not an inference input.
- `observed_response.json`: saved answer text from the matching historical inference record. Sampling and service revisions can produce different answers in a fresh run.

The case IDs and answer text were taken from saved successful inference records and matched back to the source dataset. The request templates were **reconstructed offline using the evaluation request builder**, with network calls mocked, and are not presented as historical HTTP wire logs. Only audio data is replaced by a placeholder. For MTalk's second request, the checked-in assistant history contains the recorded first reply; live execution replaces it with the reply from the new run.

## Audio preparation

The bundled WAV files are already prepared. Base64-encode them directly without resampling or concatenating them. Preparation of source dataset audio differs by benchmark:

| Benchmarks | Source-to-request preparation |
| --- | --- |
| MMSU, MMAR, MMAU mini, Big Bench Audio, WildSpeech-Bench, Step-Caption | Decode the original file, preserve its decoded sample rate and channels, split recordings longer than 29.9 seconds into ordered chunks, and export each chunk as WAV. The original common loader omits a final chunk shorter than 0.1 seconds or an exported chunk shorter than 200 bytes. |
| Audio Multi-Challenge | Read each user turn from the dataset's embedded audio, decode PCM, downmix multi-channel data if needed, convert to signed 16-bit mono PCM, resample to 16 kHz, and split that turn into 29.9-second WAV blocks. Preserve every user turn, not just the last one. |
| MTalk-Bench | Read each current-turn WAV directly and send that file's bytes as one audio block. The MTalk S2T inferencer does not use the common 29.9-second splitter. Prior turns become text history, not repeated audio. |

These are the benchmark client's preparation rules, not service-wide audio limits. The Audio Multi-Challenge example includes a 32.213-second first user turn split into two blocks (29.9 seconds + 2.313 seconds), making the ordering explicit. The MMAR example retains stereo 48 kHz audio, demonstrating why a blanket “16 kHz mono” rule would be incorrect.

## Multiple-choice text

MMSU, MMAR and MMAU mini include the following exact instruction before the A–D options:

```json
"\nPlease choose the answer from the following options, do not provide any additional explanations or content: \n"
```

The complete case-specific question and options are in each request file. Do not inject the correct answer. MMAU mini uses no few-shot demonstrations in this setting.

## The two multi-turn protocols

**Audio Multi-Challenge:** all user turns remain audio. The dataset's earlier assistant replies are fixed context; only the last reply is generated. The included three-turn case has five messages in one request: `user(audio 1) → assistant(dataset text 1) → user(audio 2) → assistant(dataset text 2) → user(audio 3)`. A user turn may contain several audio blocks. The readable user transcripts do not enter the request.

**MTalk-Bench:** the model answers every turn. Request 1 is `user(audio 1)`. Request 2 is `user(official transcript 1) → assistant(new answer 1) → user(audio 2)`. Later turns repeat this pattern with all prior turns. Official annotations such as `(Angry emotion)` are retained when that user turn becomes history; the current turn's transcription is never supplied alongside its audio. Scoring rubrics and reference-model answers are never inserted into this history.

## Inference and scoring

These examples document and execute **inference requests**, not the full dataset evaluator. They do not equate the saved answer with a correct answer or use it as an exact-match test. Scoring conventions and judge model names are described in [EVALUATION.md](../EVALUATION.md). User-query transcripts and rubrics stored here remain separate from inference even when the evaluator later uses them.

The two minimal introductory shell examples remain available: [no system message](chat_no_system.sh) and [explicit empty system message](chat_explicit_empty_system.sh). They illustrate the API only; use the case-specific examples above for benchmark input construction.
