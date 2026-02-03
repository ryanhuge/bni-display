import { useState, useEffect } from 'react';
import { useAmountStore } from '@/store/amountStore';
import { useWeeklyStore } from '@/store/weeklyStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, DollarSign, AlertCircle, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function AmountInput() {
  const { currentAmount, saveAmount } = useAmountStore();
  const { currentReport, getReportSummary, foundingYear } = useWeeklyStore();

  const summary = getReportSummary();

  // 從週報自動計算的數據
  const autoData = {
    period: currentReport ? `${currentReport.dateFrom} - ${currentReport.dateTo}` : '',
    internalReferral: summary?.totalInternalReferrals || 0,
    externalReferral: summary?.totalExternalReferrals || 0,
    totalReferral: summary?.totalReferrals || 0,
    oneToOne: summary?.totalOneToOne || 0,
    guests: summary?.totalGuests || 0,
    totalAmount: summary?.totalTransactionValue || 0,
  };

  // 只有累計金額需要手動輸入
  const [cumulativeAmount, setCumulativeAmount] = useState(
    currentAmount?.cumulativeAmount || 0
  );

  // 當 currentAmount 改變時更新累計金額
  useEffect(() => {
    if (currentAmount?.cumulativeAmount) {
      setCumulativeAmount(currentAmount.cumulativeAmount);
    }
  }, [currentAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAmount({
      ...autoData,
      cumulativeAmount,
    });
  };

  const hasWeeklyData = Boolean(currentReport && summary);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">引薦金額輸入</h1>
        <p className="text-gray-600">數據自動從週報提取，僅需輸入累計金額</p>
      </div>

      {/* 目前資料狀態 */}
      {currentAmount && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">已儲存資料</p>
              <p className="text-sm text-green-600">
                統計區間：{currentAmount.period} | 累計：$
                {formatCurrency(currentAmount.cumulativeAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 週報資料狀態 */}
      {!hasWeeklyData ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">尚未上傳週報</p>
              <p className="text-sm text-yellow-600">
                請先至「上傳週報」頁面上傳 PALMS 週報 PDF，系統將自動提取數據。
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center gap-3 py-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">週報資料已載入</p>
              <p className="text-sm text-blue-600">
                分會：{currentReport?.chapter} | 統計區間：{autoData.period}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 自動提取的數據顯示 */}
      <Card>
        <CardHeader>
          <CardTitle>自動提取數據（來自週報）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 統計區間 */}
          <div>
            <Label>統計區間</Label>
            <Input
              value={autoData.period || '尚未載入週報'}
              disabled
              className="bg-gray-100"
            />
          </div>

          {/* 引薦數據 */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>內部引薦</Label>
              <Input
                type="number"
                value={autoData.internalReferral}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label>外部引薦</Label>
              <Input
                type="number"
                value={autoData.externalReferral}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label>總引薦</Label>
              <Input
                type="number"
                value={autoData.totalReferral}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          {/* 其他數據 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>一對一</Label>
              <Input
                type="number"
                value={autoData.oneToOne}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label>來賓</Label>
              <Input
                type="number"
                value={autoData.guests}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          {/* 成交金額 */}
          <div>
            <Label>成交總金額</Label>
            <Input
              type="number"
              value={autoData.totalAmount}
              disabled
              className="bg-gray-100"
            />
            {autoData.totalAmount > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                ${formatCurrency(autoData.totalAmount)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 手動輸入區域 */}
      <Card>
        <CardHeader>
          <CardTitle>手動輸入</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="cumulativeAmount">{foundingYear}年成會至今累計</Label>
              <Input
                id="cumulativeAmount"
                type="number"
                min="0"
                value={cumulativeAmount}
                onChange={(e) => setCumulativeAmount(parseInt(e.target.value) || 0)}
                placeholder="請輸入累計金額"
              />
              {cumulativeAmount > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  ${formatCurrency(cumulativeAmount)}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={!hasWeeklyData}>
              <Check className="mr-2 h-4 w-4" />
              {hasWeeklyData ? '儲存' : '請先上傳週報'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
