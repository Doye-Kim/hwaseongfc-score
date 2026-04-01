import { db } from '@/firebase';
import { getServerTime } from './times';
import { serverTimestamp, getDoc, doc, setDoc } from 'firebase/firestore';

interface Props {
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
}: Props) {
  const rawPhone = phone.replace(/-/g, '');
  const docId = `${gameId}_${rawPhone}`;
  const existing = await getDoc(doc(db, 'predictions', docId));
  if (existing.exists())
    throw new Error('이미 해당 번호로 예측을 제출하셨습니다');

  const serverTime = await getServerTime();

  const gameSnap = await getDoc(doc(db, 'games', gameId));
  if (!gameSnap.exists()) throw new Error('존재하지 않는 경기입니다');

  const closeTime = gameSnap.data()!.closeTime.toDate();
  const openTime = gameSnap.data()!.openTime.toDate();

  if (serverTime >= closeTime)
    throw new Error('이번 경기 예측이 마감되었습니다');

  if (serverTime < openTime) throw new Error('아직 예측 오픈 전입니다');
  await setDoc(doc(db, 'predictions', docId), {
    gameId,
    name,
    phone: rawPhone,
    homeScore,
    opponentScore,
    createdAt: serverTimestamp(),
  });
}
