# 小寧陪你 · Android 打包說明

## 方式一：本機打包（需先安裝環境）

### 1. 安裝 JDK 17

- **Mac (Homebrew)**：`brew install openjdk@17`  
  然後在 `~/.zshrc` 加上：`export JAVA_HOME=$(/usr/libexec/java_home -v 17)`
- **或** 從 [Adoptium](https://adoptium.net/) 下載安裝 JDK 17

### 2. 安裝 Android SDK

- 安裝 [Android Studio](https://developer.android.com/studio)，安裝時會一併安裝 Android SDK。
- 在 `~/.zshrc` 設定（路徑依實際安裝為準）：
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
  ```

### 3. 執行打包腳本

```bash
chmod +x scripts/build-android-apk.sh
./scripts/build-android-apk.sh
```

完成後 APK 位置：

```
android/app/build/outputs/apk/debug/app-debug.apk
```

傳到手機安裝：用 USB 連接後 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`，或把 `app-debug.apk` 複製到手機用檔案管理器安裝（需在設定中允許「未知來源」安裝）。

---

## 方式二：用 GitHub Actions 產出 APK（可下載）

專案已包含 GitHub Actions 工作流程，推送到 GitHub 後會自動建置 Android APK，並在 **Actions → 對應 workflow run → Artifacts** 中提供 `app-debug.apk` 下載，無需在本機安裝 JDK / Android SDK。

1. 將專案推到 GitHub。
2. 打開 **Actions** 分頁，選擇「Build Android APK」workflow，可手動 Run workflow 或等 push 觸發。
3. 跑完後在該 run 頁面下方 **Artifacts** 下載 `app-debug.apk`。
4. 傳到手機安裝（同上，允許未知來源後安裝）。
