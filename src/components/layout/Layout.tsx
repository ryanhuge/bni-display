import { Link, Outlet, useLocation } from 'react-router-dom';
import { useWeeklyStore } from '@/store/weeklyStore';
import { useTrafficLightStore } from '@/store/trafficLightStore';
import { cn } from '@/lib/utils';
import { SYSTEM_SIGNATURE } from '@/config/system';
import {
  LayoutDashboard,
  FileText,
  Award,
  Gift,
  Upload,
  Calendar,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

// BNI 官方配色
const BNI_RED = '#C8102E';
const BNI_RED_DARK = '#A00D24';

const navigation = [
  { name: '首頁', href: '/', icon: LayoutDashboard },
  { name: '週報展示', href: '/display/report', icon: FileText },
  { name: '紅綠燈榮耀榜', href: '/display/honor', icon: Award },
  { name: '抽獎', href: '/lottery', icon: Gift },
];

const adminNavigation = [
  { name: '週報上傳', href: '/admin/weekly', icon: Upload },
  { name: '半年報上傳', href: '/admin/half-year', icon: Calendar },
  { name: '系統設定', href: '/admin/settings', icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const { currentReport } = useWeeklyStore();
  const { chapter: trafficLightChapter } = useTrafficLightStore();
  // 優先使用週報的分會名稱，其次使用紅綠燈的分會名稱，最後使用預設值
  const chapterName = currentReport?.chapter || trafficLightChapter || '威鋒';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)' }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white shadow-2xl" style={{ borderRight: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex h-full flex-col">
          {/* Logo - 漸層背景 */}
          <div
            className="relative flex h-24 items-center justify-center overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${BNI_RED} 0%, ${BNI_RED_DARK} 100%)` }}
          >
            {/* 裝飾性圓形 */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/5 blur-lg" />

            <div className="relative text-center">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <h1 className="text-3xl font-black text-white tracking-widest">BNI</h1>
                <Sparkles className="h-5 w-5 text-yellow-300" />
              </div>
              <p className="mt-1 text-sm font-medium text-white/90">{chapterName}分會</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            {/* 展示頁面區塊 */}
            <div className="mb-6">
              <p
                className="mb-3 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider"
                style={{ color: BNI_RED }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BNI_RED }} />
                展示頁面
              </p>
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                        isActive
                          ? 'text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                      )}
                      style={isActive ? {
                        background: `linear-gradient(135deg, ${BNI_RED} 0%, ${BNI_RED_DARK} 100%)`,
                        boxShadow: `0 4px 15px ${BNI_RED}40`
                      } : {}}
                    >
                      <item.icon className={cn(
                        'h-5 w-5 transition-transform duration-300',
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'
                      )} />
                      <span className="flex-1">{item.name}</span>
                      {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 分隔線 */}
            <div className="mx-3 mb-6 border-t border-gray-100" />

            {/* 後台管理區塊 */}
            <div>
              <p className="mb-3 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                後台管理
              </p>
              <div className="space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                        isActive
                          ? 'bg-gray-800 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                      )}
                      style={isActive ? { boxShadow: '0 4px 15px rgba(0,0,0,0.2)' } : {}}
                    >
                      <item.icon className={cn(
                        'h-5 w-5 transition-transform duration-300',
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'
                      )} />
                      <span className="flex-1">{item.name}</span>
                      {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* 底部版權區 */}
          <div className="border-t border-gray-100 p-4">
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}
            >
              <p className="text-sm font-bold text-amber-800">Givers Gain</p>
              <p className="text-xs text-amber-600 mt-0.5">付出者收穫</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 系統簽名 - 固定在主內容區左下角（系統級，請勿修改） */}
      <div
        className="fixed bottom-2 z-50 select-none pointer-events-none"
        style={{
          left: '17rem',
          fontSize: '10px',
          color: '#9CA3AF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.02em',
          opacity: 0.7,
        }}
        data-system-signature="true"
        data-protected="true"
        aria-hidden="true"
      >
        {SYSTEM_SIGNATURE.text}
      </div>

      {/* Main content */}
      <main
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: '16rem' }}
      >
        {/* 頂部裝飾條 - 漸層 */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${BNI_RED} 0%, ${BNI_RED_DARK} 50%, ${BNI_RED} 100%)` }}
        />

        {/* 內容區 */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
