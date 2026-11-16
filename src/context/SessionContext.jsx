import { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../utils/api';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [view, setView] = useState('home'); // home | record | review

  const refreshSessions = useCallback(async () => {
    const list = await api.listSessions();
    setSessions(list);
  }, []);

  const refreshCurrentSession = useCallback(async () => {
    if (!currentSession) return null;
    const updated = await api.getSession(currentSession.id);
    setCurrentSession(updated);
    return updated;
  }, [currentSession]);

  const openSession = useCallback(
    async (id) => {
      const session = await api.getSession(id);
      setCurrentSession(session);
      setView('review');
    },
    [],
  );

  const deleteSession = useCallback(
    async (id) => {
      await api.deleteSession(id);
      if (currentSession?.id === id) {
        setCurrentSession(null);
        setView('home');
      }
      await refreshSessions();
    },
    [currentSession, refreshSessions],
  );

  return (
    <SessionContext.Provider
      value={{
        sessions,
        currentSession,
        setCurrentSession,
        view,
        setView,
        refreshSessions,
        refreshCurrentSession,
        openSession,
        deleteSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be inside SessionProvider');
  return ctx;
}
