#!/bin/bash

# BNI 分會會議數據展示系統
# 建置可攜式版本
# 台中市中心區威鋒分會 製作

echo "========================================"
echo "  BNI 分會會議數據展示系統"
echo "  建置可攜式版本"
echo "  台中市中心區威鋒分會 製作"
echo "========================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "[錯誤] 找不到 Node.js，請先安裝"
    exit 1
fi

echo "[1/3] 安裝依賴套件..."
npm install
if [ $? -ne 0 ]; then
    echo "[錯誤] 安裝依賴失敗"
    exit 1
fi

echo ""
echo "[2/3] 建置生產版本..."
npm run build
if [ $? -ne 0 ]; then
    echo "[錯誤] 建置失敗"
    exit 1
fi

echo ""
echo "[3/3] 準備可攜式版本..."

# 建立 portable 資料夾
mkdir -p portable

# 複製必要檔案
echo "複製 dist 目錄..."
cp -r dist portable/

echo "複製 public 目錄..."
cp -r public portable/

echo "複製啟動腳本..."
cp start-windows.bat portable/
cp start-mac.command portable/
chmod +x portable/start-mac.command
cp README.md portable/
cp package.json portable/
cp vite.config.ts portable/

# 安裝精簡版依賴
echo "安裝精簡版依賴 (僅 vite)..."
cd portable
npm install vite --save-dev --silent 2>/dev/null
cd ..

echo ""
echo "========================================"
echo "  建置完成！"
echo "========================================"
echo ""
echo "可攜式版本已建立在 portable 資料夾中"
echo "將整個 portable 資料夾複製到隨身碟即可使用"
echo ""
echo "使用方式:"
echo "  Windows: 雙擊 start-windows.bat"
echo "  Mac: 雙擊 start-mac.command"
echo ""
