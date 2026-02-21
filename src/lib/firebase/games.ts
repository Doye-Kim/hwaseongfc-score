import { db } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';

export async function getActiveQuery(offset: number) {
  const now = Timestamp.fromMillis(Date.now() + offset);
  return query(
    collection(db, 'games'),
    where('openTime', '<=', now),
    where('closeTime', '>', now),
    limit(1),
  );
}

export async function getNextQuery(offset: number) {
  const now = Timestamp.fromMillis(Date.now() + offset);

  return query(
    collection(db, 'games'),
    where('openTime', '>', now),
    orderBy('openTime', 'asc'),
    limit(1),
  );
}
