import { Link } from 'react-router-dom';
import { useWeeklyStore } from '@/store/weeklyStore';
import { useTrafficLightStore } from '@/store/trafficLightStore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Award,
  Gift,
  Upload,
  Calendar,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useMemo } from 'react';

// BNI 官方配色
const BNI_RED = '#C8102E';

export function Home() {
  const { currentReport } = useWeeklyStore();
  const { statuses, chapter } = useTrafficLightStore();
  const chapterName = currentReport?.chapter || chapter || '威鋒';

  const stats = useMemo(() => {
    const members = currentReport?.members || [];
    const trafficLights = statuses || [];

    const totalMembers = members.length || trafficLights.length;
    const greenCount = trafficLights.filter((s) => s.status === 'green').length;
    const yellowCount = trafficLights.filter((s) => s.status === 'yellow').length;
    const redCount = trafficLights.filter((s) => s.status === 'red').length;
    const greyCount = trafficLights.filter((s) => s.status === 'grey').length;

    const totalAttendance = members.reduce((sum, m) => sum + m.attendance, 0);
    const totalAbsence = members.reduce((sum, m) => sum + m.absence, 0);
    const avgAttendanceRate =
      totalMembers > 0 && totalAttendance + totalAbsence > 0
        ? ((totalAttendance / (totalAttendance + totalAbsence)) * 100).toFixed(1)
        : '0';

    const totalInternalRef = members.reduce((sum, m) => sum + m.internalReferralGiven, 0);
    const totalExternalRef = members.reduce((sum, m) => sum + m.externalReferralGiven, 0);
    const totalReferrals = totalInternalRef + totalExternalRef;
    const totalOneToOne = members.reduce((sum, m) => sum + m.oneToOne, 0);
    const totalGuests = members.reduce((sum, m) => sum + m.guests, 0);
    const totalTransaction = members.reduce((sum, m) => sum + m.transactionValue, 0);
    const totalEducation = members.reduce((sum, m) => sum + m.educationUnits, 0);

    const topReferrers = [...members]
      .sort((a, b) => (b.internalReferralGiven + b.externalReferralGiven) - (a.internalReferralGiven + a.externalReferralGiven))
      .slice(0, 5);
    const topOneToOne = [...members].sort((a, b) => b.oneToOne - a.oneToOne).slice(0, 5);
    const topGuests = [...members].sort((a, b) => b.guests - a.guests).slice(0, 5);
    const topTransaction = [...members].sort((a, b) => b.transactionValue - a.transactionValue).slice(0, 5);

    return {
      totalMembers, greenCount, yellowCount, redCount, greyCount,
      avgAttendanceRate, totalInternalRef, totalExternalRef, totalReferrals,
      totalOneToOne, totalGuests, totalTransaction, totalEducation,
      topReferrers, topOneToOne, topGuests, topTransaction,
    };
  }, [currentReport, statuses]);

  const hasData = stats.totalMembers > 0;
  const hasTrafficLight = statuses.length > 0;

  const formatMoney = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.round(num / 1000)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* 標題 */}
      <div className="p-4 text-white" style={{ backgroundColor: BNI_RED }}>
        <h1 className="text-lg font-bold">BNI {chapterName}分會</h1>
        <p className="text-sm text-white/70">會議數據展示系統</p>
      </div>

      {/* 統計區塊 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 總覽統計 */}
        <Card className="border rounded-none">
          <CardHeader className="py-3 px-4 bg-gray-50 border-b">
            <h2 className="text-sm font-semibold text-gray-700">總覽統計</h2>
          </CardHeader>
          <CardContent className="p-0">
            {hasData ? (
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-gray-600">會員總數</TableCell>
                    <TableCell className="text-right font-medium">{stats.totalMembers} 人</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-600">出席率</TableCell>
                    <TableCell className="text-right font-medium">{stats.avgAttendanceRate}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-600">總引薦數</TableCell>
                    <TableCell className="text-right font-medium">{stats.totalReferrals}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-600">一對一會面</TableCell>
                    <TableCell className="text-right font-medium">{stats.totalOneToOne}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-600">來賓人次</TableCell>
                    <TableCell className="text-right font-medium">{stats.totalGuests}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-600">教育學分</TableCell>
                    <TableCell className="text-right font-medium">{stats.totalEducation}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-600">交易總額</TableCell>
                    <TableCell className="text-right font-medium text-amber-600">${stats.totalTransaction.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-gray-400">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">尚未上傳數據</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 紅綠燈分佈 */}
        <Card className="border rounded-none">
          <CardHeader className="py-3 px-4 bg-gray-50 border-b">
            <h2 className="text-sm font-semibold text-gray-700">紅綠燈分佈</h2>
          </CardHeader>
          <CardContent className="p-0">
            {hasTrafficLight ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>燈號</TableHead>
                    <TableHead className="text-right">人數</TableHead>
                    <TableHead className="text-right">佔比</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        綠燈
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">{stats.greenCount}</TableCell>
                    <TableCell className="text-right text-gray-500">{stats.totalMembers ? Math.round(stats.greenCount / stats.totalMembers * 100) : 0}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500" />
                        黃燈
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-yellow-600">{stats.yellowCount}</TableCell>
                    <TableCell className="text-right text-gray-500">{stats.totalMembers ? Math.round(stats.yellowCount / stats.totalMembers * 100) : 0}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        紅燈
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">{stats.redCount}</TableCell>
                    <TableCell className="text-right text-gray-500">{stats.totalMembers ? Math.round(stats.redCount / stats.totalMembers * 100) : 0}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gray-400" />
                        灰燈
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-600">{stats.greyCount}</TableCell>
                    <TableCell className="text-right text-gray-500">{stats.totalMembers ? Math.round(stats.greyCount / stats.totalMembers * 100) : 0}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-gray-400">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">尚未上傳半年報</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 排行榜 */}
      {hasData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 引薦 Top 5 */}
          <Card className="border rounded-none">
            <CardHeader className="py-3 px-4 bg-purple-50 border-b">
              <h2 className="text-xs font-semibold text-purple-700">引薦 Top 5</h2>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {stats.topReferrers.map((m, i) => (
                    <TableRow key={m.id}>
                      <TableCell className="w-8 text-gray-400">{i + 1}</TableCell>
                      <TableCell className="truncate max-w-[100px]">{m.fullName}</TableCell>
                      <TableCell className="text-right font-medium text-purple-600">{m.internalReferralGiven + m.externalReferralGiven}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 一對一 Top 5 */}
          <Card className="border rounded-none">
            <CardHeader className="py-3 px-4 bg-blue-50 border-b">
              <h2 className="text-xs font-semibold text-blue-700">一對一 Top 5</h2>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {stats.topOneToOne.map((m, i) => (
                    <TableRow key={m.id}>
                      <TableCell className="w-8 text-gray-400">{i + 1}</TableCell>
                      <TableCell className="truncate max-w-[100px]">{m.fullName}</TableCell>
                      <TableCell className="text-right font-medium text-blue-600">{m.oneToOne}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 來賓 Top 5 */}
          <Card className="border rounded-none">
            <CardHeader className="py-3 px-4 bg-green-50 border-b">
              <h2 className="text-xs font-semibold text-green-700">來賓 Top 5</h2>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {stats.topGuests.map((m, i) => (
                    <TableRow key={m.id}>
                      <TableCell className="w-8 text-gray-400">{i + 1}</TableCell>
                      <TableCell className="truncate max-w-[100px]">{m.fullName}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">{m.guests}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 交易額 Top 5 */}
          <Card className="border rounded-none">
            <CardHeader className="py-3 px-4 bg-amber-50 border-b">
              <h2 className="text-xs font-semibold text-amber-700">交易額 Top 5</h2>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {stats.topTransaction.map((m, i) => (
                    <TableRow key={m.id}>
                      <TableCell className="w-8 text-gray-400">{i + 1}</TableCell>
                      <TableCell className="truncate max-w-[100px]">{m.fullName}</TableCell>
                      <TableCell className="text-right font-medium text-amber-600">{formatMoney(m.transactionValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 快速連結 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 展示頁面 */}
        <Card className="border rounded-none">
          <CardHeader className="py-3 px-4 bg-gray-50 border-b">
            <h2 className="text-sm font-semibold text-gray-700">展示頁面</h2>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            <Link to="/display/report" className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50">
              <FileText className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">週報展示</p>
                <p className="text-xs text-gray-500">查看本週會員數據報表</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </Link>
            <Link to="/display/honor" className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50">
              <Award className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">紅綠燈榮耀榜</p>
                <p className="text-xs text-gray-500">查看會員表現燈號</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </Link>
            <Link to="/lottery" className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50">
              <Gift className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">抽獎</p>
                <p className="text-xs text-gray-500">執行會議抽獎</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </Link>
          </CardContent>
        </Card>

        {/* 後台管理 */}
        <Card className="border rounded-none">
          <CardHeader className="py-3 px-4 bg-gray-50 border-b">
            <h2 className="text-sm font-semibold text-gray-700">後台管理</h2>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            <Link to="/admin/weekly" className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50">
              <Upload className="h-5 w-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">上傳週報</p>
                <p className="text-xs text-gray-500">上傳 PALMS 週報 PDF</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </Link>
            <Link to="/admin/half-year" className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">上傳半年報</p>
                <p className="text-xs text-gray-500">上傳半年報計算紅綠燈</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
