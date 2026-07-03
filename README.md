# Codex Reset Credits Skill

用于查询本机 Codex 账号的 rate-limit reset credits（重置卡）数量与到期时间。

这个 skill 会读取本机 Codex OAuth 凭证，调用 ChatGPT backend 的 reset credits 接口，并只输出适合分享的汇总字段：`available_count`、`status`、`title`、`granted_at_local`、`expires_at_local`。

## 功能

- 查询当前可用的 Codex 重置卡数量
- 查看每张重置卡的状态、标题、发放时间和到期时间
- 自动把接口返回时间转换成本地时区
- 避免输出 token、cookie、refresh token、完整唯一 ID 或原始响应体

## 触发方式

显式调用：

```text
使用 $codex-reset-credits 查询我的 Codex 重置卡到期时间
```

也可以用自然语言触发，例如：

```text
查询 Codex 重置卡到期时间
查看 reset credits
查看 Codex rate-limit reset cards
```

## 使用方式

在支持 Codex skills 的环境中，直接用上面的触发语即可。

也可以手动运行脚本：

```bash
node ~/.codex/skills/codex-reset-credits/scripts/check_reset_credits.js
```

成功时输出示例：

```json
{
  "ok": true,
  "status": 200,
  "available_count": 1,
  "credits": [
    {
      "status": "available",
      "title": "Full reset (Weekly + 5 hr)",
      "granted_at_local": "YYYY/MM/DD GMT+8 HH:mm:ss",
      "expires_at_local": "YYYY/MM/DD GMT+8 HH:mm:ss"
    }
  ]
}
```

## 隐私说明

该 skill 的脚本会在运行时读取：

```text
~/.codex/auth.json
```

读取目的仅是取得本机 Codex OAuth access token 来完成只读查询。仓库内不应包含任何真实 token、refresh token、cookie、账号 ID、重置卡 ID 或查询结果。

发布到 GitHub 前建议确认不要提交：

- `~/.codex/auth.json`
- 终端日志或截图中的查询结果
- macOS 自动生成的 `.DS_Store`
- 任何包含 token、cookie、完整 ID 的临时文件

## 文件结构

```text
codex-reset-credits/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   └── implementation.md
└── scripts/
    └── check_reset_credits.js
```

## 故障判断

- 返回 `401`：本机 Codex 凭证可能失效，或 `Authorization` header 未被接受。
- 返回 `ENOTFOUND`：当前执行环境无法解析域名，通常是沙箱或 DNS 问题。
- 返回 `UND_ERR_CONNECT_TIMEOUT`：当前网络无法连接到目标后端，通常是网络、代理或 DNS 污染问题。
