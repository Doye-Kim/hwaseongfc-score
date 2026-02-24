import { useState } from 'react';
import { ManageGames, ManageParticipants } from '@/components';
import styles from './AdminPage.module.css';
import { Game } from '@/types';

const AdminPage = () => {
  const [games, setGames] = useState<Game[]>([]);
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
        <ManageGames games={games} setGames={setGames} />
        <ManageParticipants games={games} />
      </div>
    </div>
  );
};
export default AdminPage;
