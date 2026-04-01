import adminStyles from '@/pages/AdminPage.module.css';
import styles from './ManageQuizzes.module.css';
import { TEAM_NAMES } from '@/constants/teams';
import { formatMatchDate } from '@/lib/date';
import { Game } from '@/types';

interface Props {
  question: string;
  onQuestionChange: (v: string) => void;
  answer: 'O' | 'X' | null;
  onAnswerChange: (v: 'O' | 'X' | null) => void;
  gameId: string;
  onGameIdChange: (v: string) => void;
  openDate: string;
  onOpenDateChange: (v: string) => void;
  openTime: string;
  onOpenTimeChange: (v: string) => void;
  games: Game[];
}

const QuizFormFields = ({
  question,
  onQuestionChange,
  answer,
  onAnswerChange,
  gameId,
  onGameIdChange,
  openDate,
  onOpenDateChange,
  openTime,
  onOpenTimeChange,
  games,
}: Props) => (
  <>
    <div className={styles.formField}>
      <label className={styles.formLabel}>문제</label>
      <textarea
        className={styles.textarea}
        placeholder='문제를 입력해 주세요'
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
        rows={3}
      />
    </div>
    <div className={styles.formRow}>
      <div className={styles.formField}>
        <label className={styles.formLabel}>정답 (선택)</label>
        <div className={styles.answerToggle}>
          <button
            className={`${styles.answerBtn} ${
              answer === 'O' ? styles.answerBtnO : ''
            }`}
            onClick={() => onAnswerChange(answer === 'O' ? null : 'O')}>
            O
          </button>
          <button
            className={`${styles.answerBtn} ${
              answer === 'X' ? styles.answerBtnX : ''
            }`}
            onClick={() => onAnswerChange(answer === 'X' ? null : 'X')}>
            X
          </button>
        </div>
      </div>
      <div className={styles.formField}>
        <label className={styles.formLabel}>관련 경기</label>
        <select
          className={adminStyles.gameSelect}
          value={gameId}
          onChange={(e) => onGameIdChange(e.target.value)}>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {TEAM_NAMES[g.opponent]} ({formatMatchDate(g.matchTime.toDate())})
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formField}>
        <label className={styles.formLabel}>오픈 날짜</label>
        <input
          type='date'
          className={styles.dateInput}
          value={openDate}
          onChange={(e) => onOpenDateChange(e.target.value)}
        />
      </div>
      <div className={styles.formField}>
        <label className={styles.formLabel}>오픈 시간</label>
        <input
          type='time'
          className={styles.dateInput}
          value={openTime}
          onChange={(e) => onOpenTimeChange(e.target.value)}
        />
      </div>
    </div>
  </>
);

export default QuizFormFields;
