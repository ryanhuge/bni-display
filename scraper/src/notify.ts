import nodemailer from 'nodemailer';
import type { TrafficLightResult } from './traffic-light.js';

const STATUS_EMOJI: Record<string, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
  grey: '⚫',
};

interface NotifyOptions {
  to: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  displayUrl: string;
}

/**
 * 寄送紅綠燈更新通知 Email
 */
export async function sendNotification(
  results: TrafficLightResult[],
  options: NotifyOptions,
) {
  const { to, smtpHost, smtpPort, smtpUser, smtpPass, displayUrl } = options;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });

  // 統計
  const summary = { green: 0, yellow: 0, red: 0, grey: 0 };
  for (const r of results) summary[r.status]++;

  // 建立 HTML 內容
  const memberRows = results
    .sort((a, b) => b.scores.total - a.scores.total)
    .map(
      (r) =>
        `<tr>
          <td>${STATUS_EMOJI[r.status]}</td>
          <td>${r.memberName}</td>
          <td style="text-align:center">${r.scores.total}</td>
        </tr>`,
    )
    .join('\n');

  const html = `
    <h2>BNI 威鋒分會 - 紅綠燈更新通知</h2>
    <p>紅綠燈資料已自動更新完成！</p>
    <p>
      🟢 綠燈: ${summary.green} 人 |
      🟡 黃燈: ${summary.yellow} 人 |
      🔴 紅燈: ${summary.red} 人 |
      ⚫ 灰燈: ${summary.grey} 人
    </p>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
      <tr style="background:#f0f0f0">
        <th>燈號</th><th>會員</th><th>總分</th>
      </tr>
      ${memberRows}
    </table>
    <p><a href="${displayUrl}/display/honor">查看紅綠燈榮耀榜</a></p>
    <hr>
    <p style="color:#888;font-size:12px">此郵件由 BNI 爬蟲系統自動發送</p>
  `;

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;

  await transporter.sendMail({
    from: smtpUser,
    to,
    subject: `[BNI 威鋒] 紅綠燈已更新 - ${dateStr}`,
    html,
  });

  console.log(`[notify] Email 已寄送至 ${to}`);
}
