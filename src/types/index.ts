import { Timestamp } from 'firebase/firestore';

export interface Game {
  id: string;
  opponent: string;
  matchTime: Timestamp;
  openTime: Timestamp;
  closeTime: Timestamp;
  status: '종료' | '예정';
}

export interface Prediction {
  id: string;
  gameId: string;
  name: string;
  phone: string;
  homeScore: number;
  opponentScore: number;
  createdAt: Timestamp;
}

export interface Quiz {
  id: string;
  gameId: string;
  question: string;
  openTime: Timestamp;
  closeTime: Timestamp;
  answer: 'O' | 'X' | null;
  createdAt: Timestamp;
}

export interface QuizParticipant {
  id: string;
  quizId: string;
  name: string;
  phone: string;
  answer: 'O' | 'X';
  submittedAt: Timestamp;
}
