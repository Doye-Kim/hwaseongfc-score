import { db } from '@/firebase';
import { Quiz, QuizParticipant } from '@/types';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  DocumentSnapshot,
  getCountFromServer,
} from 'firebase/firestore';

export async function getActiveQuiz(serverTime: number): Promise<Quiz | null> {
  const snapshot = await getDocs(collection(db, 'quizzes'));
  for (const d of snapshot.docs) {
    const data = d.data();
    const openMs = data.openTime.toMillis();
    const closeMs = data.closeTime.toMillis();
    if (serverTime >= openMs && serverTime <= closeMs) {
      return { id: d.id, ...(data as Omit<Quiz, 'id'>) };
    }
  }
  return null;
}

export async function submitQuizAnswer(
  quizId: string,
  name: string,
  phone: string,
  answer: 'O' | 'X',
) {
  const rawPhone = phone.replace(/-/g, '');
  const docId = `${quizId}_${rawPhone}`;

  const existing = await getDoc(doc(db, 'participants', docId));
  if (existing.exists()) throw new Error('이미 해당 번호로 제출하셨습니다');

  try {
    await setDoc(doc(db, 'participants', docId), {
      quizId,
      name,
      phone: rawPhone,
      answer,
      submittedAt: serverTimestamp(),
    });
  } catch (e) {
    if (e instanceof FirebaseError && e.code === 'permission-denied') {
      throw new Error('퀴즈가 삭제되었거나 참여 가능 시간이 아닙니다');
    }
    throw e;
  }
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Quiz, 'id'>),
  }));
}

// 동시성 보장 없음 — 관리자 단일 사용자 환경 기준으로 pre-check만 수행
// 동시 등록이 필요한 경우 Firestore 트랜잭션으로 교체 필요
async function checkTimeOverlap(
  openMs: number,
  closeMs: number,
  excludeId?: string,
) {
  const snapshot = await getDocs(collection(db, 'quizzes'));
  for (const d of snapshot.docs) {
    if (excludeId && d.id === excludeId) continue;
    const data = d.data();
    const existOpen = data.openTime.toMillis();
    const existClose = data.closeTime.toMillis();
    if (openMs < existClose && existOpen < closeMs) {
      throw new Error('해당 시간대에 이미 등록된 퀴즈가 있습니다');
    }
  }
}

export async function createQuiz(
  question: string,
  gameId: string,
  answer: 'O' | 'X' | null,
  openTime: Date,
) {
  const openTimestamp = Timestamp.fromDate(openTime);
  const closeTimestamp = Timestamp.fromDate(
    new Date(openTime.getTime() + 10 * 60 * 1000),
  );

  await checkTimeOverlap(openTimestamp.toMillis(), closeTimestamp.toMillis());
  await addDoc(collection(db, 'quizzes'), {
    gameId,
    question,
    answer,
    openTime: openTimestamp,
    closeTime: closeTimestamp,
    createdAt: serverTimestamp(),
  });
}

export async function updateQuiz(
  quizId: string,
  question: string,
  gameId: string,
  answer: 'O' | 'X' | null,
  openTime: Date,
) {
  const openTimestamp = Timestamp.fromDate(openTime);
  const closeTimestamp = Timestamp.fromDate(
    new Date(openTime.getTime() + 10 * 60 * 1000),
  );
  await checkTimeOverlap(
    openTimestamp.toMillis(),
    closeTimestamp.toMillis(),
    quizId,
  );
  await updateDoc(doc(db, 'quizzes', quizId), {
    question,
    gameId,
    answer,
    openTime: openTimestamp,
    closeTime: closeTimestamp,
  });
}

export async function deleteQuiz(quizId: string) {
  await deleteDoc(doc(db, 'quizzes', quizId));
}

const QUIZ_PARTICIPANTS_PAGE_SIZE = 10;

export async function getQuizParticipants(
  quizId: string,
  answer?: 'O' | 'X',
): Promise<QuizParticipant[]> {
  const col = collection(db, 'participants');
  const q = answer
    ? query(
        col,
        where('quizId', '==', quizId),
        where('answer', '==', answer),
        orderBy('submittedAt', 'asc'),
      )
    : query(col, where('quizId', '==', quizId), orderBy('submittedAt', 'asc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<QuizParticipant, 'id'>),
  }));
}

export async function getQuizParticipantCount(quizId: string) {
  const q = query(
    collection(db, 'participants'),
    where('quizId', '==', quizId),
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function getFirstQuizParticipantsPage(quizId: string) {
  const q = query(
    collection(db, 'participants'),
    where('quizId', '==', quizId),
    orderBy('submittedAt', 'asc'),
    limit(QUIZ_PARTICIPANTS_PAGE_SIZE),
  );
  const snapshot = await getDocs(q);
  const data: QuizParticipant[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<QuizParticipant, 'id'>),
  }));
  return { data, lastVisible: snapshot.docs[snapshot.docs.length - 1] ?? null };
}

export async function getNextQuizParticipantsPage(
  quizId: string,
  lastVisible: DocumentSnapshot,
) {
  const q = query(
    collection(db, 'participants'),
    where('quizId', '==', quizId),
    orderBy('submittedAt', 'asc'),
    startAfter(lastVisible),
    limit(QUIZ_PARTICIPANTS_PAGE_SIZE),
  );
  const snapshot = await getDocs(q);
  const data: QuizParticipant[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<QuizParticipant, 'id'>),
  }));
  return { data, lastVisible: snapshot.docs[snapshot.docs.length - 1] ?? null };
}
