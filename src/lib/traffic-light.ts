import type { TrafficLightScores, TrafficLightRawData } from '@/types';

// 計算各項分數的函數
export function calculateTrafficLightScores(rawData: TrafficLightRawData): TrafficLightScores {
  // 1. 出席分數 (0-20)
  const attendanceScore = (() => {
    const { absenceCount } = rawData;
    if (absenceCount >= 3) return 0;
    if (absenceCount === 2) return 10;
    if (absenceCount === 1) return 15;
    return 20; // 0 次缺席
  })();

  // 2. 一對一分數 (0-15)
  const oneToOneScore = (() => {
    const { oneToOnePerWeek } = rawData;
    if (oneToOnePerWeek < 0.5) return 0;
    if (oneToOnePerWeek < 1) return 5;
    if (oneToOnePerWeek < 2) return 10;
    return 15; // 2 次以上
  })();

  // 3. 培訓分數 (0-15)
  const trainingScore = (() => {
    const { trainingCredits } = rawData;
    if (trainingCredits < 2) return 0;
    if (trainingCredits < 4) return 5;
    if (trainingCredits < 6) return 10;
    return 15; // 6 學分以上
  })();

  // 4. 業務引薦分數 (0-20)
  const referralsScore = (() => {
    const { referralsPerWeek } = rawData;
    if (referralsPerWeek < 0.75) return 0;
    if (referralsPerWeek < 1) return 5;
    if (referralsPerWeek < 1.2) return 10;
    if (referralsPerWeek < 1.5) return 15;
    return 20; // 1.5 以上
  })();

  // 5. 來賓分數 (0-15)
  const guestsScore = (() => {
    const { guestsPer4Weeks } = rawData;
    if (guestsPer4Weeks < 1) return 0;
    if (guestsPer4Weeks < 2) return 10;
    return 15; // 2 人以上
  })();

  // 6. 引薦金額分數 (0-15)
  const referralAmountScore = (() => {
    const { referralAmountTotal } = rawData;
    if (referralAmountTotal < 400000) return 0;
    if (referralAmountTotal < 800000) return 5;
    if (referralAmountTotal < 2000000) return 10;
    return 15; // 200 萬以上
  })();

  const total = attendanceScore + oneToOneScore + trainingScore +
                referralsScore + guestsScore + referralAmountScore;

  return {
    attendance: attendanceScore,
    oneToOne: oneToOneScore,
    training: trainingScore,
    referrals: referralsScore,
    guests: guestsScore,
    referralAmount: referralAmountScore,
    total
  };
}

// 根據總分判定燈號
// PDF 標準: 70=綠燈, 50-65=黃燈, 30-45=紅燈, <30=灰燈
export function determineTrafficLight(totalScore: number): 'green' | 'yellow' | 'red' | 'grey' {
  if (totalScore >= 70) return 'green';
  if (totalScore >= 50) return 'yellow';
  if (totalScore >= 30) return 'red';
  return 'grey'; // 30 分以下
}

// 取得燈號顏色 class
export function getTrafficLightColor(status: 'green' | 'yellow' | 'red' | 'grey'): string {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    grey: 'bg-gray-500',
  };
  return colors[status];
}

// 取得燈號顯示文字
export function getTrafficLightLabel(status: 'green' | 'yellow' | 'red' | 'grey'): string {
  const labels = {
    green: '綠燈',
    yellow: '黃燈',
    red: '紅燈',
    grey: '灰燈',
  };
  return labels[status];
}

// 取得燈號 emoji
export function getTrafficLightEmoji(status: 'green' | 'yellow' | 'red' | 'grey'): string {
  const emojis = {
    green: '🟢',
    yellow: '🟡',
    red: '🔴',
    grey: '⚫',
  };
  return emojis[status];
}
