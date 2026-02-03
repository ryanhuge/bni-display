import { useState, useCallback } from 'react';
import { useWeeklyStore } from '@/store/weeklyStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
      <div>
        <h1 className="text-2xl font-bold">週報 PDF 上傳</h1>
        <p className="text-gray-600">上傳 PALMS 週報 PDF 檔案以匯入會員數據</p>
      </div>

      {/* 目前報告狀態 */}
      {currentReport && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 py-4">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">目前已載入報告</p>
              <p className="text-sm text-green-600">
                {currentReport.chapter} | {currentReport.dateFrom} - {currentReport.dateTo}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 累計金額設定 */}
      <Card>
        <CardHeader>
          <CardTitle>成會至今累計金額（不含本次）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 成會年份設定 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-24">成會年份</label>
            <input
              type="number"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="w-32 rounded-lg border border-gray-300 px-4 py-2"
              placeholder="民國年"
            />
            <span className="text-gray-500">年</span>
            <Button
              variant="outline"
              onClick={() => {
                const value = parseInt(yearInput) || 104;
                setFoundingYear(value);
              }}
            >
              儲存年份
            </Button>
            <span className="text-gray-500">
              目前設定: 民國 {foundingYear} 年
            </span>
          </div>
          {/* 累計金額設定 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-24">累計金額</label>
            <input
              type="number"
              value={cumulativeInput}
              onChange={(e) => setCumulativeInput(e.target.value)}
              className="w-64 rounded-lg border border-gray-300 px-4 py-2 text-lg"
              placeholder="輸入累計金額"
            />
            <Button
              onClick={() => {
                const value = parseInt(cumulativeInput) || 0;
                setCumulativeAmount(value);
              }}
            >
              儲存金額
            </Button>
            <span className="text-gray-500">
              目前設定: ${cumulativeAmount.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 上傳區域 */}
      <Card>
        <CardHeader>
          <CardTitle>上傳 PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              flex min-h-[200px] cursor-pointer flex-col items-center justify-center
              rounded-lg border-2 border-dashed transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
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
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-gray-600">解析中...</p>
              </div>
            ) : (
              <>
                <Upload className="mb-4 h-12 w-12 text-gray-400" />
                <p className="text-lg font-medium">拖曳 PDF 檔案至此處</p>
                <p className="text-sm text-gray-500">或點擊選擇檔案</p>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 預覽區域 */}
      {parsedData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                解析結果預覽
              </CardTitle>
              <p className="mt-1 text-sm text-gray-600">
                {parsedData.chapter} | {parsedData.dateFrom} - {parsedData.dateTo}
              </p>
            </div>
            <Button onClick={handleConfirm}>
              <Check className="mr-2 h-4 w-4" />
              確認匯入
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead className="text-center">出席</TableHead>
                  <TableHead className="text-center">缺席</TableHead>
                  <TableHead className="text-center">內部引薦</TableHead>
                  <TableHead className="text-center">外部引薦</TableHead>
                  <TableHead className="text-center">來賓</TableHead>
                  <TableHead className="text-center">一對一</TableHead>
                  <TableHead className="text-right">交易價值</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.fullName}</TableCell>
                    <TableCell className="text-center">{member.attendance}</TableCell>
                    <TableCell className="text-center">{member.absence}</TableCell>
                    <TableCell className="text-center">{member.internalReferralGiven}</TableCell>
                    <TableCell className="text-center">{member.externalReferralGiven}</TableCell>
                    <TableCell className="text-center">{member.guests}</TableCell>
                    <TableCell className="text-center">{member.oneToOne}</TableCell>
                    <TableCell className="text-right">
                      ${member.transactionValue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
