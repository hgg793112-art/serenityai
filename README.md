<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/11PVPbLQvLfFtO_LDGqq-AWTu2OxGm3NL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the API keys in [.env.local](.env.local):
   - `VITE_DASHSCOPE_API_KEY`: 千問 API 金鑰（對話功能必需）
   - `VITE_GEMINI_API_KEY`: Gemini API 金鑰（可選，作為備用）
3. Run the app:
   `npm run dev`

## 功能說明

### 🎵 療癒音頻
- 所有放鬆練習均配備高品質音頻（128-256 kbps）
- 支援音量調節和淡入淡出效果
- 音頻檔案位於 `public/audio/`，詳見 `public/audio/README.md`
- 測試工具：訪問 `http://localhost:3000/audio/test-audio.html`

### 💬 AI 對話
- **和小寧聊聊**：使用千問 API，帶記憶功能
- **療癒對話**：專注於正念、呼吸、情緒安撫

## 使用 Supabase 線上資料庫

1. 在 [Supabase 儀表板](https://supabase.com/dashboard/org/kzqpuipouzdcvgioghnw) 建立或選擇專案。
2. **取得 API 金鑰**：專案左側 **Project Settings** → **API**，複製 **Project URL** 與 **anon public** key。
3. 在專案根目錄建立或編輯 `.env.local`，加入：
   ```
   VITE_SUPABASE_URL=你的_Project_URL
   VITE_SUPABASE_ANON_KEY=你的_anon_公鑰
   ```
4. **建立資料表**：在 Supabase 左側 **SQL Editor** → **New query**，貼上並執行 `supabase/schema.sql` 的內容。
5. 重新執行 `npm run dev`，心情日誌會改為儲存到 Supabase；未設定上述變數時仍使用瀏覽器 localStorage。

## 雲端部署（Vercel）

1. **一鍵部署**  
   打開：[**Vercel 新建專案**](https://vercel.com/new?teamSlug=nicks-projects-8cddbdf5)

2. **匯入專案**  
   - 若專案已在 GitHub：選擇對應 repo，點 **Import**。  
   - 若從本機部署：先安裝 [Vercel CLI](https://vercel.com/docs/cli)，在專案目錄執行 `vercel`，依提示登入並選擇 team `nicks-projects-8cddbdf5`。

3. **建置設定**（通常不需改）  
   - **Framework Preset**: Vite  
   - **Build Command**: `npm run build`  
   - **Output Directory**: `dist`  
   - **Install Command**: `npm install`

4. **環境變數**（在專案 **Settings → Environment Variables** 新增）  
   | 名稱 | 說明 |
   |------|------|
   | `VITE_SUPABASE_URL` | Supabase Project URL（若使用線上資料庫） |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
   | `GEMINI_API_KEY` | Gemini API 金鑰（若使用 AI 功能） |

5. 點 **Deploy**，完成後會得到一個 `*.vercel.app` 網址。
