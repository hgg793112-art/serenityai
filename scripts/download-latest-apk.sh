#!/usr/bin/env bash
# 從 GitHub Actions 下載最新成功的 APK（需設定 GITHUB_TOKEN 或手動輸入）
# 使用：export GITHUB_TOKEN=ghp_xxx 後執行 ./scripts/download-latest-apk.sh

set -e
REPO="hgg793112-art/serenityai"
API="https://api.github.com/repos/$REPO/actions/runs"
OUTPUT="${1:-../app-debug-latest.apk}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "請設定 GITHUB_TOKEN，例如："
  echo "  export GITHUB_TOKEN=你的Personal_Access_Token"
  echo "  $0 [輸出路徑]"
  exit 1
fi

if [ -n "$RUN_ID" ]; then
  RUNS="$RUN_ID"
  echo "→ 使用指定 Run ID: $RUNS"
else
  echo "→ 查詢最近成功的 workflow run..."
  RUNS=$(curl -sL -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
    "$API?per_page=10&status=completed" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for r in d.get('workflow_runs', []):
    if r.get('conclusion') == 'success' and 'Build Android APK' in r.get('name', ''):
        print(r['id'])
        break
else:
    print('')
" 2>/dev/null)

  if [ -z "$RUNS" ]; then
    echo "尚未有成功的 Build Android APK run，請先推送並等待 Actions 跑完。"
    exit 1
  fi
fi

echo "→ Run ID: $RUNS，取得 Artifacts..."
ARTS=$(curl -sL -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  "$API/$RUNS/artifacts" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for a in d.get('artifacts', []):
    if a.get('name') == 'app-debug-apk':
        print(a['archive_download_url'])
        break
else:
    print('')
" 2>/dev/null)

if [ -z "$ARTS" ]; then
  echo "此 run 沒有 app-debug-apk artifact。"
  exit 1
fi

echo "→ 下載並解壓..."
TMPZIP=$(mktemp).zip
curl -sL -H "Authorization: token $GITHUB_TOKEN" -o "$TMPZIP" "$ARTS"
unzip -o -q -j "$TMPZIP" "app-debug.apk" -d "$(dirname "$OUTPUT")" 2>/dev/null || unzip -o -q -j "$TMPZIP" "*.apk" -d "$(dirname "$OUTPUT")"
mv "$(dirname "$OUTPUT")/app-debug.apk" "$OUTPUT" 2>/dev/null || true
rm -f "$TMPZIP"
echo "✓ 已儲存: $OUTPUT"
