function formatMatchDate(date: Date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const day = days[date.getDay()];
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}년 ${m}월 ${d}일 (${day}) ${hh}:${mm}`;
}

type DDayResult =
  | { type: 'days'; display: number }
  | { type: 'countdown'; display: string };

function getDDayDisplay(date: Date, now: number): DDayResult {
  const diff = date.getTime() - now;
  if (diff <= 0) return { type: 'countdown', display: '00:00:00' };

  const targetDay = new Date(date).setHours(0, 0, 0, 0);
  const todayDay = new Date(now).setHours(0, 0, 0, 0);
  const days = Math.round((targetDay - todayDay) / (1000 * 60 * 60 * 24));

  if (days >= 1) return { type: 'days', display: days };

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    type: 'countdown',
    display: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(seconds).padStart(2, '0')}`,
  };
}

function getTimeLeft(closeTime: Date, now: number): string {
  const diff = closeTime.getTime() - now;

  if (diff <= 0) return '마감';

  const totalMin = Math.floor(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) {
    if (m > 0) return `${h}시간 ${m}분 후 마감`;
    return `${h}시간 후 마감`;
  } else if (m > 0) return `${m}분 후 마감`;
  return `${s}초 후 마감`;
}

export { formatMatchDate, getDDayDisplay, getTimeLeft };
