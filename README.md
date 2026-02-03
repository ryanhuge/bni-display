# BNI 分會會議數據展示系統

一個專為 BNI 分會設計的會議數據展示系統，支援週報展示、紅綠燈榮耀榜、抽獎等功能。

## 功能特色

### 展示功能
- **週報展示** - 自動解析 PALMS 週報 PDF，展示會員引薦數據
- **紅綠燈榮耀榜** - 根據半年報計算會員表現燈號（綠/黃/紅），可下載為圖片
- **抽獎系統** - 根據引薦數進行加權抽獎，含音效與動畫效果

### 後台管理
- **週報上傳** - 上傳 PALMS 週報 PDF 自動解析
- **半年報上傳** - 上傳半年報 PDF 計算紅綠燈狀態
- **系統設定** - 設定分會名稱、成會年份、累計金額等

## 系統需求

### 可攜式版本（隨身碟使用）
- Windows 10/11 或 macOS 10.15+
- 無需安裝任何軟體
- 建議使用 Chrome、Edge 或 Safari 瀏覽器

### 開發版本
- Node.js 18.0 以上
- npm 或 yarn 套件管理器

## 快速開始

### 方式一：完整可攜式版本（推薦，含 Node.js）

如果您使用的是 `BNI_Portable` 完整可攜式版本：

1. 將整個 `BNI_Portable` 資料夾複製到隨身碟
2. **Windows 使用者**：雙擊執行 `啟動-Windows.bat`
3. **Mac Intel 使用者**：雙擊執行 `啟動-Mac-Intel.command`
4. **Mac M1/M2/M3 使用者**：雙擊執行 `啟動-Mac-M1M2M3.command`
5. 瀏覽器會自動開啟 http://localhost:4173

> 此版本已內建 Node.js，無需安裝任何軟體

### 方式二：輕量版（需要系統有 Node.js）

1. **Windows**：執行 `setup-portable.bat` 自動下載 Node.js 並建置
2. **Mac**：執行 `./setup-portable-mac.sh`
3. 完成後執行 `start-windows.bat` 或 `start-mac.command`

### 方式三：開發模式

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 建立可攜式版本

如果您要建立完整的可攜式版本給其他人使用：

```bash
# Windows - 執行完整打包（包含所有平台的 Node.js）
build-full-portable.bat
```

這會建立 `BNI_Portable` 資料夾，包含：
- Windows 版 Node.js
- Mac Intel 版 Node.js
- Mac ARM (M1/M2/M3) 版 Node.js
- 所有啟動腳本
- 完整應用程式

## 使用說明

### 1. 上傳週報

1. 進入「後台管理 > 週報上傳」
2. 拖曳或點擊上傳 PALMS 週報 PDF
3. 確認解析結果後點擊「確認匯入」
4. 設定成會年份和累計金額

### 2. 週報展示

1. 進入「展示頁面 > 週報展示」
2. 系統會自動顯示最新週報數據
3. 可切換至「金額」分頁查看累計金額

### 3. 上傳半年報

1. 進入「後台管理 > 半年報上傳」
2. 上傳半年報 PDF
3. 系統會自動計算各會員的紅綠燈狀態
4. 可手動調整教育學分或覆寫燈號

### 4. 紅綠燈榮耀榜

1. 進入「展示頁面 > 紅綠燈榮耀榜」
2. 查看綠燈和黃燈會員名單
3. 點擊「下載圖片」可儲存為 PNG 分享

### 5. 抽獎

1. 進入「展示頁面 > 抽獎」
2. 系統根據週報的引薦數自動產生候選人
3. 點擊「開始抽獎」開始，再點擊「停止抽獎」抽出得獎者
4. 可開啟/關閉音效與背景音樂
5. 勾選「排除已中獎者」避免重複中獎

## 紅綠燈計算規則

| 項目 | 綠燈標準 | 配分 |
|------|----------|------|
| 出席率 | >= 85% | 最高 4 分 |
| One-to-One | >= 24 次/半年 | 最高 4 分 |
| 引薦數 | >= 24 個/半年 | 最高 4 分 |
| 教育學分 | >= 2 學分/半年 | 最高 4 分 |

- **綠燈**：總分 >= 12 分
- **黃燈**：總分 >= 8 分
- **紅燈**：總分 < 8 分

## 資料夾結構

```
bni-display/
├── dist/                       # 建置後的生產版本
├── public/
│   └── sounds/                # 抽獎音效檔案
│       ├── rolling.mp3        # 滾動音效
│       ├── win.mp3            # 中獎音效
│       └── bgm.mp3            # 背景音樂
├── src/
│   ├── components/            # React 元件
│   ├── pages/                # 頁面元件
│   ├── store/                # Zustand 狀態管理
│   ├── config/               # 系統配置（含簽名）
│   ├── lib/                  # 工具函式
│   └── types/                # TypeScript 型別定義
├── node-portable/             # 可攜式 Node.js（自動下載）
├── start-windows.bat          # Windows 啟動腳本
├── start-mac.command          # Mac 啟動腳本
├── setup-portable.bat         # Windows 下載 Node.js 腳本
├── setup-portable-mac.sh      # Mac 下載 Node.js 腳本
├── build-full-portable.bat    # 建立完整可攜版（含所有平台 Node.js）
└── README.md                  # 本文件

BNI_Portable/                   # 完整可攜式版本輸出
├── node-win/                  # Windows Node.js
├── node-mac-intel/            # Mac Intel Node.js
├── node-mac-arm/              # Mac M1/M2/M3 Node.js
├── dist/                      # 應用程式
├── 啟動-Windows.bat
├── 啟動-Mac-Intel.command
├── 啟動-Mac-M1M2M3.command
└── 使用說明.txt
```

## 技術架構

- **前端框架**：React 18 + TypeScript
- **狀態管理**：Zustand（含持久化）
- **UI 元件**：Tailwind CSS + shadcn/ui
- **PDF 解析**：pdf.js
- **路由**：React Router
- **建置工具**：Vite

## 資料儲存

系統使用瀏覽器的 LocalStorage 儲存資料，包括：
- `bni-weekly-storage` - 週報資料
- `bni-traffic-light-storage` - 紅綠燈資料
- `bni-lottery-storage` - 抽獎記錄
- `bni-amount-storage` - 金額資料

**注意**：清除瀏覽器資料會導致所有設定遺失，建議定期備份。

## 常見問題

### Q: 為什麼抽獎沒有聲音？
A: 現代瀏覽器需要使用者互動後才能播放音效。請先點擊頁面任意處，再開始抽獎。

### Q: PDF 解析失敗怎麼辦？
A: 確認 PDF 是從 PALMS 系統直接下載的原始檔案，不是掃描版或圖片版。

### Q: 如何備份資料？
A: 開啟瀏覽器開發者工具（F12），在 Console 輸入：
```javascript
// 匯出資料
console.log(JSON.stringify({
  weekly: localStorage.getItem('bni-weekly-storage'),
  trafficLight: localStorage.getItem('bni-traffic-light-storage'),
  lottery: localStorage.getItem('bni-lottery-storage'),
  amount: localStorage.getItem('bni-amount-storage')
}));
```

### Q: 可攜式版本無法啟動？
A:
- Windows：確認已安裝 Node.js，或使用內建的 portable-node
- Mac：首次執行需在「系統偏好設定 > 安全性與隱私權」允許執行

## 更新日誌

### v1.0.0
- 初始版本
- 支援週報/半年報 PDF 解析
- 紅綠燈榮耀榜功能
- 抽獎系統（含音效）
- 可攜式版本支援

## 授權

本專案僅供 BNI 分會內部使用。

---

**Givers Gain - 付出者收穫**
