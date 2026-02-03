@echo off
chcp 65001 >nul
title BNI 系統 - 打包可攜式版本

echo ========================================
echo   BNI 分會會議數據展示系統
echo   打包完整可攜式版本
echo   台中市中心區威鋒分會 製作
echo ========================================
echo.

cd /d "%~dp0"

:: Node.js 版本
set NODE_VER=20.11.1

:: 輸出目錄
set OUT=BNI_System
if exist "%OUT%" rmdir /s /q "%OUT%"
mkdir "%OUT%"

echo [1/5] 建置應用程式...
call npm install >nul 2>nul
call npm run build
if not exist "dist" (
    echo [錯誤] 建置失敗
    pause
    exit /b 1
)

echo [2/5] 下載 Node.js (Windows)...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v%NODE_VER%/node-v%NODE_VER%-win-x64.zip' -OutFile 'node-win.zip'" 2>nul
if exist "node-win.zip" (
    powershell -Command "Expand-Archive -Path 'node-win.zip' -DestinationPath '.' -Force"
    move "node-v%NODE_VER%-win-x64" "%OUT%\node-win" >nul
    del node-win.zip
    echo    OK
) else (
    echo    失敗 - 請手動下載
)

echo [3/5] 下載 Node.js (Mac Intel)...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v%NODE_VER%/node-v%NODE_VER%-darwin-x64.tar.gz' -OutFile 'node-mac-x64.tar.gz'" 2>nul
if exist "node-mac-x64.tar.gz" (
    tar -xzf node-mac-x64.tar.gz 2>nul
    move "node-v%NODE_VER%-darwin-x64" "%OUT%\node-mac-x64" >nul
    del node-mac-x64.tar.gz
    echo    OK
) else (
    echo    失敗
)

echo [4/5] 下載 Node.js (Mac M1/M2/M3)...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v%NODE_VER%/node-v%NODE_VER%-darwin-arm64.tar.gz' -OutFile 'node-mac-arm.tar.gz'" 2>nul
if exist "node-mac-arm.tar.gz" (
    tar -xzf node-mac-arm.tar.gz 2>nul
    move "node-v%NODE_VER%-darwin-arm64" "%OUT%\node-mac-arm" >nul
    del node-mac-arm.tar.gz
    echo    OK
) else (
    echo    失敗
)

echo [5/5] 複製檔案並建立啟動腳本...

:: 複製應用程式
xcopy /E /I /Y "dist" "%OUT%\dist" >nul
xcopy /E /I /Y "public" "%OUT%\public" >nul

:: Windows 啟動腳本
(
echo @echo off
echo chcp 65001 ^>nul
echo title BNI 分會會議數據展示系統
echo cd /d "%%~dp0"
echo set "PATH=%%~dp0node-win;%%PATH%%"
echo echo ========================================
echo echo   BNI 分會會議數據展示系統
echo echo   台中市中心區威鋒分會 製作
echo echo ========================================
echo echo.
echo echo 網址: http://localhost:4173
echo echo 按 Ctrl+C 停止
echo echo.
echo start "" http://localhost:4173
echo node-win\npx.cmd vite preview --host
) > "%OUT%\啟動(Windows).bat"

:: Mac Intel 啟動腳本
(
echo #!/bin/bash
echo cd "$(dirname "$0")"
echo export PATH="$PWD/node-mac-x64/bin:$PATH"
echo echo "========================================"
echo echo "  BNI 分會會議數據展示系統"
echo echo "  台中市中心區威鋒分會 製作"
echo echo "========================================"
echo echo ""
echo echo "網址: http://localhost:4173"
echo ^(sleep 2 ^&^& open http://localhost:4173^) ^&
echo npx vite preview --host
) > "%OUT%\啟動(Mac-Intel).command"

:: Mac ARM 啟動腳本
(
echo #!/bin/bash
echo cd "$(dirname "$0")"
echo export PATH="$PWD/node-mac-arm/bin:$PATH"
echo echo "========================================"
echo echo "  BNI 分會會議數據展示系統"
echo echo "  台中市中心區威鋒分會 製作"
echo echo "========================================"
echo echo ""
echo echo "網址: http://localhost:4173"
echo ^(sleep 2 ^&^& open http://localhost:4173^) ^&
echo npx vite preview --host
) > "%OUT%\啟動(Mac-M系列).command"

:: 複製必要設定
copy /Y "package.json" "%OUT%\" >nul
copy /Y "vite.config.ts" "%OUT%\" >nul

:: 使用說明
(
echo ╔══════════════════════════════════════════════════════╗
echo ║     BNI 分會會議數據展示系統 - 使用說明              ║
echo ║     本軟體由台中市中心區威鋒分會製作                 ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 【使用方式】
echo.
echo   Windows 電腦：雙擊「啟動(Windows^).bat」
echo.
echo   Mac 電腦 (2020年以前^)：雙擊「啟動(Mac-Intel^).command」
echo.
echo   Mac 電腦 (M1/M2/M3/M4^)：雙擊「啟動(Mac-M系列^).command」
echo.
echo.
echo 【首次在 Mac 執行】
echo.
echo   1. 右鍵點擊啟動檔案，選擇「打開」
echo   2. 如果出現安全性警告，請到：
echo      系統偏好設定 ^> 安全性與隱私權 ^> 允許執行
echo.
echo.
echo 【注意事項】
echo.
echo   - 程式啟動後會自動開啟瀏覽器
echo   - 如果沒有自動開啟，請手動前往: http://localhost:4173
echo   - 關閉命令視窗即可停止程式
echo.
echo ════════════════════════════════════════════════════════
echo   Givers Gain - 付出者收穫
echo ════════════════════════════════════════════════════════
) > "%OUT%\使用說明.txt"

echo.
echo ========================================
echo   打包完成！
echo ========================================
echo.
echo 輸出目錄: %OUT%
echo.

:: 顯示資料夾大小
for /f "tokens=3" %%a in ('dir "%OUT%" /s ^| findstr "個檔案"') do set SIZE=%%a
echo 檔案大小: 約 %SIZE% 位元組
echo.
echo 請將「%OUT%」資料夾複製到隨身碟即可使用
echo 無需安裝任何軟體！
echo.
pause
