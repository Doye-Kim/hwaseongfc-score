import { Timestamp } from 'firebase/firestore';

export type DisplayStatus = 'active' | 'scheduled' | 'closed';

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  active: '진행 중',
  scheduled: '예정',
  closed: '마감',
};

export function getDisplayStatus(openTime: Timestamp, closeTime: Timestamp, now: number): DisplayStatus {
  const openMs = openTime.toMillis();
  const closeMs = closeTime.toMillis();
  if (now < openMs) return 'scheduled';
  if (now <= closeMs) return 'active';
  return 'closed';
}

export function formatOpenTime(openTime: Timestamp): string {
  const d = openTime.toDate();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${h}:${min}`;
}

export function formatSubmittedAt(ts: Timestamp | null): string {
  if (!ts) return '-';
  const d = ts.toDate();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const time = d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${yy}.${mm}.${dd} ${time}`;
}

export function toLocalDateTimeInputs(date: Date): {
  date: string;
  time: string;
} {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const iso = local.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

export function buildOpenTimeDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

export function nowToInputs(): { date: string; time: string } {
  return toLocalDateTimeInputs(new Date());
}
