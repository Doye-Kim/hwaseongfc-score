import { db } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';

export function getActiveQuery() {
  const now = Timestamp.now();
  return query(
    collection(db, 'games'),
    where('openTime', '<=', now),
    where('closeTime', '>', now),
    limit(1),
  );
}

export function getNextQuery() {
  const now = Timestamp.now();
  return query(
    collection(db, 'games'),
    where('openTime', '>', now),
    orderBy('openTime', 'asc'),
    limit(1),
  );
}
