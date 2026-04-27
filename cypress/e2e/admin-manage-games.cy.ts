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

  it('수정 버튼 클릭 시 아코디언 패널이 열린다', () => {
    cy.contains('저장').should('not.exist');
    cy.contains('수정').first().click();
    cy.contains('경기 시작 시간').should('be.visible');
    cy.contains('제출 마감 시간').should('be.visible');
    cy.contains('저장').should('be.visible');
  });

  it('취소 버튼 클릭 시 아코디언 패널이 닫힌다', () => {
    cy.contains('수정').first().click();
    cy.contains('취소').click();
    cy.contains('경기 시작 시간').should('not.exist');
  });

  it('경기 시작 시간 변경 시 제출 마감 시간이 5분 전으로 자동 업데이트된다', () => {
    cy.contains('수정').first().click();

    cy.get('input[type="datetime-local"]').first().then(($input) => {
      const newMatchTime = '2026-06-01T18:00';
      cy.wrap($input).clear().type(newMatchTime);

      cy.get('input[type="datetime-local"]').eq(1).should('have.value', '2026-06-01T17:55');
    });
  });

  it('경기 시작 시간 변경 후 제출 마감 시간을 수동으로 덮어쓸 수 있다', () => {
    cy.contains('수정').first().click();

    cy.get('input[type="datetime-local"]').first().clear().type('2026-06-01T18:00');
    cy.get('input[type="datetime-local"]').eq(1).should('have.value', '2026-06-01T17:55');

    cy.get('input[type="datetime-local"]').eq(1).clear().type('2026-06-01T17:30');
    cy.get('input[type="datetime-local"]').eq(1).should('have.value', '2026-06-01T17:30');
  });

  it('저장 후 변경된 시간이 유지된다', () => {
    cy.contains('수정').first().click();

    cy.get('input[type="datetime-local"]').first().clear().type('2026-06-01T18:00');
    cy.get('input[type="datetime-local"]').eq(1).clear().type('2026-06-01T17:45');

    cy.contains('저장').click();
    cy.contains('경기 시작 시간').should('not.exist');

    cy.contains('수정').first().click();
    cy.get('input[type="datetime-local"]').first().should('have.value', '2026-06-01T18:00');
    cy.get('input[type="datetime-local"]').eq(1).should('have.value', '2026-06-01T17:45');
  });
});
