function formatMatchDate(date: Date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = days[date.getDay()];
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}년 ${m}월 ${d}일 (${day}) ${hh}:${mm}`;
}

type DDayResult =
  | { type: 'days'; display: number }
  | { type: 'countdown'; display: string };

function getDDayDisplay(date: Date): DDayResult {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff <= 0) return { type: 'countdown', display: '00:00:00' };

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));

  if (days >= 1) return { type: 'days', display: days };

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

function getTimeLeft(closeTime: Date): string {
  const now = new Date();
  const diff = closeTime.getTime() - now.getTime();
  if (diff <= 0) return '마감';
  const totalMin = Math.floor(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}시간 ${m}분 후 마감`;
  return `${m}분 후 마감`;
}

export { formatMatchDate, getDDayDisplay, getTimeLeft };
