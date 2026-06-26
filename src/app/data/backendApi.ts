import {
  AUTHORS,
  CATEGORIES,
  CONTENT_ITEMS,
  FORUM_POSTS,
  MOCK_USERS,
  QUIZZES,
  RANKING,
  type Author,
  type ContentItem,
  type ForumPost,
  type ForumReply,
  type Quiz,
  type QuizQuestion,
  type User,
} from './mockData';
import { normalizeBackendRole, type BackendUserRole } from './roles';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/api')) {
    const base = API_BASE.replace(/\/$/, '');
    if (base.startsWith('http')) {
      const origin = base.replace(/\/api$/, '');
      return `${origin}${url}`;
    }
    return url;
  }
  const base = API_BASE.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export function parseDurationToSeconds(duration: string): number | undefined {
  const trimmed = duration.trim().toLowerCase();
  const minMatch = trimmed.match(/(\d+)\s*min/);
  if (minMatch) return Number.parseInt(minMatch[1], 10) * 60;
  const colonMatch = trimmed.match(/^(\d+):(\d+)$/);
  if (colonMatch) {
    return Number.parseInt(colonMatch[1], 10) * 60 + Number.parseInt(colonMatch[2], 10);
  }
  const plain = Number.parseInt(trimmed, 10);
  return Number.isNaN(plain) ? undefined : plain * 60;
}
const AUTH_TOKEN_KEY = 'economia-historia-token';

type AnyRecord = Record<string, unknown>;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function formatDuration(seconds: number | null | undefined) {
  if (!seconds || Number.isNaN(Number(seconds))) {
    return '';
  }

  const totalSeconds = Math.max(0, Math.floor(Number(seconds)));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}`;
  }

  return `${minutes} min`;
}

function generatedAvatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7B1D2D&color=fff&size=200`;
}

export async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as AnyRecord;
    for (const key of ['data', 'content', 'items', 'results']) {
      if (Array.isArray(candidate[key])) {
        return candidate[key] as T[];
      }
    }
  }

  return [];
}

function replaceArray<T>(target: T[], values: T[]) {
  target.splice(0, target.length, ...values);
}


function mergeByKey<T>(base: T[], incoming: T[], keySelector: (value: T) => string) {
  const merged = new Map<string, T>();

  for (const item of base) {
    merged.set(keySelector(item), item);
  }

  for (const item of incoming) {
    const key = keySelector(item);
    if (!key) {
      continue;
    }

    const current = merged.get(key);
    merged.set(key, current ? { ...current, ...item } : item);
  }

  return Array.from(merged.values());
}

function findFallback<T extends { title?: string; name?: string; id: string }>(items: T[], raw: AnyRecord) {
  const key = normalize(String(raw.title ?? raw.name ?? raw.slug ?? raw.id ?? ''));
  if (!key) {
    return undefined;
  }

  return items.find((item) => {
    const candidate = normalize(String(item.title ?? item.name ?? item.id));
    return candidate === key || candidate.includes(key) || key.includes(candidate);
  });
}

export function mapContentItem(raw: AnyRecord) {
  const fallback = findFallback(CONTENT_ITEMS, raw);
  const mediaType = String(raw.mediaType ?? raw.type ?? fallback?.type ?? 'article').toLowerCase();
  const type = mediaType.includes('video') ? 'video' : mediaType.includes('podcast') ? 'podcast' : 'article';
  const categoryFromApi = Array.isArray(raw.categories) && raw.categories.length > 0 ? raw.categories[0]?.name : undefined;
  // Artigos usam sourceUrl, vídeos/áudios usam fileUrl
  const contentUrl = type === 'article' ? (raw.sourceUrl ?? raw.fileUrl ?? fallback?.content ?? '') : (raw.fileUrl ?? raw.sourceUrl ?? fallback?.content ?? '');
  // authorId vem do backend (campo authorId no ContentItemDTO)
  const authorId = String(raw.authorId ?? fallback?.authorId ?? '');

  return {
    id: String(raw.contentId ?? raw.id ?? fallback?.id ?? `content-${Date.now()}`),
    title: String(raw.title ?? fallback?.title ?? 'Conteúdo sem título'),
    description: String(raw.description ?? fallback?.description ?? ''),
    type,
    category: String(categoryFromApi ?? raw.regionTag ?? fallback?.category ?? 'Geral'),
    authorId,
    thumbnail: resolveMediaUrl(String(raw.thumbnailUrl ?? fallback?.thumbnail ?? '')),
    duration: String(raw.durationSeconds ? formatDuration(Number(raw.durationSeconds)) : fallback?.duration ?? ''),
    views: Number(raw.viewCount ?? fallback?.views ?? 0),
    likes: Number(raw.likeCount ?? fallback?.likes ?? 0),
    publishedAt: String(raw.publishedAt ?? fallback?.publishedAt ?? new Date().toISOString().split('T')[0]),
    tags: fallback?.tags ?? [],
    isJindungo: raw.isJindungo ?? fallback?.isJindungo ?? false,
    featured: fallback?.featured ?? false,
    content: type === 'article' ? String(contentUrl) : resolveMediaUrl(String(contentUrl)),
    status: (String(raw.status ?? fallback?.status ?? 'published').toLowerCase().includes('publish') ? 'published' : 'draft') as 'published' | 'draft',
  } satisfies ContentItem;
}

function mapQuizQuestion(raw: AnyRecord, fallbackQuestion?: QuizQuestion, index = 0): QuizQuestion {
  const answerOptions = Array.isArray(raw.answerOptions) ? raw.answerOptions as AnyRecord[] : [];
  const optionsFromApi = answerOptions.map((opt) => String(opt.text ?? ''));
  const correctIndexFromApi = answerOptions.findIndex((opt) => opt.correct === true);

  return {
    id: String(raw.questionId ?? raw.id ?? fallbackQuestion?.id ?? `q-${index}-${Date.now()}`),
    question: String(raw.text ?? fallbackQuestion?.question ?? `Pergunta ${index + 1}`),
    options: optionsFromApi.length > 0 ? optionsFromApi : (fallbackQuestion?.options ?? ['Opção A', 'Opção B', 'Opção C', 'Opção D']),
    correctIndex: correctIndexFromApi >= 0 ? correctIndexFromApi : (fallbackQuestion?.correctIndex ?? 0),
    explanation: fallbackQuestion?.explanation ?? '',
  };
}

function mapQuiz(raw: AnyRecord, questions: AnyRecord[] = []) {
  const fallback = findFallback(QUIZZES, raw);
  const mappedQuestions = questions.length > 0
    ? questions.map((question, index) => mapQuizQuestion(question, fallback?.questions[index] ?? fallback?.questions[0], index))
    : (fallback?.questions ?? []);

  return {
    id: String(raw.quizId ?? raw.id ?? fallback?.id ?? `quiz-${Date.now()}`),
    title: String(raw.title ?? fallback?.title ?? 'Quiz sem título'),
    description: String(raw.description ?? fallback?.description ?? ''),
    category: fallback?.category ?? 'Geral',
    difficulty: fallback?.difficulty ?? 'medio',
    questions: mappedQuestions,
    thumbnail: fallback?.thumbnail ?? AUTHORS[0]?.avatar ?? '',
    estimatedTime: fallback?.estimatedTime ?? `${Math.max(1, mappedQuestions.length * 2)} min`,
    participants: fallback?.participants ?? 0,
    status: fallback?.status ?? 'published',
  } satisfies Quiz;
}

function mapReply(raw: AnyRecord, fallback?: ForumReply): ForumReply {
  return {
    id: String(raw.commentId ?? raw.id ?? fallback?.id ?? `reply-${Date.now()}`),
    content: String(raw.content ?? fallback?.content ?? ''),
    authorId: String(raw.userId ?? fallback?.authorId ?? MOCK_USERS[0]?.id ?? 'u1'),
    publishedAt: String(raw.commentedAt ?? raw.postedAt ?? fallback?.publishedAt ?? new Date().toISOString().split('T')[0]),
    likes: fallback?.likes ?? 0,
  };
}

function mapForumPost(raw: AnyRecord, fallback?: ForumPost, replies: ForumReply[] = []) {
  return {
    id: String(raw.threadId ?? raw.postId ?? raw.id ?? fallback?.id ?? `forum-${Date.now()}`),
    backendThreadId: String(raw.threadId ?? raw.id ?? fallback?.backendThreadId ?? ''),
    backendMainPostId: String(raw.postId ?? raw.mainPostId ?? fallback?.backendMainPostId ?? ''),
    title: String(raw.title ?? fallback?.title ?? 'Tópico sem título'),
    content: String(raw.content ?? fallback?.content ?? ''),
    authorId: String(raw.userId ?? fallback?.authorId ?? MOCK_USERS[0]?.id ?? 'u1'),
    category: String(raw.topicName ?? fallback?.category ?? 'Geral'),
    likes: Number(raw.likeCount ?? raw.likes ?? fallback?.likes ?? 0),
    views: Number(raw.postCount ?? raw.viewCount ?? raw.views ?? fallback?.views ?? 0),
    replies,
    publishedAt: String(raw.postedAt ?? fallback?.publishedAt ?? new Date().toISOString().split('T')[0]),
    isPinned: fallback?.isPinned ?? false,
    tags: fallback?.tags ?? [],
    status: fallback?.status ?? 'published',
    isPrivate: fallback?.isPrivate ?? false,
    approvedUsers: fallback?.approvedUsers ?? [],
  } satisfies ForumPost;
}

function mapUser(raw: AnyRecord) {
  const fallback = findFallback(MOCK_USERS, raw);
  const name = String(raw.name ?? fallback?.name ?? 'Utilizador');
  const email = String(raw.email ?? fallback?.email ?? '');
  const role = normalizeBackendRole(String(raw.role ?? fallback?.role ?? 'ESTUDANTE'));

  return {
    id: String(raw.userId ?? raw.id ?? fallback?.id ?? `u-${Date.now()}`),
    name,
    email,
    password: String(raw.password ?? fallback?.password ?? ''),
    avatar: fallback?.avatar ?? generatedAvatar(name),
    role,
    bio: fallback?.bio ?? '',
    subscriptions: raw.subscriptionsCount !== undefined ? Array(Number(raw.subscriptionsCount)).fill('') : fallback?.subscriptions ?? [],
    completedQuizzes: raw.completedQuizzesCount !== undefined ? Array(Number(raw.completedQuizzesCount)).fill('') : fallback?.completedQuizzes ?? [],
    watchHistory: raw.watchHistoryCount !== undefined ? Array(Number(raw.watchHistoryCount)).fill('') : fallback?.watchHistory ?? [],
    joinedAt: String(raw.registrationDate ?? fallback?.joinedAt ?? new Date().toISOString().split('T')[0]),
    savedContent: fallback?.savedContent ?? [],
    province: fallback?.province ?? String(raw.preferredLanguage ?? 'Angola'),
    isActive: fallback?.isActive ?? true,
    subscribersCount: raw.subscribersCount !== undefined ? Number(raw.subscribersCount) : fallback?.subscribersCount ?? 0,
  } satisfies User;
}

function applyCategories(values: string[]) {
  const unique = Array.from(new Set(values.filter(Boolean).map((value) => value.trim())));
  replaceArray(CATEGORIES, ['Todos', ...unique.filter((value) => value !== 'Todos')]);
}

function storeAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getStoredAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearStoredAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function bootstrapWebData() {
  const results = await Promise.allSettled([
    requestJson<unknown>('/v1/content-items'),
    requestJson<unknown>('/v1/quizzes'),
    requestJson<unknown>('/v1/forum-threads'),
    requestJson<unknown>('/v1/categories'),
    requestJson<unknown>('/v1/users'),
  ]);

  const contentPayload = results[0].status === 'fulfilled' ? extractArray<AnyRecord>(results[0].value) : [];
  const quizPayload = results[1].status === 'fulfilled' ? extractArray<AnyRecord>(results[1].value) : [];
  const threadPayload = results[2].status === 'fulfilled' ? extractArray<AnyRecord>(results[2].value) : [];
  const postPayload: AnyRecord[] = [];
  const commentPayload: AnyRecord[] = [];
  const categoryPayload = results[3].status === 'fulfilled' ? extractArray<AnyRecord>(results[3].value) : [];
  const userPayload = results[4].status === 'fulfilled' ? extractArray<AnyRecord>(results[4].value) : [];

  if (categoryPayload.length > 0) {
    applyCategories(categoryPayload.map((item) => String(item.name ?? item.slug ?? '')));
  }

  if (contentPayload.length > 0) {
    // Substitui completamente o mock data com dados reais do backend
    const mappedContent = contentPayload.map((item) => mapContentItem(item));
    replaceArray(CONTENT_ITEMS, mappedContent);
  }

  if (quizPayload.length > 0) {
    const mappedQuizzes = await Promise.all(
      quizPayload.map(async (item) => {
        const quizId = String(item.quizId ?? item.id ?? '');
        let questionsForQuiz: AnyRecord[] = [];
        if (quizId) {
          try {
            questionsForQuiz = extractArray<AnyRecord>(
              await requestJson<unknown>(`/v1/questions/quiz/${quizId}`),
            );
          } catch {
            questionsForQuiz = [];
          }
        }
        return mapQuiz(item, questionsForQuiz);
      }),
    );
    replaceArray(QUIZZES, mappedQuizzes);
  }

  if (threadPayload.length > 0 || postPayload.length > 0 || commentPayload.length > 0) {
    const repliesByPostId = new Map<string, ForumReply[]>();
    for (const comment of commentPayload) {
      const postId = String(comment.postId ?? '');
      const current = repliesByPostId.get(postId) ?? [];
      current.push(mapReply(comment));
      repliesByPostId.set(postId, current);
    }

    const forumPosts = threadPayload.map((thread) => {
      const threadId = String(thread.threadId ?? thread.id ?? '');
      const threadPosts = postPayload.filter((post) => String(post.threadId ?? '') === threadId);
      const firstPost = threadPosts[0] ?? {};
      const fallback = findFallback(FORUM_POSTS, {
        title: thread.title,
        content: firstPost.content,
      });
      return mapForumPost(
        {
          ...thread,
          content: firstPost.content ?? thread.description ?? fallback?.content,
          userId: firstPost.userId ?? thread.createdByUserId,
          topicName: thread.title,
          postedAt: firstPost.postedAt ?? thread.createdAt,
        },
        fallback,
        repliesByPostId.get(String(firstPost.postId ?? '')) ?? [],
      );
    });

    replaceArray(FORUM_POSTS, forumPosts);
  }

  if (userPayload.length > 0) {
    const mappedUsers = userPayload.map((item) => mapUser(item));
    replaceArray(MOCK_USERS, mergeByKey(MOCK_USERS, mappedUsers, (item) => item.id));
  }

  // Constrói AUTHORS a partir de TODOS os utilizadores que têm conteúdos publicados
  // ou que são ESCRITOR/REVISOR/APROVADOR/ADMIN/SUPERADMIN
  {
    const authorRoles = new Set(['ESCRITOR', 'REVISOR', 'APROVADOR', 'ADMIN', 'SUPERADMIN']);
    // Recolhe os IDs dos autores que têm conteúdos
    const authorIdsWithContent = new Set(CONTENT_ITEMS.map(c => c.authorId).filter(Boolean));

    const builtAuthors: import('./mockData').Author[] = MOCK_USERS
      .filter(u => authorRoles.has(u.role) || authorIdsWithContent.has(u.id))
      .map(u => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        bio: u.bio || '',
        subscribers: u.subscribersCount || 0,
        specialty: u.role === 'ESCRITOR' ? 'Escritor / Professor'
          : u.role === 'REVISOR' ? 'Revisor'
          : u.role === 'APROVADOR' ? 'Aprovador'
          : 'Administrador',
        institution: 'ISPTEC',
      }));

    replaceArray(AUTHORS, builtAuthors);
  }

  if (RANKING.length === 0 && MOCK_USERS.length > 0) {
    // Mantém a tabela vazia apenas quando a API não fornecer um ranking explícito.
  }
}

export async function loginWithBackend(email: string, password: string) {
  const response = await requestJson<{ token: string; userId: string; name: string; email: string; role: string }>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.token) {
    storeAuthToken(response.token);
  }

  return response;
}

export async function registerWithBackend(name: string, email: string, password: string) {
  const response = await requestJson<{ token?: string; userId?: string; name?: string; email?: string; role?: string }>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, preferredLanguage: 'pt' }),
  });

  if (response.token) {
    storeAuthToken(response.token);
  }

  return response;
}

export async function logoutWithBackend() {
  const token = getStoredAuthToken();
  if (!token) {
    clearStoredAuthToken();
    return;
  }

  try {
    await requestJson('/v1/auth/logout', { method: 'POST' });
  } finally {
    clearStoredAuthToken();
  }
}

export async function createContentItemBackend(payload: {
  title: string;
  description: string;
  mediaType: string;
  sourceUrl?: string;
  regionTag?: string;
  publishedAt?: string;
  regionId?: string;
  contentModuleId?: string;
  durationSeconds?: number;
  wordCount?: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  isJindungo?: boolean;
  status?: string;
  categories?: Array<{ categoryId?: string; name?: string; slug?: string }>;
  topicId?: string;
}) {
  return requestJson<{ contentId?: string; id?: string }>('/v1/content-items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateContentItemBackend(contentId: string, payload: {
  title: string;
  description: string;
  mediaType: string;
  sourceUrl?: string;
  regionTag?: string;
  publishedAt?: string;
  regionId?: string;
  contentModuleId?: string;
  durationSeconds?: number;
  wordCount?: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  isJindungo?: boolean;
  status?: string;
  categories?: Array<{ categoryId?: string; name?: string; slug?: string }>;
  topicId?: string;
}) {
  return requestJson<{ contentId?: string; id?: string }>(`/v1/content-items/${contentId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteContentItemBackend(contentId: string) {
  return requestJson<void>(`/v1/content-items/${contentId}`, { method: 'DELETE' });
}

export async function getPendingContentBackend() {
  return requestJson<unknown>('/v1/content-items/pending');
}

export async function getReadyToPublishBackend() {
  return requestJson<unknown>('/v1/content-items/ready-to-publish');
}

/** Obter conteúdos do utilizador autenticado (rascunhos, em revisão, publicados) */
export async function getMyContentBackend() {
  return requestJson<unknown>('/v1/content-items/my');
}

/** Obter conteúdos por status (para escritores verem os seus rascunhos) */
export async function getContentByStatusBackend(status: 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'REJECTED') {
  return requestJson<unknown>(`/v1/content-items?status=${status}`);
}

export async function submitContentForReviewBackend(contentId: string) {
  return requestJson(`/v1/content-items/${contentId}/submit`, { method: 'PATCH' });
}

export async function readyForApprovalBackend(contentId: string) {
  return requestJson(`/v1/content-items/${contentId}/ready-for-approval`, { method: 'PATCH' });
}

export async function rejectAsReviewerBackend(contentId: string) {
  return requestJson(`/v1/content-items/${contentId}/review-reject`, { method: 'PATCH' });
}

export async function approveContentBackend(contentId: string) {
  return requestJson(`/v1/content-items/${contentId}/approve`, { method: 'PATCH' });
}

export async function rejectContentBackend(contentId: string) {
  return requestJson(`/v1/content-items/${contentId}/reject`, { method: 'PATCH' });
}

export async function getQuizQuestionsBackend(quizId: string) {
  return requestJson<unknown>(`/v1/questions/quiz/${quizId}`);
}

export async function createQuizBackend(payload: {
  title: string;
  description?: string;
  passingScore: number;
}) {
  return requestJson<{ quizId?: string; id?: string }>('/v1/quizzes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createQuestionBackend(payload: {
  quizId: string;
  text: string;
  type?: string;
  points?: number;
  answerOptions: Array<{ text: string; correct: boolean }>;
}) {
  return requestJson('/v1/questions', {
    method: 'POST',
    body: JSON.stringify({
      quizId: payload.quizId,
      text: payload.text,
      type: payload.type ?? 'SINGLE_CHOICE',
      points: payload.points ?? 10,
      answerOptions: payload.answerOptions,
    }),
  });
}

export async function deleteQuizBackend(quizId: string) {
  return requestJson<void>(`/v1/quizzes/${quizId}`, { method: 'DELETE' });
}

/** Carrega quizzes + perguntas da API para QUIZZES global */
export async function loadQuizzesFromBackend(): Promise<Quiz[]> {
  const raw = await requestJson<unknown>('/v1/quizzes');
  const quizList = extractArray<AnyRecord>(raw);

  const mapped = await Promise.all(
    quizList.map(async (item) => {
      const quizId = String(item.quizId ?? item.id ?? '');
      let questions: AnyRecord[] = [];
      if (quizId) {
        try {
          questions = extractArray<AnyRecord>(await getQuizQuestionsBackend(quizId));
        } catch {
          questions = [];
        }
      }
      return mapQuiz(item, questions);
    }),
  );

  replaceArray(QUIZZES, mapped);
  return mapped;
}

export async function submitQuizAttemptBackend(payload: {
  quizId: string;
  userId: string;
  score: number;
  completed?: boolean;
}) {
  return requestJson('/v1/quiz-attempts', {
    method: 'POST',
    body: JSON.stringify({ ...payload, completed: payload.completed ?? true }),
  });
}

async function uploadFile(
  endpoint: string,
  file: File,
): Promise<{ success: boolean; filename: string; url: string; message: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const body = await response.json().catch(() => ({})) as {
    success?: boolean;
    url?: string;
    message?: string;
  };

  if (!response.ok || body.success === false) {
    throw new Error(body.message || `HTTP ${response.status}`);
  }

  return {
    success: true,
    filename: String((body as { filename?: string }).filename ?? ''),
    url: resolveMediaUrl(body.url ?? ''),
    message: body.message ?? 'Upload concluído',
  };
}

export async function createAdminUserBackend(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  preferredLanguage?: string;
}) {
  return requestJson('/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAdminUsersBackend() {
  return requestJson<unknown>('/v1/admin/users');
}

export async function updateUserRoleBackend(userId: string, role: string) {
  return requestJson<{ userId?: string; role?: string }>(`/v1/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role: role.toUpperCase() }),
  });
}

/** Lista utilizadores da API admin e actualiza MOCK_USERS. */
export async function loadAdminUsersFromBackend(): Promise<User[]> {
  const raw = await getAdminUsersBackend();
  const items = extractArray<AnyRecord>(raw);
  const mapped = items.map((item) => mapUser(item));
  replaceArray(MOCK_USERS, mergeByKey(MOCK_USERS, mapped, (u) => u.id));
  return mapped;
}

export async function getUserProfileByUserIdBackend(userId: string) {
  return requestJson<{
    profileId?: string;
    userId: string;
    bio?: string;
    ageRange?: string;
    educationLevel?: string;
    region?: string;
  }>(`/v1/profiles/user/${userId}`);
}

export async function createUserProfileBackend(payload: {
  userId: string;
  bio?: string;
  ageRange?: string;
  educationLevel?: string;
  region?: string;
}) {
  return requestJson('/v1/profiles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUserProfileBackend(profileId: string, payload: {
  userId: string;
  bio?: string;
  ageRange?: string;
  educationLevel?: string;
  region?: string;
}) {
  return requestJson(`/v1/profiles/${profileId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export interface ForumThreadResponse {
  threadId: string;
  title: string;
  createdAt?: string;
  forumModuleId?: string;
  topicId?: string;
  createdByUserId?: string;
  createdByUserName?: string;
  createdByUserAvatar?: string;
  postCount?: number;
  likeCount?: number;
  viewCount?: number;
}

export interface ForumPostResponse {
  postId: string;
  threadId?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  postedAt?: string;
  likeCount?: number;
  likedByCurrentUser?: boolean;
}

/** Carrega todos os tópicos do fórum */
export async function getForumThreadsBackend(): Promise<ForumThreadResponse[]> {
  return requestJson<ForumThreadResponse[]>('/v1/forum-threads');
}

/** Carrega um tópico específico */
export async function getForumThreadByIdBackend(threadId: string): Promise<ForumThreadResponse> {
  return requestJson<ForumThreadResponse>(`/v1/forum-threads/${threadId}`);
}

/** Regista uma visualização na thread (incrementa view_count no backend) */
export async function registerForumThreadViewBackend(threadId: string): Promise<void> {
  await requestJson<void>(`/v1/forum-threads/${threadId}/view`, { method: 'POST' }).catch(() => undefined);
}

export async function createForumThreadBackend(payload: {
  title: string;
  topicId?: string;
  forumModuleId?: string;
  createdByUserId?: string;
}) {
  return requestJson<ForumThreadResponse>('/v1/forum-threads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createForumPostBackend(payload: {
  threadId: string;
  userId?: string;
  content: string;
}) {
  return requestJson<ForumPostResponse>('/v1/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createForumCommentBackend(payload: {
  postId: string;
  userId?: string;
  content: string;
  parentCommentId?: string;
}) {
  return requestJson<{ commentId: string; postId?: string; userId?: string; content: string; commentedAt?: string; userName?: string; userAvatar?: string; parentCommentId?: string }>('/v1/comments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPostsByThreadBackend(threadId: string): Promise<ForumPostResponse[]> {
  return requestJson<ForumPostResponse[]>(`/v1/posts/thread/${threadId}`);
}

export async function getCommentsByPostBackend(postId: string) {
  return requestJson<Array<{ commentId: string; postId?: string; userId?: string; userName?: string; userAvatar?: string; content: string; commentedAt?: string; parentCommentId?: string }>>(`/v1/comments/post/${postId}`);
}

export async function getCommentRepliesBackend(commentId: string) {
  return requestJson<Array<{ commentId: string; postId?: string; userId?: string; userName?: string; userAvatar?: string; content: string; commentedAt?: string; parentCommentId?: string }>>(`/v1/comments/${commentId}/replies`);
}

/**
 * Toggle like num post do fórum. Retorna { liked, likeCount }.
 */
export async function togglePostLikeBackend(postId: string): Promise<{ liked: boolean; likeCount: number }> {
  return requestJson<{ liked: boolean; likeCount: number }>(`/v1/posts/${postId}/like`, {
    method: 'POST',
  });
}

/**
 * Obtém a contagem de likes e estado do like do utilizador atual para um post.
 */
export async function getPostLikesBackend(postId: string): Promise<{ liked: boolean; likeCount: number }> {
  return requestJson<{ liked: boolean; likeCount: number }>(`/v1/posts/${postId}/likes`);
}


type CollectionItemType = 'HISTORY' | 'SAVED' | 'SUBSCRIPTION';

type UserCollectionItem = {
  collectionId?: string;
  userId: string;
  itemType: CollectionItemType;
  itemId: string;
  createdAt?: string;
  updatedAt?: string;
};

async function getCollection(userId: string, path: 'history' | 'saved' | 'subscriptions') {
  return requestJson<UserCollectionItem[]>(`/v1/users/${userId}/${path}`);
}

async function addCollectionItem(userId: string, path: 'history' | 'saved' | 'subscriptions', itemType: CollectionItemType, itemId: string) {
  return requestJson<UserCollectionItem>(`/v1/users/${userId}/${path}`, {
    method: 'POST',
    body: JSON.stringify({ userId, itemType, itemId }),
  });
}

async function removeCollectionItem(userId: string, path: 'history' | 'saved' | 'subscriptions', itemId: string) {
  return requestJson<void>(`/v1/users/${userId}/${path}/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });
}

export async function getUserCollectionsBackend(userId: string) {
  const [history, saved, subscriptions] = await Promise.allSettled([
    getCollection(userId, 'history'),
    getCollection(userId, 'saved'),
    getCollection(userId, 'subscriptions'),
  ]);

  return {
    history: history.status === 'fulfilled' ? history.value.map((item) => item.itemId) : [],
    saved: saved.status === 'fulfilled' ? saved.value.map((item) => item.itemId) : [],
    subscriptions: subscriptions.status === 'fulfilled' ? subscriptions.value.map((item) => item.itemId) : [],
  };
}

export async function addHistoryItemBackend(userId: string, contentId: string) {
  return addCollectionItem(userId, 'history', 'HISTORY', contentId);
}

export async function addSavedItemBackend(userId: string, contentId: string) {
  return addCollectionItem(userId, 'saved', 'SAVED', contentId);
}

export async function removeSavedItemBackend(userId: string, contentId: string) {
  return removeCollectionItem(userId, 'saved', contentId);
}

export async function addSubscriptionItemBackend(userId: string, authorId: string) {
  return addCollectionItem(userId, 'subscriptions', 'SUBSCRIPTION', authorId);
}

export async function removeSubscriptionItemBackend(userId: string, authorId: string) {
  return removeCollectionItem(userId, 'subscriptions', authorId);
}

/**
 * Altera a preferência de notificação de uma subscrição.
 * @param pref 'ALL' = receber todas as notificações | 'NONE' = sem notificações
 */
export async function updateSubscriptionNotificationPrefBackend(
  userId: string,
  authorId: string,
  pref: 'ALL' | 'NONE',
): Promise<{ notificationPref: string }> {
  return requestJson<{ notificationPref: string }>(
    `/v1/users/${userId}/subscriptions/${encodeURIComponent(authorId)}/notification-pref`,
    {
      method: 'PATCH',
      body: JSON.stringify({ notificationPref: pref }),
    },
  );
}


// ===== FILE UPLOAD FUNCTIONS =====

/**
 * Upload de ficheiro de vídeo
 */
export async function uploadVideoFile(file: File) {
  return uploadFile('/v1/files/upload/video', file);
}

export async function uploadAudioFile(file: File) {
  return uploadFile('/v1/files/upload/audio', file);
}

export async function uploadImageFile(file: File) {
  return uploadFile('/v1/files/upload/image', file);
}

export type { BackendUserRole };

/**
 * Download de ficheiro
 */
export async function downloadFile(subdirectory: string, filename: string) {
  const response = await fetch(`${API_BASE}/v1/files/download/${subdirectory}/${filename}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.blob();
}

/**
 * Obter informações de ficheiro
 */
export async function getFileInfo(subdirectory: string, filename: string) {
  return requestJson<{
    filename: string;
    size: number;
    lastModified: number;
    url: string;
    mediaType: string;
  }>(`/v1/files/info/${subdirectory}/${filename}`);
}

/**
 * Eliminar ficheiro
 */
export async function deleteFile(subdirectory: string, filename: string) {
  return requestJson<{ success: boolean; message: string }>(`/v1/files/delete/${subdirectory}/${filename}`, {
    method: 'DELETE',
  });
}

// ===== ESTATÍSTICAS DE CONTEÚDO E LIKES =====

export interface ContentStatsResponse {
  contentId: string;
  viewCount: number;
  shareCount: number;
  commentCount: number;
  likeCount: number;
  likedByCurrentUser: boolean | null;
  lastUpdated?: string;
}

/**
 * Obtém as estatísticas de um conteúdo, incluindo se o utilizador atual já deu like.
 */
export async function getContentStatsBackend(contentId: string): Promise<ContentStatsResponse> {
  return requestJson<ContentStatsResponse>(`/v1/content-items/${contentId}/stats`);
}

/**
 * Toggle like num conteúdo. Retorna { liked: true } se deu like, { liked: false } se removeu.
 */
export async function toggleContentLikeBackend(contentId: string): Promise<{ liked: boolean }> {
  return requestJson<{ liked: boolean }>(`/v1/content-items/${contentId}/like`, {
    method: 'POST',
  });
}

/**
 * Regista uma visualização de conteúdo.
 */
export async function registerContentViewBackend(contentId: string): Promise<void> {
  return requestJson(`/v1/content-items/${contentId}/view`, { method: 'POST' });
}

// ===== COMENTÁRIOS DE CONTEÚDOS DIDÁTICOS =====

export interface ContentCommentResponse {
  commentId: string;
  content: string;
  commentedAt?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  contentItemId?: string;
}

/**
 * Carrega todos os comentários de um conteúdo didático.
 */
export async function getCommentsByContentItemBackend(contentId: string): Promise<ContentCommentResponse[]> {
  return requestJson<ContentCommentResponse[]>(`/v1/comments/content/${contentId}`);
}

/**
 * Cria um comentário num conteúdo didático.
 * O userId pode ser omitido — o backend usa o utilizador autenticado via JWT.
 */
export async function createContentCommentBackend(payload: {
  contentItemId: string;
  content: string;
  userId?: string;
}): Promise<ContentCommentResponse> {
  return requestJson<ContentCommentResponse>('/v1/comments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
