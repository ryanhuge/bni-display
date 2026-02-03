import { useState, useCallback } from 'react';
import { useWeeklyStore } from '@/store/weeklyStore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { parsePalmsPdf } from '@/lib/pdf-parser';
import type { Member } from '@/types';

interface ParsedData {
  chapter: string;
  dateFrom: string;
  dateTo: string;
  generatedAt: string;
  members: Member[];
}

export function WeeklyUpload() {
  const { addReport, currentReport, cumulativeAmount, setCumulativeAmount, foundingYear, setFoundingYear } = useWeeklyStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [cumulativeInput, setCumulativeInput] = useState(cumulativeAmount.toString());
  const [yearInput, setYearInput] = useState(foundingYear.toString());

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('請上傳 PDF 檔案');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await parsePalmsPdf(file);
      setParsedData(result);
    } catch (err) {
      console.error('PDF 解析錯誤:', err);
      setError('PDF 解析失敗，請確認檔案格式是否正確');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleConfirm = () => {
    if (parsedData) {
      addReport(parsedData);
      setParsedData(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 標題區塊 */}
      <div className="relative overflow-hidden rounded-2xl gradient-red p-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">週報 PDF 上傳</h1>
            <p className="text-white/80 text-sm mt-0.5">上傳 PALMS 週報 PDF 檔案以匯入會員數據</p>
          </div>
        </div>
      </div>

      {/* 目前報告狀態 */}
      {currentReport && (
        <div className="card-modern overflow-hidden">
          <div className="flex items-center gap-4 p-5" style={{ background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)' }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800">目前已載入報告</p>
              <p className="text-sm text-green-600">
                {currentReport.chapter} | {currentReport.dateFrom} - {currentReport.dateTo}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 累計金額設定 */}
      <div className="card-modern">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="font-semibold text-gray-800">成會至今累計金額（不含本次）</h2>
        </div>
        <div className="p-5 space-y-4">
          {/* 成會年份設定 */}
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-gray-50">
            <label className="text-sm font-medium text-gray-700 w-24">成會年份</label>
            <input
              type="number"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="w-32 rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="民國年"
            />
            <span className="text-gray-500">年</span>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                const value = parseInt(yearInput) || 104;
                setFoundingYear(value);
              }}
            >
              儲存年份
            </Button>
            <span className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg">
              目前設定: 民國 {foundingYear} 年
            </span>
          </div>
          {/* 累計金額設定 */}
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-gray-50">
            <label className="text-sm font-medium text-gray-700 w-24">累計金額</label>
            <input
              type="number"
              value={cumulativeInput}
              onChange={(e) => setCumulativeInput(e.target.value)}
              className="w-64 rounded-xl border border-gray-200 px-4 py-2.5 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="輸入累計金額"
            />
            <Button className="rounded-xl" onClick={() => {
              const value = parseInt(cumulativeInput) || 0;
              setCumulativeAmount(value);
            }}>
              儲存金額
            </Button>
            <span className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg">
              目前設定: ${cumulativeAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 上傳區域 */}
      <div className="card-modern">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <Upload className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-gray-800">上傳 PDF</h2>
        </div>
        <div className="p-5">
          <div
            className={`
              flex min-h-[220px] cursor-pointer flex-col items-center justify-center
              rounded-2xl border-2 border-dashed transition-all duration-300
              ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}
              ${isLoading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pdf-input')?.click()}
          >
            <input
              id="pdf-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileInput}
            />
            {isLoading ? (
              <div className="text-center">
                <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="text-gray-600 font-medium">解析中...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-700">拖曳 PDF 檔案至此處</p>
                <p className="text-sm text-gray-500 mt-1">或點擊選擇檔案</p>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* 預覽區域 */}
      {parsedData && (
        <div className="card-modern overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">解析結果預覽</h2>
                <p className="text-sm text-gray-500">
                  {parsedData.chapter} | {parsedData.dateFrom} - {parsedData.dateTo}
                </p>
              </div>
            </div>
            <Button onClick={handleConfirm} className="rounded-xl px-5 transition-all duration-300 hover:scale-105 shadow-lg">
              <Check className="mr-2 h-4 w-4" />
              確認匯入
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">姓名</TableHead>
                  <TableHead className="text-center font-semibold">出席</TableHead>
                  <TableHead className="text-center font-semibold">缺席</TableHead>
                  <TableHead className="text-center font-semibold">內部引薦</TableHead>
                  <TableHead className="text-center font-semibold">外部引薦</TableHead>
                  <TableHead className="text-center font-semibold">來賓</TableHead>
                  <TableHead className="text-center font-semibold">一對一</TableHead>
                  <TableHead className="text-right font-semibold">交易價值</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.members.map((member) => (
                  <TableRow key={member.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{member.fullName}</TableCell>
                    <TableCell className="text-center">{member.attendance}</TableCell>
                    <TableCell className="text-center">{member.absence}</TableCell>
                    <TableCell className="text-center">{member.internalReferralGiven}</TableCell>
                    <TableCell className="text-center">{member.externalReferralGiven}</TableCell>
                    <TableCell className="text-center">{member.guests}</TableCell>
                    <TableCell className="text-center">{member.oneToOne}</TableCell>
                    <TableCell className="text-right font-semibold text-amber-600">
                      ${member.transactionValue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
