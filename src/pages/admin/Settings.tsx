import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Database, Info, Trash2, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export function Settings() {
  const supabaseConfigured = isSupabaseConfigured();

  const handleClearAllData = () => {
    if (confirm('確定要清除所有資料嗎？\n\n這將清除：\n- 週報資料\n- 紅綠燈資料\n- 抽獎記錄\n- 累計金額設定\n\n此操作無法復原！')) {
      // 清除 localStorage 中所有 BNI 相關資料
      localStorage.removeItem('bni-weekly-storage');
      localStorage.removeItem('bni-traffic-light-storage');
      localStorage.removeItem('bni-lottery-storage');

      alert('所有資料已清除！頁面將重新整理。');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">系統設定</h1>
        <p className="text-gray-600">查看與管理系統設定</p>
      </div>

      {/* 連線狀態 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            資料庫連線狀態
          </CardTitle>
        </CardHeader>
        <CardContent>
          {supabaseConfigured ? (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium text-green-800">Supabase 已連線</p>
                <p className="text-sm text-green-600">
                  多人同步功能已啟用
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div>
                <p className="font-medium text-yellow-800">使用本地儲存</p>
                <p className="text-sm text-yellow-600">
                  請設定 Supabase 環境變數以啟用多人同步
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 紅綠燈評分標準說明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            紅綠燈評分標準
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-semibold">出席 (0-20分)</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>0 次缺席 = 20分</li>
                <li>1 次缺席 = 15分</li>
                <li>2 次缺席 = 10分</li>
                <li>3 次以上 = 0分</li>
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-semibold">一對一 (0-15分)</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>每週 2+ 次 = 15分</li>
                <li>每週 1 次 = 10分</li>
                <li>每週 0.5 次 = 5分</li>
                <li>每週 0 次 = 0分</li>
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-semibold">培訓 (0-15分)</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>6+ 學分 = 15分</li>
                <li>4 學分 = 10分</li>
                <li>2 學分 = 5分</li>
                <li>0 學分 = 0分</li>
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-semibold">業務引薦 (0-20分)</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>每週 1.5+ 次 = 20分</li>
                <li>每週 1.2 次 = 15分</li>
                <li>每週 1 次 = 10分</li>
                <li>每週 0.75 次 = 5分</li>
                <li>每週 &lt;0.75 次 = 0分</li>
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-semibold">來賓 (0-15分)</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>每4週 2+ 人 = 15分</li>
                <li>每4週 1 人 = 10分</li>
                <li>每4週 0 人 = 0分</li>
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-semibold">引薦金額 (0-15分)</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>200萬以上 = 15分</li>
                <li>80萬-200萬 = 10分</li>
                <li>40萬-80萬 = 5分</li>
                <li>40萬以下 = 0分</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <h4 className="font-semibold text-blue-800">燈號判定</h4>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 rounded-full bg-green-500" />
                綠燈：70 分以上
              </span>
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 rounded-full bg-yellow-500" />
                黃燈：50-65 分
              </span>
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 rounded-full bg-red-500" />
                紅燈：30-45 分
              </span>
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 rounded-full bg-gray-500" />
                灰燈：25 分以下
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 清除資料 */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            危險區域
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">
            <div>
              <p className="font-medium text-red-800">清除所有資料</p>
              <p className="text-sm text-red-600">
                此操作將清除所有週報、紅綠燈、抽獎記錄等資料，且無法復原
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleClearAllData}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              清除所有資料
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 環境設定說明 */}
      {!supabaseConfigured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Supabase 設定說明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                若要啟用多人同步功能，請設定以下環境變數：
              </p>
              <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100">
                <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
                <p>VITE_SUPABASE_ANON_KEY=your-anon-key</p>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>步驟：</p>
                <ol className="list-inside list-decimal space-y-1">
                  <li>前往 supabase.com 建立免費帳號</li>
                  <li>建立新專案</li>
                  <li>在專案設定中找到 API 金鑰</li>
                  <li>複製 URL 和 anon key 到 .env 檔案</li>
                  <li>重新啟動開發伺服器</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
