# BNI 分會會議數據展示系統 - 安裝與使用指南

**本軟體由台中市中心區威鋒分會製作**

---

## 快速安裝指南

### Windows 使用者

1. **下載 Node.js**（首次使用需要）
   - 前往 https://nodejs.org/
   - 下載 LTS 版本（建議 18.x 或 20.x）
   - 安裝時保持預設選項，一路按「Next」即可

2. **執行程式**
   - 雙擊 `start-windows.bat`
   - 等待瀏覽器自動開啟
   - 如果瀏覽器沒有自動開啟，請手動前往 http://localhost:4173

### Mac 使用者

1. **下載 Node.js**（首次使用需要）
   - 前往 https://nodejs.org/
   - 下載 LTS 版本
   - 或使用 Homebrew：`brew install node`

2. **執行程式**
   - 雙擊 `start-mac.command`
   - 首次執行可能會顯示「無法打開，因為它來自未識別的開發者」
   - 解決方式：
     1. 打開「系統偏好設定」>「安全性與隱私權」
     2. 在「一般」標籤下點擊「仍要打開」
   - 或右鍵點擊檔案，選擇「打開」

---

## 建置可攜式版本（進階）

如果您想要建立一個完整的可攜式版本，可以放在隨身碟使用：

### Windows
```
雙擊執行 build-portable.bat
```

### Mac / Linux
```bash
chmod +x build-portable.sh
./build-portable.sh
```

建置完成後，`portable` 資料夾就是可攜式版本，可以複製到任何位置使用。

---

## 系統需求

| 項目 | 最低需求 |
|------|----------|
| 作業系統 | Windows 10/11 或 macOS 10.15+ |
| Node.js | 18.0 以上 |
| 瀏覽器 | Chrome 90+、Edge 90+、Safari 14+ |
| 記憶體 | 4GB RAM |
| 硬碟空間 | 500MB |

---

## 常見問題排解

### 問題：「找不到 Node.js」

**解決方式：**
1. 確認已安裝 Node.js
2. 重新開機後再試
3. 或手動將 Node.js 加入系統 PATH

### 問題：「找不到 dist 目錄」

**解決方式：**
執行以下指令重新建置：
```bash
npm install
npm run build
```

### 問題：瀏覽器顯示「無法連線」

**解決方式：**
1. 確認命令列視窗沒有關閉
2. 確認沒有其他程式佔用 4173 埠
3. 手動開啟 http://localhost:4173

### 問題：PDF 無法解析

**解決方式：**
1. 確認 PDF 是從 PALMS 系統直接下載
2. 不要使用掃描版或圖片版 PDF
3. 確認 PDF 沒有加密或密碼保護

### 問題：音效無法播放

**解決方式：**
1. 現代瀏覽器需要使用者互動後才能播放音效
2. 先點擊頁面任意處，再開始抽獎
3. 檢查電腦音量設定

---

## 資料備份

系統資料儲存在瀏覽器的 LocalStorage 中。

### 匯出資料

1. 按 F12 開啟開發者工具
2. 切換到 Console 標籤
3. 貼上以下程式碼並按 Enter：

```javascript
const data = {
  weekly: localStorage.getItem('bni-weekly-storage'),
  trafficLight: localStorage.getItem('bni-traffic-light-storage'),
  lottery: localStorage.getItem('bni-lottery-storage'),
  amount: localStorage.getItem('bni-amount-storage')
};
const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'bni-backup-' + new Date().toISOString().slice(0,10) + '.json';
a.click();
```

### 匯入資料

1. 按 F12 開啟開發者工具
2. 切換到 Console 標籤
3. 貼上以下程式碼：

```javascript
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = async (e) => {
  const file = e.target.files[0];
  const text = await file.text();
  const data = JSON.parse(text);
  if (data.weekly) localStorage.setItem('bni-weekly-storage', data.weekly);
  if (data.trafficLight) localStorage.setItem('bni-traffic-light-storage', data.trafficLight);
  if (data.lottery) localStorage.setItem('bni-lottery-storage', data.lottery);
  if (data.amount) localStorage.setItem('bni-amount-storage', data.amount);
  alert('資料匯入成功！請重新整理頁面');
  location.reload();
};
input.click();
```

---

## 技術支援

如有問題，請聯繫台中市中心區威鋒分會。

---

**Givers Gain - 付出者收穫**

*本軟體由台中市中心區威鋒分會製作 © 2024*
