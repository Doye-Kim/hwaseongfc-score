import { db } from '@/firebase';
import { Game, Prediction } from '@/types';
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
  writeBatch,
  getCountFromServer,
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
  const snapshot = await getDocs(
    query(collection(db, 'predictions'), where('gameId', '==', id)),
  );

  const chunks = [];
  for (let i = 0; i < snapshot.docs.length; i += 499) {
    chunks.push(snapshot.docs.slice(i, i + 499));
  }

  if (chunks.length === 0) {
    await deleteDoc(doc(db, 'games', id));
    return;
  }

  for (let i = 0; i < chunks.length; i++) {
    const batch = writeBatch(db);
    chunks[i].forEach((d) => batch.delete(d.ref));

    if (i === chunks.length - 1) {
      batch.delete(doc(db, 'games', id));
    }

    await batch.commit();
  }
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

export async function getPredictionCount(gameId: string) {
  const q = query(collection(db, 'predictions'), where('gameId', '==', gameId));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function getAllPredictions(gameId: string) {
  const q = query(
    collection(db, 'predictions'),
    where('gameId', '==', gameId),
    orderBy('createdAt', 'asc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Prediction, 'id'>),
  }));
}

export async function getCorrectPredictions(
  gameId: string,
  homeScore: number,
  opponentScore: number,
) {
  const q = query(
    collection(db, 'predictions'),
    where('gameId', '==', gameId),
    where('homeScore', '==', homeScore),
    where('opponentScore', '==', opponentScore),
    orderBy('createdAt', 'asc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Prediction, 'id'>),
  }));
}

export async function getFirstPage(gameId: string) {
  const q = query(
    collection(db, 'predictions'),
    where('gameId', '==', gameId),
    orderBy('createdAt', 'asc'),
    limit(PAGE_SIZE),
  );

  const snapshot = await getDocs(q);
  const data: Prediction[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Prediction, 'id'>), // ← 여기 as 추가
  }));
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
  const data: Prediction[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Prediction, 'id'>), // ← 여기 as 추가
  }));
  const newLastVisible = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return { data, lastVisible: newLastVisible };
}
