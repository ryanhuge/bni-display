import * as XLSX from 'xlsx';

export interface Member {
  id: string;
  lastName: string;
  firstName: string;
  fullName: string;
  attendance: number;
  absence: number;
  late: number;
  sickLeave: number;
  substitute: number;
  internalReferralGiven: number;
  externalReferralGiven: number;
  internalReferralReceived: number;
  externalReferralReceived: number;
  guests: number;
  oneToOne: number;
  transactionValue: number;
  educationUnits: number;
  totalReferrals: number;
}

export interface ParsedReport {
  chapter: string;
  dateFrom: string;
  dateTo: string;
  members: Member[];
}

// XLS 欄位 index 對應
const COL = {
  lastName: 0,
  firstName: 1,
  attendance: 3,
  absence: 4,
  late: 5,
  sickLeave: 6,
  substitute: 8,
  internalReferralGiven: 10,
  externalReferralGiven: 11,
  internalReferralReceived: 13,
  externalReferralReceived: 14,
  guests: 15,
  oneToOne: 17,
  transactionValue: 18,
  educationUnits: 19,
} as const;

/**
 * 將 Excel serial number 轉為日期字串 YYYY/M/D
 */
function excelDateToString(serial: number): string {
  const date = new Date((serial - 25569) * 86400 * 1000);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 解析 PALMS XLS 報表
 */
export function parseXls(buffer: ArrayBuffer): ParsedReport {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Row 4: 分會名稱
  const chapter = String(data[4]?.[9] ?? '');

  // Row 5-6: 日期範圍 (Excel serial numbers)
  const dateFrom = excelDateToString(Number(data[5]?.[9] ?? 0));
  const dateTo = excelDateToString(Number(data[6]?.[9] ?? 0));

  // Row 7: 標題行
  // Row 8+: 會員資料，直到遇到「來賓」、「BNI」、「總數」
  const members: Member[] = [];
  const skipNames = new Set(['來賓', 'BNI', '總數', 'Visitors', 'Total', 'Guest', 'Guests']);

  for (let i = 8; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[COL.lastName]) continue;

    const lastName = String(row[COL.lastName] ?? '');
    if (skipNames.has(lastName)) continue;

    const firstName = String(row[COL.firstName] ?? '');
    const internalGiven = Number(row[COL.internalReferralGiven] ?? 0);
    const externalGiven = Number(row[COL.externalReferralGiven] ?? 0);

    members.push({
      id: `${lastName}${firstName}`,
      lastName,
      firstName,
      fullName: `${lastName}${firstName}`,
      attendance: Number(row[COL.attendance] ?? 0),
      absence: Number(row[COL.absence] ?? 0),
      late: Number(row[COL.late] ?? 0),
      sickLeave: Number(row[COL.sickLeave] ?? 0),
      substitute: Number(row[COL.substitute] ?? 0),
      internalReferralGiven: internalGiven,
      externalReferralGiven: externalGiven,
      internalReferralReceived: Number(row[COL.internalReferralReceived] ?? 0),
      externalReferralReceived: Number(row[COL.externalReferralReceived] ?? 0),
      guests: Number(row[COL.guests] ?? 0),
      oneToOne: Number(row[COL.oneToOne] ?? 0),
      transactionValue: Number(row[COL.transactionValue] ?? 0),
      educationUnits: Number(row[COL.educationUnits] ?? 0),
      totalReferrals: internalGiven + externalGiven,
    });
  }

  console.log(`[parse] 解析完成: ${chapter}, ${dateFrom} ~ ${dateTo}, ${members.length} 位會員`);
  return { chapter, dateFrom, dateTo, members };
}
