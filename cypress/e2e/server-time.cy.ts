const SERVER_TIME_GAME_ID = 'server-time-test-game';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

describe('서버 시간 기준 D-day 검증', () => {
  beforeEach(() => {
    cy.task('clearCollection', 'games');
  });

  it('기기 시간이 1일 앞이어도 서버 시간 기준 D-3이 표시된다', () => {
    // 서버 시간이 1일 뒤처진 상황: 앱은 offset=-1day로 계산
    // openTime = 가짜 서버 시간 + 3일 = 실제 now - 1일 + 3일 = now + 2일
    const fakeServerTime = Date.now() - ONE_DAY_MS;
    cy.task('seedNextGame', {
      gameId: SERVER_TIME_GAME_ID,
      openTime: fakeServerTime + 3 * ONE_DAY_MS,
    });

    cy.visit('/', {
      onBeforeLoad(win) {
        (win as any).__mockServerTime = fakeServerTime;
      },
    });

    cy.contains('D -').should('be.visible');
    cy.contains('3').should('be.visible');
  });

  it('기기 시간이 1시간 앞이어도 서버 시간 기준 카운트다운이 표시된다', () => {
    // 서버 시간이 1시간 뒤처진 상황: offset=-1hour
    // openTime = 가짜 서버 시간 + 2시간 = now - 1시간 + 2시간 = now + 1시간
    const fakeServerTime = Date.now() - ONE_HOUR_MS;
    cy.task('seedCountdownGame', {
      gameId: SERVER_TIME_GAME_ID,
      openTime: fakeServerTime + 2 * ONE_HOUR_MS,
    });

    cy.visit('/', {
      onBeforeLoad(win) {
        (win as any).__mockServerTime = fakeServerTime;
      },
    });

    cy.contains(/^01:\d{2}:\d{2}$/).should('be.visible');
  });
});
