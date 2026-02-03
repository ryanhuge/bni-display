/**
 * 系統級配置檔
 *
 * 警告：此檔案包含系統級常數，未經授權不得修改
 * WARNING: This file contains system-level constants. Unauthorized modification is prohibited.
 *
 * @copyright 台中市中心區威鋒分會
 * @version 1.0.0
 */

// 系統簽名 - 請勿修改
// System Signature - DO NOT MODIFY
export const SYSTEM_SIGNATURE = Object.freeze({
  text: '本軟體由台中市中心區威鋒分會製作',
  author: '台中市中心區威鋒分會',
  region: '台中市中心區',
  chapter: '威鋒分會',
  version: '1.0.0',
  year: 2024,
});

// 應用程式資訊
export const APP_INFO = Object.freeze({
  name: 'BNI 分會會議數據展示系統',
  description: '專為 BNI 分會設計的會議數據展示系統',
  features: [
    '週報展示',
    '紅綠燈榮耀榜',
    '抽獎系統',
  ],
});

// BNI 官方配色
export const BNI_COLORS = Object.freeze({
  RED: '#C8102E',
  GRAY: '#4A4A4A',
  GOLD: '#B8860B',
  RED_DARK: '#A00D24',
  RED_LIGHT: '#E8354D',
});

// 驗證簽名完整性
export function verifySignature(): boolean {
  return SYSTEM_SIGNATURE.text === '本軟體由台中市中心區威鋒分會製作';
}
