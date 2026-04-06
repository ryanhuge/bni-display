import 'dotenv/config';
import cron from 'node-cron';
import { authenticate } from './auth.js';
import { fetchPalmsReport } from './fetch-report.js';
import { parseXls } from './parse-xls.js';
import { calculateTrafficLight } from './traffic-light.js';
import { getMonthlyRange, getHalfYearRange, calculateWeeks } from './date-utils.js';
import { saveWeeklyReport, saveHalfYearReport, saveTrafficLightResults } from './store.js';
import { sendNotification } from './notify.js';

// 環境變數
const BNI_USERNAME = process.env.BNI_USERNAME!;
const BNI_PASSWORD = process.env.BNI_PASSWORD!;
const BNI_ORG_ID = process.env.BNI_ORG_ID || '12962';
const BNI_REGION_ID = process.env.BNI_REGION_ID || '7700';
const BNI_COUNTRY_ID = process.env.BNI_COUNTRY_ID || '7699';
const HALF_YEAR_WEEKS = Number(process.env.HALF_YEAR_WEEKS || '26');
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 12 * * 2';

/**
 * 抓取週報
 */
async function scrapeWeekly(accessToken: string) {
  console.log('\n=== 抓取週報 ===');
  const { startDate, endDate } = getMonthlyRange();

  const buffer = await fetchPalmsReport({
    accessToken,
    startDate,
    endDate,
    orgId: BNI_ORG_ID,
    regionId: BNI_REGION_ID,
    countryId: BNI_COUNTRY_ID,
  });

  const report = parseXls(buffer);
  await saveWeeklyReport(report);
  return report;
}

/**
 * 抓取半年報 + 計算紅綠燈
 */
async function scrapeHalfYear(accessToken: string) {
  console.log('\n=== 抓取半年報 ===');
  const { startDate, endDate } = getHalfYearRange();

  const buffer = await fetchPalmsReport({
    accessToken,
    startDate,
    endDate,
    orgId: BNI_ORG_ID,
    regionId: BNI_REGION_ID,
    countryId: BNI_COUNTRY_ID,
  });

  const report = parseXls(buffer);
  await saveHalfYearReport(report);

  // 計算紅綠燈
  console.log('\n=== 計算紅綠燈 ===');
  const weeks = calculateWeeks(startDate, endDate) || HALF_YEAR_WEEKS;
  const results = report.members.map((m) => calculateTrafficLight(m, weeks));
  await saveTrafficLightResults(results);

  return { report, trafficLightResults: results };
}

/**
 * 發送通知
 */
async function notify(results: ReturnType<typeof calculateTrafficLight>[]) {
  const to = process.env.NOTIFY_EMAIL_TO;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!to || !smtpHost || !smtpUser || !smtpPass) {
    console.log('[notify] Email 設定不完整，跳過通知');
    return;
  }

  await sendNotification(results, {
    to,
    smtpHost,
    smtpPort: Number(process.env.SMTP_PORT || '587'),
    smtpUser,
    smtpPass,
    displayUrl: process.env.DISPLAY_URL || 'http://localhost:4173',
  });
}

/**
 * 執行全部流程
 */
async function runAll() {
  try {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`BNI 爬蟲啟動: ${new Date().toLocaleString('zh-TW')}`);
    console.log('='.repeat(50));

    // 登入
    const { accessToken } = await authenticate(BNI_USERNAME, BNI_PASSWORD);

    // 抓取半年報 + 計算紅綠燈
    const { trafficLightResults } = await scrapeHalfYear(accessToken);

    // 抓取週報
    await scrapeWeekly(accessToken);

    // 發送通知
    await notify(trafficLightResults);

    console.log('\n✅ 全部完成！');
  } catch (err) {
    console.error('\n❌ 執行失敗:', err);
    process.exit(1);
  }
}

// CLI 入口
const args = process.argv.slice(2);
const mode = args[0] || '--all';

if (mode === '--daemon') {
  // 排程模式
  console.log(`BNI 爬蟲排程模式啟動`);
  console.log(`排程: ${CRON_SCHEDULE}`);
  console.log(`下次執行: 每週二中午 12:00\n`);

  cron.schedule(CRON_SCHEDULE, () => {
    console.log(`\n[cron] 排程觸發: ${new Date().toLocaleString('zh-TW')}`);
    runAll();
  });

  // 保持程式運行
  console.log('等待排程觸發...');
} else if (mode === '--weekly') {
  // 只抓週報
  (async () => {
    const { accessToken } = await authenticate(BNI_USERNAME, BNI_PASSWORD);
    await scrapeWeekly(accessToken);
    console.log('\n✅ 週報抓取完成！');
  })().catch((err) => {
    console.error('❌ 失敗:', err);
    process.exit(1);
  });
} else if (mode === '--half-year') {
  // 抓半年報 + 紅綠燈
  (async () => {
    const { accessToken } = await authenticate(BNI_USERNAME, BNI_PASSWORD);
    const { trafficLightResults } = await scrapeHalfYear(accessToken);
    await notify(trafficLightResults);
    console.log('\n✅ 半年報 + 紅綠燈完成！');
  })().catch((err) => {
    console.error('❌ 失敗:', err);
    process.exit(1);
  });
} else {
  // --all: 全部執行
  runAll();
}
