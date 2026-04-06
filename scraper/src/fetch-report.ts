const REPORTS_API = 'https://api.bniconnectglobal.com/reports-api/reports/v1/generate';

interface FetchReportOptions {
  accessToken: string;
  startDate: string;  // MM/DD/YYYY
  endDate: string;    // MM/DD/YYYY
  orgId: string;
  regionId: string;
  countryId: string;
}

/**
 * 從 BNI Connect API 下載 PALMS 報表（XLS 格式）
 * 回傳 ArrayBuffer
 */
export async function fetchPalmsReport(options: FetchReportOptions): Promise<ArrayBuffer> {
  const { accessToken, startDate, endDate, orgId, regionId, countryId } = options;

  const params = new URLSearchParams({
    menuName: 'menu.reports.chapter.palms.summary',
    IdOrg: orgId,
    startDate,
    endDate,
    ReportType: 'EXCEL',
    __heading_chapter: orgId,
    __heading_region: regionId,
    __heading_country: countryId,
    __orientation: 'ltr',
    execution_type: 'SHORT',
    ShowDetails: 'false',
    __exports_details: '1',
  });

  const url = `${REPORTS_API}?${params.toString()}`;
  console.log(`[fetch] 下載報表: ${startDate} ~ ${endDate}`);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`下載報表失敗 (${res.status}): ${text}`);
  }

  const buffer = await res.arrayBuffer();
  console.log(`[fetch] 下載完成，大小: ${buffer.byteLength} bytes`);
  return buffer;
}
