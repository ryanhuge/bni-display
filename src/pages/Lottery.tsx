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
    excludeWinners,
    setExcludeWinners,
    getSessionRecords,
    startNewSession,
  } = useLotteryStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(null);
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

    // 如果是第一次開始，重置狀態
    if (currentDrawIndex === 0) {
      setCurrentWinners([]);
    }

    setIsDrawing(true);
    setShowWinner(false);
    setCurrentWinner(null);
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
  }, [candidates, animateRolling, isBgmEnabled, isMuted, initAudio, currentDrawIndex]);

  // 停止抽獎
  const stopDraw = useCallback(() => {
    // 停止動畫
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // 停止滾動音效
    stopAudio(rollingAudioRef);

    // 抽出得獎者
    const winner = drawWinner();
    setCurrentWinner(winner);
    setDisplayName(winner || '');
    setIsDrawing(false);
    setShowWinner(true);

    // 更新本輪得獎者列表
    if (winner) {
      setCurrentWinners(prev => [...prev, winner]);
      setCurrentDrawIndex(prev => prev + 1);
    }

    // 播放中獎音效
    playAudio(winAudioRef);

    // 如果還沒抽完，不停止背景音樂
    if (currentDrawIndex + 1 >= winnersCount) {
      // 停止背景音樂（延遲一點讓中獎音效更突出）
      setTimeout(() => {
        stopAudio(bgmAudioRef);
      }, 3000);
    }
  }, [drawWinner, playAudio, stopAudio, currentDrawIndex, winnersCount]);

  // 處理抽獎按鈕點擊
  const handleDrawClick = () => {
    if (isDrawing) {
      stopDraw();
    } else {
      startDraw();
    }
  };

  // 繼續抽下一位
  const handleContinueDraw = () => {
    setShowWinner(false);
    setCurrentWinner(null);
    startDraw();
  };

  // 完成本輪抽獎
  const handleFinishRound = () => {
    setCurrentDrawIndex(0);
    setCurrentWinners([]);
    setShowWinner(false);
    setCurrentWinner(null);
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
    setCurrentWinner(null);
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
        <div className="p-8 border-2" style={{ borderColor: BNI_RED, backgroundColor: `${BNI_RED}10` }}>
          <Gift className="h-20 w-20" style={{ color: BNI_RED }} />
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
    <div className="space-y-4">
      {/* 頂部標題區 - BNI 紅色 */}
      <div
        className="flex items-center justify-between p-4 text-white border-2"
        style={{ backgroundColor: BNI_RED, borderColor: BNI_RED }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">引薦抽獎</h1>
            <p className="text-white/80 text-sm">每個引薦 = 1 次抽獎機會</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleBgm}
            className="bg-white/20 text-white hover:bg-white/30 border-white/30"
            title={isBgmEnabled ? '關閉背景音樂' : '開啟背景音樂'}
          >
            {isBgmEnabled ? <Music className="h-5 w-5" /> : <Music2 className="h-5 w-5 opacity-50" />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleMute}
            className="bg-white/20 text-white hover:bg-white/30 border-white/30"
            title={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <Button
            variant="secondary"
            onClick={handleNewSession}
            className="bg-white/20 text-white hover:bg-white/30 border-white/30"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            開始新場次
          </Button>
        </div>
      </div>

      {/* 統計卡片 - 使用表格形式 */}
      <div className="border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-center font-bold">候選人數</TableHead>
              <TableHead className="text-center font-bold">總抽獎次數</TableHead>
              <TableHead className="text-center font-bold">已抽出</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" style={{ color: BNI_RED }} />
                  <span className="text-2xl font-bold" style={{ color: BNI_RED }}>{candidates.length}</span>
                  <span className="text-gray-500">人</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Ticket className="h-5 w-5" style={{ color: BNI_GRAY }} />
                  <span className="text-2xl font-bold" style={{ color: BNI_GRAY }}>{totalChances}</span>
                  <span className="text-gray-500">次</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5" style={{ color: BNI_GOLD }} />
                  <span className="text-2xl font-bold" style={{ color: BNI_GOLD }}>{sessionRecords.length}</span>
                  <span className="text-gray-500">人</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* 抽獎區 - 佔 3 欄 */}
        <div className="lg:col-span-3 border">
          <div className="p-3 border-b bg-gray-50 flex items-center gap-2" style={{ borderColor: '#e5e7eb' }}>
            <Gift className="h-5 w-5" style={{ color: BNI_RED }} />
            <span className="font-bold" style={{ color: BNI_RED }}>幸運大轉盤</span>
          </div>
          <div className="space-y-4 p-4">
            {/* 中獎者展示區 */}
            <div
              className="relative flex min-h-[250px] items-center justify-center p-6 overflow-hidden transition-colors duration-500 border-2"
              style={{
                backgroundColor: showWinner ? BNI_GOLD : BNI_RED,
                borderColor: showWinner ? BNI_GOLD : BNI_RED,
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

              {showWinner && currentWinner ? (
                <div className="relative text-center text-white z-10">
                  <div className="mb-3 flex justify-center">
                    <div className="bg-white/30 p-3 animate-bounce">
                      <Trophy className="h-12 w-12 text-yellow-100" />
                    </div>
                  </div>
                  <p className="mb-2 text-lg font-medium text-white/90">
                    🎉 恭喜中獎 {winnersCount > 1 && `(第 ${currentDrawIndex} 位)`} 🎉
                  </p>
                  <p className="text-5xl font-black tracking-wider drop-shadow-lg">{currentWinner}</p>
                  {/* 顯示本輪已抽出的所有得獎者 */}
                  {currentWinners.length > 1 && (
                    <div className="mt-4 pt-3 border-t border-white/30">
                      <p className="text-sm text-white/70 mb-2">本輪得獎者：</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {currentWinners.map((w, i) => (
                          <span key={i} className="px-3 py-1 bg-white/20 text-sm font-medium">
                            #{i + 1} {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Sparkles key={i} className="h-5 w-5 text-yellow-200 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              ) : isDrawing ? (
                <div className="relative text-center z-10">
                  <div className="mb-3">
                    <Gift className="mx-auto h-12 w-12 text-white animate-spin" />
                  </div>
                  <p className="text-4xl font-bold text-white drop-shadow-lg" style={{ animation: 'pulse 0.3s ease-in-out infinite' }}>
                    {displayName || '抽獎中...'}
                  </p>
                  <p className="mt-3 text-white/70 animate-pulse">點擊下方按鈕停止抽獎</p>
                </div>
              ) : (
                <div className="relative text-center z-10">
                  <Gift className="mx-auto mb-3 h-16 w-16 text-white/80" />
                  <p className="text-xl font-medium text-white/90">點擊下方按鈕開始抽獎</p>
                  <p className="mt-2 text-white/60">祝您好運！</p>
                </div>
              )}
            </div>

            {/* 控制區 */}
            <div className="border bg-gray-50 p-3 space-y-3">
              {/* 上排：設定區 */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={excludeWinners}
                    onChange={(e) => setExcludeWinners(e.target.checked)}
                    className="h-4 w-4"
                    style={{ accentColor: BNI_RED }}
                  />
                  <span className="text-sm font-medium text-gray-700">排除已中獎者</span>
                </label>

                {/* 抽獎人數設定 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">本次抽出</span>
                  <div className="flex items-center border bg-white">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={decrementWinnersCount}
                      disabled={winnersCount <= 1 || isDrawing || currentDrawIndex > 0}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold text-lg" style={{ color: BNI_RED }}>
                      {winnersCount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={incrementWinnersCount}
                      disabled={winnersCount >= candidates.length || isDrawing || currentDrawIndex > 0}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm font-medium text-gray-700">位</span>
                </div>
              </div>

              {/* 下排：抽獎按鈕區 */}
              <div className="flex items-center justify-between">
                {/* 本輪進度 */}
                {currentDrawIndex > 0 && (
                  <div className="text-sm" style={{ color: BNI_RED }}>
                    <span className="font-bold">進度：{currentDrawIndex} / {winnersCount}</span>
                    {currentDrawIndex < winnersCount && <span className="ml-2 text-gray-500">（還剩 {winnersCount - currentDrawIndex} 位）</span>}
                  </div>
                )}
                {currentDrawIndex === 0 && <div />}

                {/* 按鈕區 */}
                <div className="flex items-center gap-2">
                  {/* 顯示繼續抽獎或完成按鈕 */}
                  {showWinner && currentDrawIndex < winnersCount && (
                    <Button
                      size="lg"
                      onClick={handleContinueDraw}
                      className="px-6 text-base font-bold text-white border-0 transition-all duration-300"
                      style={{ backgroundColor: BNI_GOLD }}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      繼續抽獎 ({currentDrawIndex}/{winnersCount})
                    </Button>
                  )}
                  {showWinner && currentDrawIndex >= winnersCount && (
                    <Button
                      size="lg"
                      onClick={handleFinishRound}
                      className="px-6 text-base font-bold text-white border-0 transition-all duration-300 bg-green-600 hover:bg-green-700"
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
                      className="px-6 text-base font-bold text-white border-0 min-w-[140px] transition-all duration-300"
                      style={{ backgroundColor: isDrawing ? BNI_GOLD : BNI_RED }}
                    >
                      {isDrawing ? (
                        <>
                          <Square className="mr-2 h-4 w-4" />
                          停止抽獎
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          {currentDrawIndex > 0 ? `繼續 (${currentDrawIndex}/${winnersCount})` : '開始抽獎'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 本場次記錄 */}
            {sessionRecords.length > 0 && (
              <div className="border" style={{ borderColor: BNI_RED }}>
                <div className="p-2 flex items-center gap-2 border-b" style={{ backgroundColor: `${BNI_RED}10`, borderColor: BNI_RED }}>
                  <Crown className="h-4 w-4" style={{ color: BNI_RED }} />
                  <span className="font-bold text-sm" style={{ color: BNI_RED }}>本場次中獎記錄</span>
                </div>
                <div className="p-3">
                  <Table>
                    <TableBody>
                      {sessionRecords.map((record, index) => (
                        <TableRow key={record.id}>
                          <TableCell className="w-12 text-center font-bold" style={{ color: BNI_GOLD }}>
                            #{index + 1}
                          </TableCell>
                          <TableCell className="font-medium">{record.winner}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 候選人名單 - 佔 2 欄 */}
        <div className="lg:col-span-2 border">
          <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: BNI_GRAY }} />
              <span className="font-bold" style={{ color: BNI_GRAY }}>抽獎候選人</span>
            </div>
            <span className="text-sm text-gray-500">
              {candidates.length} 人，共 {totalChances} 次機會
            </span>
          </div>
          <div className="max-h-[450px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-100">
                <TableRow>
                  <TableHead className="font-bold">姓名</TableHead>
                  <TableHead className="text-center font-bold w-20">引薦</TableHead>
                  <TableHead className="text-center font-bold w-28">機率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates
                  .sort((a, b) => b.chances - a.chances)
                  .map((candidate, index) => (
                    <TableRow key={candidate.name}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {index < 3 && (
                            <span
                              className="flex h-5 w-5 items-center justify-center text-xs font-bold text-white"
                              style={{
                                backgroundColor: index === 0 ? BNI_GOLD : index === 1 ? '#A0A0A0' : '#CD7F32'
                              }}
                            >
                              {index + 1}
                            </span>
                          )}
                          {candidate.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className="inline-flex items-center px-2 py-0.5 text-sm font-medium text-white"
                          style={{ backgroundColor: BNI_RED }}
                        >
                          {candidate.chances}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="h-2 w-12 overflow-hidden bg-gray-200">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${(candidate.chances / totalChances) * 100}%`,
                                backgroundColor: BNI_RED
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-10">
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
