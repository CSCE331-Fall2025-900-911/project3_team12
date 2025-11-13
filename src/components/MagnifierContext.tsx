import React, { createContext, useContext, useState } from 'react';

type MagnifierContextValue = {
  enabled: boolean;
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const MagnifierContext = createContext<MagnifierContextValue | undefined>(
  undefined
);

export function MagnifierProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  return (
    <MagnifierContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </MagnifierContext.Provider>
  );
}

export function useMagnifier() {
  const ctx = useContext(MagnifierContext);
  if (!ctx) throw new Error('useMagnifier must be used within MagnifierProvider');
  return ctx;
}
