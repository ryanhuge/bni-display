import { useRef } from 'react';
import { useWeeklyStore } from '@/store/weeklyStore';
import { formatCurrency } from '@/lib/utils';
import { FileText, Download, Calendar, ArrowUpRight, ArrowDownRight, Users, Handshake, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

// BNI 官方配色
const BNI_RED = '#C8102E';
const BNI_GRAY = '#4A4A4A';
const BNI_GOLD = '#B8860B';

export function Report() {
  const { currentReport, getReportSummary, cumulativeAmount, foundingYear } = useWeeklyStore();
  const summary = getReportSummary();
  const captureRef = useRef<HTMLDivElement>(null);

  // 計算累計總金額 = 過往累計 + 本月新增
  const totalCumulative = cumulativeAmount + (summary?.totalTransactionValue || 0);

  const handleDownload = async () => {
    if (!captureRef.current) return;

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // 隱藏所有固定定位的浮水印元素
          const signatures = clonedDoc.querySelectorAll('[data-system-signature], .fixed');
          signatures.forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
        },
      });

      const link = document.createElement('a');
      link.download = `BNI${currentReport?.chapter || ''}週報_${currentReport?.dateFrom || ''}_${currentReport?.dateTo || ''}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('下載圖片失敗:', err);
    }
  };

  if (!currentReport) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="relative rounded-2xl p-8" style={{ backgroundColor: `${BNI_RED}10` }}>
          <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ backgroundColor: `${BNI_RED}05` }} />
          <FileText className="relative h-20 w-20" style={{ color: BNI_RED }} />
        </div>
        <h2 className="mt-6 text-2xl font-bold" style={{ color: BNI_GRAY }}>尚無報告資料</h2>
        <p className="mt-2 text-gray-500">
          請先至後台上傳週報 PDF 檔案
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 下載按鈕 */}
      <div className="flex justify-end">
        <Button
          onClick={handleDownload}
          variant="outline"
          className="gap-2 rounded-xl px-5 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={{
            borderColor: BNI_RED,
            color: BNI_RED,
            backgroundColor: `${BNI_RED}05`
          }}
        >
          <Download className="h-4 w-4" />
          下載圖片
        </Button>
      </div>

      <div ref={captureRef} style={{ maxWidth: '48rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '1rem' }}>
        {/* 標題區 */}
        <div
          style={{ backgroundColor: BNI_RED, borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', color: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
        >
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: '2.25rem' }}>BNI {currentReport.chapter}分會</h1>
          <h2 style={{ marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: 600, lineHeight: '2rem' }}>引薦金額統計</h2>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>
            <Calendar style={{ width: '1rem', height: '1rem' }} />
            <span style={{ fontSize: '0.875rem' }}>{currentReport.dateFrom} - {currentReport.dateTo}</span>
          </div>
        </div>

        {/* 統計卡片群組 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ backgroundColor: `${BNI_RED}08`, borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1rem', textAlign: 'center' }}>
            <div
              style={{ width: '3rem', height: '3rem', margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: `${BNI_RED}20` }}
            >
              <ArrowDownRight style={{ width: '1.5rem', height: '1.5rem', color: BNI_RED }} />
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: '2.25rem', color: BNI_RED }}>
              {summary?.totalInternalReferrals || 0}
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: BNI_GRAY }}>內部引薦</p>
          </div>

          <div style={{ backgroundColor: `${BNI_GRAY}08`, borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1rem', textAlign: 'center' }}>
            <div
              style={{ width: '3rem', height: '3rem', margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: `${BNI_GRAY}20` }}
            >
              <ArrowUpRight style={{ width: '1.5rem', height: '1.5rem', color: BNI_GRAY }} />
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: '2.25rem', color: BNI_GRAY }}>
              {summary?.totalExternalReferrals || 0}
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: BNI_GRAY }}>外部引薦</p>
          </div>

          <div style={{ backgroundColor: `${BNI_GOLD}15`, borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1rem', textAlign: 'center' }}>
            <div
              style={{ width: '3rem', height: '3rem', margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: `${BNI_GOLD}30` }}
            >
              <Handshake style={{ width: '1.5rem', height: '1.5rem', color: BNI_GOLD }} />
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: '2.25rem', color: BNI_GOLD }}>
              {summary?.totalReferrals || 0}
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: BNI_GRAY }}>總引薦</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1rem', textAlign: 'center' }}>
            <div
              style={{ width: '3rem', height: '3rem', margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: '#dbeafe' }}
            >
              <Users style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} />
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: '2.25rem', color: '#2563eb' }}>
              {summary?.totalOneToOne || 0}
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: BNI_GRAY }}>一對一</p>
          </div>

          <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1rem', textAlign: 'center' }}>
            <div
              style={{ width: '3rem', height: '3rem', margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: '#dcfce7' }}
            >
              <UserPlus style={{ width: '1.5rem', height: '1.5rem', color: '#16a34a' }} />
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: '2.25rem', color: '#16a34a' }}>
              {summary?.totalGuests || 0}
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: BNI_GRAY }}>來賓</p>
          </div>
        </div>

        {/* 金額統計 */}
        <div style={{ borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', backgroundColor: '#ffffff' }}>
          <div style={{ height: '0.25rem', backgroundColor: BNI_RED }} />
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#f9fafb' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 500, color: BNI_GRAY }}>本期成交總金額</span>
                <span style={{ fontSize: '1.875rem', fontWeight: 900, color: BNI_RED }}>
                  {formatCurrency(summary?.totalTransactionValue || 0)} 元整
                </span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0.5rem', padding: '1rem', backgroundColor: BNI_RED, color: '#ffffff' }}
              >
                <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>{foundingYear}年成會至今累計</span>
                <span style={{ fontSize: '1.875rem', fontWeight: 900 }}>
                  {formatCurrency(totalCumulative)} 元整
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
