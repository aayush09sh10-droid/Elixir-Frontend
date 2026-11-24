import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MOCK_USERS } from '../data/players';
import { readDemo, writeDemo } from '../utils/demoStorage';

const AuthContext = createContext(null);
const ACCOUNTS_KEY = 'elixir_demo_accounts';
const MODERATION_KEY = 'elixir_demo_moderation';
const SESSION_KEY = 'elixir_user';
const hashDemoPassword = (value) => {
  // This is obfuscation for a local demo, not a secure password hash or auth system.
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `demo-${(hash >>> 0).toString(16)}`;
};
const safeUser = ({ password, passwordHash, ...user }) => user;
const seedUsers = () => MOCK_USERS.map(safeUser);
const persistModeration = (rows) => writeDemo(MODERATION_KEY, rows.map(safeUser));

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(seedUsers);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAccounts = readDemo(ACCOUNTS_KEY, []);
    const moderation = readDemo(MODERATION_KEY, []);
    const all = new Map(seedUsers().map((row) => [row.id, row]));
    if (Array.isArray(savedAccounts))
      savedAccounts.forEach((row) => {
        if (row?.id && row?.username) all.set(row.id, safeUser(row));
      });
    if (Array.isArray(moderation))
      moderation.forEach((row) => {
        if (row?.id && all.has(row.id)) all.set(row.id, { ...all.get(row.id), ...safeUser(row) });
      });
    const restoredUsers = [...all.values()];
    setUsers(restoredUsers);
    const session = readDemo(SESSION_KEY, null);
    const restored = session?.id && restoredUsers.find((row) => row.id === session.id);
    if (restored && restored.status === 'active') setUser(restored);
    else if (session) {
      localStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
  }, []);

  const persistUsers = (rows) => {
    setUsers(rows);
    const registered = readDemo(ACCOUNTS_KEY, []);
    const credentials = new Map(
      Array.isArray(registered) ? registered.map((row) => [row.id, row.passwordHash]) : [],
    );
    writeDemo(
      ACCOUNTS_KEY,
      rows
        .filter((row) => credentials.has(row.id))
        .map((row) => ({
          ...safeUser(row),
          passwordHash: credentials.get(row.id),
        })),
    );
    persistModeration(rows);
  };
  const activate = (row) => {
    if (row.status === 'banned' || row.status === 'held')
      throw new Error(`This account is ${row.status}. Contact ELIXIR support.`);
    const clean = safeUser(row);
    setUser(clean);
    writeDemo(SESSION_KEY, clean);
    return clean;
  };
  const login = (email, password) => {
    const found = users.find(
      (row) => row.email.toLowerCase() === String(email).trim().toLowerCase(),
    );
    if (!found) throw new Error('Invalid email or password.');
    const credential = readDemo(ACCOUNTS_KEY, []).find((row) => row.id === found.id);
    const valid = credential?.passwordHash
      ? credential.passwordHash === hashDemoPassword(String(password))
      : MOCK_USERS.find((row) => row.id === found.id)?.password === password;
    if (!valid) throw new Error('Invalid email or password.');
    return activate(found);
  };
  const register = ({ fullName, username, email, password, dob }) => {
    if (users.some((row) => row.email.toLowerCase() === String(email).trim().toLowerCase()))
      throw new Error('Email already registered.');
    if (users.some((row) => row.username.toLowerCase() === String(username).trim().toLowerCase()))
      throw new Error('Username already taken.');
    if (String(password).length < 8) throw new Error('Password must be at least 8 characters.');
    const row = {
      id: `user-${Date.now()}`,
      username: String(username).trim(),
      email: String(email).trim().toLowerCase(),
      fullName: String(fullName).trim(),
      dob,
      role: 'user',
      avatar: null,
      country: 'IN',
      bio: '',
      joinedAt: new Date().toISOString().slice(0, 10),
      status: 'active',
      gameBans: [],
      connectedGames: [],
      followers: 0,
      following: 0,
      tournaments: 0,
      wins: 0,
      rewards: 0,
    };
    const accounts = readDemo(ACCOUNTS_KEY, []);
    writeDemo(ACCOUNTS_KEY, [
      ...(Array.isArray(accounts) ? accounts : []),
      { ...row, passwordHash: hashDemoPassword(String(password)) },
    ]);
    const next = [...users, row];
    setUsers(next);
    activate(row);
    return row;
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };
  const updateUser = (updates) => {
    if (!user) return;
    const nextUser = { ...user, ...updates };
    const rows = users.map((row) => (row.id === user.id ? nextUser : row));
    setUsers(rows);
    setUser(nextUser);
    writeDemo(SESSION_KEY, nextUser);
    persistUsers(rows);
  };
  const addAuditLog = (entry) => {
    const logs = readDemo('elixir_audit_logs', []);
    const next = [
      {
        ...entry,
        adminId: user?.id,
        adminUsername: user?.username,
        timestamp: new Date().toISOString(),
        id: `log-${Date.now()}`,
      },
      ...(Array.isArray(logs) ? logs : []),
    ].slice(0, 500);
    writeDemo('elixir_audit_logs', next);
  };
  const adminAction = (id, action, details = {}) => {
    if (user?.role !== 'admin') throw new Error('Unauthorized');
    const target = users.find((row) => row.id === id);
    if (!target) throw new Error('User not found.');
    const changed = { ...target, ...details };
    const rows = users.map((row) => (row.id === id ? changed : row));
    setUsers(rows);
    persistUsers(rows);
    if (user.id === id && changed.status !== 'active') {
      setUser(null);
      localStorage.removeItem(SESSION_KEY);
    }
    addAuditLog({
      action,
      targetId: id,
      targetUsername: target.username,
      reason:
        details.reason ||
        details.banReason ||
        details.holdReason ||
        details.lastGameBanReason ||
        undefined,
      ...details,
    });
  };
  const banUser = (id, reason, duration = 'permanent') =>
    adminAction(id, 'BAN_USER', {
      status: 'banned',
      banReason: reason,
      banDuration: duration,
      bannedAt: new Date().toISOString(),
      bannedBy: user.username,
    });
  const holdUser = (id, reason) =>
    adminAction(id, 'HOLD_USER', {
      status: 'held',
      holdReason: reason,
      heldAt: new Date().toISOString(),
      heldBy: user.username,
    });
  const unbanUser = (id, reason = 'Account restored after review') =>
    adminAction(id, 'UNBAN_USER', {
      status: 'active',
      reason,
      banReason: null,
      holdReason: null,
      banDuration: null,
      bannedAt: null,
      heldAt: null,
    });
  const gameBanUser = (id, game, reason) => {
    const target = users.find((row) => row.id === id);
    if (!target) throw new Error('User not found.');
    adminAction(id, 'GAME_BAN', {
      gameBans: [...new Set([...(target.gameBans || []), game])],
      lastGameBanReason: reason,
    });
  };
  const removeGameBan = (id, game, reason = '') => {
    const target = users.find((row) => row.id === id);
    if (!target) throw new Error('User not found.');
    adminAction(id, 'REMOVE_GAME_BAN', {
      gameBans: (target.gameBans || []).filter((item) => item !== game),
      reason,
    });
  };
  const getAuditLogs = () => {
    const logs = readDemo('elixir_audit_logs', []);
    return Array.isArray(logs) ? logs : [];
  };
  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer' || isAdmin;
  const value = useMemo(
    () => ({
      user,
      users,
      loading,
      isAdmin,
      isOrganizer,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateUser,
      banUser,
      unbanUser,
      holdUser,
      gameBanUser,
      removeGameBan,
      getAuditLogs,
    }),
    [user, users, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
