describe('스코어 예측 제출', () => {
  const GAME_ID = 'test-game-1';

  beforeEach(() => {
    cy.task('clearCollection', 'predictions');
    cy.task('clearCollection', 'games');
    cy.task('seedActiveGame', GAME_ID);
  });

  it('예측을 정상적으로 제출할 수 있다', () => {
    cy.visit('/');
    cy.screenshot('after-visit');
    cy.contains('예측 제출하기').click();

    cy.get('input[placeholder="이름"]').type('홍길동');
    cy.get('input[placeholder*="전화번호"]').type('01012345678');

    cy.contains('참여자 정보 입력').should('be.visible');
    cy.get('[data-testid="submit-button"]').click();

    cy.contains('제출되었습니다').should('exist');
  });
});
