import { useState, useCallback } from 'react';
import { useTrafficLightStore } from '@/store/trafficLightStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Upload, Check, AlertCircle, Calculator, Trash2 } from 'lucide-react';
import { parsePalmsPdf } from '@/lib/pdf-parser';
import { getTrafficLightEmoji, getTrafficLightLabel } from '@/lib/traffic-light';
import type { Member, TrafficLightRawData } from '@/types';

interface ParsedData {
  chapter: string;
  dateFrom: string;
  dateTo: string;
  members: Member[];
}

interface MemberTrainingInput {
  memberName: string;
  trainingCredits: number;
}

export function HalfYearUpload() {
  const { statuses, addOrUpdateMember, updateTrainingCredits, setChapter, setStatuses } = useTrafficLightStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [trainingInputs, setTrainingInputs] = useState<MemberTrainingInput[]>([]);
  const [halfYearWeeks] = useState(26);

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
      // 初始化培訓學分輸入（使用 PDF 中的分會教育單位）
      setTrainingInputs(
        result.members.map((m) => ({
          memberName: m.fullName,
          trainingCredits: m.educationUnits || 0,
        }))
      );
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

  const handleTrainingChange = (memberName: string, value: number) => {
    setTrainingInputs((prev) =>
      prev.map((input) =>
        input.memberName === memberName
          ? { ...input, trainingCredits: value }
          : input
      )
    );
  };

  const calculateRawData = (member: Member, trainingCredits: number): TrafficLightRawData => {
    const totalReferrals = member.internalReferralGiven + member.externalReferralGiven;
    return {
      absenceCount: member.absence,
      oneToOnePerWeek: member.oneToOne / halfYearWeeks,
      trainingCredits,
      referralsPerWeek: totalReferrals / halfYearWeeks,
      guestsPer4Weeks: (member.guests / halfYearWeeks) * 4,
      referralAmountTotal: member.transactionValue,
    };
  };

  const handleConfirm = () => {
    if (parsedData) {
      // 保存分會名稱
      setChapter(parsedData.chapter);

      parsedData.members.forEach((member) => {
        const trainingInput = trainingInputs.find(
          (t) => t.memberName === member.fullName
        );
        const rawData = calculateRawData(
          member,
          trainingInput?.trainingCredits || 0
        );
        addOrUpdateMember(member.fullName, rawData);
      });
      setParsedData(null);
      setTrainingInputs([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 標題區塊 */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">半年報 PDF 上傳</h1>
              <p className="text-white/80 text-sm mt-0.5">上傳半年期 PALMS 報告以計算紅綠燈狀態</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 border-0 rounded-xl"
            onClick={() => {
              if (confirm('確定要清除所有紅綠燈資料嗎？')) {
                setStatuses([]);
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            清除紅綠燈資料
          </Button>
        </div>
      </div>

      {/* 目前紅綠燈狀態 */}
      {statuses.length > 0 && (
        <div className="card-modern overflow-hidden">
          <div className="flex items-center gap-4 p-5" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)' }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-800">
                目前已有 {statuses.length} 位會員的紅綠燈資料
              </p>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  {getTrafficLightEmoji('green')} {statuses.filter((s) => s.status === 'green').length}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  {getTrafficLightEmoji('yellow')} {statuses.filter((s) => s.status === 'yellow').length}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  {getTrafficLightEmoji('red')} {statuses.filter((s) => s.status === 'red').length}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {getTrafficLightEmoji('grey')} {statuses.filter((s) => s.status === 'grey').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 上傳區域 */}
      <div className="card-modern">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
            <Upload className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="font-semibold text-gray-800">上傳半年報 PDF</h2>
        </div>
        <div className="p-5">
          <div
            className={`
              flex min-h-[220px] cursor-pointer flex-col items-center justify-center
              rounded-2xl border-2 border-dashed transition-all duration-300
              ${isDragging ? 'border-green-500 bg-green-50 scale-[1.02]' : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'}
              ${isLoading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('half-year-pdf-input')?.click()}
          >
            <input
              id="half-year-pdf-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileInput}
            />
            {isLoading ? (
              <div className="text-center">
                <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
                <p className="text-gray-600 font-medium">解析中...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-700">拖曳半年報 PDF 檔案至此處</p>
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

      {/* 預覽與培訓學分輸入 */}
      {parsedData && (
        <div className="card-modern overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <Calculator className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">解析結果 - 請輸入培訓學分</h2>
                <p className="text-sm text-gray-500">
                  {parsedData.chapter} | {parsedData.dateFrom} - {parsedData.dateTo}
                </p>
              </div>
            </div>
            <Button onClick={handleConfirm} className="rounded-xl px-5 transition-all duration-300 hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' }}>
              <Check className="mr-2 h-4 w-4" />
              計算並儲存
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">姓名</TableHead>
                  <TableHead className="text-center font-semibold">缺席</TableHead>
                  <TableHead className="text-center font-semibold">一對一</TableHead>
                  <TableHead className="text-center font-semibold">引薦</TableHead>
                  <TableHead className="text-center font-semibold">來賓</TableHead>
                  <TableHead className="text-center font-semibold">交易金額</TableHead>
                  <TableHead className="text-center font-semibold">培訓學分</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.members.map((member) => {
                  const trainingInput = trainingInputs.find(
                    (t) => t.memberName === member.fullName
                  );
                  return (
                    <TableRow key={member.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{member.fullName}</TableCell>
                      <TableCell className="text-center">{member.absence}</TableCell>
                      <TableCell className="text-center">{member.oneToOne}</TableCell>
                      <TableCell className="text-center">
                        {member.internalReferralGiven + member.externalReferralGiven}
                      </TableCell>
                      <TableCell className="text-center">{member.guests}</TableCell>
                      <TableCell className="text-center font-semibold text-amber-600">
                        ${member.transactionValue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          className="w-20 text-center rounded-lg"
                          value={trainingInput?.trainingCredits || 0}
                          onChange={(e) =>
                            handleTrainingChange(
                              member.fullName,
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* 現有會員培訓學分調整 */}
      {statuses.length > 0 && !parsedData && (
        <div className="card-modern overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <Calculator className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="font-semibold text-gray-800">調整培訓學分</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">姓名</TableHead>
                  <TableHead className="text-center font-semibold">燈號</TableHead>
                  <TableHead className="text-center font-semibold">總分</TableHead>
                  <TableHead className="text-center font-semibold">出席</TableHead>
                  <TableHead className="text-center font-semibold">一對一</TableHead>
                  <TableHead className="text-center font-semibold">培訓</TableHead>
                  <TableHead className="text-center font-semibold">引薦</TableHead>
                  <TableHead className="text-center font-semibold">來賓</TableHead>
                  <TableHead className="text-center font-semibold">金額</TableHead>
                  <TableHead className="text-center font-semibold">培訓學分</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.map((status) => (
                  <TableRow key={status.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{status.memberName}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                        status.status === 'green' ? 'bg-green-100 text-green-700' :
                        status.status === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        status.status === 'red' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {getTrafficLightEmoji(status.status)}
                        {getTrafficLightLabel(status.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">{status.scores.total}</span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {status.scores.attendance}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {status.scores.oneToOne}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {status.scores.training}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {status.scores.referrals}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {status.scores.guests}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {status.scores.referralAmount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        className="w-20 text-center rounded-lg"
                        value={status.rawData.trainingCredits}
                        onChange={(e) =>
                          updateTrainingCredits(
                            status.memberName,
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
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
