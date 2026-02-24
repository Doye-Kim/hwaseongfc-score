import styles from './LoadingSpinner.module.css';
import hwaseongLogo from '@/assets/logos/hwaseong.png';

const LoadingSpinner = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.logoWrap}>
        <img src={hwaseongLogo} alt='화성FC 로고' className={styles.logo} />
        <div className={styles.spinner} />
      </div>
    </div>
  );
};

export default LoadingSpinner;
