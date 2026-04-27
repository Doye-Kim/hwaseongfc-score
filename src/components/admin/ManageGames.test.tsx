import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageGames from './ManageGames';
import { Game } from '@/types';
import { Timestamp } from 'firebase/firestore';

jest.mock('@/context/ServerTimeContext', () => ({
  useServerOffset: () => 0,
}));

jest.mock('@/firebase', () => ({
  logEvent: jest.fn(),
  db: {},
}));

const mockUpdateGameFull = jest.fn().mockResolvedValue(undefined);
const mockFormatGames = jest.fn();

jest.mock('@/lib/firebase/admin', () => ({
  getGamesQuery: jest.fn(),
  formatGames: (...args: unknown[]) => mockFormatGames(...args),
  updateGameFull: (...args: unknown[]) => mockUpdateGameFull(...args),
  deleteGame: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn().mockResolvedValue({ docs: [] }),
  Timestamp: {
    fromDate: (d: Date) => ({
      toDate: () => d,
      seconds: Math.floor(d.getTime() / 1000),
      nanoseconds: 0,
    }),
  },
}));

function makeTimestamp(date: Date) {
  return {
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  } as unknown as Timestamp;
}

const MATCH_DATE = new Date('2026-06-01T16:00:00');
const CLOSE_DATE = new Date('2026-06-01T15:55:00');

const mockGame: Game = {
  id: 'game-1',
  opponent: 'sangju',
  matchTime: makeTimestamp(MATCH_DATE),
  openTime: makeTimestamp(new Date('2026-06-01T14:00:00')),
  closeTime: makeTimestamp(CLOSE_DATE),
  status: '예정',
};

function toLocalInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function renderComponent() {
  mockFormatGames.mockReturnValue([mockGame]);
  const setGames = jest.fn();
  render(<ManageGames games={[mockGame]} setGames={setGames} />);
  return { setGames };
}

describe('ManageGames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 렌더링 시 아코디언 패널이 보이지 않는다', () => {
    renderComponent();
    expect(screen.queryByLabelText('경기 시작 시간')).not.toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 아코디언 패널이 열린다', () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));
    expect(screen.getByLabelText('경기 시작 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('예측 종료 시간')).toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 아코디언 패널이 닫힌다', () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));
    fireEvent.click(screen.getByText('취소'));
    expect(screen.queryByLabelText('경기 시작 시간')).not.toBeInTheDocument();
  });

  it('아코디언이 열리면 현재 경기 시작/종료 시간이 input에 채워진다', () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));

    const matchInput = screen.getByLabelText(
      '경기 시작 시간',
    ) as HTMLInputElement;
    const closeInput = screen.getByLabelText(
      '예측 종료 시간',
    ) as HTMLInputElement;

    expect(matchInput.value).toBe(toLocalInput(MATCH_DATE));
    expect(closeInput.value).toBe(toLocalInput(CLOSE_DATE));
  });

  it('경기 시작 시간 변경 시 예측 종료 시간이 5분 전으로 자동 업데이트된다', () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));

    const newMatchDate = new Date('2026-06-01T18:00:00');
    const expectedCloseDate = new Date('2026-06-01T17:55:00');

    const matchInput = screen.getByLabelText('경기 시작 시간');
    fireEvent.change(matchInput, {
      target: { value: toLocalInput(newMatchDate) },
    });

    const closeInput = screen.getByLabelText(
      '예측 종료 시간',
    ) as HTMLInputElement;
    expect(closeInput.value).toBe(toLocalInput(expectedCloseDate));
  });

  it('예측 종료 시간을 수동으로 변경할 수 있다', () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));

    const customClose = new Date('2026-06-01T15:30:00');
    const closeInput = screen.getByLabelText('예측 종료 시간');
    fireEvent.change(closeInput, {
      target: { value: toLocalInput(customClose) },
    });

    expect((closeInput as HTMLInputElement).value).toBe(
      toLocalInput(customClose),
    );
  });

  it('저장 클릭 시 updateGameFull이 올바른 인자로 호출된다', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));

    const newMatchDate = new Date('2026-06-01T18:00:00');
    const customClose = new Date('2026-06-01T17:45:00');

    fireEvent.change(screen.getByLabelText('경기 시작 시간'), {
      target: { value: toLocalInput(newMatchDate) },
    });
    fireEvent.change(screen.getByLabelText('예측 종료 시간'), {
      target: { value: toLocalInput(customClose) },
    });

    fireEvent.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(mockUpdateGameFull).toHaveBeenCalledWith(
        'game-1',
        newMatchDate,
        customClose,
      );
    });
  });

  it('시작 시간만 바꾸고 저장하면 closeTime은 자동계산값(5분 전)으로 저장된다', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));

    const newMatchDate = new Date('2026-06-01T18:00:00');
    const expectedAutoClose = new Date('2026-06-01T17:55:00');

    fireEvent.change(screen.getByLabelText('경기 시작 시간'), {
      target: { value: toLocalInput(newMatchDate) },
    });

    fireEvent.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(mockUpdateGameFull).toHaveBeenCalledWith(
        'game-1',
        newMatchDate,
        expectedAutoClose,
      );
    });
  });
});
