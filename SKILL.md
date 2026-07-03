---
name: codex-reset-credits
description: Check local Codex rate-limit reset credits and their expiration times using the user's existing ~/.codex/auth.json OAuth credentials. Use when the user asks for Codex reset cards, reset credits, rate-limit reset credit expiry, or wants a safe local-only summary of available Codex reset card status/title/granted_at/expires_at fields.
---

# Codex Reset Credits

## Quick Start

Run the bundled script:

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/codex-reset-credits/scripts/check_reset_credits.js"
```

The script reads `~/.codex/auth.json`, extracts `tokens.access_token`, derives `ChatGPT-Account-Id` from the access-token JWT claim, and requests:

```text
https://chatgpt.com/backend-api/wham/rate-limit-reset-credits
```

It only prints:

- `available_count`
- each credit's `status`
- each credit's `title`
- each credit's `granted_at_local`
- each credit's `expires_at_local`

## Safety Rules

Never print or quote:

- `access_token`
- `refresh_token`
- cookies
- complete credit IDs
- raw response bodies that may contain identifiers

If the endpoint returns `401`, report that the local Codex credential is expired or the `Authorization: Bearer ...` header was not accepted.

If the request fails before HTTP status is available, report the network error separately. A DNS result that resolves `chatgpt.com` to an unexpected address or a connection timeout is a network/proxy issue, not a credential failure.

## Implementation Notes

This workflow uses the same request shape as the Codex desktop backend:

- `Authorization: Bearer <access token>`
- `Accept: application/json`
- `User-Agent: codex-reset-credits/1.0`
- `OpenAI-Beta: codex-1`
- `originator: Codex Desktop`
- `ChatGPT-Account-Id: <claim>` when present

The account id claim is read from:

```text
namespace: https://api.openai.com/auth
claim: chatgpt_account_id
```

See `references/implementation.md` for endpoint and header notes.
