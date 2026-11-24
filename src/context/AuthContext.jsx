import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/players';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('elixir_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('elixir_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password.');
    if (found.status === 'banned') throw new Error('Your account has been suspended. Contact support.');

    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem('elixir_user', JSON.stringify(safeUser));
    return safeUser;
  };

  const register = ({ fullName, username, email, password, dob }) => {
    const emailExists = MOCK_USERS.find(u => u.email === email);
    if (emailExists) throw new Error('Email already registered.');
    const usernameExists = MOCK_USERS.find(u => u.username === username);
    if (usernameExists) throw new Error('Username already taken.');

    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      fullName,
      dob,
      role: 'user',
      avatar: null,
      country: 'IN',
      bio: '',
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'active',
      gameBans: [],
      connectedGames: [],
      followers: 0,
      following: 0,
      tournaments: 0,
      wins: 0,
      rewards: 0,
    };

    // Add to mock store (in-memory only — no backend)
    MOCK_USERS.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem('elixir_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elixir_user');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('elixir_user', JSON.stringify(updated));
    // Also update in MOCK_USERS
    const idx = MOCK_USERS.findIndex(u => u.id === updated.id);
    if (idx !== -1) Object.assign(MOCK_USERS[idx], updates);
  };

  // ── Admin Actions ──────────────────────────────────────────────────────────

  const banUser = (targetUserId, reason, duration = 'permanent') => {
    if (user?.role !== 'admin') throw new Error('Unauthorized');
    const target = MOCK_USERS.find(u => u.id === targetUserId);
    if (!target) throw new Error('User not found');
    target.status = 'banned';
    target.banReason = reason;
    target.banDuration = duration;
    target.bannedAt = new Date().toISOString();
    target.bannedBy = user.username;
    addAuditLog({ action: 'BAN_USER', targetId: targetUserId, targetUsername: target.username, reason, duration });
  };

  const unbanUser = (targetUserId) => {
    if (user?.role !== 'admin') throw new Error('Unauthorized');
    const target = MOCK_USERS.find(u => u.id === targetUserId);
    if (!target) throw new Error('User not found');
    target.status = 'active';
    delete target.banReason;
    delete target.banDuration;
    delete target.bannedAt;
    addAuditLog({ action: 'UNBAN_USER', targetId: targetUserId, targetUsername: target.username });
  };

  const holdUser = (targetUserId, reason) => {
    if (user?.role !== 'admin') throw new Error('Unauthorized');
    const target = MOCK_USERS.find(u => u.id === targetUserId);
    if (!target) throw new Error('User not found');
    target.status = 'held';
    target.holdReason = reason;
    target.heldAt = new Date().toISOString();
    target.heldBy = user.username;
    addAuditLog({ action: 'HOLD_USER', targetId: targetUserId, targetUsername: target.username, reason });
  };

  const gameBanUser = (targetUserId, gameSlug, reason) => {
    if (user?.role !== 'admin') throw new Error('Unauthorized');
    const target = MOCK_USERS.find(u => u.id === targetUserId);
    if (!target) throw new Error('User not found');
    if (!target.gameBans) target.gameBans = [];
    if (!target.gameBans.includes(gameSlug)) {
      target.gameBans.push(gameSlug);
    }
    addAuditLog({ action: 'GAME_BAN', targetId: targetUserId, targetUsername: target.username, game: gameSlug, reason });
  };

  const removeGameBan = (targetUserId, gameSlug) => {
    if (user?.role !== 'admin') throw new Error('Unauthorized');
    const target = MOCK_USERS.find(u => u.id === targetUserId);
    if (!target) throw new Error('User not found');
    target.gameBans = (target.gameBans || []).filter(g => g !== gameSlug);
    addAuditLog({ action: 'REMOVE_GAME_BAN', targetId: targetUserId, targetUsername: target.username, game: gameSlug });
  };

  const addAuditLog = (entry) => {
    const logs = JSON.parse(localStorage.getItem('elixir_audit_logs') || '[]');
    logs.unshift({ ...entry, adminId: user?.id, adminUsername: user?.username, timestamp: new Date().toISOString(), id: `log-${Date.now()}` });
    localStorage.setItem('elixir_audit_logs', JSON.stringify(logs.slice(0, 500)));
  };

  const getAuditLogs = () => {
    return JSON.parse(localStorage.getItem('elixir_audit_logs') || '[]');
  };

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin, isOrganizer, isAuthenticated,
      login, register, logout, updateUser,
      banUser, unbanUser, holdUser, gameBanUser, removeGameBan, getAuditLogs,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
