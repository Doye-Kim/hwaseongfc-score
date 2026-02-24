import { useState, useEffect } from 'react';
import { getDocs } from 'firebase/firestore';
import { useServerOffset } from '@/context/ServerTimeContext';
import styles from '@/pages/AdminPage.module.css';
import { TEAM_NAMES } from '@/constants/teams';
import { formatMatchDate } from '@/lib/date';
import { Game } from '@/types';
import {
  getGamesQuery,
  formatGames,
  updateGameTime,
  deleteGame,
} from '@/lib/firebase/admin';

const GAMES_PER_PAGE = 4;
const GAMES_TOTAL_PAGE = 4;

const ManageGames = () => {
  const offset = useServerOffset();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function fetchGames() {
      const snapshot = await getDocs(getGamesQuery());
      setGames(formatGames(snapshot, offset));
    }

    fetchGames();
  }, [offset]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const pagedGames = games.slice(
    (currentPage - 1) * GAMES_PER_PAGE,
    currentPage * GAMES_PER_PAGE,
  );

  const handleEdit = (game: Game) => {
    setEditingId(game.id);
    const date = game.matchTime.toDate();
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    setEditTime(local.toISOString().slice(0, 16));
  };

  const handleSave = async (id: string) => {
    const matchDate = new Date(editTime);
    await updateGameTime(id, matchDate);

    const snapshot = await getDocs(getGamesQuery());
    setGames(formatGames(snapshot, offset));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('경기를 삭제하시겠습니까?')) {
      await deleteGame(id);
      setGames(games.filter((g) => g.id !== id));
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <span className={styles.sectionTitle}>경기 관리</span>
          <span className={styles.sectionCount}>{games.length}경기</span>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['NO', '상대팀', '경기 일시', '상태', '관리'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedGames.map((game) => {
              const isDone = game.status === '종료';
              const originalNo = games.findIndex((g) => g.id === game.id) + 1;

              return (
                <tr key={game.id}>
                  <td className={styles.noNum}>{originalNo}</td>

                  {editingId === game.id ? (
                    <>
                      <td className={`${styles.opponent}`}>
                        {TEAM_NAMES[game.opponent]}
                      </td>
                      <td>
                        <input
                          type='datetime-local'
                          className={styles.editInput}
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                        />
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            isDone ? styles.badgeDone : styles.badgeUpcoming
                          }`}>
                          {game.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`${styles.actionBtn} ${styles.btnSave}`}
                          onClick={() => handleSave(game.id)}>
                          저장
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.btnCancel}`}
                          onClick={() => setEditingId(null)}>
                          취소
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={styles.opponent}>
                        {TEAM_NAMES[game.opponent]}
                      </td>
                      <td>{formatMatchDate(game.matchTime.toDate())}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            isDone ? styles.badgeDone : styles.badgeUpcoming
                          }`}>
                          {game.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`${styles.actionBtn} ${styles.btnEdit}`}
                          onClick={() => handleEdit(game)}>
                          수정
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.btnDelete}`}
                          onClick={() => handleDelete(game.id)}>
                          삭제
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        {Array.from({ length: GAMES_TOTAL_PAGE }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              className={`${styles.pageBtn} ${
                page === currentPage ? styles.pageBtnActive : ''
              }`}
              onClick={() => setCurrentPage(page)}>
              {page}
            </button>
          ),
        )}
      </div>
    </div>
  );
};
export default ManageGames;
