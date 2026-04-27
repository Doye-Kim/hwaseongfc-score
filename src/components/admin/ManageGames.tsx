import { getDocs } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useServerOffset } from '@/context/ServerTimeContext';
import styles from '@/pages/AdminPage.module.css';
import { TEAM_NAMES } from '@/constants/teams';
import { formatMatchDate } from '@/lib/date';
import { Game } from '@/types';
import {
  getGamesQuery,
  formatGames,
  updateGameFull,
  deleteGame,
} from '@/lib/firebase/admin';

const GAMES_PER_PAGE = 4;
const GAMES_TOTAL_PAGE = 4;

function dateToLocalInput(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function toLocalDatetimeValue(timestamp: { toDate: () => Date }) {
  return dateToLocalInput(timestamp.toDate());
}

const ManageGames = ({
  games,
  setGames,
}: {
  games: Game[];
  setGames: (games: Game[]) => void;
}) => {
  const offset = useServerOffset();

  useEffect(() => {
    async function fetchGames() {
      const snapshot = await getDocs(getGamesQuery());
      setGames(formatGames(snapshot, offset));
    }
    fetchGames();
  }, [offset, setGames]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMatchTime, setEditMatchTime] = useState('');
  const [editOpenTime, setEditOpenTime] = useState('');
  const [editCloseTime, setEditCloseTime] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const pagedGames = games.slice(
    (currentPage - 1) * GAMES_PER_PAGE,
    currentPage * GAMES_PER_PAGE,
  );

  const handleEdit = (game: Game) => {
    if (editingId === game.id) {
      setEditingId(null);
      return;
    }
    setEditingId(game.id);
    setEditMatchTime(toLocalDatetimeValue(game.matchTime));
    setEditOpenTime(toLocalDatetimeValue(game.openTime));
    setEditCloseTime(toLocalDatetimeValue(game.closeTime));
  };

  const handleMatchTimeChange = (value: string) => {
    setEditMatchTime(value);
    const matchDate = new Date(value);
    if (!isNaN(matchDate.getTime())) {
      setEditOpenTime(
        dateToLocalInput(new Date(matchDate.getTime() - 2 * 60 * 60 * 1000)),
      );
      setEditCloseTime(
        dateToLocalInput(new Date(matchDate.getTime() - 5 * 60 * 1000)),
      );
    }
  };

  const handleSave = async (id: string) => {
    const openDate = new Date(editOpenTime);
    const closeDate = new Date(editCloseTime);
    if (openDate >= closeDate) {
      alert('예측 오픈 시간은 마감 시간보다 이전이어야 합니다');
      return;
    }
    const matchDate = new Date(editMatchTime);
    await updateGameFull(id, matchDate, openDate, closeDate);
    const snapshot = await getDocs(getGamesQuery());
    setGames(formatGames(snapshot, offset));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        '경기를 삭제하면 해당 경기의 참여자 데이터도 함께 삭제됩니다.\n정말 삭제하시겠습니까?',
      )
    ) {
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
              const isEditing = editingId === game.id;

              return (
                <React.Fragment key={game.id}>
                  <tr>
                    <td className={styles.noNum}>{originalNo}</td>
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
                        className={`${styles.actionBtn} ${
                          isEditing ? styles.btnSave : styles.btnEdit
                        }`}
                        onClick={() =>
                          isEditing ? handleSave(game.id) : handleEdit(game)
                        }>
                        {isEditing ? '저장' : '수정'}
                      </button>
                      <button
                        className={`${styles.actionBtn} ${
                          isEditing ? styles.btnCancel : styles.btnDelete
                        }`}
                        style={{ marginLeft: 6 }}
                        onClick={() =>
                          isEditing ? handleEdit(game) : handleDelete(game.id)
                        }>
                        {isEditing ? '취소' : '삭제'}
                      </button>
                    </td>
                  </tr>
                  {isEditing && (
                    <tr key={`${game.id}-edit`}>
                      <td colSpan={5} className={styles.accordionCell}>
                        <div className={styles.accordionPanel}>
                          <div className={styles.accordionFields}>
                            <div className={styles.accordionField}>
                              <label
                                className={styles.accordionLabel}
                                htmlFor={`match-time-${game.id}`}>
                                경기 시작 시간
                              </label>
                              <input
                                id={`match-time-${game.id}`}
                                type='datetime-local'
                                className={styles.editInput}
                                value={editMatchTime}
                                onChange={(e) =>
                                  handleMatchTimeChange(e.target.value)
                                }
                              />
                            </div>
                            <div className={styles.accordionField}>
                              <label
                                className={styles.accordionLabel}
                                htmlFor={`open-time-${game.id}`}>
                                예측 오픈 시간
                              </label>
                              <input
                                id={`open-time-${game.id}`}
                                type='datetime-local'
                                className={styles.editInput}
                                value={editOpenTime}
                                onChange={(e) =>
                                  setEditOpenTime(e.target.value)
                                }
                              />
                            </div>
                            <div className={styles.accordionField}>
                              <label
                                className={styles.accordionLabel}
                                htmlFor={`close-time-${game.id}`}>
                                예측 마감 시간
                              </label>
                              <input
                                id={`close-time-${game.id}`}
                                type='datetime-local'
                                className={styles.editInput}
                                value={editCloseTime}
                                onChange={(e) =>
                                  setEditCloseTime(e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
