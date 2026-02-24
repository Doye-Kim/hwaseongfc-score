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
