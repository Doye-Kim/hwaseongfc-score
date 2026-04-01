import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';
import styles from '@/pages/AdminPage.module.css';
import ScoreInputModal from './ScoreInputModal';
import { TEAM_NAMES } from '@/constants/teams';
import { formatMatchDate } from '@/lib/date';
import { Game, Prediction } from '@/types';
import {
  getAllPredictions,
  getCorrectPredictions,
  getFirstPage,
  getNextPage,
  getPredictionCount,
} from '@/lib/firebase/admin';
import useCursorPagination from '@/hooks/useCursorPagination';

const PARTICIPATE_PAGE_SIZE = 10;

const ManageParticipants = ({ games }: { games: Game[] }) => {
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const selectedGame = games.find((g) => g.id === selectedGameId);

  const {
    items: predictions,
    currentPage,
    hasNext,
    loadFirst,
    handleNext,
    handlePrev,
  } = useCursorPagination<Prediction>(
    PARTICIPATE_PAGE_SIZE,
    () => getFirstPage(selectedGameId),
    (cursor) => getNextPage(selectedGameId, cursor),
  );

  useEffect(() => {
    if (games.length > 0) {
      setSelectedGameId(games[0].id);
    }
  }, [games]);

  useEffect(() => {
    if (!selectedGameId) return;

    async function fetchCount() {
      const count = await getPredictionCount(selectedGameId);
      setTotalCount(count);
    }

    fetchCount();
    loadFirst();
    // loadFirst는 매 렌더마다 재생성되므로 deps에 포함하면 무한 루프 발생함
    // fetchFirstRef/fetchNextRef로 최신 함수를 참조하므로 stale closure 문제 없음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGameId]);

  const handleCorrectExport = async (home: number, opponent: number) => {
    handleExport(home, opponent);
    setShowModal(false);
  };

  const handleExport = async (home?: number, opponent?: number) => {
    let data;
    const isCorrect = home !== undefined && opponent !== undefined;
    if (isCorrect) {
      data = await getCorrectPredictions(selectedGameId, home, opponent);
    } else data = await getAllPredictions(selectedGameId);

    if (data.length === 0) {
      alert(`${isCorrect ? '정답자' : '참여자'}가 없습니다.`);
      return;
    }
    const worksheetData = [
      [
        'NO',
        '이름',
        '전화번호',
        TEAM_NAMES['hwaseong'],
        TEAM_NAMES[selectedGame!.opponent],
      ],
      ...data.map((p, i) => [
        i + 1,
        p.name,
        p.phone,
        p.homeScore,
        p.opponentScore,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 16 },
      { wch: 10 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    if (isCorrect)
      XLSX.utils.book_append_sheet(workbook, worksheet, '정답자 목록');
    else XLSX.utils.book_append_sheet(workbook, worksheet, '참여자 목록');

    const fileName = `${isCorrect ? '정답자' : '참여자'}_${
      TEAM_NAMES[selectedGame!.opponent]
    }_${formatMatchDate(selectedGame!.matchTime.toDate())}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (games.length === 0) return null;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <span className={styles.sectionTitle}>참여자 조회</span>
          <span className={styles.sectionCount}>{totalCount}명</span>
        </div>
        <div className={styles.participantControls}>
          <select
            className={styles.gameSelect}
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {TEAM_NAMES[g.opponent]} (
                {formatMatchDate(g.matchTime.toDate())})
              </option>
            ))}
          </select>
          <button className={styles.exportBtn} onClick={() => handleExport()}>
            ↓ 전체 다운로드
          </button>
          <button
            className={styles.exportBtn}
            onClick={() => setShowModal(true)}>
            ↓ 정답자 다운로드
          </button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {predictions.length === 0 ? (
          <div className={styles.emptyState}>참여자가 없습니다.</div>
        ) : (
          selectedGame && (
            <table className={styles.table}>
              <thead>
                <tr>
                  {[
                    'NO',
                    '이름',
                    '전화번호',
                    `${TEAM_NAMES['hwaseong']}`,
                    `${TEAM_NAMES[selectedGame.opponent]}`,
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {predictions.map((p, i) => (
                  <tr key={i}>
                    <td className={styles.noNum}>
                      {(currentPage - 1) * PARTICIPATE_PAGE_SIZE + i + 1}
                    </td>
                    <td className={styles.opponent}>{p.name}</td>
                    <td>{p.phone}</td>
                    <td>
                      <span className={styles.scoreCell}>{p.homeScore}</span>
                    </td>
                    <td>
                      <span className={styles.scoreCell}>
                        {p.opponentScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {predictions.length > 0 && (
        <div className={styles.prevNextWrap}>
          <button
            className={styles.prevNextBtn}
            disabled={currentPage === 1}
            onClick={handlePrev}>
            ← 이전
          </button>
          <button
            className={styles.prevNextBtn}
            disabled={!hasNext}
            onClick={handleNext}>
            다음 →
          </button>
        </div>
      )}
      {showModal && (
        <ScoreInputModal
          opponentKey={selectedGame!.opponent}
          onConfirm={handleCorrectExport}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ManageParticipants;
