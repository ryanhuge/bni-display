@echo off
chcp 65001 >nul
title BNI 系統 - 建置可攜式版本

echo ========================================
echo   BNI 分會會議數據展示系統
echo   建置可攜式版本
echo   台中市中心區威鋒分會 製作
echo ========================================
echo.

cd /d "%~dp0"

:: 檢查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [錯誤] 找不到 Node.js，請先安裝
    pause
    exit /b 1
)

echo [1/3] 安裝依賴套件...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [錯誤] 安裝依賴失敗
    pause
    exit /b 1
)

echo.
echo [2/3] 建置生產版本...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [錯誤] 建置失敗
    pause
    exit /b 1
)

echo.
echo [3/3] 準備可攜式版本...

:: 建立 portable 資料夾
if not exist "portable" mkdir portable

:: 複製必要檔案
echo 複製 dist 目錄...
xcopy /E /I /Y "dist" "portable\dist" >nul

echo 複製 public 目錄...
xcopy /E /I /Y "public" "portable\public" >nul

echo 複製啟動腳本...
copy /Y "start-windows.bat" "portable\" >nul
copy /Y "start-mac.command" "portable\" >nul
copy /Y "README.md" "portable\" >nul
copy /Y "package.json" "portable\" >nul

echo 複製 vite 設定...
copy /Y "vite.config.ts" "portable\" >nul

:: 建立精簡版 node_modules (只有 vite)
echo 安裝精簡版依賴 (僅 vite)...
cd portable
call npm install vite --save-dev --silent >nul 2>nul
cd ..

echo.
echo ========================================
echo   建置完成！
echo ========================================
echo.
echo 可攜式版本已建立在 portable 資料夾中
echo 將整個 portable 資料夾複製到隨身碟即可使用
echo.
echo 使用方式:
echo   Windows: 雙擊 start-windows.bat
echo   Mac: 雙擊 start-mac.command
echo.
pause
