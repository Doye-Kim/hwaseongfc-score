import { useState } from 'react';
import { deleteQuiz, updateQuiz } from '@/lib/firebase/quizzes';
import adminStyles from '@/pages/AdminPage.module.css';
import styles from './ManageQuizzes.module.css';
import { TEAM_NAMES } from '@/constants/teams';
import QuizFormFields from './QuizFormFields';
import { Game, Quiz } from '@/types';
import {
  DisplayStatus,
  STATUS_LABEL,
  getDisplayStatus,
  formatOpenTime,
  toLocalDateTimeInputs,
  buildOpenTimeDate,
} from './quizUtils';

interface Props {
  games: Game[];
  quizzes: Quiz[];
  now: number;
  onChanged: () => void;
}

const QuizList = ({ games, quizzes, now, onChanged }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState<'O' | 'X' | null>(null);
  const [editGameId, setEditGameId] = useState('');
  const [editOpenDate, setEditOpenDate] = useState('');
  const [editOpenTime, setEditOpenTime] = useState('');

  function handleEditStart(quiz: Quiz) {
    setEditingId(quiz.id);
    setEditQuestion(quiz.question);
    setEditAnswer(quiz.answer);
    setEditGameId(quiz.gameId);
    const { date, time } = toLocalDateTimeInputs(quiz.openTime.toDate());
    setEditOpenDate(date);
    setEditOpenTime(time);
  }

  async function handleEditSave(quizId: string) {
    if (!editQuestion.trim()) return alert('문제를 입력해 주세요');
    if (!editOpenDate || !editOpenTime)
      return alert('오픈 날짜/시간을 입력해 주세요');
    try {
      await updateQuiz(
        quizId,
        editQuestion.trim(),
        editGameId,
        editAnswer,
        buildOpenTimeDate(editOpenDate, editOpenTime),
      );
      setEditingId(null);
      onChanged();
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  }

  async function handleDelete(quizId: string) {
    if (!window.confirm('퀴즈를 삭제하시겠습니까?')) return;
    await deleteQuiz(quizId);
    onChanged();
  }

  function getGameLabel(gameId: string) {
    const game = games.find((g) => g.id === gameId);
    return game ? `화성 vs ${TEAM_NAMES[game.opponent]}` : '-';
  }

  return (
    <div className={adminStyles.section}>
      <div className={adminStyles.sectionHeader}>
        <div className={adminStyles.sectionTitleWrap}>
          <span className={adminStyles.sectionTitle}>퀴즈 목록</span>
          <span className={adminStyles.sectionCount}>{quizzes.length}개</span>
        </div>
      </div>
      <div className={styles.quizList}>
        {quizzes.length === 0 ? (
          <div className={adminStyles.emptyState}>등록된 퀴즈가 없습니다.</div>
        ) : (
          quizzes.map((quiz) => {
            const status: DisplayStatus = getDisplayStatus(
              quiz.openTime,
              quiz.closeTime,
              now,
            );
            const isEditing = editingId === quiz.id;

            return (
              <div
                key={quiz.id}
                className={`${styles.quizCard} ${
                  status === 'active' ? styles.quizCardActive : ''
                }`}>
                <div className={styles.quizCardHeader}>
                  <div className={styles.quizCardLeft}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`statusBadge_${status}`]
                      }`}>
                      {status === 'active' && <span className={styles.dot} />}
                      {STATUS_LABEL[status]}
                    </span>
                    {!isEditing && (
                      <div className={styles.quizCardInfo}>
                        <span className={styles.quizCardQuestion}>
                          {quiz.question}
                        </span>
                        <span className={styles.quizCardMeta}>
                          오픈 {formatOpenTime(quiz.openTime)}
                          {quiz.gameId && ` · ${getGameLabel(quiz.gameId)}`}
                          {quiz.answer && ` · 정답 ${quiz.answer}`}
                        </span>
                      </div>
                    )}
                    {isEditing && (
                      <span
                        className={styles.quizCardQuestion}
                        style={{ color: 'var(--gray-07)' }}>
                        {quiz.question}
                      </span>
                    )}
                  </div>
                  <div className={styles.quizCardActions}>
                    {isEditing ? (
                      <>
                        <button
                          className={`${adminStyles.actionBtn} ${adminStyles.btnCancel}`}
                          onClick={() => setEditingId(null)}>
                          취소
                        </button>
                        <button
                          className={`${adminStyles.actionBtn} ${adminStyles.btnSave}`}
                          onClick={() => handleEditSave(quiz.id)}>
                          저장
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={`${adminStyles.actionBtn} ${adminStyles.btnEdit}`}
                          onClick={() => handleEditStart(quiz)}>
                          수정
                        </button>
                        <button
                          className={`${adminStyles.actionBtn} ${adminStyles.btnDelete}`}
                          onClick={() => handleDelete(quiz.id)}>
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className={styles.quizCardBody}>
                    <QuizFormFields
                      question={editQuestion}
                      onQuestionChange={setEditQuestion}
                      answer={editAnswer}
                      onAnswerChange={setEditAnswer}
                      gameId={editGameId}
                      onGameIdChange={setEditGameId}
                      openDate={editOpenDate}
                      onOpenDateChange={setEditOpenDate}
                      openTime={editOpenTime}
                      onOpenTimeChange={setEditOpenTime}
                      games={games}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuizList;
