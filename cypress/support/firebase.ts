import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({ projectId: 'hwaseongfc-e8890' });
  }
  return getFirestore();
}

export async function seedActiveGame(gameId: string) {
  const db = getAdminDb();
  const now = Date.now();
  await db
    .collection('games')
    .doc(gameId)
    .set({
      opponent: 'gimhae',
      matchTime: Timestamp.fromMillis(now + 60 * 60 * 1000), // 1시간 후
      openTime: Timestamp.fromMillis(now - 60 * 60 * 1000), // 1시간 전
      closeTime: Timestamp.fromMillis(now + 55 * 60 * 1000), // 55분 후
    });
}

export async function seedClosedGame(gameId: string) {
  const db = getAdminDb();
  const now = Date.now();
  await db
    .collection('games')
    .doc(gameId)
    .set({
      opponent: 'gimhae',
      matchTime: Timestamp.fromMillis(now - 60 * 60 * 1000), // 1시간 전
      openTime: Timestamp.fromMillis(now - 3 * 60 * 60 * 1000), // 3시간 전
      closeTime: Timestamp.fromMillis(now - 65 * 60 * 1000), // 65분 전
    });
}

export async function clearCollection(collectionName: string) {
  const db = getAdminDb();
  const snap = await db.collection(collectionName).get();
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

export async function seedNextGame(gameId: string, openTime: number) {
  const db = getAdminDb();
  const matchTime = openTime + 2 * 60 * 60 * 1000;
  const closeTime = matchTime - 5 * 60 * 1000;
  await db.collection('games').doc(gameId).set({
    opponent: 'sangju',
    matchTime: Timestamp.fromMillis(matchTime),
    openTime: Timestamp.fromMillis(openTime),
    closeTime: Timestamp.fromMillis(closeTime),
  });
}

export async function seedCountdownGame(gameId: string, openTime: number) {
  const db = getAdminDb();
  const matchTime = openTime + 2 * 60 * 60 * 1000;
  const closeTime = matchTime - 5 * 60 * 1000;
  await db.collection('games').doc(gameId).set({
    opponent: 'sangju',
    matchTime: Timestamp.fromMillis(matchTime),
    openTime: Timestamp.fromMillis(openTime),
    closeTime: Timestamp.fromMillis(closeTime),
  });
}

export async function seedAdminUser(uid: string) {
  const adminAuth = getAuth();
  try {
    await adminAuth.createUser({ uid, email: 'admin@test.com' });
  } catch (e: any) {
    if (e.code !== 'auth/uid-already-exists') throw e;
  }
  const db = getAdminDb();
  await db.collection('users').doc(uid).set({ isAdmin: true });
}

export async function getCustomToken(uid: string) {
  const adminAuth = getAuth();
  return adminAuth.createCustomToken(uid);
}
