#!/bin/bash

# BNI 分會會議數據展示系統
# 下載可攜式 Node.js (Mac)
# 台中市中心區威鋒分會 製作

echo "========================================"
echo "  BNI 分會會議數據展示系統"
echo "  下載可攜式 Node.js (Mac)"
echo "  台中市中心區威鋒分會 製作"
echo "========================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Node.js 版本設定
NODE_VERSION="20.11.1"

# 偵測 Mac 架構 (Intel 或 Apple Silicon)
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    NODE_ARCH="darwin-arm64"
    echo "[資訊] 偵測到 Apple Silicon (M1/M2/M3)"
else
    NODE_ARCH="darwin-x64"
    echo "[資訊] 偵測到 Intel Mac"
fi

# 檢查是否已有 node-portable
if [ -f "node-portable/bin/node" ]; then
    echo "[資訊] 已存在可攜式 Node.js"
    ./node-portable/bin/node -v
    echo ""
    read -p "是否要重新下載？(y/N): " REDOWNLOAD
    if [ "$REDOWNLOAD" != "y" ] && [ "$REDOWNLOAD" != "Y" ]; then
        echo "跳過下載"
        # 直接進行建置
        goto_build=true
    fi
fi

if [ "$goto_build" != "true" ]; then
    echo "[1/4] 正在下載 Node.js v${NODE_VERSION}..."
    DOWNLOAD_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${NODE_ARCH}.tar.gz"
    echo "下載網址: $DOWNLOAD_URL"
    echo ""

    # 下載
    curl -L -o node-temp.tar.gz "$DOWNLOAD_URL"

    if [ ! -f "node-temp.tar.gz" ]; then
        echo "[錯誤] 下載失敗"
        echo "請手動下載 Node.js:"
        echo "$DOWNLOAD_URL"
        exit 1
    fi

    echo "[2/4] 正在解壓縮..."

    # 刪除舊的資料夾
    rm -rf node-portable
    rm -rf "node-v${NODE_VERSION}-${NODE_ARCH}"

    # 解壓縮
    tar -xzf node-temp.tar.gz

    # 重新命名資料夾
    mv "node-v${NODE_VERSION}-${NODE_ARCH}" node-portable

    # 清理暫存檔
    rm node-temp.tar.gz

    echo "[3/4] 驗證安裝..."
    ./node-portable/bin/node -v
    if [ $? -ne 0 ]; then
        echo "[錯誤] Node.js 安裝驗證失敗"
        exit 1
    fi

    echo ""
    echo "[資訊] Node.js v${NODE_VERSION} 已安裝完成"
fi

echo ""
echo "[4/4] 建置應用程式..."

# 設定環境變數使用可攜式 Node.js
export PATH="$SCRIPT_DIR/node-portable/bin:$PATH"

# 安裝依賴
echo "安裝依賴套件..."
npm install

# 建置
echo "建置生產版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "[錯誤] 建置失敗"
    exit 1
fi

echo ""
echo "========================================"
echo "  設定完成！"
echo "========================================"
echo ""
echo "現在可以執行 start-mac.command 啟動系統"
echo ""
