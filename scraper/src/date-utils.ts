/**
 * 格式化日期為 MM/DD/YYYY（BNI API 格式）
 */
export function formatDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
}

/**
 * 取得週報日期範圍（上上週二到本週二）
 */
export function getWeeklyRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const day = now.getDay(); // 0=日 1=一 2=二 ...
  const diffToTuesday = (day + 7 - 2) % 7;
  const thisTuesday = new Date(now);
  thisTuesday.setDate(now.getDate() - diffToTuesday);
  // 上上週二（往前推 14 天）
  const twoWeeksAgo = new Date(thisTuesday);
  twoWeeksAgo.setDate(thisTuesday.getDate() - 14);
  return {
    startDate: formatDate(twoWeeksAgo),
    endDate: formatDate(thisTuesday),
  };
}

/**
 * 取得半年日期範圍（紅綠燈用：從今天往前推 6 個月）
 */
export function getHalfYearRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  return {
    startDate: formatDate(start),
    endDate: formatDate(now),
  };
}

/**
 * 計算日期範圍的週數
 */
export function calculateWeeks(startDate: string, endDate: string): number {
  const start = parseApiDate(startDate);
  const end = parseApiDate(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)));
}

/**
 * 解析 MM/DD/YYYY 格式日期
 */
function parseApiDate(dateStr: string): Date {
  const [m, d, y] = dateStr.split('/').map(Number);
  return new Date(y, m - 1, d);
}
