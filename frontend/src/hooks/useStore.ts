import { useUserStore } from '@/lib/Store/userStore';
import { useState, useEffect } from 'react';


export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubHydrate = useUserStore.persist.onHydrate(() => {
      // this runs when the store is being hydrated
      setHydrated(false);
    });

    const unsubFinishHydration = useUserStore.persist.onFinishHydration(() => {
      // this runs when the store is done hydrating
      setHydrated(true);
    });

    setHydrated(useUserStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};