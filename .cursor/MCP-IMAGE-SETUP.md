# DALL-E / Midjourney MCP 安裝說明

專案已預先加入兩個與繪圖相關的 MCP 伺服器，需設定 API 金鑰後重啟 Cursor 才會生效。

---

## 已加入的 MCP

| 名稱 | 用途 | 依賴 |
|------|------|------|
| **image-mcp** | OpenAI / Replicate 圖生（文字生圖、尺寸捷徑） | Node.js 18+、npx |
| **midjourney** | 透過 ImagineAPI 呼叫 Midjourney 生圖 | Python 3.11+、uvx |

---

## 1. image-mcp（OpenAI / Replicate）

- **套件**：`image-mcp`（npm），以 npx 執行，無需全域安裝。
- **金鑰**：編輯 `.cursor/mcp.json`，將 `image-mcp` 的 `env` 裡：
  - `OPENAI_API_KEY` 改為你的 **OpenAI API Key**（必填）。
  - `REPLICATE_API_TOKEN` 改為你的 Replicate Token，或刪除該鍵（選填）。
- **工具**：`generate_ai_image`、`square_image`、`landscape_image`、`portrait_image` 等。

> 此 MCP 主要透過 OpenAI / Replicate 做圖，若你要用「純 DALL-E 3」可再查 [Azure OpenAI DALL-E 3 MCP](https://cursormcp.dev/mcp-servers/401-azure-openai-dall-e-3-mcp-server) 或自建 DALL-E 專用 MCP。

---

## 2. midjourney（ImagineAPI）

- **套件**：`midjourney-proxy-mcp`（PyPI），建議用 `uvx` 執行。
- **前置**：安裝 [uv](https://docs.astral.sh/uv/)（會提供 `uvx`）：
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```
- **金鑰**：到 [ImagineAPI](https://www.imagineapi.dev/) 取得 Token，在 `.cursor/mcp.json` 的 `midjourney` → `env` 裡將 `IMAGINEAPI_TOKEN` 改為該 Token。
- **工具**：`midjourney_imagine`（生圖，支援 `--ar 16:9` 等參數）、`midjourney_get_status`、`midjourney_list_images`。

---

## 設定步驟摘要

1. 開啟 `.cursor/mcp.json`。
2. 在 **image-mcp** 的 `env` 中填入 `OPENAI_API_KEY`（與選填的 `REPLICATE_API_TOKEN`）。
3. 在 **midjourney** 的 `env` 中填入 `IMAGINEAPI_TOKEN`。
4. 儲存後**完全關閉並重啟 Cursor**（MCP 僅在啟動時載入）。

---

## 安全提醒

- 勿將真實 API Key 提交到 Git。可改為使用環境變數（若 Cursor 支援從環境讀取），或將 `mcp.json` 加入 `.gitignore` 並用 `mcp.json.example` 範本管理。
- 建議在專案根目錄加入 `.cursor/mcp.json.example`，內容與 `mcp.json` 相同但金鑰改為占位符 `<<OPENAI_API_KEY>>`、`<<IMAGINEAPI_TOKEN>>`，供團隊複製後自行填寫。
