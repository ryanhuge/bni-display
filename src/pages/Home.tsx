import { Link } from 'react-router-dom';
import { useWeeklyStore } from '@/store/weeklyStore';
import { useTrafficLightStore } from '@/store/trafficLightStore';
import {
  FileText,
  Award,
  Gift,
  Upload,
  Calendar,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Users,
  Handshake,
  UserPlus,
  GraduationCap,
  DollarSign,
  Zap,
} from 'lucide-react';
import { useMemo } from 'react';

// BNI 官方配色
const BNI_RED = '#C8102E';
const BNI_GOLD = '#B8860B';

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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 標題區塊 - 漸層背景 */}
      <div className="relative overflow-hidden rounded-2xl gradient-red p-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/5 blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">BNI {chapterName}分會</h1>
              <p className="text-white/80 text-sm mt-0.5">會議數據展示系統</p>
            </div>
          </div>
        </div>
      </div>

      {/* 統計概覽卡片 */}
      {hasData && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard icon={Users} label="會員總數" value={stats.totalMembers} suffix="人" color="#C8102E" />
          <StatCard icon={TrendingUp} label="出席率" value={stats.avgAttendanceRate} suffix="%" color="#16a34a" />
          <StatCard icon={Handshake} label="總引薦" value={stats.totalReferrals} color="#8b5cf6" />
          <StatCard icon={Users} label="一對一" value={stats.totalOneToOne} color="#3b82f6" />
          <StatCard icon={UserPlus} label="來賓" value={stats.totalGuests} color="#06b6d4" />
          <StatCard icon={GraduationCap} label="教育學分" value={stats.totalEducation} color="#f59e0b" />
          <StatCard icon={DollarSign} label="交易總額" value={formatMoney(stats.totalTransaction)} color={BNI_GOLD} />
        </div>
      )}

      {/* 主要統計區塊 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 總覽統計 */}
        <div className="card-modern">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${BNI_RED}15` }}>
              <FileText className="h-5 w-5" style={{ color: BNI_RED }} />
            </div>
            <h2 className="font-semibold text-gray-800">總覽統計</h2>
          </div>
          <div className="p-0">
            {hasData ? (
              <div className="divide-y divide-gray-50">
                <StatRow label="會員總數" value={`${stats.totalMembers} 人`} />
                <StatRow label="出席率" value={`${stats.avgAttendanceRate}%`} highlight />
                <StatRow label="內部引薦" value={stats.totalInternalRef} />
                <StatRow label="外部引薦" value={stats.totalExternalRef} />
                <StatRow label="總引薦數" value={stats.totalReferrals} highlight />
                <StatRow label="一對一會面" value={stats.totalOneToOne} />
                <StatRow label="來賓人次" value={stats.totalGuests} />
                <StatRow label="教育學分" value={stats.totalEducation} />
                <StatRow label="交易總額" value={`$${stats.totalTransaction.toLocaleString()}`} highlight color={BNI_GOLD} />
              </div>
            ) : (
              <EmptyState icon={AlertCircle} message="尚未上傳數據" />
            )}
          </div>
        </div>

        {/* 紅綠燈分佈 */}
        <div className="card-modern">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-800">紅綠燈分佈</h2>
          </div>
          <div className="p-0">
            {hasTrafficLight ? (
              <div className="p-5 space-y-4">
                <TrafficLightBar label="綠燈" count={stats.greenCount} total={stats.totalMembers} color="#22c55e" />
                <TrafficLightBar label="黃燈" count={stats.yellowCount} total={stats.totalMembers} color="#eab308" />
                <TrafficLightBar label="紅燈" count={stats.redCount} total={stats.totalMembers} color="#ef4444" />
                <TrafficLightBar label="灰燈" count={stats.greyCount} total={stats.totalMembers} color="#9ca3af" />
              </div>
            ) : (
              <EmptyState icon={AlertCircle} message="尚未上傳半年報" />
            )}
          </div>
        </div>
      </div>

      {/* 排行榜 */}
      {hasData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LeaderboardCard
            title="引薦 Top 5"
            icon={Handshake}
            color="#8b5cf6"
            bgColor="rgba(139, 92, 246, 0.1)"
            data={stats.topReferrers.map(m => ({ name: m.fullName, value: m.internalReferralGiven + m.externalReferralGiven }))}
          />
          <LeaderboardCard
            title="一對一 Top 5"
            icon={Users}
            color="#3b82f6"
            bgColor="rgba(59, 130, 246, 0.1)"
            data={stats.topOneToOne.map(m => ({ name: m.fullName, value: m.oneToOne }))}
          />
          <LeaderboardCard
            title="來賓 Top 5"
            icon={UserPlus}
            color="#16a34a"
            bgColor="rgba(22, 163, 74, 0.1)"
            data={stats.topGuests.map(m => ({ name: m.fullName, value: m.guests }))}
          />
          <LeaderboardCard
            title="交易額 Top 5"
            icon={DollarSign}
            color={BNI_GOLD}
            bgColor="rgba(184, 134, 11, 0.1)"
            data={stats.topTransaction.map(m => ({ name: m.fullName, value: formatMoney(m.transactionValue) }))}
          />
        </div>
      )}

      {/* 快速連結 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 展示頁面 */}
        <div className="card-modern">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${BNI_RED}15` }}>
              <FileText className="h-5 w-5" style={{ color: BNI_RED }} />
            </div>
            <h2 className="font-semibold text-gray-800">展示頁面</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <QuickLink
              to="/display/report"
              icon={FileText}
              iconColor={BNI_RED}
              title="週報展示"
              description="查看本週會員數據報表"
            />
            <QuickLink
              to="/display/honor"
              icon={Award}
              iconColor="#16a34a"
              title="紅綠燈榮耀榜"
              description="查看會員表現燈號"
            />
            <QuickLink
              to="/lottery"
              icon={Gift}
              iconColor="#8b5cf6"
              title="抽獎"
              description="執行會議抽獎"
            />
          </div>
        </div>

        {/* 後台管理 */}
        <div className="card-modern">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
              <Upload className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="font-semibold text-gray-800">後台管理</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <QuickLink
              to="/admin/weekly"
              icon={Upload}
              iconColor="#6b7280"
              title="上傳週報"
              description="上傳 PALMS 週報 PDF"
            />
            <QuickLink
              to="/admin/half-year"
              icon={Calendar}
              iconColor="#6b7280"
              title="上傳半年報"
              description="上傳半年報計算紅綠燈"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 統計卡片組件
function StatCard({ icon: Icon, label, value, suffix = '', color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  suffix?: string;
  color: string;
}) {
  return (
    <div className="card-modern p-4 flex flex-col items-center text-center">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl mb-2"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="stat-number text-2xl font-bold" style={{ color }}>{value}{suffix}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

// 統計行組件
function StatRow({ label, value, highlight = false, color }: {
  label: string;
  value: string | number;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div className={`flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50 ${highlight ? 'bg-gray-50/50' : ''}`}>
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-lg' : ''}`} style={color ? { color } : {}}>
        {value}
      </span>
    </div>
  );
}

// 紅綠燈進度條組件
function TrafficLightBar({ label, count, total, color }: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full shadow-sm"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
          />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color }}>{count}</span>
          <span className="text-sm text-gray-400">({percentage}%)</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

// 排行榜卡片組件
function LeaderboardCard({ title, icon: Icon, color, bgColor, data }: {
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  data: { name: string; value: string | number }[];
}) {
  return (
    <div className="card-modern">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2" style={{ backgroundColor: bgColor }}>
        <Icon className="h-4 w-4" style={{ color }} />
        <h3 className="text-sm font-semibold" style={{ color }}>{title}</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{
                backgroundColor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#e5e7eb',
                color: i < 3 ? 'white' : '#6b7280',
              }}
            >
              {i + 1}
            </span>
            <span className="flex-1 truncate text-sm text-gray-700">{item.name}</span>
            <span className="text-sm font-bold" style={{ color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 快速連結組件
function QuickLink({ to, icon: Icon, iconColor, title, description }: {
  to: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <Link to={to} className="link-card flex items-center gap-4 px-5 py-4">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300"
        style={{ backgroundColor: `${iconColor}12` }}
      >
        <Icon className="h-5 w-5" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <ChevronRight className="link-icon h-5 w-5 text-gray-300" />
    </Link>
  );
}

// 空狀態組件
function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-3">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
