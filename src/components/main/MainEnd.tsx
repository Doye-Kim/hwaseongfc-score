import styles from '@/pages/MainPage.module.css';

const MainEnd = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>🏆</div>
      <p className={styles.endTitle}>
        시즌 이벤트가 <br />{' '}
        <span style={{ color: 'var(--primary)' }}>종료</span>
        되었습니다
      </p>
      <p className={styles.endSub}>함께해주셔서 감사합니다.</p>
    </div>
  );
};

export default MainEnd;
