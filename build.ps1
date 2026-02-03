# BNI System - Build Portable Package
# Made by Taichung Central District Wei-Feng Chapter

$ErrorActionPreference = 'Continue'

Write-Host "========================================"
Write-Host "  BNI System - Build Portable Package"
Write-Host "========================================"
Write-Host ""

Set-Location $PSScriptRoot

$OUT = "BNI_System"
$NODE_VER = "20.11.1"

# Clean old directory
if (Test-Path $OUT) {
    Remove-Item -Recurse -Force $OUT
}
New-Item -ItemType Directory -Path $OUT | Out-Null

Write-Host "[1/5] Building application..."
npm run build 2>&1 | Out-Null

if (-not (Test-Path "dist")) {
    Write-Host "[Error] Build failed"
    exit 1
}
Write-Host "   OK"

Write-Host "[2/5] Downloading Node.js (Windows)..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
try {
    $url = "https://nodejs.org/dist/v$NODE_VER/node-v$NODE_VER-win-x64.zip"
    Invoke-WebRequest -Uri $url -OutFile "node-win.zip"
    Expand-Archive -Path "node-win.zip" -DestinationPath "." -Force
    Move-Item "node-v$NODE_VER-win-x64" "$OUT\node-win"
    Remove-Item "node-win.zip"
    Write-Host "   OK"
} catch {
    Write-Host "   Failed: $_"
}

Write-Host "[3/5] Downloading Node.js (Mac Intel)..."
try {
    $url = "https://nodejs.org/dist/v$NODE_VER/node-v$NODE_VER-darwin-x64.tar.gz"
    Invoke-WebRequest -Uri $url -OutFile "node-mac-x64.tar.gz"
    tar -xzf "node-mac-x64.tar.gz"
    Move-Item "node-v$NODE_VER-darwin-x64" "$OUT\node-mac-x64"
    Remove-Item "node-mac-x64.tar.gz"
    Write-Host "   OK"
} catch {
    Write-Host "   Failed: $_"
}

Write-Host "[4/5] Downloading Node.js (Mac M1/M2/M3)..."
try {
    $url = "https://nodejs.org/dist/v$NODE_VER/node-v$NODE_VER-darwin-arm64.tar.gz"
    Invoke-WebRequest -Uri $url -OutFile "node-mac-arm.tar.gz"
    tar -xzf "node-mac-arm.tar.gz"
    Move-Item "node-v$NODE_VER-darwin-arm64" "$OUT\node-mac-arm"
    Remove-Item "node-mac-arm.tar.gz"
    Write-Host "   OK"
} catch {
    Write-Host "   Failed: $_"
}

Write-Host "[5/5] Copying files and creating scripts..."

# Copy application
Copy-Item -Recurse "dist" "$OUT\dist"
Copy-Item -Recurse "public" "$OUT\public"
Copy-Item "package.json" "$OUT\"
Copy-Item "vite.config.ts" "$OUT\"

# Windows startup script
$winScript = @'
@echo off
chcp 65001 >nul
title BNI System
cd /d "%~dp0"
set "PATH=%~dp0node-win;%PATH%"
echo ========================================
echo   BNI System
echo   Made by Wei-Feng Chapter
echo ========================================
echo.
echo URL: http://localhost:4173
echo Press Ctrl+C to stop
echo.
start "" http://localhost:4173
node-win\npx.cmd vite preview --host
'@
$winScript | Out-File -FilePath "$OUT\Start-Windows.bat" -Encoding ascii

# Mac Intel startup script
$macIntelScript = @'
#!/bin/bash
cd "$(dirname "$0")"
export PATH="$PWD/node-mac-x64/bin:$PATH"
echo "========================================"
echo "  BNI System"
echo "  Made by Wei-Feng Chapter"
echo "========================================"
echo ""
echo "URL: http://localhost:4173"
(sleep 2 && open http://localhost:4173) &
npx vite preview --host
'@
$macIntelScript | Out-File -FilePath "$OUT\Start-Mac-Intel.command" -Encoding ascii -NoNewline

# Mac ARM startup script
$macArmScript = @'
#!/bin/bash
cd "$(dirname "$0")"
export PATH="$PWD/node-mac-arm/bin:$PATH"
echo "========================================"
echo "  BNI System"
echo "  Made by Wei-Feng Chapter"
echo "========================================"
echo ""
echo "URL: http://localhost:4173"
(sleep 2 && open http://localhost:4173) &
npx vite preview --host
'@
$macArmScript | Out-File -FilePath "$OUT\Start-Mac-M-Series.command" -Encoding ascii -NoNewline

# README
$readme = @'
BNI Chapter Meeting Data Display System
========================================
Made by Taichung Central District Wei-Feng Chapter

[How to Use]

Windows: Double-click "Start-Windows.bat"

Mac (Intel, before 2020): Double-click "Start-Mac-Intel.command"

Mac (M1/M2/M3/M4): Double-click "Start-Mac-M-Series.command"

[First time on Mac]

1. Right-click the startup file and select "Open"
2. If security warning appears, go to:
   System Preferences > Security & Privacy > Allow

[Notes]

- Browser will open automatically after startup
- If not, manually go to: http://localhost:4173
- Close the terminal window to stop the server

========================================
Givers Gain
========================================
'@
$readme | Out-File -FilePath "$OUT\README.txt" -Encoding UTF8

Write-Host "   OK"
Write-Host ""
Write-Host "========================================"
Write-Host "  Build Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "Output: $OUT"

# Calculate size
$size = (Get-ChildItem -Recurse $OUT | Measure-Object -Property Length -Sum).Sum
$sizeMB = [math]::Round($size / 1MB, 2)
Write-Host "Total Size: $sizeMB MB"
Write-Host ""
Write-Host "Copy the '$OUT' folder to USB drive"
Write-Host "No installation required!"
