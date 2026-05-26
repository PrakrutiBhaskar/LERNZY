# AI Model Guide — Selection, Quantisation & Inference
> Everything an engineer needs to choose, download, configure, and run models on-device.

---

## 1. Model Selection by Task

| Task | Model | Format | Size | Why |
|---|---|---|---|---|
| Lesson generation / Q&A | Phi-3 Mini 4K Instruct | GGUF INT4 | ~2.2 GB | Best quality/size ratio for 11–14 age content; strong multilingual |
| Fallback (≥4 GB RAM) | Gemma 2 2B Instruct | GGUF INT4 | ~1.5 GB | Faster, lighter; good for quizzes |
| Fallback (≥6 GB RAM) | Llama 3.2 3B Instruct | GGUF INT4 | ~2.0 GB | Best reasoning; use if RAM allows |
| Speech-to-text (STT) | Whisper Tiny (multilingual) | .bin | ~75 MB | Hindi + Kannada + English, runs on CPU |
| Text-to-speech (TTS) EN | Piper `en_US-lessac-medium` | .onnx | ~60 MB | Natural English voice |
| Text-to-speech (TTS) HI | Piper `hi_IN-hindi_ldcc-medium` | .onnx | ~55 MB | Natural Hindi voice |
| Text-to-speech (TTS) KN | Piper `kn_IN-kannada-medium` | .onnx | ~55 MB | Natural Kannada voice |

---

## 2. Inference Runtime Stack

```
┌─────────────────────────────┐
│   React Native App (JS/TS)  │
├─────────────────────────────┤
│  inferenceClient.ts          │  ← sends HTTP to local server
├─────────────────────────────┤
│  llama.cpp server            │  ← runs as background service on device
│  (Android JNI / ARM binary)  │
├─────────────────────────────┤
│  .gguf model weights         │  ← stored in app's internal storage
└─────────────────────────────┘
```

### React Native ↔ llama.cpp Bridge Options (choose one)

| Option | Package | Pros | Cons |
|---|---|---|---|
| **Recommended** | `llama.rn` | Purpose-built RN wrapper, active | Requires custom native build |
| Alternative | `react-native-executorch` | Facebook-backed, LLaMA optimised | Less language flexibility |
| Fallback | Local HTTP server (llama.cpp server mode) | Flexible, easy to swap | Adds latency (~20ms) |

---

## 3. Model Download & Storage

Models are **not bundled** in the APK (too large for Play Store). They download on first launch.

### First-Launch Flow
```
1. App opens → check if models/ folder exists and is valid
2. If missing → show "Downloading your tutor..." screen with progress bar
3. Download from hosted CDN (HTTPS) → save to app internal storage
4. Verify SHA-256 checksum
5. Mark models as ready in AsyncStorage → proceed to onboarding
```

### Storage Paths (Android)
```
/data/data/com.lernzytutor.app/files/models/
  phi3_mini_int4.gguf
  whisper_tiny.bin
  piper_en.onnx
  piper_hi.onnx
  piper_kn.onnx
```

### Model Checksums (update on each model version bump)
```json
{
  "phi3_mini_int4.gguf":   "sha256:abc123...",
  "whisper_tiny.bin":      "sha256:def456...",
  "piper_en.onnx":         "sha256:ghi789...",
  "piper_hi.onnx":         "sha256:jkl012...",
  "piper_kn.onnx":         "sha256:mno345..."
}
```

---

## 4. llama.cpp Configuration

### Recommended Parameters for Low-End Devices
```json
{
  "n_ctx": 2048,
  "n_threads": 4,
  "n_gpu_layers": 0,
  "temperature": 0.7,
  "top_p": 0.9,
  "repeat_penalty": 1.1,
  "max_tokens": 512,
  "stop": ["</s>", "User:", "Student:"]
}
```

### Notes
- `n_ctx: 2048` — enough for full system prompt + 6–8 conversation turns
- `n_gpu_layers: 0` — CPU-only; low-end Androids have no compatible GPU drivers
- `n_threads: 4` — most low-end SoCs have 4–8 cores; 4 is a safe default
- `max_tokens: 512` — keeps responses short, mobile-appropriate, faster inference
- Expect ~3–8 tokens/sec on a Snapdragon 680-class chip

---

## 5. Whisper STT Configuration

```json
{
  "model": "tiny",
  "language": "auto",
  "task": "transcribe",
  "beam_size": 1,
  "best_of": 1,
  "temperature": 0.0,
  "no_speech_threshold": 0.6,
  "condition_on_previous_text": false
}
```

- Use `language: "auto"` to detect Hindi/Kannada/English automatically
- `beam_size: 1` for fastest inference on low-end devices
- Recommend recording in 16 kHz mono WAV for accuracy

---

## 6. Piper TTS Configuration

```typescript
// ttsClient.ts
const VOICE_MAP = {
  en: 'piper_en.onnx',
  hi: 'piper_hi.onnx',
  kn: 'piper_kn.onnx',
};

// Piper synthesis params
const piperConfig = {
  speaker_id: 0,
  length_scale: 1.1,   // slightly slower for child comprehension
  noise_scale: 0.667,
  noise_w: 0.8,
};
```

- `length_scale: 1.1` — 10% slower speech, better for young learners
- Output: 22050 Hz WAV → play via `react-native-sound`
- Pre-generate and cache TTS for lesson text to avoid live synthesis latency

---

## 7. Context Window Management

The system prompt uses ~400–600 tokens. Budget remaining context as:

| Allocation | Tokens |
|---|---|
| System prompt (filled) | ~500 |
| Chat history (last 6 turns) | ~600 |
| Current user message | ~100 |
| **Total input budget** | **~1200** |
| Output (max_tokens) | 512 |
| **Total context used** | **~1712 / 2048** |

### Chat History Pruning (in `inferenceClient.ts`)
```typescript
// Keep only the last N turns to stay within context budget
const MAX_HISTORY_TURNS = 6;
const prunedHistory = chatHistory.slice(-MAX_HISTORY_TURNS * 2);
```

---

## 8. Prompt Format (Phi-3 / Llama 3 Chat Template)

### Phi-3 Mini
```
<|system|>
{system_prompt}<|end|>
<|user|>
{user_message}<|end|>
<|assistant|>
```

### Llama 3.x
```
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
{system_prompt}<|eot_id|>
<|start_header_id|>user<|end_header_id|>
{user_message}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
```

Always use the correct chat template for the model being used. `llama.rn` handles this automatically if `chat_template` is embedded in the GGUF metadata.

---

## 9. Fallback Strategy

If inference fails or is too slow:
1. First retry: reduce `max_tokens` to 256
2. Second retry: switch to lighter model (Gemma 2B if available)
3. Third: show cached content from `lesson.json` directly (no AI generation)
4. Always: show a friendly message — never crash silently

---

## 10. Model Update Strategy

- Models are versioned in a remote `models_manifest.json`
- App checks manifest on first launch after an app update
- If a newer model is available AND device has Wi-Fi AND storage: prompt user to update
- User can defer model updates — old model keeps working
