import { Link, Outlet, useLocation } from 'react-router-dom';
import { useWeeklyStore } from '@/store/weeklyStore';
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
} from 'lucide-react';

// BNI 官方配色
const BNI_RED = '#C8102E';

const navigation = [
  { name: '首頁', href: '/', icon: LayoutDashboard },
  { name: '週報展示', href: '/display/report', icon: FileText },
  { name: '紅綠燈榮耀榜', href: '/display/honor', icon: Award },
  { name: '抽獎', href: '/lottery', icon: Gift },
];

const adminNavigation = [
  { name: '週報上傳', href: '/admin/weekly', icon: Upload },
  { name: '半年報上傳', href: '/admin/half-year', icon: Calendar },
  { name: '系統設定與佈署說明', href: '/admin/settings', icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const { currentReport } = useWeeklyStore();
  const chapterName = currentReport?.chapter || '威鋒';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div
            className="flex h-20 items-center justify-center border-b"
            style={{ backgroundColor: BNI_RED }}
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-wider">BNI</h1>
              <p className="text-sm text-white/80">{chapterName}分會</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            {/* 展示頁面區塊 */}
            <div className="mb-6 px-4">
              <p
                className="mb-3 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider"
                style={{ color: BNI_RED }}
              >
                <span className="h-1 w-4 rounded-full" style={{ backgroundColor: BNI_RED }} />
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
                        'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      style={isActive ? { backgroundColor: BNI_RED } : {}}
                    >
                      <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600')} />
                      <span className="flex-1">{item.name}</span>
                      {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 分隔線 */}
            <div className="mx-6 mb-6 border-t border-gray-200" />

            {/* 後台管理區塊 */}
            <div className="px-4">
              <p className="mb-3 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span className="h-1 w-4 rounded-full bg-gray-300" />
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
                        'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-gray-800 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600')} />
                      <span className="flex-1">{item.name}</span>
                      {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* 底部版權區 */}
          <div className="border-t border-gray-200 p-4">
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-500">Givers Gain</p>
              <p className="text-xs text-gray-400">付出者收穫</p>
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
        {/* 頂部裝飾條 */}
        <div className="h-1 w-full" style={{ backgroundColor: BNI_RED }} />

        {/* 內容區 */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
