import { db } from '@/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export async function getServerTime(): Promise<Date> {
  const ref = doc(db, '_serverTime', 'now');
  await setDoc(ref, { time: serverTimestamp() });
  const snap = await getDoc(ref);
  return snap.data()!.time.toDate();
}
