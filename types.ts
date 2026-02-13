export enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3
}

export interface Question {
  lvl: Difficulty;
  q: string;
  a: string[];
  correct: number;
  exp: string;
}

export interface Exam {
  id: number;
  subject: string;
  lecturer: string;
  email: string;
  phone?: string;
  date: string;
  originalDate?: string; 
  completedAt?: number; // תאריך השלמת המשימה לטובת מיון
  link: string;
  linkTitle?: string;
  adminNote: string;
  link2?: string;
  note2?: string;
  status: 'active' | 'archive';
}