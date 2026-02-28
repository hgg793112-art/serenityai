# 小寧陪你 — 未完成／待辦檢查清單

以下為目前專案中**尚未完成或無法實際使用**的項目，供後續排期與修復參考。

---

## 一、麥克風／語音對話（壓力測評）

**現狀：麥克風權限與 API Key 已接通（前端直連），語音對話可用；壓力報告尚為固定值。**

| 項目 | 狀態 | 說明 |
|------|------|------|
| 麥克風權限（Android） | ✅ 已修 | `AndroidManifest.xml` 已宣告 `RECORD_AUDIO`。 |
| Gemini API Key 傳入 | ✅ 已修 | `StressVoiceSession.tsx` 改為讀取 `import.meta.env.VITE_GEMINI_API_KEY`，需在 `.env.local` 設定。 |
| 語音測評結果 | ⚠️ 開發中 | 結束會話時固定回傳壓力值 50，尚未從 Gemini 回傳內容解析真實壓力。 |

**注意（安全）：** 目前採前端直連方式，`VITE_GEMINI_API_KEY` 會打進客戶端 JS/APK，正式對外發布前應改為後端代理。

**剩餘待做：**

1. **壓力報告**：實作從 Gemini 回傳內容解析壓力／情緒，再呼叫 `onCompleteStressTest(level)` 傳入真實數值並顯示報告。
2. **後端代理（正式發布前）**：改為透過自家後端呼叫 Gemini Live，前端只連後端，不帶 Key。

---

## 二、健康數據（Health Connect / 健康趨勢）

**現狀：僅心率有機會接真實數據，步數與睡眠目前全是假資料。**

| 項目 | 狀態 | 說明 |
|------|------|------|
| 心率（heartRate） | ✅ 已接 | `healthService.ts` 使用 `@capgo/capacitor-health` 請求 `heartRate` 並 `queryAggregated`，有讀取 Health Connect。 |
| 步數（steps） | ❌ 未接 | `App.tsx` 第 42–44 行：在有心率時仍用 `steps: 4000 + Math.floor(Math.random() * 8000)`，未呼叫 Health 查 steps。 |
| 睡眠（sleepHours） | ❌ 未接 | 同上，`sleepHours: 5 + Math.random() * 4`，未從 Health Connect 讀取睡眠。 |
| 無權限／讀取失敗時 | ⚠️ 全 mock | `initHealth()` 或 `fetchHeartRateData()` 失敗時，整份 `healthData` 改為 `generateMockData()`，全部為假資料。 |

**建議修復方向：**

1. 在 `healthService.ts` 增加：  
   - `requestAuthorization` 時一併請求 `steps`、`sleep`（依 @capgo/capacitor-health 與 Health Connect 支援的類型命名）。  
   - 新增 `fetchStepsData()`、`fetchSleepData()`（或等同的 query），依文件用 `queryAggregated` / 對應 API。  
2. 在 `App.tsx` 組裝 `healthData` 時，改為使用上述真實查詢結果，僅在無權限或查詢失敗時才用 mock 補步數／睡眠。  
3. Android 端確認 Health Connect 權限與資料類型宣告是否完整（如 READ_STEPS、READ_SLEEP 等），依套件與官方文件設定。

---

## 三、其他（可一併檢查）

| 項目 | 狀態 | 說明 |
|------|------|------|
| Supabase 心情同步 | ⚠️ 依環境 | 有寫入／讀取 `mood_logs`；若未設定 `VITE_SUPABASE_*` 會走 localStorage，僅本機。 |
| 小寧聊天（XiaoningChat） | ✅ 僅 UI | 彈窗與導向「記錄心情」「放鬆」；無真實對話後端，非語音。 |
| 儀表板健康數據展示 | ⚠️ 依上列 | Dashboard / HealthTrends 顯示的 `healthData` 來自上列邏輯，步數／睡眠未接則仍為假資料。 |

---

## 四、建議優先順序

1. **高**：語音測評可用的最小閉環 — Android 麥克風權限 + Gemini Key 傳入（或改後端代理）+ 壓力結果回傳。  
2. **高**：健康數據真實化 — 步數、睡眠改為從 Health Connect 讀取，僅在失敗時 fallback mock。  
3. **中**：語音測評完整體驗 — 真實壓力報告與文案更新（移除「開發中」等說明）。  
4. **低**：Supabase 與權限的錯誤處理與使用者提示（未設定時明確說明僅本機儲存）。

---

*本清單依目前程式碼與 manifest 檢查結果整理，實際修復時請再對應 @capgo/capacitor-health 與 Android Health Connect 最新文件。*
