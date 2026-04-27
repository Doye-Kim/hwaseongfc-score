const GAME_ID = 'test-game-1';
const ADMIN_UID = 'test-admin-uid';

function loginAsAdmin() {
  cy.task('getCustomToken', ADMIN_UID).then((token) => {
    cy.window().then((win) => {
      return (win as any).__signInWithCustomToken(token);
    });
  });
}

describe('관리자 경기 시간 수정', () => {
  beforeEach(() => {
    cy.task('clearCollection', 'games');
    cy.task('clearCollection', 'users');
    cy.task('seedAdminUser', ADMIN_UID);
    cy.task('seedActiveGame', GAME_ID);

    cy.visit('/admin');
    loginAsAdmin();
    cy.contains('경기 관리').should('be.visible');
  });

  it('시작 시간 변경 후 오픈/마감 시간을 수동으로 덮어써도 덮어쓴 값으로 저장된다', () => {
    cy.contains('수정').first().click();

    cy.get('input[type="datetime-local"]').first().clear().type('2026-06-01T18:00');

    // 자동계산 확인
    cy.get('input[type="datetime-local"]').eq(1).should('have.value', '2026-06-01T16:00');
    cy.get('input[type="datetime-local"]').eq(2).should('have.value', '2026-06-01T17:55');

    // 수동으로 덮어쓰기
    cy.get('input[type="datetime-local"]').eq(1).clear().type('2026-06-01T15:00');
    cy.get('input[type="datetime-local"]').eq(2).clear().type('2026-06-01T17:30');

    cy.contains('저장').click();
    cy.contains('경기 시작 시간').should('not.exist');

    // 다시 열어서 저장된 값 확인
    cy.contains('수정').first().click();
    cy.get('input[type="datetime-local"]').first().should('have.value', '2026-06-01T18:00');
    cy.get('input[type="datetime-local"]').eq(1).should('have.value', '2026-06-01T15:00');
    cy.get('input[type="datetime-local"]').eq(2).should('have.value', '2026-06-01T17:30');
  });

  it('저장 후 변경된 시간이 유지된다', () => {
    cy.contains('수정').first().click();

    cy.get('input[type="datetime-local"]').first().clear().type('2026-06-01T18:00');
    cy.get('input[type="datetime-local"]').eq(1).clear().type('2026-06-01T15:00');
    cy.get('input[type="datetime-local"]').eq(2).clear().type('2026-06-01T17:45');

    cy.contains('저장').click();
    cy.contains('경기 시작 시간').should('not.exist');

    cy.contains('수정').first().click();
    cy.get('input[type="datetime-local"]').first().should('have.value', '2026-06-01T18:00');
    cy.get('input[type="datetime-local"]').eq(1).should('have.value', '2026-06-01T15:00');
    cy.get('input[type="datetime-local"]').eq(2).should('have.value', '2026-06-01T17:45');
  });
});
