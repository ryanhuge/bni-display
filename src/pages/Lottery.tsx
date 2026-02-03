import { useState, useEffect, useRef, useCallback } from 'react';
import { useWeeklyStore } from '@/store/weeklyStore';
import { useLotteryStore } from '@/store/lotteryStore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Gift, RotateCcw, Trophy, Sparkles, Users, Ticket, Crown, Play, Square, Volume2, VolumeX, Music, Music2, Plus, Minus } from 'lucide-react';
import type { LotteryCandidate } from '@/types';

// BNI 官方配色
const BNI_RED = '#C8102E';
const BNI_GRAY = '#4A4A4A';
const BNI_GOLD = '#B8860B';

export function Lottery() {
  const { currentReport } = useWeeklyStore();
  const {
    candidates,
    setCandidates,
    drawWinner,
    drawMultipleWinners,
    excludeWinners,
    setExcludeWinners,
    getSessionRecords,
    startNewSession,
  } = useLotteryStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWinners, setCurrentWinners] = useState<string[]>([]); // 本輪抽出的所有得獎者
  const [showWinner, setShowWinner] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true); // 背景音樂開關
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [winnersCount, setWinnersCount] = useState(1); // 本次要抽出的人數
  const [currentDrawIndex, setCurrentDrawIndex] = useState(0); // 目前抽到第幾位

  // 音效 refs - 使用 HTMLAudioElement refs
  const rollingAudioRef = useRef<HTMLAudioElement>(null);
  const winAudioRef = useRef<HTMLAudioElement>(null);
  const bgmAudioRef = useRef<HTMLAudioElement>(null);

  // 抽獎動畫 ref
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const sessionRecords = getSessionRecords();

  // 初始化音效（需要使用者互動後才能播放）
  const initAudio = useCallback(() => {
    if (audioInitialized) return;

    // 預載音效
    if (rollingAudioRef.current) {
      rollingAudioRef.current.load();
    }
    if (winAudioRef.current) {
      winAudioRef.current.load();
    }
    if (bgmAudioRef.current) {
      bgmAudioRef.current.load();
    }

    setAudioInitialized(true);
  }, [audioInitialized]);

  // 清理音效
  useEffect(() => {
    return () => {
      if (rollingAudioRef.current) {
        rollingAudioRef.current.pause();
        rollingAudioRef.current.currentTime = 0;
      }
      if (winAudioRef.current) {
        winAudioRef.current.pause();
        winAudioRef.current.currentTime = 0;
      }
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  // 從週報生成候選人
  useEffect(() => {
    if (currentReport) {
      const newCandidates: LotteryCandidate[] = currentReport.members
        .filter((m) => m.totalReferrals > 0)
        .map((m) => ({
          name: m.fullName,
          chances: m.internalReferralGiven + m.externalReferralGiven,
        }));
      setCandidates(newCandidates);
    }
  }, [currentReport, setCandidates]);

  // 抽獎動畫函數
  const animateRolling = useCallback((timestamp: number) => {
    if (timestamp - lastUpdateRef.current > 80) {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      setDisplayName(candidates[randomIndex]?.name || '');
      lastUpdateRef.current = timestamp;
    }
    animationRef.current = requestAnimationFrame(animateRolling);
  }, [candidates]);

  // 播放音效的輔助函數
  const playAudio = useCallback((audioRef: React.RefObject<HTMLAudioElement | null>) => {
    if (audioRef.current && !isMuted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        console.log('Audio play failed:', e);
      });
    }
  }, [isMuted]);

  const stopAudio = useCallback((audioRef: React.RefObject<HTMLAudioElement | null>) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // 開始抽獎
  const startDraw = useCallback(() => {
    if (candidates.length === 0) return;

    // 確保音效已初始化
    initAudio();

    // 重置狀態
    setCurrentWinners([]);
    setCurrentDrawIndex(0);
    setIsDrawing(true);
    setShowWinner(false);
    setDisplayName('');

    // 播放背景音樂和滾動音效
    if (isBgmEnabled && bgmAudioRef.current && !isMuted) {
      bgmAudioRef.current.currentTime = 0;
      bgmAudioRef.current.play().catch(() => {});
    }
    if (rollingAudioRef.current && !isMuted) {
      rollingAudioRef.current.currentTime = 0;
      rollingAudioRef.current.play().catch(() => {});
    }

    // 開始動畫
    lastUpdateRef.current = 0;
    animationRef.current = requestAnimationFrame(animateRolling);
  }, [candidates, animateRolling, isBgmEnabled, isMuted, initAudio]);

  // 停止抽獎
  const stopDraw = useCallback(() => {
    // 停止動畫
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // 停止滾動音效
    stopAudio(rollingAudioRef);

    // 計算還需要抽出的人數
    const remainingCount = winnersCount - currentDrawIndex;

    if (remainingCount > 1) {
      // 一次抽出所有剩餘人數
      const winners = drawMultipleWinners(remainingCount);
      if (winners.length > 0) {
        setCurrentWinners(prev => [...prev, ...winners]);
        setDisplayName(winners.join('、')); // 顯示所有名字
        setCurrentDrawIndex(prev => prev + winners.length);
      }
    } else {
      // 只抽一位
      const winner = drawWinner();
      if (winner) {
        setDisplayName(winner);
        setCurrentWinners(prev => [...prev, winner]);
        setCurrentDrawIndex(prev => prev + 1);
      }
    }

    setIsDrawing(false);
    setShowWinner(true);

    // 播放中獎音效
    playAudio(winAudioRef);

    // 停止背景音樂（延遲一點讓中獎音效更突出）
    setTimeout(() => {
      stopAudio(bgmAudioRef);
    }, 3000);
  }, [drawWinner, drawMultipleWinners, playAudio, stopAudio, currentDrawIndex, winnersCount]);

  // 處理抽獎按鈕點擊
  const handleDrawClick = () => {
    if (isDrawing) {
      stopDraw();
    } else {
      startDraw();
    }
  };

  // 完成本輪抽獎
  const handleFinishRound = () => {
    setCurrentDrawIndex(0);
    setCurrentWinners([]);
    setShowWinner(false);
    stopAudio(bgmAudioRef);
  };

  // 增減抽獎人數
  const incrementWinnersCount = () => {
    setWinnersCount(prev => Math.min(prev + 1, candidates.length));
  };

  const decrementWinnersCount = () => {
    setWinnersCount(prev => Math.max(prev - 1, 1));
  };

  const handleNewSession = () => {
    // 停止所有音效
    stopAudio(rollingAudioRef);
    stopAudio(winAudioRef);
    stopAudio(bgmAudioRef);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startNewSession();
    setCurrentWinners([]);
    setShowWinner(false);
    setDisplayName('');
    setIsDrawing(false);
    setCurrentDrawIndex(0);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    // 即時更新所有音效的靜音狀態
    if (rollingAudioRef.current) rollingAudioRef.current.muted = newMuted;
    if (winAudioRef.current) winAudioRef.current.muted = newMuted;
    if (bgmAudioRef.current) bgmAudioRef.current.muted = newMuted;
  };

  const toggleBgm = () => {
    if (isBgmEnabled) {
      // 關閉背景音樂
      stopAudio(bgmAudioRef);
    }
    setIsBgmEnabled(!isBgmEnabled);
  };

  if (!currentReport) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="relative p-8 rounded-2xl" style={{ backgroundColor: `${BNI_RED}10` }}>
          <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ backgroundColor: `${BNI_RED}05` }} />
          <Gift className="relative h-20 w-20" style={{ color: BNI_RED }} />
        </div>
        <h2 className="mt-6 text-2xl font-bold" style={{ color: BNI_GRAY }}>尚無報告資料</h2>
        <p className="mt-2 text-gray-500">
          請先至後台上傳週報 PDF 檔案以生成抽獎名單
        </p>
      </div>
    );
  }

  const totalChances = candidates.reduce((sum, c) => sum + c.chances, 0);

  return (
    <div className="space-y-6">
      {/* 頂部標題區 - 漸層背景 */}
      <div
        className="relative flex items-center justify-between p-6 text-white rounded-2xl overflow-hidden shadow-xl"
        style={{ background: `linear-gradient(135deg, ${BNI_RED} 0%, #E31837 50%, ${BNI_RED} 100%)` }}
      >
        {/* 裝飾性元素 */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/5 blur-xl" />

        <div className="relative flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide">引薦抽獎</h1>
            <p className="text-white/80 text-sm mt-0.5">每個引薦 = 1 次抽獎機會</p>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleBgm}
            className="bg-white/20 text-white hover:bg-white/30 border-0 rounded-xl transition-all duration-300 hover:scale-105"
            title={isBgmEnabled ? '關閉背景音樂' : '開啟背景音樂'}
          >
            {isBgmEnabled ? <Music className="h-5 w-5" /> : <Music2 className="h-5 w-5 opacity-50" />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleMute}
            className="bg-white/20 text-white hover:bg-white/30 border-0 rounded-xl transition-all duration-300 hover:scale-105"
            title={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <Button
            variant="secondary"
            onClick={handleNewSession}
            className="bg-white/20 text-white hover:bg-white/30 border-0 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            開始新場次
          </Button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-modern p-5 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${BNI_RED}15` }}>
            <Users className="h-6 w-6" style={{ color: BNI_RED }} />
          </div>
          <p className="text-3xl font-bold stat-number" style={{ color: BNI_RED }}>{candidates.length}</p>
          <p className="text-sm text-gray-500 mt-1">候選人數</p>
        </div>
        <div className="card-modern p-5 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${BNI_GRAY}15` }}>
            <Ticket className="h-6 w-6" style={{ color: BNI_GRAY }} />
          </div>
          <p className="text-3xl font-bold stat-number" style={{ color: BNI_GRAY }}>{totalChances}</p>
          <p className="text-sm text-gray-500 mt-1">總抽獎次數</p>
        </div>
        <div className="card-modern p-5 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${BNI_GOLD}15` }}>
            <Crown className="h-6 w-6" style={{ color: BNI_GOLD }} />
          </div>
          <p className="text-3xl font-bold stat-number" style={{ color: BNI_GOLD }}>{sessionRecords.length}</p>
          <p className="text-sm text-gray-500 mt-1">已抽出</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* 抽獎區 - 佔 3 欄 */}
        <div className="lg:col-span-3 card-modern overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${BNI_RED}15` }}>
              <Gift className="h-5 w-5" style={{ color: BNI_RED }} />
            </div>
            <span className="font-semibold text-gray-800">幸運大轉盤</span>
          </div>
          <div className="space-y-4 p-5">
            {/* 中獎者展示區 */}
            <div
              className="relative flex min-h-[280px] items-center justify-center p-8 overflow-hidden transition-all duration-500 rounded-2xl"
              style={{
                background: showWinner
                  ? `linear-gradient(135deg, ${BNI_GOLD} 0%, #DAA520 50%, ${BNI_GOLD} 100%)`
                  : `linear-gradient(135deg, ${BNI_RED} 0%, #E31837 50%, ${BNI_RED} 100%)`,
                boxShadow: showWinner ? `0 20px 40px ${BNI_GOLD}40` : `0 20px 40px ${BNI_RED}40`,
              }}
            >
              {/* 抽獎中的動態效果 */}
              {isDrawing && (
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-2 w-2 bg-white/40 animate-ping"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random()}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {showWinner && currentWinners.length > 0 ? (
                <div className="relative text-center text-white z-10">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-white/30 p-4 rounded-2xl animate-bounce backdrop-blur-sm">
                      <Trophy className="h-14 w-14 text-yellow-100" />
                    </div>
                  </div>
                  <p className="mb-3 text-lg font-medium text-white/90">
                    🎉 恭喜中獎！共 {currentWinners.length} 位 🎉
                  </p>
                  {/* 顯示所有得獎者 */}
                  {currentWinners.length === 1 ? (
                    <p className="text-5xl font-black tracking-wider drop-shadow-lg animate-pulse">{currentWinners[0]}</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap justify-center gap-3">
                        {currentWinners.map((w, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 rounded-xl backdrop-blur-sm animate-pulse"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            <span
                              className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#000' }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-xl font-bold">{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-5 flex justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Sparkles key={i} className="h-5 w-5 text-yellow-200 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              ) : isDrawing ? (
                <div className="relative text-center z-10">
                  <div className="mb-4">
                    <Gift className="mx-auto h-14 w-14 text-white animate-spin" />
                  </div>
                  <p className="text-5xl font-black text-white drop-shadow-lg" style={{ animation: 'pulse 0.3s ease-in-out infinite' }}>
                    {displayName || '抽獎中...'}
                  </p>
                  <p className="mt-4 text-white/70 animate-pulse">點擊下方按鈕停止抽獎</p>
                </div>
              ) : (
                <div className="relative text-center z-10">
                  <div className="mb-4">
                    <Gift className="mx-auto h-16 w-16 text-white/80 float" />
                  </div>
                  <p className="text-xl font-semibold text-white/90">點擊下方按鈕開始抽獎</p>
                  <p className="mt-2 text-white/60">祝您好運！</p>
                </div>
              )}
            </div>

            {/* 控制區 */}
            <div className="rounded-xl bg-gray-50 p-4 space-y-4">
              {/* 上排：設定區 */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2 rounded-lg hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={excludeWinners}
                    onChange={(e) => setExcludeWinners(e.target.checked)}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: BNI_RED }}
                  />
                  <span className="text-sm font-medium text-gray-700">排除已中獎者</span>
                </label>

                {/* 抽獎人數設定 */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">本次抽出</span>
                  <div className="flex items-center rounded-lg bg-white shadow-sm overflow-hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={decrementWinnersCount}
                      disabled={winnersCount <= 1 || isDrawing || currentDrawIndex > 0}
                      className="h-9 w-9 p-0 rounded-none hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-bold text-lg" style={{ color: BNI_RED }}>
                      {winnersCount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={incrementWinnersCount}
                      disabled={winnersCount >= candidates.length || isDrawing || currentDrawIndex > 0}
                      className="h-9 w-9 p-0 rounded-none hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm font-medium text-gray-700">位</span>
                </div>
              </div>

              {/* 下排：抽獎按鈕區 */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                {/* 提示文字 */}
                <div className="text-sm text-gray-500">
                  {winnersCount > 1 && !showWinner && (
                    <span>將一次抽出 <span className="font-bold" style={{ color: BNI_RED }}>{winnersCount}</span> 位得獎者</span>
                  )}
                  {showWinner && currentWinners.length > 0 && (
                    <span className="font-medium" style={{ color: BNI_GOLD }}>
                      已抽出 {currentWinners.length} 位得獎者
                    </span>
                  )}
                </div>

                {/* 按鈕區 */}
                <div className="flex items-center gap-3">
                  {/* 完成按鈕 */}
                  {showWinner && (
                    <Button
                      size="lg"
                      onClick={handleFinishRound}
                      className="px-6 text-base font-bold text-white border-0 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)' }}
                    >
                      ✓ 完成本輪
                    </Button>
                  )}
                  {/* 開始/停止抽獎按鈕 */}
                  {!showWinner && (
                    <Button
                      size="lg"
                      onClick={handleDrawClick}
                      disabled={candidates.length === 0}
                      className="px-8 text-base font-bold text-white border-0 min-w-[160px] rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                      style={{
                        background: isDrawing
                          ? `linear-gradient(135deg, ${BNI_GOLD} 0%, #DAA520 100%)`
                          : `linear-gradient(135deg, ${BNI_RED} 0%, #E31837 100%)`,
                        boxShadow: isDrawing ? `0 4px 15px ${BNI_GOLD}40` : `0 4px 15px ${BNI_RED}40`
                      }}
                    >
                      {isDrawing ? (
                        <>
                          <Square className="mr-2 h-4 w-4" />
                          停止抽獎
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          開始抽獎
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 本場次記錄 */}
            {sessionRecords.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: `2px solid ${BNI_RED}20` }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${BNI_RED}10 0%, ${BNI_RED}05 100%)` }}>
                  <Crown className="h-5 w-5" style={{ color: BNI_GOLD }} />
                  <span className="font-semibold" style={{ color: BNI_RED }}>本場次中獎記錄</span>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {sessionRecords.map((record, index) => (
                      <div
                        key={record.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                        style={{ background: `linear-gradient(135deg, ${BNI_GOLD}15 0%, ${BNI_GOLD}05 100%)` }}
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${BNI_GOLD} 0%, #DAA520 100%)` }}
                        >
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-700">{record.winner}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 候選人名單 - 佔 2 欄 */}
        <div className="lg:col-span-2 card-modern overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <span className="font-semibold text-gray-800">抽獎候選人</span>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {candidates.length} 人 · {totalChances} 次機會
            </span>
          </div>
          <div className="max-h-[480px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50/95 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">姓名</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 w-20">引薦</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 w-32">機率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates
                  .sort((a, b) => b.chances - a.chances)
                  .map((candidate, index) => (
                    <TableRow key={candidate.name} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {index < 3 ? (
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                              style={{
                                background: index === 0 ? `linear-gradient(135deg, ${BNI_GOLD} 0%, #DAA520 100%)` :
                                           index === 1 ? 'linear-gradient(135deg, #A0A0A0 0%, #C0C0C0 100%)' :
                                           'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'
                              }}
                            >
                              {index + 1}
                            </span>
                          ) : (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-gray-400 bg-gray-100">
                              {index + 1}
                            </span>
                          )}
                          <span className="text-gray-700">{candidate.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${BNI_RED} 0%, #E31837 100%)` }}
                        >
                          {candidate.chances}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(candidate.chances / totalChances) * 100}%`,
                                background: `linear-gradient(90deg, ${BNI_RED}, #E31837)`
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500 w-12">
                            {((candidate.chances / totalChances) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* 隱藏的音效元素 */}
      <audio ref={rollingAudioRef} src="/sounds/rolling.mp3" loop preload="auto" />
      <audio ref={winAudioRef} src="/sounds/win.mp3" preload="auto" />
      <audio ref={bgmAudioRef} src="/sounds/bgm.mp3" loop preload="auto" />
    </div>
  );
}
