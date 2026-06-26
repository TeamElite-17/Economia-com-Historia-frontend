import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MOCK_USERS, User } from '../data/mockData';
import {
  addHistoryItemBackend,
  addSavedItemBackend,
  addSubscriptionItemBackend,
  clearStoredAuthToken,
  createUserProfileBackend,
  getUserCollectionsBackend,
  getUserProfileByUserIdBackend,
  loginWithBackend,
  logoutWithBackend,
  registerWithBackend,
  removeSavedItemBackend,
  removeSubscriptionItemBackend,
  submitQuizAttemptBackend,
  updateUserProfileBackend,
  updateSubscriptionNotificationPrefBackend,
} from '../data/backendApi';
import {
  canAccessAdminPanel,
  canPublishContent,
  isStaffRole,
  isSuperAdminRole,
  normalizeBackendRole,
  type BackendUserRole,
} from '../data/roles';

interface AuthContextType {
  user: User | null;
  userRole: BackendUserRole;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStaff: boolean;
  canPublish: boolean;
  showAuthModal: boolean;
  authMode: 'login' | 'register';
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; isAdmin: boolean; error?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, province: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => void;
  subscribeToAuthor: (authorId: string) => void;
  unsubscribeFromAuthor: (authorId: string) => void;
  saveContent: (contentId: string) => void;
  unsaveContent: (contentId: string) => void;
  addToHistory: (contentId: string) => void;
  completeQuiz: (quizId: string, score?: number) => void;
  /** Obtém a preferência de notificação para um autor subscrito ('ALL' | 'NONE') */
  getSubscriptionNotifPref: (authorId: string) => 'ALL' | 'NONE';
  /** Altera e persiste a preferência de notificação para um autor subscrito */
  setSubscriptionNotifPref: (authorId: string, pref: 'ALL' | 'NONE') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function buildUserFromLogin(
  response: { userId?: string; name?: string; email?: string; role?: string },
  email: string,
  password: string,
  localMatch?: User,
): User {
  const role = normalizeBackendRole(response.role ?? localMatch?.role);
  return localMatch
    ? {
        ...localMatch,
        id: response.userId || localMatch.id,
        name: response.name || localMatch.name,
        email: response.email || localMatch.email,
        role,
      }
    : {
        id: response.userId || `u-${Date.now()}`,
        name: response.name || email,
        email: response.email || email,
        password,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.name || email)}&background=7B1D2D&color=fff&size=200`,
        role,
        bio: '',
        subscriptions: [],
        completedQuizzes: [],
        watchHistory: [],
        joinedAt: new Date().toISOString().split('T')[0],
        savedContent: [],
        province: 'Angola',
        isActive: true,
      };
}

const USER_STORAGE_KEY = 'economia-historia-user';
const NOTIF_PREFS_KEY = 'economia-historia-notif-prefs';

function loadPersistedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    // Só restaurar se ainda houver token válido
    const token = localStorage.getItem('economia-historia-token');
    if (!token) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function loadNotifPrefs(userId: string): Record<string, 'ALL' | 'NONE'> {
  try {
    const raw = localStorage.getItem(`${NOTIF_PREFS_KEY}-${userId}`);
    return raw ? (JSON.parse(raw) as Record<string, 'ALL' | 'NONE'>) : {};
  } catch {
    return {};
  }
}

function saveNotifPrefs(userId: string, prefs: Record<string, 'ALL' | 'NONE'>) {
  try {
    localStorage.setItem(`${NOTIF_PREFS_KEY}-${userId}`, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadPersistedUser());
  const [profileId, setProfileId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [notifPrefs, setNotifPrefs] = useState<Record<string, 'ALL' | 'NONE'>>(
    () => {
      const persisted = loadPersistedUser();
      return persisted ? loadNotifPrefs(persisted.id) : {};
    }
  );

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      // Se não tivermos o profileId em memória mas temos utilizador logado (ex: refresh da página)
      // Vamos tentar ir buscar à BD para sincronizar.
      if (!profileId) {
        getUserProfileByUserIdBackend(user.id)
          .then((profile) => {
            setProfileId(profile.profileId ?? null);
            // Atualizar o utilizador local com os dados frescos da BD
            setUser(prev => prev ? {
              ...prev,
              bio: (profile as any).bio ?? prev.bio,
              province: (profile as any).region ?? prev.province,
              name: (profile as any).name ?? prev.name,
              avatar: (profile as any).avatarUrl ?? prev.avatar,
              youtubeUrl: (profile as any).youtubeUrl,
              instagramUrl: (profile as any).instagramUrl,
              facebookUrl: (profile as any).facebookUrl,
              websiteUrl: (profile as any).websiteUrl,
            } : prev);
          })
          .catch(() => undefined);
      }
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user, profileId]);

  const userRole = user ? normalizeBackendRole(user.role) : 'ESTUDANTE';

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

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await loginWithBackend(email, password);
      const localMatch = MOCK_USERS.find(
        (u) => u.email.trim().toLowerCase() === normalizedEmail,
      );
      const nextUser = buildUserFromLogin(response, email, password, localMatch);

      const profilePromise = getUserProfileByUserIdBackend(nextUser.id)
        .then((profile) => {
          setProfileId(profile.profileId ?? null);
          return {
            ...nextUser,
            bio: (profile as any).bio ?? nextUser.bio,
            province: (profile as any).region ?? nextUser.province,
            name: (profile as any).name ?? nextUser.name,
            avatar: (profile as any).avatarUrl ?? nextUser.avatar,
            youtubeUrl: (profile as any).youtubeUrl,
            instagramUrl: (profile as any).instagramUrl,
            facebookUrl: (profile as any).facebookUrl,
            websiteUrl: (profile as any).websiteUrl,
          };
        })
        .catch(() => {
          setProfileId(null);
          return nextUser;
        });

      const collectionPromise = getUserCollectionsBackend(nextUser.id).catch(() => ({
        history: nextUser.watchHistory,
        saved: nextUser.savedContent,
        subscriptions: nextUser.subscriptions,
      }));

      const [profileMerged, collections] = await Promise.all([profilePromise, collectionPromise]);
      const mergedUser = {
        ...profileMerged,
        watchHistory: collections.history,
        savedContent: collections.saved,
        subscriptions: collections.subscriptions,
      };

      setUser(mergedUser);
      setShowAuthModal(false);
      return { success: true, isAdmin: canAccessAdminPanel(mergedUser.role) };
    } catch {
      return { success: false, isAdmin: false, error: 'Email ou senha incorretos.' };
    }
  }, []);

  const logout = useCallback(() => {
    void logoutWithBackend().finally(() => {
      clearStoredAuthToken();
      setUser(null);
    });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, province: string) => {
    try {
      const response = await registerWithBackend(name, email, password);
      const newUser: User = {
        id: response.userId || `u${Date.now()}`,
        name: response.name || name,
        email: response.email || email,
        password,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.name || name)}&background=7B1D2D&color=fff&size=200`,
        role: normalizeBackendRole(response.role ?? 'ESTUDANTE'),
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
      try {
        const createdProfile = await createUserProfileBackend({
          userId: newUser.id,
          bio: '',
          region: province,
          educationLevel: '',
          ageRange: '',
        });
        setProfileId((createdProfile as { profileId?: string })?.profileId ?? null);
      } catch {
        setProfileId(null);
      }

      setUser({ ...newUser });
      setShowAuthModal(false);
      return { success: true };
    } catch {
      return { success: false, error: 'Não foi possível criar a conta agora.' };
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;

      const next = { ...prev, ...updates };
      const payload = {
        userId: next.id,
        bio: next.bio,
        region: next.province,
        educationLevel: '',
        ageRange: '',
        name: next.name,
        avatarUrl: next.avatar,
        youtubeUrl: next.youtubeUrl,
        instagramUrl: next.instagramUrl,
        facebookUrl: next.facebookUrl,
        websiteUrl: next.websiteUrl,
      };

      if (profileId) {
        void updateUserProfileBackend(profileId, payload).catch(() => undefined);
      } else {
        void createUserProfileBackend(payload)
          .then((created) => {
            setProfileId((created as { profileId?: string })?.profileId ?? null);
          })
          .catch(() => undefined);
      }

      return next;
    });
  }, [profileId]);

  const subscribeToAuthor = useCallback((authorId: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const subscriptions = prev.subscriptions.includes(authorId)
        ? prev.subscriptions
        : [...prev.subscriptions, authorId];
      if (!prev.subscriptions.includes(authorId)) {
        void addSubscriptionItemBackend(prev.id, authorId).catch(() => undefined);
      }
      return { ...prev, subscriptions };
    });
  }, []);

  const unsubscribeFromAuthor = useCallback((authorId: string) => {
    setUser((prev) => {
      if (!prev) return null;
      void removeSubscriptionItemBackend(prev.id, authorId).catch(() => undefined);
      return { ...prev, subscriptions: prev.subscriptions.filter((id) => id !== authorId) };
    });
  }, []);

  const saveContent = useCallback((contentId: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const savedContent = prev.savedContent.includes(contentId)
        ? prev.savedContent
        : [...prev.savedContent, contentId];
      if (!prev.savedContent.includes(contentId)) {
        void addSavedItemBackend(prev.id, contentId).catch(() => undefined);
      }
      return { ...prev, savedContent };
    });
  }, []);

  const unsaveContent = useCallback((contentId: string) => {
    setUser((prev) => {
      if (!prev) return null;
      void removeSavedItemBackend(prev.id, contentId).catch(() => undefined);
      return { ...prev, savedContent: prev.savedContent.filter((id) => id !== contentId) };
    });
  }, []);

  const addToHistory = useCallback((contentId: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const watchHistory = [contentId, ...prev.watchHistory.filter((id) => id !== contentId)].slice(0, 50);
      void addHistoryItemBackend(prev.id, contentId).catch(() => undefined);
      return { ...prev, watchHistory };
    });
  }, []);

  const completeQuiz = useCallback((quizId: string, score = 0) => {
    setUser((prev) => {
      if (!prev) return null;
      const completedQuizzes = prev.completedQuizzes.includes(quizId)
        ? prev.completedQuizzes
        : [...prev.completedQuizzes, quizId];
      void submitQuizAttemptBackend({
        quizId,
        userId: prev.id,
        score,
        completed: true,
      }).catch(() => undefined);
      return { ...prev, completedQuizzes };
    });
  }, []);

  const getSubscriptionNotifPref = useCallback((authorId: string): 'ALL' | 'NONE' => {
    return notifPrefs[authorId] ?? 'ALL';
  }, [notifPrefs]);

  const setSubscriptionNotifPref = useCallback((authorId: string, pref: 'ALL' | 'NONE') => {
    setNotifPrefs(prev => {
      const next = { ...prev, [authorId]: pref };
      if (user) saveNotifPrefs(user.id, next);
      return next;
    });
    if (user) {
      void updateSubscriptionNotificationPrefBackend(user.id, authorId, pref).catch(() => undefined);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isLoggedIn: !!user,
        isAdmin: canAccessAdminPanel(userRole),
        isSuperAdmin: isSuperAdminRole(userRole),
        isStaff: isStaffRole(userRole),
        canPublish: canPublishContent(userRole),
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
        getSubscriptionNotifPref,
        setSubscriptionNotifPref,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
