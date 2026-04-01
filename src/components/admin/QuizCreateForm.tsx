import { useState, useEffect } from 'react';
import { buildOpenTimeDate, nowToInputs } from './quizUtils';
import adminStyles from '@/pages/AdminPage.module.css';
import { createQuiz } from '@/lib/firebase/quizzes';
import styles from './ManageQuizzes.module.css';
import QuizFormFields from './QuizFormFields';
import { Game } from '@/types';

interface Props {
  games: Game[];
  onCreated: () => void;
}

const QuizCreateForm = ({ games, onCreated }: Props) => {
  const { date: initDate, time: initTime } = nowToInputs();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<'O' | 'X' | null>(null);
  const [gameId, setGameId] = useState('');
  const [openDate, setOpenDate] = useState(initDate);
  const [openTime, setOpenTime] = useState(initTime);

  useEffect(() => {
    if (games.length > 0 && !gameId) {
      setGameId(games[0].id);
    }
  }, [games, gameId]);

  async function handleCreate() {
    if (!question.trim()) return alert('문제를 입력해 주세요');
    if (!gameId) return alert('경기를 선택해 주세요');
    if (!openDate || !openTime) return alert('오픈 날짜/시간을 입력해 주세요');
    try {
      await createQuiz(
        question.trim(),
        gameId,
        answer,
        buildOpenTimeDate(openDate, openTime),
      );
      setQuestion('');
      setAnswer(null);
      const { date, time } = nowToInputs();
      setOpenDate(date);
      setOpenTime(time);
      onCreated();
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  }

  return (
    <div className={adminStyles.section}>
      <div className={adminStyles.sectionHeader}>
        <span className={adminStyles.sectionTitle}>퀴즈 등록</span>
      </div>
      <div className={styles.createBody}>
        <QuizFormFields
          question={question}
          onQuestionChange={setQuestion}
          answer={answer}
          onAnswerChange={setAnswer}
          gameId={gameId}
          onGameIdChange={setGameId}
          openDate={openDate}
          onOpenDateChange={setOpenDate}
          openTime={openTime}
          onOpenTimeChange={setOpenTime}
          games={games}
        />
        <div className={styles.createFooter}>
          <p className={styles.infoMsg}>
            설정한 오픈 시간이 되면 퀴즈가 진행되며 10분 후 자동으로 마감됩니다.
          </p>
          <button
            className={`${adminStyles.actionBtn} ${adminStyles.btnSave}`}
            style={{ padding: '10px 24px', fontSize: 14 }}
            onClick={handleCreate}>
            퀴즈 등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCreateForm;
