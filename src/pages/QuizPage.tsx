import { useEffect, useState } from 'react';
import { getActiveQuiz, submitQuizAnswer } from '@/lib/firebase/quizzes';
import { useServerOffset } from '@/context/ServerTimeContext';
import mainStyles from './MainPage.module.css';
import { LoadingSpinner } from '@/components';
import styles from './QuizPage.module.css';
import { Quiz } from '@/types';

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const QuizPage = () => {
  const offset = useServerOffset();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<'O' | 'X' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getActiveQuiz(Date.now() + offset)
      .then(setQuiz)
      .finally(() => setLoading(false));
  }, [offset]);

  async function handleSubmit() {
    if (!selected) {
      alert('O 또는 X를 선택해 주세요');
      return;
    }
    if (!name.trim()) {
      alert('이름을 입력해 주세요');
      return;
    }
    const rawPhone = phone.replace(/-/g, '');
    if (rawPhone.length < 10) {
      alert('전화번호를 정확히 입력해 주세요');
      return;
    }

    setSubmitting(true);
    try {
      await submitQuizAnswer(quiz!.id, name.trim(), phone, selected);
      setSubmitted(true);
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={mainStyles.root}>
      <div className={mainStyles.orb1} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={mainStyles.container}>
          {submitted ? (
            <div className={mainStyles.card}>
              <div className={styles.centerPad}>
                <div className={styles.bigIcon}>✅</div>
                <p className={styles.successTitle}>제출되었습니다!</p>
                <p className={mainStyles.subText}>참여해 주셔서 감사합니다.</p>
              </div>
            </div>
          ) : quiz ? (
            <>
              <div className={mainStyles.card}>
                <p className={styles.quizLabel}>OX 퀴즈</p>
                <p className={styles.quizQuestion}>{quiz.question}</p>
              </div>

              <div className={mainStyles.card} style={{ marginTop: 12 }}>
                <p className={styles.sectionTitle}>답을 선택하세요</p>
                <div className={styles.oxRow}>
                  <button
                    className={`${styles.oxBtn} ${
                      selected === 'O' ? styles.oxBtnO : ''
                    }`}
                    onClick={() => setSelected('O')}>
                    O
                  </button>
                  <button
                    className={`${styles.oxBtn} ${
                      selected === 'X' ? styles.oxBtnX : ''
                    }`}
                    onClick={() => setSelected('X')}>
                    X
                  </button>
                </div>

                <p className={styles.sectionTitle} style={{ marginTop: 20 }}>
                  참여자 정보
                </p>
                <p className={mainStyles.subText} style={{ marginBottom: 12 }}>
                  경품 당첨 시 연락을 위해 입력해 주세요
                </p>
                <input
                  className={styles.input}
                  placeholder='이름'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className={styles.input}
                  style={{ marginTop: 10 }}
                  placeholder="전화번호 ('-' 없이 숫자만 입력)"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  type='tel'
                />
                <button
                  className={mainStyles.submitBtn}
                  style={{ marginTop: 16 }}
                  onClick={handleSubmit}
                  disabled={submitting}>
                  {submitting ? '제출 중...' : '제출하기'}
                </button>
              </div>
            </>
          ) : (
            <div className={mainStyles.card}>
              <div className={styles.centerPad}>
                <div className={styles.bigIcon}>🔍</div>
                <p className={styles.emptyTitle}>
                  현재 진행 중인 퀴즈가 없습니다
                </p>
                <p className={mainStyles.subText}>다음 퀴즈를 기대해 주세요!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
