import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import styles from '@/pages/AdminPage.module.css';
import { TEAM_NAMES } from '@/constants/teams';
import { formatMatchDate } from '@/lib/date';
import { Game, Prediction } from '@/types';
import {
  getAllPredictions,
  getFirstPage,
  getNextPage,
  getPredictionCount,
} from '@/lib/firebase/admin';

const PARTICIPATE_PAGE_SIZE = 10;

const ManageParticipants = ({ games }: { games: Game[] }) => {
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const selectedGame = games.find((g) => g.id === selectedGameId);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [cursorStack, setCursorStack] = useState<DocumentSnapshot[]>([]);
  const [hasNext, setHasNext] = useState(false);

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

    async function fetchFirst() {
      const { data, lastVisible: last } = await getFirstPage(selectedGameId);
      setPredictions(data);
      setLastVisible(last);
      setCursorStack([]);
      setCurrentPage(1);
      setHasNext(data.length === PARTICIPATE_PAGE_SIZE);
    }
    fetchCount();
    fetchFirst();
  }, [selectedGameId]);

  const handleExport = async () => {
    const data = await getAllPredictions(selectedGameId);

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
      { wch: 6 }, // NO
      { wch: 12 }, // 이름
      { wch: 16 }, // 전화번호
      { wch: 10 }, // 화성
      { wch: 14 }, // 상대팀
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '참여자 목록');

    const fileName = `참여자_${
      TEAM_NAMES[selectedGame!.opponent]
    }_${formatMatchDate(selectedGame!.matchTime.toDate())}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleNext = async () => {
    if (!lastVisible) return;
    const currentCursor = lastVisible;
    const { data, lastVisible: newLast } = await getNextPage(
      selectedGameId,
      currentCursor,
    );
    setCursorStack((prev) => [...prev, currentCursor]);
    setPredictions(data);
    setLastVisible(newLast);
    setCurrentPage((p) => p + 1);
    setHasNext(data.length === PARTICIPATE_PAGE_SIZE);
  };

  const handlePrev = async () => {
    const stack = [...cursorStack];
    stack.pop();
    const prevCursor = stack[stack.length - 1];
    setCursorStack(stack);

    if (!prevCursor) {
      const { data, lastVisible: newLast } = await getFirstPage(selectedGameId);
      setPredictions(data);
      setLastVisible(newLast);
    } else {
      const { data, lastVisible: newLast } = await getNextPage(
        selectedGameId,
        prevCursor,
      );
      setPredictions(data);
      setLastVisible(newLast);
    }
    setCurrentPage((p) => p - 1);
    setHasNext(true);
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
            onChange={(e) => {
              setSelectedGameId(e.target.value);
              setCurrentPage(1);
            }}>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {TEAM_NAMES[g.opponent]} (
                {formatMatchDate(g.matchTime.toDate())})
              </option>
            ))}
          </select>
          <button className={styles.exportBtn} onClick={handleExport}>
            ↓ xlsx 다운로드
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
    </div>
  );
};

export default ManageParticipants;
