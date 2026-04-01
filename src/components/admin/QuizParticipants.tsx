import * as XLSX from 'xlsx';
import { useState, useEffect } from 'react';
import adminStyles from '@/pages/AdminPage.module.css';
import { Game, Quiz, QuizParticipant } from '@/types';
import { formatSubmittedAt } from './quizUtils';
import styles from './ManageQuizzes.module.css';
import { TEAM_NAMES } from '@/constants/teams';
import {
  getQuizParticipants,
  getQuizParticipantCount,
  getFirstQuizParticipantsPage,
  getNextQuizParticipantsPage,
} from '@/lib/firebase/quizzes';
import useCursorPagination from '@/hooks/useCursorPagination';

const PAGE_SIZE = 10;

interface Props {
  quizzes: Quiz[];
  games: Game[];
}

const QuizParticipants = ({ quizzes, games }: Props) => {
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const {
    items: participants,
    currentPage,
    hasNext,
    loadFirst,
    handleNext,
    handlePrev,
  } = useCursorPagination<QuizParticipant>(
    PAGE_SIZE,
    () => getFirstQuizParticipantsPage(selectedQuizId),
    (cursor) => getNextQuizParticipantsPage(selectedQuizId, cursor),
  );

  useEffect(() => {
    if (quizzes.length > 0 && !selectedQuizId) {
      setSelectedQuizId(quizzes[0].id);
    }
  }, [quizzes, selectedQuizId]);

  useEffect(() => {
    if (!selectedQuizId) return;

    async function fetchCount() {
      const count = await getQuizParticipantCount(selectedQuizId);
      setTotalCount(count);
    }

    fetchCount();
    loadFirst();

    // loadFirst는 매 렌더마다 재생성되므로 deps에 포함하면 무한 루프 발생함
    // fetchFirstRef/fetchNextRef로 최신 함수를 참조하므로 stale closure 문제 없음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuizId]);

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  async function handleDownload() {
    if (!selectedQuiz?.answer) {
      alert('퀴즈 정보를 수정해 정답을 입력해 주세요');
      return;
    }
    const data = await getQuizParticipants(
      selectedQuiz.id,
      selectedQuiz.answer,
    );

    if (data.length === 0) {
      alert('정답자가 없습니다.');
      return;
    }

    const game = games.find((g) => g.id === selectedQuiz.gameId);
    const titlePart = selectedQuiz.question.slice(0, 10);
    const opponentPart = game ? TEAM_NAMES[game.opponent] : '';
    const datePart = game
      ? (() => {
          const d = game.matchTime.toDate();
          const yy = String(d.getFullYear()).slice(2);
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yy}${mm}${dd}`;
        })()
      : '';

    const worksheetData = [
      ['NO', '이름', '전화번호', '답변'],
      ...data.map((p, i) => [i + 1, p.name, p.phone, p.answer]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 16 }, { wch: 8 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '정답자 목록');
    XLSX.writeFile(
      workbook,
      `${datePart}_${opponentPart}_${titlePart}_OX퀴즈정답자.xlsx`,
    );
  }

  return (
    <div className={adminStyles.section}>
      <div
        className={`${adminStyles.sectionHeader} ${adminStyles.sectionHeaderColumn}`}>
        <div>
          <div className={adminStyles.sectionTitleWrap}>
            <span className={adminStyles.sectionTitle}>참여자 조회</span>
            <span className={adminStyles.sectionCount}>{totalCount}명</span>
          </div>
          {selectedQuiz && (
            <p className={styles.participantsMeta}>{selectedQuiz.question}</p>
          )}
        </div>
        <div className={styles.participantsControls}>
          <select
            className={adminStyles.gameSelect}
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.question.length > 20
                  ? `${q.question.slice(0, 20)}...`
                  : q.question}
              </option>
            ))}
          </select>
          <button className={adminStyles.exportBtn} onClick={handleDownload}>
            정답자 xlsx 다운로드
          </button>
        </div>
      </div>
      <div className={adminStyles.tableWrap}>
        {participants.length === 0 ? (
          <div className={adminStyles.emptyState}>참여자가 없습니다.</div>
        ) : (
          <table className={`${adminStyles.table} ${styles.participantsTable}`}>
            <thead>
              <tr>
                {['NO', '이름', '전화번호', '선택', '제출 시각'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={p.id}>
                  <td className={adminStyles.noNum}>
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className={adminStyles.opponent}>{p.name}</td>
                  <td>{p.phone}</td>
                  <td>
                    <span className={styles.answer}>{p.answer}</span>
                  </td>
                  <td style={{ color: 'var(--gray-06)', fontSize: 13 }}>
                    {formatSubmittedAt(p.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {participants.length > 0 && (
        <div className={adminStyles.prevNextWrap}>
          <button
            className={adminStyles.prevNextBtn}
            disabled={currentPage === 1}
            onClick={handlePrev}>
            ← 이전
          </button>
          <button
            className={adminStyles.prevNextBtn}
            disabled={!hasNext}
            onClick={handleNext}>
            다음 →
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizParticipants;
