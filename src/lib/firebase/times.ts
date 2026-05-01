import { db } from '@/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export async function getServerTime(): Promise<Date> {
  if (
    process.env.REACT_APP_USE_EMULATOR === 'true' &&
    typeof (window as any).__mockServerTime === 'number'
  ) {
    return new Date((window as any).__mockServerTime);
  }
  const ref = doc(db, '_serverTime', 'now');
  await setDoc(ref, { time: serverTimestamp() });
  const snap = await getDoc(ref);
  return snap.data()!.time.toDate();
}
