import { ManageGames } from '@/components';
import styles from './AdminPage.module.css';

const AdminPage = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            화성<span className={styles.logoAccent}>FC</span>
          </div>
          <div className={styles.adminBadge}>ADMIN</div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.logoutBtn}>로그아웃</button>
        </div>
      </div>
      <div className={styles.content}>
        <ManageGames />
      </div>
    </div>
  );
};
export default AdminPage;
