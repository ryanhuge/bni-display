@echo off
chcp 65001 >nul
title BNI 分會會議數據展示系統

echo ========================================
echo   BNI 分會會議數據展示系統
echo   台中市中心區威鋒分會 製作
echo ========================================
echo.

cd /d "%~dp0"

:: 優先使用可攜式 Node.js
if exist "%~dp0node-portable\node.exe" (
    set "PATH=%~dp0node-portable;%PATH%"
    echo [資訊] 使用內建可攜式 Node.js
    goto :CHECK_DIST
)

:: 檢查系統是否已安裝 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [錯誤] 找不到 Node.js
    echo.
    echo 請選擇以下方式之一:
    echo 1. 執行 setup-portable.bat 下載可攜式 Node.js
    echo 2. 手動安裝 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [資訊] 使用系統 Node.js

:CHECK_DIST
:: 檢查 dist 目錄是否存在
if not exist "%~dp0dist" (
    echo [警告] 找不到 dist 目錄，正在建置...
    echo.

    :: 安裝依賴
    if not exist "%~dp0node_modules" (
        echo 安裝依賴套件...
        call npm install
    )

    :: 建置
    echo 建置應用程式...
    call npm run build

    if not exist "%~dp0dist" (
        echo [錯誤] 建置失敗
        pause
        exit /b 1
    )
)

echo.
echo [資訊] 正在啟動伺服器...
echo [資訊] 請稍候，瀏覽器將自動開啟
echo.
echo 網址: http://localhost:4173
echo 按 Ctrl+C 可停止伺服器
echo ========================================

:: 延遲開啟瀏覽器（等伺服器啟動）
start /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:4173"

:: 啟動預覽伺服器
call npx vite preview --host

pause
