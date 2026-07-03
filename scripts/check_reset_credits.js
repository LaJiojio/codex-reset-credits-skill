#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");

const endpoint = "https://chatgpt.com/backend-api/wham/rate-limit-reset-credits";

function authPath() {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
  return path.join(codexHome, "auth.json");
}

function readJwtClaim(token, namespace, claim) {
  const payload = token?.split(".")[1];
  if (!payload) return undefined;

  try {
    const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
    const json = JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
    const value = json?.[namespace]?.[claim];
    return typeof value === "string" ? value : undefined;
  } catch {
    return undefined;
  }
}

function localTime(value) {
  if (value == null) return null;
  const date =
    typeof value === "number"
      ? new Date(value < 10_000_000_000 ? value * 1000 : value)
      : new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

async function main() {
  const auth = JSON.parse(fs.readFileSync(authPath(), "utf8"));
  const accessToken = auth?.tokens?.access_token;

  if (typeof accessToken !== "string" || accessToken.length === 0) {
    console.log(JSON.stringify({ ok: false, error: "missing tokens.access_token" }, null, 2));
    process.exit(1);
  }

  const accountId = readJwtClaim(
    accessToken,
    "https://api.openai.com/auth",
    "chatgpt_account_id",
  );

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "User-Agent": "codex-reset-credits/1.0",
    "OpenAI-Beta": "codex-1",
    originator: "Codex Desktop",
    ...(accountId ? { "ChatGPT-Account-Id": accountId } : {}),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(endpoint, { method: "GET", headers, signal: controller.signal });
    const text = await response.text();

    if (response.status === 401) {
      console.log(JSON.stringify({
        ok: false,
        status: 401,
        meaning: "credential expired or Authorization header was not accepted",
      }, null, 2));
      return;
    }

    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }

    if (!response.ok) {
      console.log(JSON.stringify({
        ok: false,
        status: response.status,
        statusText: response.statusText,
        bodyType: body == null ? "non-json" : "json",
      }, null, 2));
      return;
    }

    const credits = Array.isArray(body?.credits) ? body.credits : [];
    console.log(JSON.stringify({
      ok: true,
      status: response.status,
      available_count: body?.available_count ?? null,
      credits: credits.map((credit) => ({
        status: credit?.status ?? null,
        title: credit?.title ?? null,
        granted_at_local: localTime(credit?.granted_at),
        expires_at_local: localTime(credit?.expires_at),
      })),
    }, null, 2));
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      error: error?.name ?? "Error",
      message: error?.message ?? String(error),
      cause: error?.cause?.code ?? error?.cause?.message ?? null,
    }, null, 2));
    process.exit(2);
  } finally {
    clearTimeout(timeout);
  }
}

main();
