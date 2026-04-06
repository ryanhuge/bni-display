import type { ParsedReport } from './parse-xls.js';
import type { TrafficLightResult } from './traffic-light.js';

const API_URL = process.env.API_URL || 'https://bni-display.vercel.app';
const API_SECRET_KEY = process.env.API_SECRET_KEY || '';

async function postToApi(endpoint: string, data: unknown) {
  const url = `${API_URL}/api/${endpoint}`;
  console.log(`[store] POST ${url}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_SECRET_KEY,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API 寫入失敗 (${res.status}): ${text}`);
  }

  console.log(`[store] ✅ ${endpoint} 已同步到線上`);
}

/**
 * 儲存週報資料
 */
export async function saveWeeklyReport(report: ParsedReport) {
  const data = {
    id: `weekly-${Date.now()}`,
    chapter: report.chapter,
    dateFrom: report.dateFrom,
    dateTo: report.dateTo,
    members: report.members,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await postToApi('weekly-report', data);
}

/**
 * 儲存半年報資料
 */
export async function saveHalfYearReport(report: ParsedReport) {
  const data = {
    id: `half-year-${Date.now()}`,
    chapter: report.chapter,
    dateFrom: report.dateFrom,
    dateTo: report.dateTo,
    members: report.members,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await postToApi('half-year-report', data);
}

/**
 * 儲存紅綠燈結果
 */
export async function saveTrafficLightResults(results: TrafficLightResult[]) {
  const data = {
    updatedAt: new Date().toISOString(),
    results: results.map((r) => ({
      ...r,
      updatedAt: new Date().toISOString(),
    })),
  };

  await postToApi('traffic-light', data);

  // 印出摘要
  const summary = { green: 0, yellow: 0, red: 0, grey: 0 };
  for (const r of results) summary[r.status]++;
  console.log(`[store] 綠燈: ${summary.green}, 黃燈: ${summary.yellow}, 紅燈: ${summary.red}, 灰燈: ${summary.grey}`);
}
