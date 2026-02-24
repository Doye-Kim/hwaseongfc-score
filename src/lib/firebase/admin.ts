import { db } from '@/firebase';
import { Game } from '@/types';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  DocumentSnapshot,
  getDocs,
  startAfter,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';

const PAGE_SIZE = 10;

export function getGamesQuery() {
  return query(collection(db, 'games'), orderBy('matchTime', 'asc'));
}

export async function updateGameTime(id: string, matchTime: Date) {
  await updateDoc(doc(db, 'games', id), {
    matchTime: Timestamp.fromDate(matchTime),
    openTime: Timestamp.fromDate(
      new Date(matchTime.getTime() - 2 * 60 * 60 * 1000),
    ),
    closeTime: Timestamp.fromDate(
      new Date(matchTime.getTime() - 5 * 60 * 1000),
    ),
  });
}

export async function deleteGame(id: string) {
  await deleteDoc(doc(db, 'games', id));
}

export function formatGames(snapshot: QuerySnapshot, offset: number): Game[] {
  const now = Timestamp.fromMillis(Date.now() + offset);
  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      opponent: d.opponent,
      matchTime: d.matchTime,
      openTime: d.openTime,
      closeTime: d.closeTime,
      status: d.matchTime.toDate() < now.toDate() ? '종료' : '예정',
    };
  });
}

export async function getFirstPage(gameId: string) {
  const q = query(
    collection(db, 'predictions'),
    where('gameId', '==', gameId),
    orderBy('createdAt', 'asc'),
    limit(PAGE_SIZE),
  );

  const snapshot = await getDocs(q);
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return { data, lastVisible };
}

export async function getNextPage(
  gameId: string,
  lastVisible: DocumentSnapshot,
) {
  const q = query(
    collection(db, 'predictions'),
    where('gameId', '==', gameId),
    orderBy('createdAt', 'asc'),
    startAfter(lastVisible),
    limit(PAGE_SIZE),
  );

  const snapshot = await getDocs(q);
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const newLastVisible = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return { data, lastVisible: newLastVisible };
}
