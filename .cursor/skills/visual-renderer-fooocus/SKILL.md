---
name: visual-renderer-fooocus
description: Generates illustrations and UI mockups using local Fooocus (SDXL). Uses Sequential Thinking to conceptualize, builds IP-consistent prompts with Fooocus V2 style, and invokes fooocus-bot or outputs ready prompts. Use when the user says 生成插画, UI 原型图, /render [主题], or /variations for the last image.
---

# 插画渲染执行官 (Visual Renderer)

以本地 Fooocus（SDXL 引擎）為工具，在「生成插画」或「UI 原型图」請求時先構思畫面、再產出符合 Fooocus 審美的 Prompt，並透過 fooocus-bot 發送請求或產出可手動貼上的參數。

---

## 觸發時機

當使用者說出以下任一情況時套用本技能：

- 「生成插画」「畫一張圖」「出圖」
- 「UI 原型图」「介面原型」「畫面 mock」
- **`/render [主題]`**：結合當前專案上下文（含 IP 人設）生成一張高質量 IP 插画
- **`/variations`**：對最後一張生成的圖進行微調（基於 Fooocus 的 Vary 功能）

---

## 協作流程

### 1. 構思畫面（Sequential Thinking）

在生成任何插画或 UI 原型前，先呼叫 **Sequential Thinking** MCP 工具，產出：

- 畫面主體、構圖、氛圍
- 與當前 IP 人設的對齊點（若有專案 IP 白皮書或 ip-architect 產出，需納入視覺風格、氣質）
- 若為 UI 原型：版面分區、元件層級、色調與風格關鍵詞

### 2. 產出 Fooocus 用 Prompt

依構思結果撰寫 **正向 prompt**，並遵守下列固定參數。

**風格（必須包含）：**

- `Fooocus V2`
- `Masterpiece`
- `Cinematic Lighting`

**負向提示詞（必須包含）：**

- `Deformed, text error, low quality`

若專案中有 IP 人設（例如 ip-architect 白皮書），將人設中的視覺錨點、氣質、服裝或場景偏好融入 prompt，保持與 IP 一致。

### 3. 發送請求

- **若專案已配置 fooocus-bot MCP**：呼叫其介面發送生成請求，並依其回傳輪詢或回報生成狀態。
- **若未配置**：產出完整「正向 prompt + 負向 prompt + 關鍵參數」供使用者貼到本地 Fooocus 使用；並簡短說明如何在本機執行 Vary（若使用者觸發的是 `/variations`）。

---

## 交互命令

| 命令 | 行為 |
|------|------|
| **`/render [主題]`** | 以當前專案上下文（檔案、IP 人設、對話脈絡）為依據，經 Sequential Thinking 構思後，產出符合 Fooocus 審美的一張 IP 插画；主題可為一句話描述（例如「圖書館窗邊看書的學姐」）。 |
| **`/variations`** | 對「最後一張生成的圖」進行微調。若有 fooocus-bot，呼叫其 Vary 相關介面；否則在輸出中說明如何在 Fooocus 內對上一張圖使用 Vary，並可附上建議的微調方向（例如「稍微更暖色」「表情更柔和」）。 |

---

## Prompt 模板（參考）

```
[構思得到的主體與場景描述], Fooocus V2, Masterpiece, Cinematic Lighting, [IP 相關視覺關鍵詞若適用]
```

**Negative prompt（固定）：**

```
Deformed, text error, low quality
```

---

## 與 IP 人設的銜接

- 專案中若有 **ip-architect** 技能產出的 IP 白皮書或人設說明，從中擷取「視覺風格」「服裝／場景偏好」「氣質關鍵詞」，融入正向 prompt。
- 若無明確 IP 設定，仍依 Sequential Thinking 的構思與使用者給定的主題產出 prompt，並維持 Fooocus V2 / Masterpiece / Cinematic Lighting 與負向詞不變。
