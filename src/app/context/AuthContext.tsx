import React, { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_USERS, User } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  showAuthModal: boolean;
  authMode: 'login' | 'register';
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => { success: boolean; isAdmin: boolean; error?: string };
  logout: () => void;
  register: (name: string, email: string, password: string, province: string) => { success: boolean; error?: string };
  updateUser: (updates: Partial<User>) => void;
  subscribeToAuthor: (authorId: string) => void;
  unsubscribeFromAuthor: (authorId: string) => void;
  saveContent: (contentId: string) => void;
  unsaveContent: (contentId: string) => void;
  addToHistory: (contentId: string) => void;
  completeQuiz: (quizId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openLogin = useCallback(() => {
    setAuthMode('login');
    setShowAuthModal(true);
  }, []);

  const openRegister = useCallback(() => {
    setAuthMode('register');
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      setUser({ ...found });
      setShowAuthModal(false);
      return { success: true, isAdmin: found.role === 'admin' };
    }
    return { success: false, isAdmin: false, error: 'Email ou senha incorretos.' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const register = useCallback((name: string, email: string, password: string, province: string) => {
    const exists = MOCK_USERS.find(u => u.email === email);
    if (exists) {
      return { success: false, error: 'Este email já está registado.' };
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7B1D2D&color=fff&size=200`,
      role: 'user',
      bio: '',
      subscriptions: [],
      completedQuizzes: [],
      watchHistory: [],
      joinedAt: new Date().toISOString().split('T')[0],
      savedContent: [],
      province,
      isActive: true,
    };
    MOCK_USERS.push(newUser);
    setUser({ ...newUser });
    setShowAuthModal(false);
    return { success: true };
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const subscribeToAuthor = useCallback((authorId: string) => {
    setUser(prev => {
      if (!prev) return null;
      const subscriptions = prev.subscriptions.includes(authorId)
        ? prev.subscriptions
        : [...prev.subscriptions, authorId];
      return { ...prev, subscriptions };
    });
  }, []);

  const unsubscribeFromAuthor = useCallback((authorId: string) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, subscriptions: prev.subscriptions.filter(id => id !== authorId) };
    });
  }, []);

  const saveContent = useCallback((contentId: string) => {
    setUser(prev => {
      if (!prev) return null;
      const savedContent = prev.savedContent.includes(contentId)
        ? prev.savedContent
        : [...prev.savedContent, contentId];
      return { ...prev, savedContent };
    });
  }, []);

  const unsaveContent = useCallback((contentId: string) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, savedContent: prev.savedContent.filter(id => id !== contentId) };
    });
  }, []);

  const addToHistory = useCallback((contentId: string) => {
    setUser(prev => {
      if (!prev) return null;
      const watchHistory = [contentId, ...prev.watchHistory.filter(id => id !== contentId)].slice(0, 50);
      return { ...prev, watchHistory };
    });
  }, []);

  const completeQuiz = useCallback((quizId: string) => {
    setUser(prev => {
      if (!prev) return null;
      const completedQuizzes = prev.completedQuizzes.includes(quizId)
        ? prev.completedQuizzes
        : [...prev.completedQuizzes, quizId];
      return { ...prev, completedQuizzes };
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isAdmin: user?.role === 'admin',
      showAuthModal,
      authMode,
      openLogin,
      openRegister,
      closeAuthModal,
      login,
      logout,
      register,
      updateUser,
      subscribeToAuthor,
      unsubscribeFromAuthor,
      saveContent,
      unsaveContent,
      addToHistory,
      completeQuiz,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}