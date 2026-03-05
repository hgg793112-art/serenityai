# AI 購物決策助手 MVP

Monorepo：`mobile`（Expo 移動端）、`server`（Node + Express + Prisma）、`shared`（共用類型）。

## 1. 環境準備

- Node.js 18+
- PostgreSQL（本地或雲端）
- （可選）通義千問 API Key，用於 LLM 解析與決策；未配置時會使用規則 fallback

## 2. 後端 Server

```bash
cd server
npm install
```

在 `server` 目錄下建立 `.env`：

```env
DATABASE_URL="postgresql://用戶名:密碼@localhost:5432/ai_shopping?schema=public"
LLM_API_KEY=你的通義千問API_KEY（可留空，會走規則fallback）
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

執行資料庫遷移並啟動：

```bash
npx prisma migrate dev
npm run dev
```

- 首次啟動會自動插入 50 條 mock 商品（若資料庫中不足 50 條）。
- 服務預設：`http://localhost:3001`。

## 3. 移動端 Mobile

```bash
cd mobile
npm install
npx expo start
```

- **真機預覽**：安裝 Expo Go App，與電腦同 Wi‑Fi 後掃描終端顯示的 QR 碼。
- **模擬器預覽**：終端按 **`i`**（iOS，需 Xcode）或 **`a`**（Android，需 Android Studio + ANDROID_HOME）。詳見 `mobile/模擬器預覽說明.md`。
- 若用手機真機，請確保與電腦同一 WiFi，並在 `mobile/.env` 或環境變數中設定 `EXPO_PUBLIC_API_URL=http://你的電腦區域網IP:3001`（例如 `http://192.168.1.100:3001`）。
- Android 模擬器預設使用 `10.0.2.2:3001` 訪問本機後端。

## 4. 功能驗證

1. **首頁**：輸入「3000以內輕薄本」→ 點擊「提交」→ 應看到三套決策方案（方案 A/B/C）。
2. **個人畫像**：點擊「個人畫像」→ 查看價格敏感指數、衝動指數、品類偏好權重（由 `GET /profile/:userId` 返回）。

## 5. API 說明

- `POST /decision`  
  - Body: `{ "userId": "demo-user", "input": "3000以內輕薄本" }`  
  - 返回三套方案（stable / value / upgrade），每套含商品與推薦理由。

- `GET /profile/:userId`  
  - 返回該用戶的價格敏感指數、衝動指數、品類偏好權重。

## 6. 專案結構

```
ai-shopping-app/
  mobile/          # Expo + TypeScript + Zustand + React Navigation
  server/          # Express + Prisma + AI 解析/決策
  shared/          # 共用 TypeScript 類型
```

- 需求解析：`server/ai/parseDemand.ts`（LLM + JSON 修復 + 失敗 fallback）。
- 決策生成：`server/ai/generateDecision.ts`。
- 匹配算法：`server/ai/matchScore.ts`（預算×0.4 + 品類×0.3 + 歷史權重×0.2 + 價格穩定性×0.1）。

## 7. 容錯

- LLM 超時 8 秒會 fallback 規則解析。
- 商品不足時返回預設推薦。
- JSON 解析失敗會自動修復或 fallback。

## 8. 後續可擴展

- 衝動消費識別模型  
- 語音輸入  
- 多模型路由  
- 小程序 / Chrome 插件版本  
