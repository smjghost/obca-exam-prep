export interface Flashcard {
  id?: string;
  front: string;
  back: string;
  type: string;
}

export interface ParsedOption {
  label: string;
  text: string;
}

export interface ParsedQuestion {
  stem: string;
  options: ParsedOption[];
}

export interface ParsedAnswer {
  answer: string;
  explanation: string;
}

export interface ExamDetail {
  card: Flashcard;
  userAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
}

export interface ExamRecord {
  id: string;
  date: string;
  score: number;
  passed: boolean;
  timeSpent: number;
  details: ExamDetail[];
  markedStatus?: Record<number, boolean>;
}
