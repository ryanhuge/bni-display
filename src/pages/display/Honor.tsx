import { useRef, useMemo } from 'react';
import { useTrafficLightStore } from '@/store/trafficLightStore';
import { Award, Download, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

// BNI 官方配色
const BNI_RED = '#C8102E';
const BNI_GRAY = '#4A4A4A';
const GREEN = '#22c55e';
const YELLOW = '#eab308';

// 激勵話語列表，每周輪替
const motivationalQuotes = [
  '付出者收穫',
  '給予越多，收穫越多',
  '成功來自持續的行動',
  '一起成長，共創佳績',
  '信任是最好的引薦',
  '用心經營，成就非凡',
  '團結合作，共享成功',
  '每一次引薦都是信任的傳遞',
  '行動創造機會',
  '堅持不懈，必有回報',
];

// 根據年份的第幾周來選擇話語
function getWeeklyQuote(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return motivationalQuotes[weekNumber % motivationalQuotes.length];
}

export function Honor() {
  const { statuses, getMembersByStatus, chapter } = useTrafficLightStore();
  const captureRef = useRef<HTMLDivElement>(null);

  const greenMembers = getMembersByStatus('green');
  const yellowMembers = getMembersByStatus('yellow');

  // 取得本周的激勵話語
  const weeklyQuote = useMemo(() => getWeeklyQuote(), []);

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
      link.download = `BNI${chapter}紅綠燈榮耀榜_${new Date().toLocaleDateString('zh-TW')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('下載圖片失敗:', err);
    }
  };

  if (statuses.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full p-8" style={{ backgroundColor: `${BNI_RED}15` }}>
          <Award className="h-20 w-20" style={{ color: BNI_RED }} />
        </div>
        <h2 className="mt-6 text-2xl font-bold" style={{ color: BNI_GRAY }}>尚無紅綠燈資料</h2>
        <p className="mt-2 text-gray-500">
          請先至後台上傳半年報 PDF 檔案
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 下載按鈕 */}
      <div className="flex justify-end">
        <Button
          onClick={handleDownload}
          variant="outline"
          className="gap-2"
          style={{ borderColor: BNI_RED, color: BNI_RED }}
        >
          <Download className="h-4 w-4" />
          下載圖片
        </Button>
      </div>

      {/* 榮耀榜卡片 - 完全使用 inline styles */}
      <div
        ref={captureRef}
        style={{
          maxWidth: '56rem',
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          backgroundColor: '#ffffff'
        }}
      >
        {/* 標題區 - BNI 紅色 */}
        <div
          style={{
            backgroundColor: BNI_RED,
            padding: '1.5rem 2rem',
            textAlign: 'center',
            color: '#ffffff'
          }}
        >
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.05em', margin: 0 }}>
            BNI {chapter}分會 紅綠燈榮耀榜
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '1rem', opacity: 0.9, margin: 0 }}>
            {weeklyQuote}
          </p>
        </div>

        {/* 統計區 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ border: `2px solid ${GREEN}`, borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                margin: '0 auto 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                backgroundColor: `${GREEN}20`
              }}
            >
              <Users style={{ width: '1.75rem', height: '1.75rem', color: GREEN }} />
            </div>
            <p style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, color: GREEN }}>
              {greenMembers.length}
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: 600, color: BNI_GRAY }}>
              綠燈會員
            </p>
          </div>

          <div style={{ border: `2px solid ${YELLOW}`, borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                margin: '0 auto 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                backgroundColor: `${YELLOW}20`
              }}
            >
              <TrendingUp style={{ width: '1.75rem', height: '1.75rem', color: YELLOW }} />
            </div>
            <p style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, color: YELLOW }}>
              {yellowMembers.length}
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: 600, color: BNI_GRAY }}>
              黃燈會員
            </p>
          </div>
        </div>

        {/* 會員名單區 - 上下排列，全寬 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1.5rem 1.5rem' }}>
          {/* 綠燈會員 */}
          <div style={{ backgroundColor: `${GREEN}10`, borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${GREEN}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: GREEN }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: GREEN }} />
                綠燈榮耀會員
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem 2rem' }}>
                {greenMembers.length > 0 ? (
                  greenMembers.map((m) => (
                    <span key={m.id} style={{ fontSize: '1.125rem', fontWeight: 600, color: BNI_GRAY }}>
                      {m.memberName}
                    </span>
                  ))
                ) : (
                  <p style={{ fontSize: '1rem', color: '#9ca3af' }}>尚無綠燈會員</p>
                )}
              </div>
            </div>
          </div>

          {/* 黃燈會員 */}
          <div style={{ backgroundColor: `${YELLOW}10`, borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${YELLOW}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: YELLOW }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: YELLOW }} />
                黃燈努力中
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem 2rem' }}>
                {yellowMembers.length > 0 ? (
                  yellowMembers.map((m) => (
                    <span key={m.id} style={{ fontSize: '1.125rem', fontWeight: 600, color: BNI_GRAY }}>
                      {m.memberName}
                    </span>
                  ))
                ) : (
                  <p style={{ fontSize: '1rem', color: '#9ca3af' }}>尚無黃燈會員</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部裝飾條 - BNI 紅色 */}
        <div style={{ height: '0.5rem', backgroundColor: BNI_RED }} />
      </div>
    </div>
  );
}
