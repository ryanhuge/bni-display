@echo off
chcp 65001 >nul
title BNI 系統 - 建立完整可攜式版本

echo ========================================
echo   BNI 分會會議數據展示系統
echo   建立完整可攜式版本（含 Node.js）
echo   台中市中心區威鋒分會 製作
echo ========================================
echo.

cd /d "%~dp0"

:: Node.js 版本設定
set NODE_VERSION=20.11.1
set NODE_ARCH_WIN=win-x64
set NODE_ARCH_MAC_INTEL=darwin-x64
set NODE_ARCH_MAC_ARM=darwin-arm64

:: 建立輸出目錄
set OUTPUT_DIR=BNI_Portable
if exist "%OUTPUT_DIR%" rmdir /s /q "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%\node-win"
mkdir "%OUTPUT_DIR%\node-mac-intel"
mkdir "%OUTPUT_DIR%\node-mac-arm"

echo [1/6] 下載 Windows 版 Node.js...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-%NODE_ARCH_WIN%.zip' -OutFile 'node-win.zip'}"
if exist "node-win.zip" (
    powershell -Command "Expand-Archive -Path 'node-win.zip' -DestinationPath 'temp-win' -Force"
    xcopy /E /I /Y "temp-win\node-v%NODE_VERSION%-%NODE_ARCH_WIN%\*" "%OUTPUT_DIR%\node-win\" >nul
    rmdir /s /q temp-win
    del node-win.zip
    echo    [OK] Windows Node.js 已下載
) else (
    echo    [警告] Windows Node.js 下載失敗
)

echo [2/6] 下載 Mac Intel 版 Node.js...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-%NODE_ARCH_MAC_INTEL%.tar.gz' -OutFile 'node-mac-intel.tar.gz'}"
if exist "node-mac-intel.tar.gz" (
    powershell -Command "tar -xzf 'node-mac-intel.tar.gz'"
    xcopy /E /I /Y "node-v%NODE_VERSION%-%NODE_ARCH_MAC_INTEL%\*" "%OUTPUT_DIR%\node-mac-intel\" >nul
    rmdir /s /q "node-v%NODE_VERSION%-%NODE_ARCH_MAC_INTEL%"
    del node-mac-intel.tar.gz
    echo    [OK] Mac Intel Node.js 已下載
) else (
    echo    [警告] Mac Intel Node.js 下載失敗
)

echo [3/6] 下載 Mac ARM (M1/M2/M3) 版 Node.js...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-%NODE_ARCH_MAC_ARM%.tar.gz' -OutFile 'node-mac-arm.tar.gz'}"
if exist "node-mac-arm.tar.gz" (
    powershell -Command "tar -xzf 'node-mac-arm.tar.gz'"
    xcopy /E /I /Y "node-v%NODE_VERSION%-%NODE_ARCH_MAC_ARM%\*" "%OUTPUT_DIR%\node-mac-arm\" >nul
    rmdir /s /q "node-v%NODE_VERSION%-%NODE_ARCH_MAC_ARM%"
    del node-mac-arm.tar.gz
    echo    [OK] Mac ARM Node.js 已下載
) else (
    echo    [警告] Mac ARM Node.js 下載失敗
)

echo [4/6] 建置應用程式...
:: 使用當前 Node.js 建置
call npm install
call npm run build

echo [5/6] 複製應用程式檔案...
:: 複製 dist
xcopy /E /I /Y "dist" "%OUTPUT_DIR%\dist" >nul

:: 複製 public
xcopy /E /I /Y "public" "%OUTPUT_DIR%\public" >nul

:: 複製設定檔
copy /Y "package.json" "%OUTPUT_DIR%\" >nul
copy /Y "vite.config.ts" "%OUTPUT_DIR%\" >nul
copy /Y "tsconfig.json" "%OUTPUT_DIR%\" >nul
copy /Y "README.md" "%OUTPUT_DIR%\" >nul
copy /Y "INSTALL.md" "%OUTPUT_DIR%\" >nul

echo [6/6] 建立啟動腳本...

:: 建立 Windows 啟動腳本
(
echo @echo off
echo chcp 65001 ^>nul
echo title BNI 分會會議數據展示系統
echo.
echo echo ========================================
echo echo   BNI 分會會議數據展示系統
echo echo   台中市中心區威鋒分會 製作
echo echo ========================================
echo echo.
echo.
echo cd /d "%%~dp0"
echo.
echo :: 使用內建 Node.js
echo set "PATH=%%~dp0node-win;%%PATH%%"
echo.
echo echo [資訊] 正在啟動伺服器...
echo echo 網址: http://localhost:4173
echo echo 按 Ctrl+C 可停止伺服器
echo echo ========================================
echo.
echo start /b cmd /c "timeout /t 2 /nobreak ^>nul ^&^& start http://localhost:4173"
echo call npx vite preview --host
echo pause
) > "%OUTPUT_DIR%\啟動-Windows.bat"

:: 建立 Mac Intel 啟動腳本
(
echo #!/bin/bash
echo echo "========================================"
echo echo "  BNI 分會會議數據展示系統"
echo echo "  台中市中心區威鋒分會 製作"
echo echo "========================================"
echo SCRIPT_DIR="$^( cd "$^( dirname "${BASH_SOURCE[0]}" ^)" ^&^& pwd ^)"
echo cd "$SCRIPT_DIR"
echo export PATH="$SCRIPT_DIR/node-mac-intel/bin:$PATH"
echo echo "[資訊] 正在啟動伺服器..."
echo echo "網址: http://localhost:4173"
echo ^(sleep 2 ^&^& open http://localhost:4173^) ^&
echo npx vite preview --host
) > "%OUTPUT_DIR%\啟動-Mac-Intel.command"

:: 建立 Mac ARM 啟動腳本
(
echo #!/bin/bash
echo echo "========================================"
echo echo "  BNI 分會會議數據展示系統"
echo echo "  台中市中心區威鋒分會 製作"
echo echo "========================================"
echo SCRIPT_DIR="$^( cd "$^( dirname "${BASH_SOURCE[0]}" ^)" ^&^& pwd ^)"
echo cd "$SCRIPT_DIR"
echo export PATH="$SCRIPT_DIR/node-mac-arm/bin:$PATH"
echo echo "[資訊] 正在啟動伺服器..."
echo echo "網址: http://localhost:4173"
echo ^(sleep 2 ^&^& open http://localhost:4173^) ^&
echo npx vite preview --host
) > "%OUTPUT_DIR%\啟動-Mac-M1M2M3.command"

:: 建立說明檔
(
echo BNI 分會會議數據展示系統 - 可攜式版本
echo ======================================
echo 本軟體由台中市中心區威鋒分會製作
echo.
echo 使用方式:
echo.
echo [Windows 使用者]
echo   雙擊執行「啟動-Windows.bat」
echo.
echo [Mac Intel 使用者 ^(2020年以前的 Mac^)]
echo   雙擊執行「啟動-Mac-Intel.command」
echo   首次執行需在「系統偏好設定 ^> 安全性與隱私權」允許執行
echo.
echo [Mac M1/M2/M3 使用者 ^(2020年以後的 Mac^)]
echo   雙擊執行「啟動-Mac-M1M2M3.command」
echo   首次執行需在「系統偏好設定 ^> 安全性與隱私權」允許執行
echo.
echo 系統會自動開啟瀏覽器，如果沒有自動開啟，
echo 請手動開啟瀏覽器前往: http://localhost:4173
echo.
echo ======================================
echo Givers Gain - 付出者收穫
) > "%OUTPUT_DIR%\使用說明.txt"

echo.
echo ========================================
echo   建置完成！
echo ========================================
echo.
echo 完整可攜式版本已建立在 %OUTPUT_DIR% 資料夾中
echo.
echo 資料夾大小估計:
dir "%OUTPUT_DIR%" /s | findstr "位元組"
echo.
echo 請將整個 %OUTPUT_DIR% 資料夾複製到隨身碟
echo 即可在任何電腦上使用（無需安裝 Node.js）
echo.
pause
