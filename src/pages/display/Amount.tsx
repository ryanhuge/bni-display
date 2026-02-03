import { useRef } from 'react';
import { useAmountStore } from '@/store/amountStore';
import { useWeeklyStore } from '@/store/weeklyStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Download, ArrowDownRight, ArrowUpRight, Handshake, Users, UserPlus, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';

// BNI 官方配色
const BNI_RED = '#C8102E';
const BNI_GRAY = '#4A4A4A';
const BNI_GOLD = '#B8860B';

export function Amount() {
  const { currentAmount } = useAmountStore();
  const { foundingYear } = useWeeklyStore();
  const captureRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!captureRef.current) return;

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `BNI威鋒金額統計_${currentAmount?.period || ''}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('下載圖片失敗:', err);
    }
  };

  if (!currentAmount) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full p-8" style={{ backgroundColor: `${BNI_RED}15` }}>
          <DollarSign className="h-20 w-20" style={{ color: BNI_RED }} />
        </div>
        <h2 className="mt-6 text-2xl font-bold" style={{ color: BNI_GRAY }}>尚無金額資料</h2>
        <p className="mt-2 text-gray-500">
          請先至後台輸入引薦金額統計
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

      {/* 主要統計卡片 - BNI 配色 */}
      <div
        ref={captureRef}
        className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* 標題區 - BNI 紅色 */}
        <div
          className="px-8 py-6 text-center text-white"
          style={{ backgroundColor: BNI_RED }}
        >
          <h1 className="text-3xl font-bold">BNI 分會</h1>
          <h2 className="mt-2 text-xl font-medium text-white/90">引薦金額統計</h2>
          <p className="mt-1 text-white/70">{currentAmount.period}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* 統計數字 - 第一行 */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-md" style={{ backgroundColor: `${BNI_RED}08` }}>
              <CardContent className="p-4 text-center">
                <div
                  className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${BNI_RED}20` }}
                >
                  <ArrowDownRight className="h-5 w-5" style={{ color: BNI_RED }} />
                </div>
                <p className="text-3xl font-bold" style={{ color: BNI_RED }}>
                  {currentAmount.internalReferral}
                </p>
                <p className="text-xs font-medium" style={{ color: BNI_GRAY }}>內部引薦</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md" style={{ backgroundColor: `${BNI_GRAY}08` }}>
              <CardContent className="p-4 text-center">
                <div
                  className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${BNI_GRAY}20` }}
                >
                  <ArrowUpRight className="h-5 w-5" style={{ color: BNI_GRAY }} />
                </div>
                <p className="text-3xl font-bold" style={{ color: BNI_GRAY }}>
                  {currentAmount.externalReferral}
                </p>
                <p className="text-xs font-medium" style={{ color: BNI_GRAY }}>外部引薦</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md" style={{ backgroundColor: `${BNI_GOLD}15` }}>
              <CardContent className="p-4 text-center">
                <div
                  className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${BNI_GOLD}30` }}
                >
                  <Handshake className="h-5 w-5" style={{ color: BNI_GOLD }} />
                </div>
                <p className="text-3xl font-bold" style={{ color: BNI_GOLD }}>
                  {currentAmount.totalReferral}
                </p>
                <p className="text-xs font-medium" style={{ color: BNI_GRAY }}>總引薦</p>
              </CardContent>
            </Card>
          </div>

          {/* 統計數字 - 第二行 */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 shadow-md bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {currentAmount.oneToOne}
                </p>
                <p className="text-xs font-medium" style={{ color: BNI_GRAY }}>一對一</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <UserPlus className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {currentAmount.guests}
                </p>
                <p className="text-xs font-medium" style={{ color: BNI_GRAY }}>來賓</p>
              </CardContent>
            </Card>
          </div>

          {/* 成交金額 */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1" style={{ backgroundColor: BNI_GOLD }} />
            <CardContent className="p-6 text-center bg-gradient-to-br from-amber-50 to-yellow-50">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: `${BNI_GOLD}20` }}>
                <DollarSign className="h-7 w-7" style={{ color: BNI_GOLD }} />
              </div>
              <p className="text-sm font-medium" style={{ color: BNI_GRAY }}>成交總金額</p>
              <p className="text-4xl font-black" style={{ color: BNI_GOLD }}>
                {formatCurrency(currentAmount.totalAmount)} 元
              </p>
            </CardContent>
          </Card>

          {/* 累計金額 */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardContent
              className="p-6 text-center text-white"
              style={{ backgroundColor: BNI_RED }}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <TrendingUp className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-white/80">{foundingYear}年成會至今累計</p>
              <p className="text-5xl font-black">
                {formatCurrency(currentAmount.cumulativeAmount)} 元
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
