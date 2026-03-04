#!/usr/bin/env bash
# 打包小寧陪你 Android Debug APK
# 需要：Node.js、JDK 17、Android SDK（ANDROID_HOME 或 ANDROID_SDK_ROOT）

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 若未設定，嘗試使用 Homebrew 路徑（Mac）
if [ -z "$JAVA_HOME" ] && [ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" ]; then
  export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
fi
if [ -z "$ANDROID_HOME" ] && [ -d "/opt/homebrew/share/android-commandlinetools" ]; then
  export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
  export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
fi

echo "→ 建置網頁..."
npm run build

echo "→ 同步到 Android..."
npx cap sync android

echo "→ 建置 Android APK..."
cd android
./gradlew assembleDebug --no-daemon

APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "✓ APK 已產生："
echo "  $APK"
echo ""
echo "傳到手機安裝：adb install -r $APK"
echo "或直接複製 app-debug.apk 到手機用檔案管理器安裝（需允許未知來源）。"
