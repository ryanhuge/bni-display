import type { Member } from './parse-xls.js';

export interface TrafficLightScores {
  attendance: number;
  oneToOne: number;
  training: number;
  referrals: number;
  guests: number;
  referralAmount: number;
  total: number;
}

export interface TrafficLightRawData {
  absenceCount: number;
  oneToOnePerWeek: number;
  trainingCredits: number;
  referralsPerWeek: number;
  guestsPer4Weeks: number;
  referralAmountTotal: number;
}

export type TrafficLightStatusType = 'green' | 'yellow' | 'red' | 'grey';

export interface TrafficLightResult {
  memberName: string;
  status: TrafficLightStatusType;
  scores: TrafficLightScores;
  rawData: TrafficLightRawData;
}

/**
 * 從半年報 Member 資料計算紅綠燈
 */
export function calculateTrafficLight(member: Member, weeks: number): TrafficLightResult {
  const rawData: TrafficLightRawData = {
    absenceCount: member.absence,
    oneToOnePerWeek: weeks > 0 ? member.oneToOne / weeks : 0,
    trainingCredits: member.educationUnits,
    referralsPerWeek: weeks > 0 ? member.totalReferrals / weeks : 0,
    guestsPer4Weeks: weeks > 0 ? (member.guests / weeks) * 4 : 0,
    referralAmountTotal: member.transactionValue,
  };

  const scores = calculateScores(rawData);
  const status = determineStatus(scores.total);

  return {
    memberName: member.fullName,
    status,
    scores,
    rawData,
  };
}

function calculateScores(rawData: TrafficLightRawData): TrafficLightScores {
  // 1. 出席 (0-20)
  const attendance = (() => {
    if (rawData.absenceCount >= 3) return 0;
    if (rawData.absenceCount === 2) return 10;
    if (rawData.absenceCount === 1) return 15;
    return 20;
  })();

  // 2. 一對一 (0-15)
  const oneToOne = (() => {
    if (rawData.oneToOnePerWeek < 0.5) return 0;
    if (rawData.oneToOnePerWeek < 1) return 5;
    if (rawData.oneToOnePerWeek < 2) return 10;
    return 15;
  })();

  // 3. 培訓 (0-15)
  const training = (() => {
    if (rawData.trainingCredits < 2) return 0;
    if (rawData.trainingCredits < 4) return 5;
    if (rawData.trainingCredits < 6) return 10;
    return 15;
  })();

  // 4. 業務引薦 (0-20)
  const referrals = (() => {
    if (rawData.referralsPerWeek < 0.75) return 0;
    if (rawData.referralsPerWeek < 1) return 5;
    if (rawData.referralsPerWeek < 1.2) return 10;
    if (rawData.referralsPerWeek < 1.5) return 15;
    return 20;
  })();

  // 5. 來賓 (0-15)
  const guests = (() => {
    if (rawData.guestsPer4Weeks < 1) return 0;
    if (rawData.guestsPer4Weeks < 2) return 10;
    return 15;
  })();

  // 6. 引薦金額 (0-15)
  const referralAmount = (() => {
    if (rawData.referralAmountTotal < 400000) return 0;
    if (rawData.referralAmountTotal < 800000) return 5;
    if (rawData.referralAmountTotal < 2000000) return 10;
    return 15;
  })();

  const total = attendance + oneToOne + training + referrals + guests + referralAmount;
  return { attendance, oneToOne, training, referrals, guests, referralAmount, total };
}

function determineStatus(totalScore: number): TrafficLightStatusType {
  if (totalScore >= 70) return 'green';
  if (totalScore >= 50) return 'yellow';
  if (totalScore >= 30) return 'red';
  return 'grey';
}
