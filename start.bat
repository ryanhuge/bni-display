@echo off
chcp 65001 >nul
echo ========================================
echo    BNI 威鋒分會數據展示系統
echo ========================================
echo.
echo 正在啟動...
echo 請在瀏覽器開啟: http://localhost:5173
echo.
echo 按 Ctrl+C 可停止伺服器
echo ========================================
echo.

start "" http://localhost:5173
npm run dev
