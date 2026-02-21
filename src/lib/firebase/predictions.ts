import { db } from '@/firebase';
import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';

interface PredictionProps {
  gameId: string;
  name: string;
  phone: string;
  homeScore: number;
  opponentScore: number;
}
export async function submitPrediction({
  gameId,
  name,
  phone,
  homeScore,
  opponentScore,
}: PredictionProps) {
  const rawPhone = phone.replace(/-/g, '');
  const duplicateQuery = query(
    collection(db, 'predictions'),
    where('gameId', '==', gameId),
    where('phone', '==', rawPhone),
  );

  const existing = await getDocs(duplicateQuery);
  if (!existing.empty)
    throw new Error('이미 해당 번호로 예측을 제출하셨습니다');

  await addDoc(collection(db, 'predictions'), {
    gameId,
    name,
    phone: rawPhone,
    homeScore,
    opponentScore,
    createdAt: serverTimestamp(),
  });
}
