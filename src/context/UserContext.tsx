import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { DEMO_USERS, type DemoUser } from '../types/api';

interface UserContextValue {
  user: DemoUser;
  setUser: (user: DemoUser) => void;
  users: DemoUser[];
}

const STORAGE_KEY = 'firstclub.demoUserId';

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<DemoUser>(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    const stored = storedId
      ? DEMO_USERS.find(u => u.id === Number(storedId))
      : null;
    return stored || DEMO_USERS[0];
  });

  const setUser = (u: DemoUser) => {
    setUserState(u);
    localStorage.setItem(STORAGE_KEY, String(u.id));
  };

  return (
    <UserContext.Provider value={{ user, setUser, users: DEMO_USERS }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
