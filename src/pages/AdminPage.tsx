import { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { ManageGames, ManageParticipants } from '@/components';
import { TEAM_NAMES } from '@/constants/teams';
import styles from './AdminPage.module.css';
import { Game } from '@/types';

const AdminPage = () => {
  const [games, setGames] = useState<Game[]>([]);

  async function handleLogout() {
    const auth = getAuth();
    await signOut(auth);
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            {TEAM_NAMES['hwaseong']}
            <span className={styles.logoAccent}>FC</span>
          </div>
          <div className={styles.adminBadge}>ADMIN</div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            로그아웃
          </button>
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
