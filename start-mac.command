#!/bin/bash

# BNI 分會會議數據展示系統
# 台中市中心區威鋒分會 製作

echo "========================================"
echo "  BNI 分會會議數據展示系統"
echo "  台中市中心區威鋒分會 製作"
echo "========================================"
echo ""

# 取得腳本所在目錄
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 優先使用可攜式 Node.js
if [ -f "$SCRIPT_DIR/node-portable/bin/node" ]; then
    export PATH="$SCRIPT_DIR/node-portable/bin:$PATH"
    echo "[資訊] 使用內建可攜式 Node.js"
elif command -v node &> /dev/null; then
    echo "[資訊] 使用系統 Node.js"
else
    echo "[錯誤] 找不到 Node.js"
    echo ""
    echo "請選擇以下方式之一:"
    echo "1. 執行 ./setup-portable-mac.sh 下載可攜式 Node.js"
    echo "2. 手動安裝 Node.js: https://nodejs.org/"
    echo "3. 使用 Homebrew: brew install node"
    echo ""
    read -p "按 Enter 鍵結束..."
    exit 1
fi

# 檢查 dist 目錄是否存在
if [ ! -d "$SCRIPT_DIR/dist" ]; then
    echo "[警告] 找不到 dist 目錄，正在建置..."
    echo ""

    # 安裝依賴
    if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
        echo "安裝依賴套件..."
        npm install
    fi

    # 建置
    echo "建置應用程式..."
    npm run build

    if [ ! -d "$SCRIPT_DIR/dist" ]; then
        echo "[錯誤] 建置失敗"
        read -p "按 Enter 鍵結束..."
        exit 1
    fi
fi

echo ""
echo "[資訊] 正在啟動伺服器..."
echo "[資訊] 請稍候，瀏覽器將自動開啟"
echo ""
echo "網址: http://localhost:4173"
echo "按 Ctrl+C 可停止伺服器"
echo "========================================"

# 延遲開啟瀏覽器（等伺服器啟動）
(sleep 2 && open http://localhost:4173) &

# 啟動預覽伺服器
npx vite preview --host
