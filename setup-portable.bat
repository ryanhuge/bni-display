@echo off
chcp 65001 >nul
title BNI 系統 - 下載可攜式 Node.js

echo ========================================
echo   BNI 分會會議數據展示系統
echo   下載可攜式 Node.js
echo   台中市中心區威鋒分會 製作
echo ========================================
echo.

cd /d "%~dp0"

:: Node.js 版本設定
set NODE_VERSION=20.11.1
set NODE_ARCH=win-x64

:: 檢查是否已有 node-portable
if exist "node-portable\node.exe" (
    echo [資訊] 已存在可攜式 Node.js
    node-portable\node.exe -v
    echo.
    set /p REDOWNLOAD="是否要重新下載？(y/N): "
    if /i not "%REDOWNLOAD%"=="y" (
        echo 跳過下載
        goto :BUILD
    )
)

echo [1/4] 正在下載 Node.js v%NODE_VERSION%...
echo 下載網址: https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-%NODE_ARCH%.zip
echo.

:: 使用 PowerShell 下載
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-%NODE_ARCH%.zip' -OutFile 'node-temp.zip'}"

if not exist "node-temp.zip" (
    echo [錯誤] 下載失敗
    echo 請手動下載 Node.js:
    echo https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-%NODE_ARCH%.zip
    pause
    exit /b 1
)

echo [2/4] 正在解壓縮...

:: 刪除舊的資料夾
if exist "node-portable" rmdir /s /q "node-portable"
if exist "node-v%NODE_VERSION%-%NODE_ARCH%" rmdir /s /q "node-v%NODE_VERSION%-%NODE_ARCH%"

:: 使用 PowerShell 解壓縮
powershell -Command "Expand-Archive -Path 'node-temp.zip' -DestinationPath '.' -Force"

:: 重新命名資料夾
rename "node-v%NODE_VERSION%-%NODE_ARCH%" "node-portable"

:: 清理暫存檔
del node-temp.zip

echo [3/4] 驗證安裝...
node-portable\node.exe -v
if %ERRORLEVEL% NEQ 0 (
    echo [錯誤] Node.js 安裝驗證失敗
    pause
    exit /b 1
)

echo.
echo [資訊] Node.js v%NODE_VERSION% 已安裝完成

:BUILD
echo.
echo [4/4] 建置應用程式...

:: 設定環境變數使用可攜式 Node.js
set "PATH=%~dp0node-portable;%PATH%"

:: 安裝依賴
echo 安裝依賴套件...
call node-portable\npm.cmd install

:: 建置
echo 建置生產版本...
call node-portable\npm.cmd run build

if %ERRORLEVEL% NEQ 0 (
    echo [錯誤] 建置失敗
    pause
    exit /b 1
)

echo.
echo ========================================
echo   設定完成！
echo ========================================
echo.
echo 現在可以執行 start-windows.bat 啟動系統
echo.
pause
