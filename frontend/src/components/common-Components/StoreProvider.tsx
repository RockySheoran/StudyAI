'use client';

import { useUserStore } from '@/lib/Store/userStore';
import React, { useEffect, useState } from 'react';


export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait till Zustand persists the data
  useEffect(() => {
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    
    setIsHydrated(useUserStore.persist.hasHydrated());
    
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      {isHydrated ? children : null}
    </>
  );
}