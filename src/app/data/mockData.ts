import type { BackendUserRole } from './roles';

export type ContentType = 'video' | 'article' | 'podcast';
export type Difficulty = 'facil' | 'medio' | 'dificil';
export type UserRole = BackendUserRole;

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  subscribers: number;
  specialty: string;
  institution: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  category: string;
  authorId: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  publishedAt: string;
  tags: string[];
  isJindungo: boolean;
  featured: boolean;
  content: string;
  status: 'published' | 'draft';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  thumbnail: string;
  estimatedTime: string;
  participants: number;
  status: 'published' | 'draft';
}

export interface ForumReply {
  id: string;
  content: string;
  authorId: string;
  publishedAt: string;
  likes: number;
}

export interface ForumPost {
  id: string;
  backendThreadId: string;
  backendMainPostId: string;
  title: string;
  content: string;
  authorId: string;
  category: string;
  likes: number;
  views: number;
  replies: ForumReply[];
  publishedAt: string;
  isPinned: boolean;
  tags: string[];
  status: 'published' | 'draft';
  isPrivate: boolean;
  approvedUsers: string[];
}

export interface RankingEntry {
  userId: string;
  points: number;
  quizzesCompleted: number;
  forumReplies: number;
  badge: 'ouro' | 'prata' | 'bronze' | 'participante';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: UserRole;
  bio: string;
  subscriptions: string[];
  completedQuizzes: string[];
  watchHistory: string[];
  joinedAt: string;
  savedContent: string[];
  province: string;
  isActive: boolean;
}

// Estes arrays são populados pelo backend via bootstrapWebData() em App.tsx.
// Não devem conter dados hardcoded — apenas o backend fornece dados reais.

export const AUTHORS: Author[] = [];

export const CATEGORIES: string[] = ['Todos'];

export const CONTENT_ITEMS: ContentItem[] = [];

export const QUIZZES: Quiz[] = [];

export const FORUM_POSTS: ForumPost[] = [];

export const MOCK_USERS: User[] = [];

export const RANKING: RankingEntry[] = [];

// ─── Funções helper ───────────────────────────────────────────────────────────

export function getAuthorById(id: string): Author | undefined {
  return AUTHORS.find(a => a.id === id);
}

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find(u => u.id === id);
}

export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Hoje';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `há ${days} dias`;
  if (days < 30) return `há ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `há ${Math.floor(days / 30)} meses`;
  return `há ${Math.floor(days / 365)} anos`;
}
