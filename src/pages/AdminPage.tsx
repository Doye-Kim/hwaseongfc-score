import { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { ManageGames, ManageParticipants, ManageQuizzes } from '@/components';
import { TEAM_NAMES } from '@/constants/teams';
import styles from './AdminPage.module.css';
import { Game } from '@/types';

type Tab = 'score' | 'quiz';

const AdminPage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('score');

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
        <div className={styles.section} style={{ padding: 0 }}>
          <div className={styles.tabBar}>
            <button
              className={`${styles.tab} ${activeTab === 'score' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('score')}>
              스코어 예측
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'quiz' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('quiz')}>
              OX 퀴즈
            </button>
          </div>
        </div>

        {activeTab === 'score' && (
          <>
            <ManageGames games={games} setGames={setGames} />
            <ManageParticipants games={games} />
          </>
        )}
        {activeTab === 'quiz' && <ManageQuizzes />}
      </div>
    </div>
  );
};
export default AdminPage;
