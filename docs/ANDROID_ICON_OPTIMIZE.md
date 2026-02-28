# Android 啟動圖標優化：縮小尺寸並壓縮以減小 APK

目前 `ic_launcher_foreground.png` 為 **2048×2048、約 4.8 MB**，會讓 APK 多出約 5 MB。改為 **512×512** 並壓縮後，圖標可降到數百 KB，APK 體積可回到約 6 MB 左右。

---

## 專案內圖標路徑

| 用途 | 路徑（相對專案根目錄） |
|------|------------------------|
| Android 啟動圖標（唯一大檔） | `android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png` |
| 備用／原始大圖（可選） | `assets/app-icon-1024.png` |

XML 引用在：

- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`

兩者皆使用 `@drawable/ic_launcher_foreground`，**只需替換上述 PNG 檔案**，無需改 XML。

---

## 方式一：用專案腳本一鍵優化（推薦）

專案已內建腳本，使用 `sharp` 將圖標縮成 512×512 並壓縮 PNG。

### 步驟

1. **進入專案根目錄**
   ```bash
   cd "/Users/mac210/Downloads/serenityai (1)"
   ```

2. **執行優化腳本**
   ```bash
   npm run optimize:android-icon
   ```
   或直接：`node scripts/optimize-android-icon.mjs`  
   若要 768×768：`node scripts/optimize-android-icon.mjs --size=768`
   腳本會：
   - 讀取 `android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png`
   - 縮放為 **512×512**
   - 以 PNG 壓縮覆寫原檔（可選輸出 WebP 到同目錄，預設僅 PNG）

3. **確認檔案變小**
   ```bash
   ls -la android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png
   ```
   預期從約 4.8 MB 降到約 200～500 KB。

4. **重新打包 APK**
   - 本機：`npm run build && npx cap sync android` 後用 Android Studio 建 APK，或
   - 推送後用 GitHub Actions「Build Android APK」再下載 Artifact。

---

## 方式二：手動用指令縮放與壓縮

若不想用 Node，可用系統指令（以 macOS 為例）。

### 1. 備份原圖

```bash
cd "/Users/mac210/Downloads/serenityai (1)"
cp android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png \
   android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png.bak
```

### 2. 縮成 512×512（使用 macOS 內建 `sips`）

```bash
sips -z 512 512 android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png
```

或縮成 768×768（略大一點）：

```bash
sips -z 768 768 android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png
```

### 3. 壓縮 PNG（需安裝 `pngquant`）

```bash
# 若未安裝：brew install pngquant
pngquant --quality=80-95 --output android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png \
  android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png
```

注意：`pngquant` 會覆寫原檔，請先做好備份。若沒有 `pngquant`，只做步驟 2 也能明顯減小體積（約 512×512 時檔案約 300～600 KB）。

### 4. 確認並重新打包

```bash
ls -la android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png
```

之後同「方式一」步驟 4 重新打包 APK。

---

## 方式三：用設計軟體導出 512×512

1. 用 Figma / Sketch / Photoshop 等打開原始 2048×2048 或 `assets/app-icon-1024.png`。
2. 導出為 **512×512** PNG（或 768×768），勾選「壓縮」或「導出為 WebP」再轉 PNG。
3. 覆蓋專案內檔案：
   ```text
   android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png
   ```
4. 重新打包 APK。

---

## 預期結果

| 項目 | 優化前 | 優化後（512×512 + 壓縮） |
|------|--------|---------------------------|
| 圖標檔案 | ~4.8 MB | ~200～500 KB |
| APK 總體積 | ~11.3 MB | ~6～7 MB |

僅替換 `drawable-nodpi/ic_launcher_foreground.png`，無需改 XML 或其它資源，不影響功能。
