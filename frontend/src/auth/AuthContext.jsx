import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'radiadores-session';

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!session?.token) return null;
    const payload = JSON.parse(atob(session.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  function acceptSession(nextSession) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }

  useEffect(() => {
    function handleExpired() { logout(); }
    window.addEventListener('auth:expired', handleExpired);
    if (!session?.token) return () => window.removeEventListener('auth:expired', handleExpired);
    const payload = JSON.parse(atob(session.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const timeout = window.setTimeout(logout, Math.max(0, payload.exp * 1000 - Date.now()));
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('auth:expired', handleExpired);
    };
  }, [session]);

  return <AuthContext.Provider value={{ session, acceptSession, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return value;
}
