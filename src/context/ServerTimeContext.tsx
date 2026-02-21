import { createContext, useContext, useEffect, useState } from 'react';
import { getServerTime } from '@/lib/firebase/times';
import { LoadingSpinner } from '@/components';

const ServerTimeContext = createContext(0);

export function ServerTimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [offset, setOffset] = useState<number | null>(null);

  useEffect(() => {
    getServerTime()
      .then((serverTime) => {
        setOffset(serverTime.getTime() - Date.now());
      })
      .catch(() => setOffset(0));
  }, []);

  if (offset === null) return <LoadingSpinner />;

  return (
    <ServerTimeContext.Provider value={offset}>
      {children}
    </ServerTimeContext.Provider>
  );
}

export function useServerOffset() {
  return useContext(ServerTimeContext);
}
