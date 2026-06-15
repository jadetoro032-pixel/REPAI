# RepAI Old Voice Path Runbook

Use this path when you want the demo to make RepAI talk in a Teams call through the older Graph `playPrompt` route.

## What This Path Does

1. Copilot or an HTTP trigger calls `/start-demo-call`.
2. The backend creates a Microsoft Graph communications call.
3. Teams sends call-state notifications to `/api/calling`.
4. When the call reaches `established`, the backend calls Graph `playPrompt`.
5. Graph plays `https://repai-frhzehe2cpe2b2en.francecentral-01.azurewebsites.net/media/opening.wav` into the call.
6. After a short delay, the backend hangs up the call and returns a chat follow-up message: `I have finished the opening and left the call. Do you have any questions for RepAI?`

## What We Fixed

`/media/opening.wav` now serves a local static WAV from:

```text
assets/audio/opening.wav
```

This avoids relying on live Azure Speech synthesis during the demo.

## Leave-After-Opening Timing

The backend waits before leaving so Graph has time to play the whole opening audio.

```text
REPAI_LEAVE_AFTER_PROMPT_DELAY_MS=30000
```

Increase this value if the opening audio is still being cut off.

## Required Identity

The older voice path uses the earlier Teams bot/app id:

```text
78e73fa6-8e61-416d-8419-1d6a536b4030
```

Do not mix this with the VM bot id:

```text
67c572c9-4e4b-44dd-a106-3053abbac188
```

Mixing app ids, tenant ids, and secrets causes Graph token errors such as `AADSTS700016`.

## Local Checks

Start the server:

```powershell
$env:REPAI_CALL_SERVER_PORT="3980"
npm run call:server
```

Check the opening audio:

```powershell
curl.exe -v http://127.0.0.1:3980/media/opening.wav -o opening-test.wav
```

Expected:

```text
HTTP/1.1 200 OK
content-type: audio/wav
```

Start the call:

```powershell
$body = '{"userJoins":true,"recommendationPreference":"repai"}'
curl.exe -v -H "Content-Type: application/json" --data-raw $body http://127.0.0.1:3980/start-demo-call
```

If Graph rejects the request, read `graphCall.message`. It will usually identify the app id, tenant, admin consent, or meeting URL problem.

## Upload Package

Use:

```text
RepAI-Old-VoicePath-UNIFIED.zip
```

It includes both the Teams calling bot and the Copilot declarative agent/action files in one package.
