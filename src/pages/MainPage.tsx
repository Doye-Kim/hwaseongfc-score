import { useEffect, useState } from 'react';
import { getActiveQuery, getNextQuery } from '@/lib/firebase/games';
import { DocumentSnapshot, getDocs } from 'firebase/firestore';
import { useServerOffset } from '@/context/ServerTimeContext';
import { MainActive, MainEnd, MainNext } from '@/components';
import { TEAM_LOGOS, TEAM_NAMES } from '@/constants/teams';
import { LoadingSpinner } from '@/components';
import styles from './MainPage.module.css';

export type Match = {
  id: string;
  opponent: string;
  opponentLogo: string;
  matchDate: Date;
  openDate: Date;
  closeDate: Date;
};

type PageState = 'ACTIVE' | 'NEXT' | 'END';

function getPageState(
  activeMatch: Match | null,
  nextMatch: Match | null,
): PageState {
  if (activeMatch) return 'ACTIVE';
  if (nextMatch) return 'NEXT';
  return 'END';
}

const MainPage = () => {
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const offset = useServerOffset();

  useEffect(() => {
    async function fetchMatches() {
      const [activeSnap, nextSnap] = await Promise.all([
        getDocs(await getActiveQuery(offset)),
        getDocs(await getNextQuery(offset)),
      ]);

      setActiveMatch(activeSnap.empty ? null : snapToMatch(activeSnap.docs[0]));
      setNextMatch(nextSnap.empty ? null : snapToMatch(nextSnap.docs[0]));
      setLoading(false);
    }

    fetchMatches();
    window.addEventListener('focus', fetchMatches);
    return () => window.removeEventListener('focus', fetchMatches);
  }, [offset]);

  function snapToMatch(doc: DocumentSnapshot): Match {
    const data = doc.data()!;
    return {
      id: doc.id,
      opponent: TEAM_NAMES[data.opponent],
      opponentLogo: TEAM_LOGOS[data.opponent],
      matchDate: data.matchTime.toDate(),
      openDate: data.openTime.toDate(),
      closeDate: data.closeTime.toDate(),
    };
  }

  const pageState = getPageState(activeMatch, nextMatch);

  return (
    <div className={styles.root}>
      <div className={styles.orb1} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.container}>
          {pageState === 'ACTIVE' && activeMatch && (
            <MainActive match={activeMatch} />
          )}
          {pageState === 'NEXT' && nextMatch && <MainNext match={nextMatch} />}
          {pageState === 'END' && <MainEnd />}
        </div>
      )}
    </div>
  );
};

export default MainPage;
