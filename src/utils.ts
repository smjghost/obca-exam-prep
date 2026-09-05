import { ParsedQuestion, ParsedOption, ParsedAnswer } from './types';

export const FILES = [
  '单选题.csv',
  '多选题.csv',
  '判断题.csv',
];

export const cleanQuestionText = (text: string) => {
  if (!text) return '';
  return text.replace(/^(?:\[.*?\]\s*)?\d+[、\.]\s*/, '').trim();
};

export const getRowField = (row: any, ...keys: string[]) => {
  if (!row) return '';
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]);
    }
  }
  for (const [rowKey, val] of Object.entries(row)) {
    const cleanKey = rowKey.replace(/^\uFEFF/, '').trim();
    for (const k of keys) {
      if (cleanKey === k || cleanKey.toLowerCase() === k.toLowerCase()) {
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val);
        }
      }
    }
  }
  for (const [rowKey, val] of Object.entries(row)) {
    const cleanKey = rowKey.replace(/^\uFEFF/, '').trim();
    for (const k of keys) {
      if (cleanKey.includes(k) && val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val);
      }
    }
  }
  return '';
};

export function parseQuestion(front: string): ParsedQuestion {
  if (!front) return { stem: '', options: [] };

  const optRegex = /(?:^|\s|(?<=[^a-zA-Z0-9]))([A-G])[\.、:：\s\)\）]\s*/g;
  const matches: { label: string; index: number; matchLength: number }[] = [];
  let m;
  while ((m = optRegex.exec(front)) !== null) {
    matches.push({ label: m[1], index: m.index, matchLength: m[0].length });
  }

  let isOptionSequence = false;
  if (matches.length >= 2 && matches[0].label === 'A' && matches[1].label === 'B') {
    isOptionSequence = true;
  }

  if (!isOptionSequence || matches.length < 2) {
    return { stem: front.trim(), options: [] };
  }

  const stem = front.slice(0, matches[0].index).trim();
  const options: ParsedOption[] = [];

  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const optStart = cur.index + cur.matchLength;
    const optEnd = next ? next.index : front.length;
    const optText = front.slice(optStart, optEnd).trim();
    options.push({
      label: cur.label,
      text: optText,
    });
  }

  return { stem: stem || front.trim(), options };
}

export function parseAnswer(back: string): ParsedAnswer {
  if (!back) return { answer: '', explanation: '' };

  const match = back.match(/^(?:【?正确答案】?[：:]\s*|【?答案】?[：:]\s*)([^\n]+)(?:\n+([\s\S]*))?$/);
  if (match) {
    return {
      answer: match[1].trim(),
      explanation: (match[2] || '').trim(),
    };
  }
  return { answer: '', explanation: back.trim() };
}

export const getTypeColor = (type: string) => {
  if (type.includes('单选')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (type.includes('多选')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (type.includes('判断')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};
