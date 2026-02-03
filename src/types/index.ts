// 會員數據（從 PDF 解析）
export interface Member {
  id: string;
  lastName: string;
  firstName: string;
  fullName: string;
  attendance: number;
  absence: number;
  late: number;
  sickLeave: number;
  substitute: number;
  internalReferralGiven: number;
  externalReferralGiven: number;
  internalReferralReceived: number;
  externalReferralReceived: number;
  guests: number;
  oneToOne: number;
  transactionValue: number;
  educationUnits: number;
  totalReferrals: number;
}

// 週報數據
export interface WeeklyReport {
  id: string;
  chapter: string;
  dateFrom: string;
  dateTo: string;
  generatedAt: string;
  members: Member[];
  createdAt: Date;
  updatedAt: Date;
}

// 半年報數據
export interface HalfYearReport {
  id: string;
  chapter: string;
  dateFrom: string;
  dateTo: string;
  members: Member[];
  createdAt: Date;
  updatedAt: Date;
}

// 紅綠燈評分詳情
export interface TrafficLightScores {
  attendance: number;
  oneToOne: number;
  training: number;
  referrals: number;
  guests: number;
  referralAmount: number;
  total: number;
}

// 紅綠燈原始數據
export interface TrafficLightRawData {
  absenceCount: number;
  oneToOnePerWeek: number;
  trainingCredits: number;
  referralsPerWeek: number;
  guestsPer4Weeks: number;
  referralAmountTotal: number;
}

// 紅綠燈狀態
export interface TrafficLightStatus {
  id: string;
  memberId: string;
  memberName: string;
  status: 'green' | 'yellow' | 'red' | 'grey';
  scores: TrafficLightScores;
  rawData: TrafficLightRawData;
  isManualOverride: boolean;
  updatedAt: Date;
}

// 引薦金額統計（手動輸入）
export interface ReferralAmount {
  id: string;
  period: string;
  internalReferral: number;
  externalReferral: number;
  totalReferral: number;
  oneToOne: number;
  guests: number;
  totalAmount: number;
  cumulativeAmount: number;
  updatedAt: Date;
}

// 抽獎記錄
export interface LotteryRecord {
  id: string;
  winner: string;
  timestamp: Date;
  round: number;
  sessionId: string;
}

// 抽獎候選人
export interface LotteryCandidate {
  name: string;
  chances: number;
}

// 系統設定
export interface Settings {
  trafficLightThresholds: {
    green: number;
    yellow: number;
    red: number;
    grey: number;
  };
  halfYearWeeks: number;
}

// 資料庫紀錄類型 (Supabase)
export interface DbWeeklyReport {
  id: string;
  chapter: string;
  date_from: string;
  date_to: string;
  generated_at: string | null;
  members: Member[];
  created_at: string;
  updated_at: string;
}

export interface DbTrafficLightStatus {
  id: string;
  member_name: string;
  status: 'green' | 'yellow' | 'red' | 'grey';
  score_attendance: number;
  score_one_to_one: number;
  score_training: number;
  score_referrals: number;
  score_guests: number;
  score_referral_amount: number;
  score_total: number;
  raw_absence_count: number;
  raw_one_to_one_per_week: number;
  raw_training_credits: number;
  raw_referrals_per_week: number;
  raw_guests_per_4_weeks: number;
  raw_referral_amount_total: number;
  is_manual_override: boolean;
  updated_at: string;
}

export interface DbReferralAmount {
  id: string;
  period: string;
  internal_referral: number;
  external_referral: number;
  total_referral: number;
  one_to_one: number;
  guests: number;
  total_amount: number;
  cumulative_amount: number;
  updated_at: string;
}
