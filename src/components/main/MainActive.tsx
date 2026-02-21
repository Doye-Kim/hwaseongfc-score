import { useEffect, useState } from 'react';
import { formatMatchDate, getTimeLeft } from '@/lib/date';
import commonStyles from '@/pages/MainPage.module.css';
import { TEAM_LOGOS } from '@/constants/teams';
import styles from './MainActive.module.css';
import { Match } from '@/pages/MainPage';
import InfoSubmit from './InfoSubmit';

const MainActive = ({ match }: { match: Match }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(match.closeDate));
  const [hwaseongScore, setHwaseongScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    const t = setInterval(
      () => setTimeLeft(getTimeLeft(match.closeDate)),
      30000,
    );
    return () => clearInterval(t);
  }, [match.closeDate]);

  function handleScoreChange(team: 'hwaseong' | 'opponent', delta: number) {
    if (team === 'hwaseong') setHwaseongScore((v) => Math.max(0, v + delta));
    else setOpponentScore((v) => Math.max(0, v + delta));
  }

  function handleSubmitClick() {
    setIsOpenModal(true);
  }

  if (submitted) {
    return (
      <div className={commonStyles.card}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p className={styles.cardTitle}>제출되었습니다!</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className={commonStyles.card}>
        <div className={styles.matchHeader}>
          <div>
            <p className={styles.matchDateText}>
              {formatMatchDate(match.matchDate)}
            </p>
            <p className={styles.matchTitle}>{`화성FC vs ${match.opponent}`}</p>
          </div>
          <div className={styles.deadlineBadge}>
            <div className={styles.badgeDot} />
            {timeLeft}
          </div>
        </div>
      </div>

      <div className={commonStyles.card} style={{ marginTop: 12 }}>
        <p className={styles.cardTitle}>스코어 예측</p>
        <p className={styles.subText}>화성FC의 승리를 예측해 보세요!</p>

        <div className={styles.scoreRow}>
          <div className={styles.teamRow}>
            <div className={styles.teamLogoName}>
              <img
                className={styles.logoBox}
                src={TEAM_LOGOS['hwaseong']}
                alt='hwaseong logo'
              />
              <span className={styles.teamName}>화성FC</span>
            </div>
            <div className={styles.scoreCtrl}>
              <button
                className={styles.scoreBtn}
                style={{
                  color:
                    hwaseongScore === 99 ? 'var(--gray-08)' : 'var(--white)',
                  cursor: hwaseongScore === 99 ? 'not-allowed' : 'pointer',
                }}
                onClick={() => handleScoreChange('hwaseong', 1)}>
                +
              </button>
              <span className={styles.scoreNum}>{hwaseongScore}</span>
              <button
                className={styles.scoreBtn}
                style={{
                  color:
                    hwaseongScore === 0 ? 'var(--gray-08)' : 'var(--white)',
                  cursor: hwaseongScore === 0 ? 'not-allowed' : 'pointer',
                }}
                onClick={() => handleScoreChange('hwaseong', -1)}>
                −
              </button>
            </div>
          </div>
          <span className={styles.colon}>:</span>
          <div className={styles.teamRow}>
            <div className={styles.scoreCtrl}>
              <button
                className={styles.scoreBtn}
                style={{
                  color:
                    opponentScore === 99 ? 'var(--gray-08)' : 'var(--white)',
                  cursor: opponentScore === 99 ? 'not-allowed' : 'pointer',
                }}
                onClick={() => handleScoreChange('opponent', 1)}>
                +
              </button>
              <span className={styles.scoreNum}>{opponentScore}</span>
              <button
                className={styles.scoreBtn}
                style={{
                  color:
                    opponentScore === 0 ? 'var(--gray-08)' : 'var(--white)',
                  cursor: opponentScore === 0 ? 'not-allowed' : 'pointer',
                }}
                onClick={() => handleScoreChange('opponent', -1)}>
                −
              </button>
            </div>
            <div className={styles.teamLogoName}>
              <img
                className={styles.logoBox}
                src={match.opponentLogo}
                alt={match.opponent}
              />
              <span className={styles.teamName}>{match.opponent}</span>
            </div>
          </div>
        </div>

        <button className={commonStyles.submitBtn} onClick={handleSubmitClick}>
          예측 제출하기
        </button>
      </div>

      {isOpenModal && (
        <InfoSubmit
          gameId={match.id}
          hwaseongScore={hwaseongScore}
          opponentScore={opponentScore}
          onClose={() => setIsOpenModal(false)}
          setSubmitted={setSubmitted}
        />
      )}
    </>
  );
};

export default MainActive;
