# Gemini API Key 操作步驟

用於**語音壓力測評**與**和小寧聊聊（有記憶的對話）**，需在專案中設定 `VITE_GEMINI_API_KEY`。以下為取得並設定的完整步驟。

---

## 步驟 1：打開 Google AI Studio

1. 用瀏覽器打開：**https://aistudio.google.com/apikey**
2. 若未登入，使用你的 **Google 帳號**登入（此步驟需你本人在瀏覽器完成）。

---

## 步驟 2：建立 API Key

1. 登入後若看到「**這裡找不到您的 API 密鑰？**」，往**頁面上方**找 **「建立 API 密鑰」**或 **「Create API key」** 按鈕並點擊。
2. 彈窗 **「創建新密鑰」**：
   - **為密鑰命名**：可維持預設「Gemini API Key」或改成例如「小寧專案」。
   - **選擇一個匯入的專案**：若顯示「No Cloud Projects Available」：
     - **先試**：直接點 **「創建密鑰」**，有時會自動建立預設專案。
     - **若無法建立**：點 **「取消」**，回到 API 密鑰主頁，點 **「匯入專案」**，建立或選擇一個 Google Cloud 專案後，再重新點「建立 API 密鑰」。
3. 點 **「創建密鑰」**。
4. 畫面上會出現一組 **API 密鑰字串**（一串英文與數字）。  
   **重要**：密鑰**只會顯示一次**，請**立即複製**到剪貼簿（Ctrl+C / Cmd+C）。

---

## 步驟 3：寫入專案 .env.local

1. 在專案**根目錄**（與 `package.json` 同層）找到 **`.env.local`**；若沒有則新建一個文字檔，命名為 `.env.local`。
2. 打開 `.env.local`，找到這一行（若沒有就新增一行）：
   ```bash
   VITE_GEMINI_API_KEY=
   ```
3. 在等號後面貼上你剛複製的 **API 密鑰**，**不要加引號、不要留空格**，例如：
   ```bash
   VITE_GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **存檔**（Ctrl+S / Cmd+S）。

---

## 步驟 4：重啟開發伺服器

環境變數只在啟動時讀取，所以修改 `.env.local` 後要重啟：

1. 若終端正在跑 `npm run dev`，按 **Ctrl+C**（或 Cmd+C）停止。
2. 再執行一次：
   ```bash
   npm run dev
   ```
3. 看到 `Local: http://localhost:3000/` 後，用瀏覽器打開 **http://localhost:3000**。

---

## 驗證是否成功

- **語音**：進入「壓力」頁 → 點開始 → 若出現「我正在聽」且能對話，表示 Key 已生效。
- **文字對話**：首頁 → 小寧聊天 → 「和小寧聊聊（有記憶的對話）」→ 輸入訊息可收到回覆，表示 Key 已生效。  
若仍提示「請在 .env.local 設定 VITE_GEMINI_API_KEY」，請確認變數名為 **`VITE_GEMINI_API_KEY`**（前面有 `VITE_`）、已存檔且已重啟 `npm run dev`。

---

## 注意事項

- **免費額度**：Gemini API 有免費額度，個人或小規模使用通常足夠；超出後需啟用計費。
- **安全**：目前 Key 會被打進前端程式，**正式對外發布前**建議改為透過自家後端呼叫 Gemini，前端不帶 Key。
