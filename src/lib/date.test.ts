import { formatMatchDate, getDDayDisplay, getTimeLeft } from './date';

// 테스트용 고정 기준 시각
// 2026년 5월 1일 12:00:00 (금요일)
const BASE_NOW = new Date('2026-05-01T12:00:00').getTime();

// ─────────────────────────────────────────────
// formatMatchDate
// ─────────────────────────────────────────────
describe('formatMatchDate', () => {
  it('날짜를 올바른 형식으로 반환한다', () => {
    const date = new Date('2026-12-21T15:30:00');
    expect(formatMatchDate(date)).toBe('2026년 12월 21일 (월) 15:30');
  });

  it('월, 일이 한 자리일 때 앞에 0을 붙인다', () => {
    const date = new Date('2026-03-07T09:05:00');
    expect(formatMatchDate(date)).toBe('2026년 03월 07일 (토) 09:05');
  });

  it('요일이 올바르게 표시된다', () => {
    const cases: [string, string][] = [
      ['2026-05-03T10:00:00', '일'],
      ['2026-05-04T10:00:00', '월'],
      ['2026-05-05T10:00:00', '화'],
      ['2026-05-06T10:00:00', '수'],
      ['2026-05-07T10:00:00', '목'],
      ['2026-05-08T10:00:00', '금'],
      ['2026-05-09T10:00:00', '토'],
    ];
    cases.forEach(([dateStr, day]) => {
      expect(formatMatchDate(new Date(dateStr))).toContain(`(${day})`);
    });
  });
});

// ─────────────────────────────────────────────
// getDDayDisplay
// ─────────────────────────────────────────────
describe('getDDayDisplay', () => {
  it('다른 날이면 days 타입을 반환한다', () => {
    const target = new Date('2026-05-02T10:00:00');
    expect(getDDayDisplay(target, BASE_NOW)).toEqual({
      type: 'days',
      display: 1,
    });
  });

  it('같은 날이면 countdown 타입을 반환한다', () => {
    const target = new Date('2026-05-01T14:30:00');
    expect(getDDayDisplay(target, BASE_NOW)).toEqual({
      type: 'countdown',
      display: '02:30:00',
    });
  });

  it('전날 23시 59분이면 days 타입을 반환한다', () => {
    const target = new Date('2026-05-02T10:00:00');
    const now = new Date('2026-05-01T23:59:00').getTime();
    expect(getDDayDisplay(target, now)).toEqual({
      type: 'days',
      display: 1,
    });
  });

  it('당일 자정이 되면 countdown 타입을 반환한다', () => {
    const target = new Date('2026-05-02T10:00:00');
    const now = new Date('2026-05-02T00:00:00').getTime();
    expect(getDDayDisplay(target, now)).toEqual({
      type: 'countdown',
      display: '10:00:00',
    });
  });

  it('시간, 분, 초가 한 자리일 때 앞에 0을 붙인다', () => {
    const target = new Date(
      BASE_NOW + 1 * 60 * 60 * 1000 + 5 * 60 * 1000 + 3 * 1000,
    );
    expect(getDDayDisplay(target, BASE_NOW)).toEqual({
      type: 'countdown',
      display: '01:05:03',
    });
  });

  it('이미 지난 시각이면 00:00:00을 반환한다', () => {
    const target = new Date(BASE_NOW - 1000);
    expect(getDDayDisplay(target, BASE_NOW)).toEqual({
      type: 'countdown',
      display: '00:00:00',
    });
  });

  it('정확히 현재 시각이면 00:00:00을 반환한다', () => {
    const target = new Date(BASE_NOW);
    expect(getDDayDisplay(target, BASE_NOW)).toEqual({
      type: 'countdown',
      display: '00:00:00',
    });
  });
});

// ─────────────────────────────────────────────
// getTimeLeft
// ─────────────────────────────────────────────
describe('getTimeLeft', () => {
  it('1시간 30분 남았을 때 "N시간 N분 후 마감"을 반환한다', () => {
    const closeTime = new Date(BASE_NOW + 1 * 60 * 60 * 1000 + 30 * 60 * 1000);
    expect(getTimeLeft(closeTime, BASE_NOW)).toBe('1시간 30분 후 마감');
  });
  it('1시간 남았을 때 "N시간 후 마감"을 반환한다', () => {
    const closeTime = new Date(BASE_NOW + 1 * 60 * 60 * 1000);
    expect(getTimeLeft(closeTime, BASE_NOW)).toBe('1시간 후 마감');
  });

  it('1시간 미만 남았을 때 "N분 후 마감"을 반환한다', () => {
    const closeTime = new Date(BASE_NOW + 30 * 60 * 1000);
    expect(getTimeLeft(closeTime, BASE_NOW)).toBe('30분 후 마감');
  });

  it('1분 미만 남았을 때 "N초 후 마감"을 반환한다', () => {
    const closeTime = new Date(BASE_NOW + 30 * 1000);
    expect(getTimeLeft(closeTime, BASE_NOW)).toBe('30초 후 마감');
  });

  it('마감 시각이 지났을 때 "마감"을 반환한다', () => {
    const closeTime = new Date(BASE_NOW - 1000);
    expect(getTimeLeft(closeTime, BASE_NOW)).toBe('마감');
  });

  it('정확히 마감 시각일 때 "마감"을 반환한다', () => {
    const closeTime = new Date(BASE_NOW);
    expect(getTimeLeft(closeTime, BASE_NOW)).toBe('마감');
  });
});
