import { useEffect, useState } from 'react';
import { formatMatchDate, getDDayDisplay } from '@/lib/date';
import styles from '@/pages/MainPage.module.css';
import { Match } from '@/pages/MainPage';

const MainNext = ({ match }: { match: Match }) => {
  const [dday, setDday] = useState(getDDayDisplay(match.openDate));

  useEffect(() => {
    const t = setInterval(() => setDday(getDDayDisplay(match.openDate)), 1000);
    return () => clearInterval(t);
  }, [match.openDate]);

  useEffect(() => {
    if (dday.type === 'countdown' && dday.display === '00:00:00') {
      setTimeout(() => window.location.reload(), 1000);
    }
  }, [dday]);

  return (
    <div style={{ textAlign: 'center' }}>
      <p className={styles.ddayLabel}>다음 예측 오픈까지</p>
      <p className={styles.ddayNum}>
        {dday.type === 'countdown' ? (
          dday.display
        ) : (
          <>
            <span>D - </span>
            <span style={{ fontSize: 80 }}>{dday.display}</span>
          </>
        )}
      </p>

      <div className={styles.card} style={{ marginTop: 24 }}>
        <p className={styles.nextMatchLabel}>NEXT MATCH</p>
        <p className={styles.nextMatchTitle}>화성FC vs {match.opponent}</p>
        <p className={styles.nextMatchDate}>
          {formatMatchDate(match.matchDate)}
        </p>
      </div>
      <p className={styles.subText}>
        *예측은 경기 시작 2시간 전에 오픈되며, 5분 전에 마감됩니다
      </p>
    </div>
  );
};

export default MainNext;
