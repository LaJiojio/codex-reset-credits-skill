# Implementation Notes

The reset card endpoint is:

```text
https://chatgpt.com/backend-api/wham/rate-limit-reset-credits
```

Use the local Codex OAuth access token from `~/.codex/auth.json` and send a read-only `GET` request.

Recommended request headers:

- `Authorization: Bearer <access token>`
- `Accept: application/json`
- `User-Agent: codex-reset-credits/1.0`
- `OpenAI-Beta: codex-1`
- `originator: Codex Desktop`
- `ChatGPT-Account-Id: <claim>` when present

The account id claim path is:

```text
json["https://api.openai.com/auth"]["chatgpt_account_id"]
```

Summarize the response without printing raw identifiers or credential material. Prefer local time for `granted_at` and `expires_at`.
