import * as pdfjsLib from 'pdfjs-dist';
import type { Member } from '@/types';
import { generateId } from './utils';

// 設定 PDF.js worker - 使用本地 worker
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface ParsedPalmsReport {
  chapter: string;
  dateFrom: string;
  dateTo: string;
  generatedAt: string;
  members: Member[];
}

export async function parsePalmsPdf(file: File): Promise<ParsedPalmsReport> {
  console.log('開始解析 PDF:', file.name);
  const arrayBuffer = await file.arrayBuffer();
  console.log('PDF arrayBuffer 大小:', arrayBuffer.byteLength);

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  console.log('PDF 頁數:', pdf.numPages);

  let fullText = '';

  // 提取所有頁面文字
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // 直接用空格連接所有文字
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  // 輸出前 2000 字符用於 debug
  console.log('提取的文字（前 2000 字符）:', fullText.substring(0, 2000));

  // 解析報告標頭資訊 - 匹配 "威鋒 - Wei Feng" 格式
  const chapterMatch = fullText.match(/分會\s*[:\uff1a]?\s*([^\s-]+)\s*-/);
  const chapter = chapterMatch ? chapterMatch[1] : '威鋒';
  console.log('解析到分會:', chapter);

  // 解析日期範圍 (格式: 2026/1/1 或 2026/01/01)
  const dateFromMatch = fullText.match(/從\s*[:\uff1a]?\s*(\d{4}\/\d{1,2}\/\d{1,2})/);
  const dateToMatch = fullText.match(/至\s*[:\uff1a]?\s*(\d{4}\/\d{1,2}\/\d{1,2})/);
  const dateFrom = dateFromMatch ? dateFromMatch[1] : '';
  const dateTo = dateToMatch ? dateToMatch[1] : '';
  console.log('解析到日期:', dateFrom, '-', dateTo);

  // 解析報告生成時間
  const generatedMatch = fullText.match(/(\d{4}年\d{1,2}月\d{1,2}日\s*[上下]午\d{1,2}:\d{2})/);
  const generatedAt = generatedMatch ? generatedMatch[1] : '';
  console.log('報告生成時間:', generatedAt);

  // 解析會員數據
  const members = parseMembers(fullText);
  console.log('解析到的會員數:', members.length);
  if (members.length > 0) {
    console.log('第一個會員:', members[0]);
  }

  return {
    chapter,
    dateFrom,
    dateTo,
    generatedAt,
    members,
  };
}

function parseMembers(text: string): Member[] {
  const members: Member[] = [];
  const seenNames = new Set<string>(); // 用於去重

  // PALMS 報告格式:
  // 姓氏 名字 出席 缺席 遲到 病假 替代人 提供內部引薦 提供外部引薦 收到內部引薦 收到外部引薦 來賓 一對一會面 交易價值 分會教育單位
  // PDF 提取後格式：洪   偵哲   25   0   0   0   1   33   22   6   21   1   29   516830.00   0
  // 特殊格式：劉   祐辰   ( 劉兆恩 )   8   1   0...  或  楊   忠維(阿MO)   13   4   6...
  //
  // 策略：用更簡單的方式 - 匹配完整的數據行
  // 格式：中文姓(1字) + 空格 + 中文名(1-3字，可能有括號英文) + 13個數字
  // 使用 non-greedy 並限制名字只能是中文/英文/括號，不能包含數字

  // 新方法：先找數字序列，再往回截取名字
  const dataPattern = /(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d,.]+)\s+(\d+)/g;

  let match;
  while ((match = dataPattern.exec(text)) !== null) {
    // 找到數字序列的位置，然後往回找名字
    const matchStart = match.index;

    // 往回截取最多 50 個字符來找名字
    const lookbackStart = Math.max(0, matchStart - 50);
    const prefix = text.substring(lookbackStart, matchStart);

    // 從 prefix 中提取名字：找最後出現的中文姓名
    // 名字格式：姓(單字中文) + 2+空格 + 名(中文/英文/括號)
    // 姓氏前面應該有數字或 2+ 個空格作為分隔（避免把表頭文字當成姓名）
    const nameMatch = prefix.match(/(?:\d\s*|\s{2,})([\u4e00-\u9fff])\s{2,}([\u4e00-\u9fffa-zA-Z()（）\s]{1,20}?)\s*$/);

    if (!nameMatch) {
      continue;
    }

    const lastName = nameMatch[1];
    const firstNameRaw = nameMatch[2].replace(/\s+/g, '').trim();
    const fullName = lastName + firstNameRaw;

    // 排除標題行、總計行和特殊行
    if (
      fullName.includes('姓') ||
      fullName.includes('名字') ||
      fullName.includes('總數') ||
      fullName.includes('出席') ||
      fullName.includes('缺席') ||
      fullName.includes('遲到') ||
      fullName.includes('引薦') ||
      fullName.includes('會面') ||
      fullName.includes('交易') ||
      fullName.includes('價值') ||
      fullName.includes('教育') ||
      fullName.includes('單位') ||
      fullName.includes('報告') ||
      fullName.includes('PALMS') ||
      fullName === '來賓' ||
      fullName === 'BNI' ||
      fullName.length < 2 ||
      fullName.length > 15
    ) {
      continue;
    }

    // 去重：如果已經有這個名字就跳過
    if (seenNames.has(fullName)) {
      continue;
    }
    seenNames.add(fullName);

    const firstName = firstNameRaw;

    const transactionStr = match[12].replace(/,/g, '');
    const transactionValue = Math.round(parseFloat(transactionStr) || 0);

    // match[1]=出席, match[2]=缺席, ..., match[12]=交易價值, match[13]=教育單位
    const member: Member = {
      id: generateId(),
      lastName,
      firstName,
      fullName,
      attendance: parseInt(match[1]) || 0,
      absence: parseInt(match[2]) || 0,
      late: parseInt(match[3]) || 0,
      sickLeave: parseInt(match[4]) || 0,
      substitute: parseInt(match[5]) || 0,
      internalReferralGiven: parseInt(match[6]) || 0,
      externalReferralGiven: parseInt(match[7]) || 0,
      internalReferralReceived: parseInt(match[8]) || 0,
      externalReferralReceived: parseInt(match[9]) || 0,
      guests: parseInt(match[10]) || 0,
      oneToOne: parseInt(match[11]) || 0,
      transactionValue: transactionValue,
      educationUnits: parseInt(match[13]) || 0,
      totalReferrals: (parseInt(match[6]) || 0) + (parseInt(match[7]) || 0),
    };

    members.push(member);
  }

  console.log('正則匹配找到會員數:', members.length);

  // 如果正則沒有匹配到，嘗試備用解析方式
  if (members.length === 0) {
    console.log('嘗試備用解析方式...');
    return parseMembers_fallback(text);
  }

  return members;
}

function parseMembers_fallback(text: string): Member[] {
  const members: Member[] = [];
  const seenNames = new Set<string>(); // 用於去重

  // 將文字按行分割
  const lines = text.split(/\n/);
  console.log('備用解析 - 總行數:', lines.length);

  // 尋找包含數字序列的行 - 姓氏 + 名字 + 13個數字
  const fallbackPattern = /([\u4e00-\u9fff])\s+([\u4e00-\u9fffa-zA-Z()（）\s]{1,20}?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d,.]+)\s+(\d+)/;

  for (const line of lines) {
    const match = line.match(fallbackPattern);

    if (match) {
      // match[1] = 姓氏, match[2] = 名字部分
      const lastName = match[1];
      const firstNameRaw = match[2].replace(/\s+/g, '');
      const fullName = lastName + firstNameRaw;

      // 排除特殊行
      if (
        fullName.includes('姓') ||
        fullName.includes('名字') ||
        fullName.includes('總數') ||
        fullName.includes('出席') ||
        fullName.includes('缺席') ||
        fullName.includes('引薦') ||
        fullName.includes('交易') ||
        fullName.includes('教育') ||
        fullName === '來賓' ||
        fullName === 'BNI' ||
        fullName.length < 2 ||
        fullName.length > 15
      ) {
        continue;
      }

      // 去重：如果已經有這個名字就跳過
      if (seenNames.has(fullName)) {
        continue;
      }
      seenNames.add(fullName);

      const firstName = firstNameRaw;

      const transactionStr = match[14].replace(/,/g, '');
      const transactionValue = Math.round(parseFloat(transactionStr) || 0);

      // match[1]=姓, match[2]=名, match[3]=出席, ..., match[14]=交易價值, match[15]=教育單位
      const member: Member = {
        id: generateId(),
        lastName,
        firstName,
        fullName,
        attendance: parseInt(match[3]) || 0,
        absence: parseInt(match[4]) || 0,
        late: parseInt(match[5]) || 0,
        sickLeave: parseInt(match[6]) || 0,
        substitute: parseInt(match[7]) || 0,
        internalReferralGiven: parseInt(match[8]) || 0,
        externalReferralGiven: parseInt(match[9]) || 0,
        internalReferralReceived: parseInt(match[10]) || 0,
        externalReferralReceived: parseInt(match[11]) || 0,
        guests: parseInt(match[12]) || 0,
        oneToOne: parseInt(match[13]) || 0,
        transactionValue: transactionValue,
        educationUnits: parseInt(match[15]) || 0,
        totalReferrals: (parseInt(match[8]) || 0) + (parseInt(match[9]) || 0),
      };

      members.push(member);
    }
  }

  console.log('備用解析找到會員數:', members.length);
  return members;
}
