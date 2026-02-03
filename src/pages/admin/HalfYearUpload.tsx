import { useState, useCallback } from 'react';
import { useTrafficLightStore } from '@/store/trafficLightStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">半年報 PDF 上傳</h1>
          <p className="text-gray-600">上傳半年期 PALMS 報告以計算紅綠燈狀態</p>
        </div>
        <Button
          variant="destructive"
          size="sm"
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

      {/* 目前紅綠燈狀態 */}
      {statuses.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">
                  目前已有 {statuses.length} 位會員的紅綠燈資料
                </p>
                <p className="text-sm text-blue-600">
                  {getTrafficLightEmoji('green')} {statuses.filter((s) => s.status === 'green').length} 位 |
                  {getTrafficLightEmoji('yellow')} {statuses.filter((s) => s.status === 'yellow').length} 位 |
                  {getTrafficLightEmoji('red')} {statuses.filter((s) => s.status === 'red').length} 位 |
                  {getTrafficLightEmoji('grey')} {statuses.filter((s) => s.status === 'grey').length} 位
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 上傳區域 */}
      <Card>
        <CardHeader>
          <CardTitle>上傳半年報 PDF</CardTitle>
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
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-gray-600">解析中...</p>
              </div>
            ) : (
              <>
                <Upload className="mb-4 h-12 w-12 text-gray-400" />
                <p className="text-lg font-medium">拖曳半年報 PDF 檔案至此處</p>
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

      {/* 預覽與培訓學分輸入 */}
      {parsedData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>解析結果 - 請輸入培訓學分</CardTitle>
              <p className="mt-1 text-sm text-gray-600">
                {parsedData.chapter} | {parsedData.dateFrom} - {parsedData.dateTo}
              </p>
            </div>
            <Button onClick={handleConfirm}>
              <Check className="mr-2 h-4 w-4" />
              計算並儲存
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead className="text-center">缺席</TableHead>
                  <TableHead className="text-center">一對一</TableHead>
                  <TableHead className="text-center">引薦</TableHead>
                  <TableHead className="text-center">來賓</TableHead>
                  <TableHead className="text-center">交易金額</TableHead>
                  <TableHead className="text-center">培訓學分</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.members.map((member) => {
                  const trainingInput = trainingInputs.find(
                    (t) => t.memberName === member.fullName
                  );
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.fullName}</TableCell>
                      <TableCell className="text-center">{member.absence}</TableCell>
                      <TableCell className="text-center">{member.oneToOne}</TableCell>
                      <TableCell className="text-center">
                        {member.internalReferralGiven + member.externalReferralGiven}
                      </TableCell>
                      <TableCell className="text-center">{member.guests}</TableCell>
                      <TableCell className="text-center">
                        ${member.transactionValue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          className="w-20 text-center"
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
          </CardContent>
        </Card>
      )}

      {/* 現有會員培訓學分調整 */}
      {statuses.length > 0 && !parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>調整培訓學分</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead className="text-center">燈號</TableHead>
                  <TableHead className="text-center">總分</TableHead>
                  <TableHead className="text-center">出席</TableHead>
                  <TableHead className="text-center">一對一</TableHead>
                  <TableHead className="text-center">培訓</TableHead>
                  <TableHead className="text-center">引薦</TableHead>
                  <TableHead className="text-center">來賓</TableHead>
                  <TableHead className="text-center">金額</TableHead>
                  <TableHead className="text-center">培訓學分</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.map((status) => (
                  <TableRow key={status.id}>
                    <TableCell className="font-medium">{status.memberName}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1">
                        {getTrafficLightEmoji(status.status)}
                        {getTrafficLightLabel(status.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {status.scores.total}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {status.scores.attendance}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {status.scores.oneToOne}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {status.scores.training}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {status.scores.referrals}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {status.scores.guests}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {status.scores.referralAmount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        className="w-20 text-center"
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
