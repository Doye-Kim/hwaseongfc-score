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
const OPEN_DATE = new Date('2026-06-01T14:00:00');
const CLOSE_DATE = new Date('2026-06-01T15:55:00');

const mockGame: Game = {
  id: 'game-1',
  opponent: 'sangju',
  matchTime: makeTimestamp(MATCH_DATE),
  openTime: makeTimestamp(OPEN_DATE),
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
    window.alert = jest.fn();
  });

  it('초기 렌더링 시 아코디언 패널이 보이지 않는다', () => {
    renderComponent();
    expect(screen.queryByLabelText('경기 시작 시간')).not.toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 아코디언 패널이 열린다', () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));
    expect(screen.getByLabelText('경기 시작 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('예측 마감 시간')).toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 아코디언 패널이 닫힌다', () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));
    fireEvent.click(screen.getByText('취소'));
    expect(screen.queryByLabelText('경기 시작 시간')).not.toBeInTheDocument();
  });

  it('아코디언이 열리면 현재 시간들이 input에 채워진다', () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));

    expect(
      (screen.getByLabelText('경기 시작 시간') as HTMLInputElement).value,
    ).toBe(toLocalInput(MATCH_DATE));
    expect(
      (screen.getByLabelText('예측 오픈 시간') as HTMLInputElement).value,
    ).toBe(toLocalInput(OPEN_DATE));
    expect(
      (screen.getByLabelText('예측 마감 시간') as HTMLInputElement).value,
    ).toBe(toLocalInput(CLOSE_DATE));
  });

  it('경기 시작 시간 변경 시 오픈/마감이 자동 업데이트되고 그 값으로 저장된다', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));

    const newMatchDate = new Date('2026-06-01T18:00:00');
    fireEvent.change(screen.getByLabelText('경기 시작 시간'), {
      target: { value: toLocalInput(newMatchDate) },
    });

    expect((screen.getByLabelText('예측 오픈 시간') as HTMLInputElement).value)
      .toBe(toLocalInput(new Date('2026-06-01T16:00:00')));
    expect((screen.getByLabelText('예측 마감 시간') as HTMLInputElement).value)
      .toBe(toLocalInput(new Date('2026-06-01T17:55:00')));

    fireEvent.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(mockUpdateGameFull).toHaveBeenCalledWith(
        'game-1',
        newMatchDate,
        new Date('2026-06-01T16:00:00'),
        new Date('2026-06-01T17:55:00'),
      );
    });
  });

  it('오픈/마감 시간을 수동으로 변경하면 그 값으로 저장된다', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));

    const newMatchDate = new Date('2026-06-01T18:00:00');
    const customOpen = new Date('2026-06-01T13:00:00');
    const customClose = new Date('2026-06-01T17:45:00');

    fireEvent.change(screen.getByLabelText('경기 시작 시간'), {
      target: { value: toLocalInput(newMatchDate) },
    });
    fireEvent.change(screen.getByLabelText('예측 오픈 시간'), {
      target: { value: toLocalInput(customOpen) },
    });
    fireEvent.change(screen.getByLabelText('예측 마감 시간'), {
      target: { value: toLocalInput(customClose) },
    });

    expect((screen.getByLabelText('예측 오픈 시간') as HTMLInputElement).value)
      .toBe(toLocalInput(customOpen));
    expect((screen.getByLabelText('예측 마감 시간') as HTMLInputElement).value)
      .toBe(toLocalInput(customClose));

    fireEvent.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(mockUpdateGameFull).toHaveBeenCalledWith(
        'game-1',
        newMatchDate,
        customOpen,
        customClose,
      );
    });
  });

  it('오픈 시간이 마감 시간보다 늦으면 저장되지 않는다', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('수정'));

    fireEvent.change(screen.getByLabelText('예측 오픈 시간'), {
      target: { value: toLocalInput(new Date('2026-06-01T16:00:00')) },
    });
    fireEvent.change(screen.getByLabelText('예측 마감 시간'), {
      target: { value: toLocalInput(new Date('2026-06-01T15:00:00')) },
    });

    fireEvent.click(screen.getByText('저장'));

    expect(window.alert).toHaveBeenCalledWith('예측 오픈 시간은 마감 시간보다 이전이어야 합니다');
    await waitFor(() => {
      expect(mockUpdateGameFull).not.toHaveBeenCalled();
    });
  });
});
