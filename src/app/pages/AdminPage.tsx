import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, BookOpen, HelpCircle, Users, MessageSquare, Settings,
  Plus, Edit2, Trash2, TrendingUp, Activity, X,
  Play, FileText, Headphones, Pin, ShieldAlert, BarChart3, Check,
  AlertTriangle, ToggleLeft, ToggleRight, Save, Flame, Star,
  Lock, Globe, ChevronDown, ChevronUp, Search,
  LogOut, ExternalLink, Shield, Menu as MenuIcon, Loader, Eye, CheckCircle, XCircle,
  Bold, Italic, List, Link as LinkIcon, Quote, Heading1, Heading2, Heading3,
  Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import {
  CONTENT_ITEMS, QUIZZES, MOCK_USERS, FORUM_POSTS, AUTHORS,
  ContentItem, Quiz, ForumPost, User,
  formatViews, formatDate, CATEGORIES
} from '../data/mockData';
import {
  createAdminUserBackend,
  createContentItemBackend,
  updateContentItemBackend,
  deleteContentItemBackend,
  createQuestionBackend,
  createQuizBackend,
  deleteQuizBackend,
  loadAdminUsersFromBackend,
  loadQuizzesFromBackend,
  parseDurationToSeconds,
  updateUserRoleBackend,
  uploadVideoFile,
  uploadAudioFile,
  uploadImageFile,
  getPendingContentBackend,
  submitContentForReviewBackend,
  approveContentBackend,
  rejectContentBackend,
  readyForApprovalBackend,
  rejectAsReviewerBackend,
  getReadyToPublishBackend,
  getContentByStatusBackend,
  mapContentItem,
  extractArray,
} from '../data/backendApi';
import { useAuth } from '../context/AuthContext';
import { ASSIGNABLE_ROLES, PROMOTABLE_ROLES, ROLE_LABELS, type BackendUserRole } from '../data/roles';
import { HomePage } from './HomePage';
import { FileUpload } from '../components/ui/FileUpload';

const PROVINCES = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire',
];

const INITIAL_USER_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'ESTUDANTE' as BackendUserRole,
  province: 'Luanda',
  bio: '',
};

type AdminTab = 'dashboard' | 'content' | 'review' | 'quizzes' | 'users' | 'forum' | 'settings';

const INITIAL_CONTENT_FORM = {
  title: '',
  description: '',
  type: 'article' as 'video' | 'article' | 'podcast',
  category: 'Finanças Pessoais',
  authorId: '',
  thumbnail: '',
  duration: '5 min',
  tags: '',
  content: '',
  status: 'published' as 'published' | 'draft' | 'under_review',
  isJindungo: false,
  featured: false,
  fileUrl: '', // URL do ficheiro (vídeo/áudio) após upload
  thumbnailUrl: '', // URL da miniatura após upload
};

interface SystemSetting {
  id: string;
  title: string;
  desc: string;
  active: boolean;
}

export function AdminPage() {
  const { isAdmin, isSuperAdmin, isLoggedIn, user, logout } = useAuth();
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [contentItems, setContentItems] = useState([...CONTENT_ITEMS]);
  const [pendingContent, setPendingContent] = useState<ContentItem[]>([]);
  const [approvedContent, setApprovedContent] = useState<ContentItem[]>([]);
  const [quizzes, setQuizzes] = useState([...QUIZZES]);
  const [users, setUsers] = useState([...MOCK_USERS]);
  const [forumPosts, setForumPosts] = useState([...FORUM_POSTS]);
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentForm, setContentForm] = useState(INITIAL_CONTENT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passingScore: 60,
    category: 'Finanças Pessoais',
    difficulty: 'medio' as 'facil' | 'medio' | 'dificil',
    questions: [
      { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' },
    ] as Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>,
  });
  const [userSearch, setUserSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState(INITIAL_USER_FORM);
  const [showPreview, setShowPreview] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ file?: string; progress: number }>({ progress: 0 });

  // Editor state
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkPrompt, setLinkPrompt] = useState<{ show: boolean; range: Range | null; text: string }>({ show: false, range: null, text: '' });
  const [linkUrl, setLinkUrl] = useState('https://');

  const handleEditorInput = () => {
    if (editorRef.current) {
      setContentForm((f) => ({ ...f, content: editorRef.current!.innerHTML }));
    }
  };

  const execFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  const addLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setLinkPrompt({ show: true, range: null, text: '' });
      setLinkUrl('https://');
      return;
    }
    const range = selection.getRangeAt(0).cloneRange();
    const isCollapsed = selection.isCollapsed;
    const selectedText = range.toString();

    setLinkPrompt({ show: true, range, text: isCollapsed ? '' : selectedText });
    setLinkUrl('https://');
  };

  const confirmLink = () => {
    if (!linkUrl || linkUrl === 'https://') {
      setLinkPrompt({ show: false, range: null, text: '' });
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
    }

    const selection = window.getSelection();
    if (selection && linkPrompt.range) {
      selection.removeAllRanges();
      selection.addRange(linkPrompt.range);
    }

    const linkText = linkPrompt.text || linkUrl;
    const linkHTML = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #7B1D2D; text-decoration: underline;">${linkText}</a>`;
    
    document.execCommand('insertHTML', false, linkHTML);
    handleEditorInput();
    setLinkPrompt({ show: false, range: null, text: '' });
  };
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([
    { id: 'maintenance', title: 'Modo de manutenção', desc: 'Coloca a plataforma em manutenção temporária', active: false },
    { id: 'moderation', title: 'Moderação de comentários', desc: 'Requer aprovação manual para novos comentários', active: true },
    { id: 'registration', title: 'Registo aberto', desc: 'Permite novos registos na plataforma', active: true },
    { id: 'email_notif', title: 'Notificações por email', desc: 'Envia emails automáticos para utilizadores', active: false },
    { id: 'jindungo_gate', title: 'Bloqueio Jindungo activo', desc: 'Conteúdos Jindungo são bloqueados para não subscritores', active: true },
    { id: 'quiz_ranking', title: 'Ranking público', desc: 'Mostra a tabela de classificação publicamente', active: true },
  ]);

  const refreshContentItems = async () => {
    try {
      // Carrega todos os conteúdos de todos os estados do backend
      const results = await Promise.allSettled([
        getContentByStatusBackend('PUBLISHED'),
        getContentByStatusBackend('DRAFT'),
        getContentByStatusBackend('UNDER_REVIEW'),
        getContentByStatusBackend('REJECTED'),
      ]);
      const allRaw = results.flatMap(r =>
        r.status === 'fulfilled' ? extractArray<Record<string, unknown>>(r.value) : []
      );
      if (allRaw.length > 0) {
        const mapped = allRaw.map((item) => mapContentItem(item));
        // Actualiza o array global para consistência com o resto da app
        CONTENT_ITEMS.splice(0, CONTENT_ITEMS.length, ...mapped);
        setContentItems([...mapped]);
      }
    } catch (err) {
      console.error('Erro ao carregar conteúdos do backend:', err);
    }
  };

  const refreshPendingContent = async () => {
    try {
      const data: any = await getPendingContentBackend();
      const items = Array.isArray(data) ? data : data?.data || [];
      const mapped = items.map((item: any) => {
        const fallback = contentItems.find(c => c.id === item.contentId);
        const type = item.mediaType?.toLowerCase().includes('video') ? 'video' :
          (item.mediaType?.toLowerCase().includes('audio') || item.mediaType?.toLowerCase() === 'podcast') ? 'podcast' : 'article';
        // Artigos usam sourceUrl, vídeos/áudios usam fileUrl
        const contentUrl = type === 'article' ? (item.sourceUrl || item.fileUrl || fallback?.content || '') : (item.fileUrl || item.sourceUrl || fallback?.content || '');
        return {
          id: item.contentId || item.id,
          title: item.title || '',
          description: item.description || '',
          type,
          category: item.regionTag || fallback?.category || 'Geral',
          authorId: fallback?.authorId || AUTHORS[0]?.id || '',
          thumbnail: item.thumbnailUrl || fallback?.thumbnail || '',
          duration: fallback?.duration || '',
          views: fallback?.views || 0,
          likes: fallback?.likes || 0,
          publishedAt: item.publishedAt || new Date().toISOString().split('T')[0],
          tags: fallback?.tags || [],
          isJindungo: fallback?.isJindungo || false,
          featured: fallback?.featured || false,
          content: contentUrl,
          status: 'draft' as const,
        };
      });
      setPendingContent(mapped);
    } catch (err) {
      console.error('Erro ao carregar conteúdo pendente:', err);
      setPendingContent([]);
    }
  };

  const refreshApprovedContent = async () => {
    try {
      const data: any = await getReadyToPublishBackend();
      const items = Array.isArray(data) ? data : data?.data || [];
      const mapped = items.map((item: any) => {
        const fallback = contentItems.find(c => c.id === item.contentId);
        const type = item.mediaType?.toLowerCase().includes('video') ? 'video' :
          (item.mediaType?.toLowerCase().includes('audio') || item.mediaType?.toLowerCase() === 'podcast') ? 'podcast' : 'article';
        // Artigos usam sourceUrl, vídeos/áudios usam fileUrl
        const contentUrl = type === 'article' ? (item.sourceUrl || item.fileUrl || fallback?.content || '') : (item.fileUrl || item.sourceUrl || fallback?.content || '');
        return {
          id: item.contentId || item.id,
          title: item.title || '',
          description: item.description || '',
          type,
          category: item.regionTag || fallback?.category || 'Geral',
          authorId: fallback?.authorId || AUTHORS[0]?.id || '',
          thumbnail: item.thumbnailUrl || fallback?.thumbnail || '',
          duration: fallback?.duration || '',
          views: fallback?.views || 0,
          likes: fallback?.likes || 0,
          publishedAt: item.publishedAt || new Date().toISOString().split('T')[0],
          tags: fallback?.tags || [],
          isJindungo: fallback?.isJindungo || false,
          featured: fallback?.featured || false,
          content: contentUrl,
          status: 'draft' as const,
        };
      });
      setApprovedContent(mapped);
    } catch (err) {
      console.error('Erro ao carregar conteúdo aprovado:', err);
      setApprovedContent([]);
    }
  };

  const refreshQuizzes = async () => {
    try {
      const loaded = await loadQuizzesFromBackend();
      setQuizzes([...loaded]);
    } catch {
      setQuizzes([...QUIZZES]);
    }
  };

  const refreshUsers = async () => {
    try {
      const loaded = await loadAdminUsersFromBackend();
      setUsers([...loaded]);
    } catch {
      setUsers([...MOCK_USERS]);
    }
  };

  useEffect(() => {
    // Carrega imediatamente do backend para evitar race condition com bootstrapWebData
    void refreshContentItems();
    setQuizzes([...QUIZZES]);
    setUsers([...MOCK_USERS]);
    setForumPosts([...FORUM_POSTS]);
  }, []);

  useEffect(() => {
    if (activeTab === 'content') {
      void refreshContentItems();
    }
    if (activeTab === 'review') {
      void refreshPendingContent();
      void refreshApprovedContent();
    }
    if (activeTab === 'quizzes') {
      void refreshQuizzes();
    }
    if (activeTab === 'users') {
      void refreshUsers();
    }
  }, [activeTab]);

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4" style={{ backgroundColor: '#F8F4F1' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F5E8EB' }}>
            <ShieldAlert size={32} style={{ color: '#7B1D2D' }} />
          </div>
          <h2 className="text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-gray-500 mb-6">Esta área é exclusiva para Administradores.</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#7B1D2D' }}>
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePromoteUser = async (targetUser: User, newRole: BackendUserRole) => {
    if (!isSuperAdmin) {
      showNotif('error', 'Apenas o Super Admin pode alterar papéis.');
      return;
    }
    if (targetUser.id === user?.id) {
      showNotif('error', 'Não pode alterar o seu próprio papel.');
      return;
    }
    if (targetUser.role === 'SUPERADMIN') {
      showNotif('error', 'Não é possível alterar outro Super Admin.');
      return;
    }
    if (targetUser.role === newRole) return;

    setPromotingUserId(targetUser.id);
    try {
      await updateUserRoleBackend(targetUser.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u)));
      const mockIdx = MOCK_USERS.findIndex((u) => u.id === targetUser.id);
      if (mockIdx >= 0) MOCK_USERS[mockIdx] = { ...MOCK_USERS[mockIdx], role: newRole };
      showNotif('success', `${targetUser.name} passou a ${ROLE_LABELS[newRole]}.`);
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao alterar papel.');
    } finally {
      setPromotingUserId(null);
    }
  };

  // Content review workflow
  const handleSubmitForReview = async (contentId: string) => {
    try {
      await submitContentForReviewBackend(contentId);
      setPendingContent(prev => prev.filter(c => c.id !== contentId));
      showNotif('success', 'Conteúdo submetido para revisão com sucesso!');
      await refreshPendingContent();
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao submeter para revisão.');
    }
  };

  const handleApproveContent = async (contentId: string) => {
    try {
      await approveContentBackend(contentId);
      setPendingContent(prev => prev.filter(c => c.id !== contentId));
      setContentItems(prev => [
        ...prev.filter(c => c.id !== contentId),
        ...pendingContent.filter(c => c.id === contentId).map(c => ({ ...c, status: 'published' as const }))
      ]);
      showNotif('success', 'Conteúdo aprovado e publicado!');
      await refreshPendingContent();
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao aprovar conteúdo.');
    }
  };

  const handleRejectContent = async (contentId: string) => {
    try {
      await rejectContentBackend(contentId);
      setPendingContent(prev => prev.filter(c => c.id !== contentId));
      showNotif('success', 'Conteúdo rejeitado. O autor pode editar e resubmeter.');
      await refreshPendingContent();
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao rejeitar conteúdo.');
    }
  };

  // Revisor actions
  const handleReadyForApproval = async (contentId: string) => {
    try {
      await readyForApprovalBackend(contentId);
      setPendingContent(prev => prev.filter(c => c.id !== contentId));
      setApprovedContent(prev => [
        ...prev,
        ...pendingContent.filter(c => c.id === contentId)
      ]);
      showNotif('success', 'Conteúdo marcado como pronto para aprovação!');
      await refreshPendingContent();
      await refreshApprovedContent();
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao marcar como pronto.');
    }
  };

  const handleRejectAsReviewer = async (contentId: string) => {
    try {
      await rejectAsReviewerBackend(contentId);
      setPendingContent(prev => prev.filter(c => c.id !== contentId));
      showNotif('success', 'Conteúdo rejeitado. O autor pode editar e resubmeter.');
      await refreshPendingContent();
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao rejeitar conteúdo.');
    }
  };

  // Approver actions (publish approved content)
  const handlePublishApproved = async (contentId: string) => {
    try {
      await approveContentBackend(contentId);
      setApprovedContent(prev => prev.filter(c => c.id !== contentId));
      setContentItems(prev => [
        ...prev.filter(c => c.id !== contentId),
        ...approvedContent.filter(c => c.id === contentId).map(c => ({ ...c, status: 'published' as const }))
      ]);
      showNotif('success', 'Conteúdo publicado com sucesso!');
      await refreshApprovedContent();
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao publicar conteúdo.');
    }
  };

  // Content CRUD
  const handleSaveContent = async () => {
    if (!contentForm.title.trim() || !contentForm.description.trim()) {
      showNotif('error', 'Título e descrição são obrigatórios.');
      return;
    }

    if (isUploading) {
      showNotif('error', 'Aguarde o upload do ficheiro terminar.');
      return;
    }

    if ((contentForm.type === 'video' || contentForm.type === 'podcast') && !contentForm.fileUrl) {
      showNotif('error', `Por favor, carregue um ficheiro de ${contentForm.type === 'video' ? 'vídeo' : 'áudio'}.`);
      return;
    }

    const tags = contentForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    // Remove o prefixo /api que o resolveMediaUrl adiciona ao carregar URLs do backend
    const stripApi = (url?: string) => url ? url.replace(/^\/api/, '') : undefined;

    if (editingId) {
      try {
        await updateContentItemBackend(editingId, {
          title: contentForm.title,
          description: contentForm.description,
          mediaType: contentForm.type === 'video' ? 'VIDEO' : contentForm.type === 'article' ? 'TEXT' : 'PODCAST',
          // Artigos: corpo do texto vai em sourceUrl (coluna TEXT); Vídeo/áudio: URL do ficheiro
          sourceUrl: contentForm.type === 'article'
            ? (contentForm.content || undefined)
            : stripApi(contentForm.fileUrl),
          fileUrl: contentForm.type !== 'article' ? stripApi(contentForm.fileUrl) : undefined,
          regionTag: contentForm.category,
          durationSeconds: parseDurationToSeconds(contentForm.duration),
          thumbnailUrl: stripApi(contentForm.thumbnailUrl || contentForm.thumbnail),
          isJindungo: contentForm.isJindungo,
          categories: tags.map(tag => ({ name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') })),
          authorId: contentForm.authorId,
        });
      } catch (err) {
        console.error('Erro ao actualizar no backend:', err);
        showNotif('error', err instanceof Error ? err.message : 'Erro ao guardar alterações no servidor.');
        return;
      }
      const updatedItem = {
        title: contentForm.title,
        description: contentForm.description,
        type: contentForm.type,
        category: contentForm.category,
        duration: contentForm.duration,
        tags,
        isJindungo: contentForm.isJindungo,
        featured: contentForm.featured,
        status: contentForm.status,
        thumbnail: contentForm.thumbnailUrl || contentForm.thumbnail,
        content: contentForm.type === 'article' ? contentForm.content : contentForm.fileUrl,
      };
      // Actualiza o estado local React
      setContentItems(prev => prev.map(c => c.id === editingId ? { ...c, ...updatedItem } : c));
      // Actualiza o array global para não ser sobrescrito ao navegar entre tabs
      const globalIdx = CONTENT_ITEMS.findIndex(c => c.id === editingId);
      if (globalIdx >= 0) {
        CONTENT_ITEMS[globalIdx] = { ...CONTENT_ITEMS[globalIdx], ...updatedItem };
      }
      showNotif('success', 'Conteúdo actualizado com sucesso!');
      setShowContentModal(false);
      setEditingId(null);
      setContentForm({ ...INITIAL_CONTENT_FORM, authorId: AUTHORS[0]?.id || user?.id || '' });
      return;
    }


    const newItem: ContentItem = {
      ...contentForm,
      id: `c${Date.now()}`,
      tags,
      views: 0,
      likes: 0,
      publishedAt: new Date().toISOString().split('T')[0],
      isJindungo: contentForm.isJindungo,
      featured: contentForm.featured,
      thumbnail: contentForm.thumbnailUrl || contentForm.thumbnail || 'https://images.unsplash.com/photo-1602516807029-0d2b26a43766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      content: contentForm.fileUrl || contentForm.content,
    };

    try {
      const created = await createContentItemBackend({
        title: newItem.title,
        description: newItem.description,
        mediaType: newItem.type === 'video' ? 'VIDEO' : newItem.type === 'article' ? 'TEXT' : 'PODCAST',
        // Artigos: corpo do texto vai em sourceUrl (coluna TEXT); Vídeo/áudio: URL do ficheiro
        sourceUrl: newItem.type === 'article'
          ? (newItem.content || undefined)
          : (newItem.fileUrl || undefined),
        fileUrl: newItem.type !== 'article' ? (newItem.fileUrl || undefined) : undefined,
        regionTag: newItem.category,
        publishedAt: newItem.publishedAt,
        durationSeconds: parseDurationToSeconds(newItem.duration),
        thumbnailUrl: newItem.thumbnail,
        isJindungo: newItem.isJindungo,
        status: contentForm.status === 'published' ? 'PUBLISHED' : contentForm.status === 'under_review' ? 'UNDER_REVIEW' : 'DRAFT',
        categories: newItem.tags.map((tag) => ({ name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') })),
        authorId: contentForm.authorId,
      });
      newItem.id = String(created.contentId ?? created.id ?? newItem.id);

      if (contentForm.status === 'under_review') {
        setPendingContent(prev => [newItem, ...prev]);
        showNotif('success', 'Conteúdo submetido para revisão!');
      } else if (contentForm.status === 'draft') {
        setContentItems(prev => [newItem, ...prev]);
        showNotif('success', 'Conteúdo guardado como rascunho!');
      } else {
        setContentItems(prev => [newItem, ...prev]);
        showNotif('success', 'Conteúdo criado e publicado!');
      }

      CONTENT_ITEMS.unshift(newItem);
      setShowContentModal(false);
      setEditingId(null);
      setContentForm({ ...INITIAL_CONTENT_FORM, authorId: AUTHORS[0]?.id || user?.id || '' });
    } catch (err) {
      console.error('Erro do backend:', err);
      showNotif('error', err instanceof Error ? err.message : 'Falha ao guardar no servidor.');
    }
  };

  const handleEditContent = (c: ContentItem) => {
    // Strip o prefixo /api que resolveMediaUrl adiciona (não deve ser reenviado ao backend)
    const stripApi = (url?: string) => (url ?? '').replace(/^\/api/, '');
    // Remove o /api prefix do content que já foi processado por resolveMediaUrl
    const contentStripped = stripApi(c.content);
    setContentForm({
      title: c.title,
      description: c.description,
      type: c.type,
      category: c.category,
      authorId: c.authorId,
      thumbnail: stripApi(c.thumbnail),
      duration: c.duration,
      tags: c.tags.join(', '),
      content: c.type === 'article' ? contentStripped : '',
      status: c.status,
      isJindungo: c.isJindungo,
      featured: c.featured,
      fileUrl: c.type !== 'article' ? contentStripped : '',
      thumbnailUrl: stripApi(c.thumbnail),
    });
    setEditingId(c.id);
    setShowContentModal(true);
    setTimeout(() => {
      if (editorRef.current && c.type === 'article') {
        editorRef.current.innerHTML = contentStripped;
      }
    }, 50);
  };

  const handleDeleteContent = async (id: string) => {
    try {
      await deleteContentItemBackend(id);
    } catch (err) {
      console.error('Erro ao eliminar no backend:', err);
      showNotif('error', err instanceof Error ? err.message : 'Erro ao eliminar conteúdo.');
      setDeleteConfirm(null);
      return;
    }
    setContentItems(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
    showNotif('success', 'Conteúdo eliminado.');
  };

  const handleToggleContentStatus = (id: string) => {
    setContentItems(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'published' ? 'draft' : 'published' } : c
    ));
  };

  const handleToggleJindungo = (id: string) => {
    setContentItems(prev => prev.map(c => c.id === id ? { ...c, isJindungo: !c.isJindungo } : c));
    showNotif('success', 'Estado Jindungo alterado.');
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) {
      showNotif('error', 'Título do quiz é obrigatório.');
      return;
    }
    const validQuestions = quizForm.questions.filter(
      (q) => q.question.trim() && q.options.filter((o) => o.trim()).length >= 2,
    );
    if (validQuestions.length === 0) {
      showNotif('error', 'Adicione pelo menos uma pergunta com 2 opções.');
      return;
    }

    setIsSavingQuiz(true);
    try {
      const created = await createQuizBackend({
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        passingScore: quizForm.passingScore,
      });
      const quizId = String(created.quizId ?? created.id ?? '');

      for (const q of validQuestions) {
        const optionsWithIndex = q.options
          .map((text, idx) => ({ text: text.trim(), idx }))
          .filter((o) => o.text);
        await createQuestionBackend({
          quizId,
          text: q.question.trim(),
          answerOptions: optionsWithIndex.map(({ text, idx }) => ({
            text,
            correct: idx === q.correctIndex,
          })),
        });
      }

      await refreshQuizzes();
      setShowQuizModal(false);
      setQuizForm({
        title: '',
        description: '',
        passingScore: 60,
        category: 'Finanças Pessoais',
        difficulty: 'medio',
        questions: [{ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }],
      });
      showNotif('success', 'Quiz criado e publicado!');
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao criar quiz.');
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      await deleteQuizBackend(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      QUIZZES.splice(
        0,
        QUIZZES.length,
        ...QUIZZES.filter((q) => q.id !== id),
      );
      showNotif('success', 'Quiz eliminado.');
    } catch {
      showNotif('error', 'Não foi possível eliminar o quiz.');
    }
    setDeleteConfirm(null);
  };

  const handleTogglePin = (id: string) => {
    setForumPosts(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
  };

  const handleDeletePost = (id: string) => {
    setForumPosts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
    showNotif('success', 'Tópico eliminado.');
  };

  const handleToggleUserActive = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const handleToggleSetting = (id: string) => {
    setSystemSettings(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    showNotif('success', 'Definição actualizada.');
  };

  // File upload handlers
  const handleFileUpload = async (file: File, type: 'video' | 'audio' | 'image') => {
    setIsUploading(true);
    setUploadProgress({ file: file.name, progress: 0 });

    try {
      let response;
      const simulateProgress = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 30, 90),
        }));
      }, 200);

      if (type === 'video') {
        response = await uploadVideoFile(file);
      } else if (type === 'audio') {
        response = await uploadAudioFile(file);
      } else {
        response = await uploadImageFile(file);
      }

      clearInterval(simulateProgress);
      setUploadProgress({ file: file.name, progress: 100 });

      if (!response.success || !response.url) {
        throw new Error(response.message || 'Upload falhou');
      }
      if (type === 'video' || type === 'audio') {
        setContentForm(f => ({
          ...f,
          fileUrl: response.url,
        }));
      } else {
        setContentForm(f => ({
          ...f,
          thumbnailUrl: response.url,
          thumbnail: response.url,
        }));
      }
      showNotif('success', `${type === 'video' ? 'Vídeo' : type === 'audio' ? 'Áudio' : 'Imagem'} enviado com sucesso!`);
      setTimeout(() => setUploadProgress({ progress: 0 }), 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      showNotif('error', `Erro ao enviar ficheiro: ${errorMsg}`);
      setUploadProgress({ progress: 0 });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveUser = () => {
    if (!userForm.name.trim()) { showNotif('error', 'Nome é obrigatório.'); return; }
    if (!userForm.email.trim()) { showNotif('error', 'Email é obrigatório.'); return; }
    if (!userForm.password.trim() || userForm.password.length < 6) { showNotif('error', 'Senha deve ter pelo menos 6 caracteres.'); return; }
    const exists = users.find(u => u.email === userForm.email.trim());
    if (exists) { showNotif('error', 'Já existe um utilizador com esse email.'); return; }
    const newUser: User = {
      id: `u${Date.now()}`,
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      password: userForm.password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userForm.name.trim())}&background=7B1D2D&color=fff&size=200`,
      role: userForm.role,
      bio: userForm.bio,
      subscriptions: [],
      completedQuizzes: [],
      watchHistory: [],
      joinedAt: new Date().toISOString().split('T')[0],
      savedContent: [],
      province: userForm.province,
      isActive: true,
    };
    void createAdminUserBackend({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: userForm.role,
      preferredLanguage: 'pt',
    });
    MOCK_USERS.push(newUser);
    setUsers(prev => [newUser, ...prev]);
    setShowUserModal(false);
    setUserForm(INITIAL_USER_FORM);
    showNotif('success', `Utilizador criado com sucesso!`);
  };

  // Dashboard stats
  const stats = [
    { label: 'Conteúdos', value: contentItems.length, icon: BookOpen, color: '#7B1D2D', sub: `${contentItems.filter(c => c.status === 'published').length} publicados` },
    { label: 'Utilizadores', value: users.length, icon: Users, color: '#C9A84C', sub: `${users.filter(u => u.isActive).length} activos` },
    { label: 'Quizzes', value: quizzes.length, icon: HelpCircle, color: '#5C8A6E', sub: `${quizzes.reduce((a, q) => a + q.questions.length, 0)} perguntas` },
    { label: 'Tópicos Fórum', value: forumPosts.length, icon: MessageSquare, color: '#D64E12', sub: `${forumPosts.reduce((a, p) => a + p.replies.length, 0)} respostas` },
  ];

  const totalViews = contentItems.reduce((a, c) => a + c.views, 0);
  const totalLikes = contentItems.reduce((a, c) => a + c.likes, 0);

  const navItems: { id: AdminTab; icon: typeof LayoutDashboard; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'content', icon: BookOpen, label: 'Conteúdo' },
    { id: 'review', icon: Eye, label: 'Revisão Pendente' },
    { id: 'quizzes', icon: HelpCircle, label: 'Quizzes' },
    { id: 'users', icon: Users, label: 'Utilizadores' },
    { id: 'forum', icon: MessageSquare, label: 'Fórum' },
    { id: 'settings', icon: Settings, label: 'Definições' },
  ];

  const filteredContent = contentItems.filter(c =>
    !contentSearch || c.title.toLowerCase().includes(contentSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F0EBE8' }}>

      {/* ===== ADMIN TOP HEADER (full width, dedicated CMS bar) ===== */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-4 shadow-lg"
        style={{ backgroundColor: '#3D0B14', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileSidebarOpen(o => !o)}
          className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <MenuIcon size={20} />
        </button>

        {/* Logo + platform name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C9A84C' }}>
            <BookOpen size={14} className="text-white" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="text-white text-xs font-bold leading-tight">Economia com História Angola</div>
            <div className="text-xs leading-tight" style={{ color: '#C9A84C' }}>Painel de Administração Â· CMS</div>
          </div>
          <div className="sm:hidden min-w-0">
            <div className="text-white text-sm font-bold leading-tight">Admin CMS</div>
          </div>
          {/* Current section breadcrumb (large screens) */}
          <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-white/10">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {navItems.find(n => n.id === activeTab)?.label}
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Preview site */}
          <button
            onClick={() => setShowPreview(true)}
            className="hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.55)' }}
          >
            <ExternalLink size={11} />
            Pré-visualizar site
          </button>

          <div className="hidden md:block w-px h-5 mx-1" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />

          {/* User info */}
          <div className="hidden md:flex items-center gap-2">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-7 h-7 rounded-full object-cover border-2"
              style={{ borderColor: 'rgba(201,168,76,0.5)' }}
            />
            <div>
              <div className="text-xs font-semibold text-white leading-tight">{user?.name?.split(' ')[0]}</div>
              <div className="flex items-center gap-1" style={{ color: '#C9A84C' }}>
                <Shield size={9} />
                <span style={{ fontSize: '10px' }}>Administrador</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-white/10 ml-1"
            style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.55)' }}
            title="Terminar sessão"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* ===== BODY: Sidebar + Main Content ===== */}
      <div className="flex flex-1 pt-14">

        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Admin Sidebar */}
        <aside
          className={`fixed left-0 top-14 bottom-0 z-40 w-56 flex flex-col transition-transform duration-300
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          style={{ backgroundColor: '#5C1520', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Mobile: user info inside sidebar */}
          <div className="md:hidden p-4 border-b border-white/10 flex items-center gap-3">
            <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
              <div className="flex items-center gap-1 text-xs" style={{ color: '#C9A84C' }}>
                <Shield size={10} /> Administrador
              </div>
            </div>
          </div>

          {/* Section label */}
          <div className="px-4 pt-5 pb-2">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>
              Gestão
            </span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2 pb-2 overflow-y-auto">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              const isHovered = hoveredNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm text-left"
                  style={{
                    backgroundColor: isActive ? '#7B1D2D' : isHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: isActive ? 'white' : isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
                    transform: isHovered && !isActive ? 'translateX(3px)' : 'translateX(0px)',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <item.icon size={16} className="flex-shrink-0" style={{ transition: 'transform 0.18s ease', transform: isHovered && !isActive ? 'scale(1.15)' : 'scale(1)' }} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-white/10 space-y-1">
            <button
              onClick={() => setShowPreview(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/10 text-left"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <ExternalLink size={13} /> Pré-visualizar site
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-900/40 text-left"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <LogOut size={13} /> Terminar sessão
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0 md:ml-56 p-4 md:p-6 pb-6">
          {/* Notification toast */}
          {notification && (
            <div
              className="fixed top-16 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm shadow-lg flex items-center gap-2"
              style={{ backgroundColor: notification.type === 'success' ? '#5C8A6E' : '#D64E12' }}
            >
              {notification.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              {notification.msg}
            </div>
          )}

          {/* ===== DASHBOARD ===== */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-6">
                <h1 className="text-gray-900 text-xl font-bold">Dashboard</h1>
                <p className="text-sm text-gray-500">Visão geral da plataforma</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                {stats.map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                        <s.icon size={18} style={{ color: s.color }} />
                      </div>
                      <TrendingUp size={14} className="text-green-500" />
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-gray-900">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    <div className="text-xs mt-1" style={{ color: s.color }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={16} style={{ color: '#7B1D2D' }} />
                    <h3 className="font-semibold text-gray-900 text-sm">Estatísticas de Conteúdo</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total de visualizações</span>
                      <span className="font-bold text-sm text-gray-900">{formatViews(totalViews)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total de gostos</span>
                      <span className="font-bold text-sm text-gray-900">{formatViews(totalLikes)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conteúdos Jindungo</span>
                      <span className="font-bold text-sm text-gray-900">{contentItems.filter(c => c.isJindungo).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conteúdos publicados</span>
                      <span className="font-bold text-sm text-gray-900">{contentItems.filter(c => c.status === 'published').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rascunhos</span>
                      <span className="font-bold text-sm text-gray-900">{contentItems.filter(c => c.status === 'draft').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} style={{ color: '#7B1D2D' }} />
                    <h3 className="font-semibold text-gray-900 text-sm">Conteúdos por tipo</h3>
                  </div>
                  {[
                    { type: 'Vídeos', count: contentItems.filter(c => c.type === 'video').length, color: '#7B1D2D', icon: Play },
                    { type: 'Artigos', count: contentItems.filter(c => c.type === 'article').length, color: '#4A6FA5', icon: FileText },
                    { type: 'Podcasts', count: contentItems.filter(c => c.type === 'podcast').length, color: '#5C8A6E', icon: Headphones },
                  ].map(item => (
                    <div key={item.type} className="mb-3">
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="flex items-center gap-1.5 text-gray-600"><item.icon size={13} style={{ color: item.color }} />{item.type}</span>
                        <span className="font-semibold text-gray-900">{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(item.count / contentItems.length) * 100}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(123,29,45,0.08)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Flame size={14} style={{ color: '#D64E12' }} />
                      <span className="text-sm font-medium text-gray-700">Fórum</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{forumPosts.filter(p => p.isPrivate).length} privados</span>
                      <span>{forumPosts.filter(p => !p.isPrivate).length} abertos</span>
                      <span>{forumPosts.filter(p => p.isPinned).length} fixados</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent content */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 text-sm mb-4">Conteúdos mais vistos</h3>
                <div className="space-y-3">
                  {[...contentItems].sort((a, b) => b.views - a.views).slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center gap-3">
                      <img src={c.thumbnail} alt={c.title} className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{c.category}</span>
                          {c.isJindungo && <span className="flex items-center gap-0.5" style={{ color: '#D64E12' }}><Flame size={10} /> Jindungo</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-gray-900">{formatViews(c.views)}</div>
                        <div className="text-xs text-gray-400 hidden sm:block">visualizações</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== CONTENT MANAGEMENT ===== */}
          {activeTab === 'content' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-gray-900 text-xl md:text-2xl font-bold">Gestão de Conteúdo</h1>
                  <p className="text-sm text-gray-500">{contentItems.length} conteúdos</p>
                </div>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setContentForm({ ...INITIAL_CONTENT_FORM, authorId: AUTHORS[0]?.id || user?.id || '' });
                    setShowContentModal(true);
                    setTimeout(() => {
                      if (editorRef.current) {
                        editorRef.current.innerHTML = '';
                      }
                    }, 50);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-white font-medium w-full sm:w-auto justify-center"
                  style={{ backgroundColor: '#7B1D2D' }}
                >
                  <Plus size={16} /> Novo conteúdo
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={contentSearch}
                  onChange={e => setContentSearch(e.target.value)}
                  placeholder="Pesquisar conteúdos..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(123,29,45,0.15)' }}
                />
              </div>

              {/* Desktop table */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(123,29,45,0.1)' }}>
                        {['Título', 'Tipo', 'Categoria', 'Estado', 'Jindungo', 'Vistas', 'Data', 'Ações'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContent.map(c => (
                        <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: 'rgba(123,29,45,0.06)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img src={c.thumbnail} alt="" className="w-10 h-7 rounded object-cover flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">{c.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-xs capitalize">
                              {c.type === 'video' ? <Play size={11} style={{ color: '#7B1D2D' }} /> : c.type === 'article' ? <FileText size={11} style={{ color: '#4A6FA5' }} /> : <Headphones size={11} style={{ color: '#5C8A6E' }} />}
                              {c.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>{c.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleToggleContentStatus(c.id)} className="flex items-center gap-1 text-xs">
                              {c.status === 'published'
                                ? <><ToggleRight size={16} style={{ color: '#5C8A6E' }} /> <span style={{ color: '#5C8A6E' }}>Publicado</span></>
                                : <><ToggleLeft size={16} style={{ color: '#C9A84C' }} /> <span style={{ color: '#C9A84C' }}>Rascunho</span></>
                              }
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleToggleJindungo(c.id)} className="flex items-center gap-1 text-xs">
                              {c.isJindungo
                                ? <><Flame size={13} style={{ color: '#D64E12' }} /> <span style={{ color: '#D64E12' }}>Sim</span></>
                                : <span className="text-gray-400">Não</span>
                              }
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatViews(c.views)}</td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(c.publishedAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleEditContent(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                                <Edit2 size={14} />
                              </button>
                              {deleteConfirm === c.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDeleteContent(c.id)} className="p-1 rounded-lg text-xs text-white" style={{ backgroundColor: '#D64E12' }}>Sim</button>
                                  <button onClick={() => setDeleteConfirm(null)} className="p-1 rounded-lg text-xs bg-gray-200 text-gray-700">Não</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredContent.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum conteúdo encontrado</p>
                  </div>
                )}
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filteredContent.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex gap-3 mb-3">
                      <img src={c.thumbnail} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{c.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs capitalize">
                            {c.type === 'video' ? <Play size={11} style={{ color: '#7B1D2D' }} /> : c.type === 'article' ? <FileText size={11} style={{ color: '#4A6FA5' }} /> : <Headphones size={11} style={{ color: '#5C8A6E' }} />}
                            {c.type}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>{c.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <button onClick={() => handleToggleContentStatus(c.id)} className="flex items-center gap-1">
                        {c.status === 'published'
                          ? <><ToggleRight size={16} style={{ color: '#5C8A6E' }} /> <span style={{ color: '#5C8A6E' }}>Publicado</span></>
                          : <><ToggleLeft size={16} style={{ color: '#C9A84C' }} /> <span style={{ color: '#C9A84C' }}>Rascunho</span></>
                        }
                      </button>
                      <button onClick={() => handleToggleJindungo(c.id)} className="flex items-center gap-1">
                        {c.isJindungo
                          ? <><Flame size={13} style={{ color: '#D64E12' }} /> <span style={{ color: '#D64E12' }}>Jindungo</span></>
                          : <span className="text-gray-400">Sem Jindungo</span>
                        }
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{formatViews(c.views)} vistas</span>
                      <span>{formatDate(c.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditContent(c)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium">
                        <Edit2 size={13} /> Editar
                      </button>
                      {deleteConfirm === c.id ? (
                        <>
                          <button onClick={() => handleDeleteContent(c.id)} className="px-3 py-2 rounded-xl text-xs text-white font-medium" style={{ backgroundColor: '#D64E12' }}>Sim</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-3 py-2 rounded-xl text-xs bg-gray-200 text-gray-700 font-medium">Não</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(c.id)} className="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-medium">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredContent.length === 0 && (
                  <div className="text-center py-10 text-gray-400 bg-white rounded-2xl">
                    <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum conteúdo encontrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== REVIEW PENDING CONTENT ===== */}
          {activeTab === 'review' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-gray-900 text-xl md:text-2xl font-bold">Revisão Pendente</h1>
                  <p className="text-sm text-gray-500">{pendingContent.length} conteúdos aguardando revisão</p>
                </div>
              </div>

              {pendingContent.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                  <Eye size={40} className="mx-auto mb-3 opacity-20" />
                  <h3 className="text-gray-900 font-semibold mb-1">Nenhum conteúdo pendente</h3>
                  <p className="text-sm text-gray-500">Todos os conteúdos foram revisados!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingContent.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border-l-4" style={{ borderColor: '#C9A84C' }}>
                      <div className="flex gap-4 items-start">
                        <img src={c.thumbnail} alt="" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{c.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{c.description}</p>
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="flex items-center gap-1">
                              {c.type === 'video' ? <Play size={11} style={{ color: '#7B1D2D' }} /> :
                                c.type === 'article' ? <FileText size={11} style={{ color: '#4A6FA5' }} /> :
                                  <Headphones size={11} style={{ color: '#5C8A6E' }} />}
                              {c.type}
                            </span>
                            <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>{c.category}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {user?.role === 'ESCRITOR' && (
                            <button
                              onClick={() => handleSubmitForReview(c.id)}
                              className="px-3 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-1"
                              style={{ backgroundColor: '#5C8A6E' }}
                            >
                              <CheckCircle size={14} /> Submeter
                            </button>
                          )}
                          {user?.role === 'REVISOR' && (
                            <>
                              <button
                                onClick={() => handleReadyForApproval(c.id)}
                                className="px-3 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-1"
                                style={{ backgroundColor: '#5C8A6E' }}
                              >
                                <CheckCircle size={14} /> Pronto
                              </button>
                              <button
                                onClick={() => handleRejectAsReviewer(c.id)}
                                className="px-3 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-1"
                                style={{ backgroundColor: '#D64E12' }}
                              >
                                <XCircle size={14} /> Rejeitar
                              </button>
                            </>
                          )}
                          {(user?.role === 'APROVADOR' || user?.role === 'SUPERADMIN') && (
                            <>
                              <button
                                onClick={() => handleApproveContent(c.id)}
                                className="px-3 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-1"
                                style={{ backgroundColor: '#5C8A6E' }}
                              >
                                <CheckCircle size={14} /> Aprovar
                              </button>
                              <button
                                onClick={() => handleRejectContent(c.id)}
                                className="px-3 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-1"
                                style={{ backgroundColor: '#D64E12' }}
                              >
                                <XCircle size={14} /> Rejeitar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(user?.role === 'APROVADOR' || user?.role === 'SUPERADMIN') && (
                <>
                  <hr className="my-8 border-gray-200" />
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                      <div>
                        <h1 className="text-gray-900 text-xl md:text-2xl font-bold">Pronto para Publicar</h1>
                        <p className="text-sm text-gray-500">{approvedContent.length} conteúdos aprovados aguardando publicação</p>
                      </div>
                    </div>

                    {approvedContent.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
                        <h3 className="text-gray-900 font-semibold mb-1">Nenhum conteúdo pronto</h3>
                        <p className="text-sm text-gray-500">Todos os conteúdos foram publicados!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {approvedContent.map(c => (
                          <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border-l-4" style={{ borderColor: '#5C8A6E' }}>
                            <div className="flex gap-4 items-start">
                              <img src={c.thumbnail} alt="" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{c.title}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{c.description}</p>
                                <div className="flex items-center gap-2 flex-wrap text-xs">
                                  <span className="flex items-center gap-1">
                                    {c.type === 'video' ? <Play size={11} style={{ color: '#7B1D2D' }} /> :
                                      c.type === 'article' ? <FileText size={11} style={{ color: '#4A6FA5' }} /> :
                                        <Headphones size={11} style={{ color: '#5C8A6E' }} />}
                                    {c.type}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8F5E8', color: '#5C8A6E' }}>Aprovado</span>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handlePublishApproved(c.id)}
                                  className="px-3 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-1"
                                  style={{ backgroundColor: '#5C8A6E' }}
                                >
                                  <CheckCircle size={14} /> Publicar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== QUIZZES MANAGEMENT ===== */}
          {activeTab === 'quizzes' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-gray-900 text-xl md:text-2xl font-bold">Gestão de Quizzes</h1>
                  <p className="text-sm text-gray-500">{quizzes.length} quizzes · {quizzes.reduce((a, q) => a + q.questions.length, 0)} perguntas</p>
                </div>
                <button
                  onClick={() => setShowQuizModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-white font-medium"
                  style={{ backgroundColor: '#5C8A6E' }}
                >
                  <Plus size={16} /> Novo quiz
                </button>
              </div>
              <div className="space-y-3 md:space-y-4">
                {quizzes.map(q => (
                  <div key={q.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4">
                      <img src={q.thumbnail} alt={q.title} className="w-full sm:w-16 h-32 sm:h-12 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>{q.category}</span>
                          <span className="text-xs text-gray-400">{q.difficulty === 'facil' ? 'Fácil' : q.difficulty === 'medio' ? 'Médio' : 'Difícil'}</span>
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{q.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span>{q.questions.length} perguntas</span>
                          <span>{q.estimatedTime}</span>
                          <span>{formatViews(q.participants)} participantes</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setExpandedQuiz(expandedQuiz === q.id ? null : q.id)}
                          className="flex-1 sm:flex-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          {expandedQuiz === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {expandedQuiz === q.id ? 'Fechar' : 'Perguntas'}
                        </button>
                        {deleteConfirm === `quiz-${q.id}` ? (
                          <>
                            <button onClick={() => void handleDeleteQuiz(q.id)} className="px-2 py-2 rounded-xl text-xs text-white" style={{ backgroundColor: '#D64E12' }}>Sim</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-2 rounded-xl text-xs bg-gray-200">Não</button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(`quiz-${q.id}`)}
                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                            title="Eliminar quiz"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    {expandedQuiz === q.id && (
                      <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: 'rgba(123,29,45,0.08)' }}>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          {q.questions.length} Perguntas
                        </div>
                        {q.questions.map((question, idx) => (
                          <div key={question.id} className="p-3 rounded-xl" style={{ backgroundColor: '#F8F4F1' }}>
                            <div className="flex items-start gap-2 mb-2">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: '#7B1D2D' }}>
                                {idx + 1}
                              </span>
                              <p className="text-sm font-medium text-gray-900 flex-1">{question.question}</p>
                            </div>
                            <div className="ml-7 grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                              {question.options.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className="text-xs px-3 py-1.5 rounded-lg"
                                  style={optIdx === question.correctIndex
                                    ? { backgroundColor: '#EBF3EE', color: '#2E5C3E', fontWeight: '600' }
                                    : { backgroundColor: 'white', color: '#6B7280' }
                                  }
                                >
                                  {String.fromCharCode(65 + optIdx)}. {opt}
                                  {optIdx === question.correctIndex && ' âœ“'}
                                </div>
                              ))}
                            </div>
                            <p className="ml-7 text-xs text-gray-500 italic">{question.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== USERS MANAGEMENT ===== */}
          {activeTab === 'users' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-gray-900 text-xl md:text-2xl font-bold">Gestão de Utilizadores</h1>
                  <p className="text-sm text-gray-500">
                    {users.length} utilizadores registados
                    {isSuperAdmin && ' · Super Admin pode promover papéis'}
                  </p>
                </div>
                <button
                  onClick={() => { setUserForm(INITIAL_USER_FORM); setShowUserModal(true); }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm text-white font-medium w-full sm:w-auto"
                  style={{ backgroundColor: '#7B1D2D' }}
                >
                  <Plus size={16} /> Novo utilizador
                </button>
              </div>

              <div className="relative mb-4">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Pesquisar por nome ou email..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(123,29,45,0.15)' }}
                />
              </div>

              {/* Desktop table */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(123,29,45,0.1)' }}>
                        {['Utilizador', 'Email', 'Papel', 'Província', 'Actividade', 'Estado', 'Ações'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: 'rgba(123,29,45,0.06)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{u.email}</td>
                          <td className="px-4 py-3">
                            {/* Admin pode alterar roles, mas não pode atribuir ADMIN/SUPERADMIN */}
                            {isAdmin && u.role !== 'SUPERADMIN' && u.id !== user?.id ? (
                              <select
                                value={u.role}
                                disabled={promotingUserId === u.id}
                                onChange={(e) => void handlePromoteUser(u, e.target.value as BackendUserRole)}
                                className="px-2 py-1 rounded-lg border text-xs bg-white min-w-[140px] disabled:opacity-50"
                                style={{ borderColor: 'rgba(123,29,45,0.25)' }}
                                title="Promover ou alterar papel"
                              >
                                {PROMOTABLE_ROLES
                                  .filter(role => isSuperAdmin || (role !== 'ADMIN' && role !== 'SUPERADMIN'))
                                  .map((role) => (
                                    <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                                  ))}
                              </select>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                                {ROLE_LABELS[u.role as BackendUserRole] ?? u.role}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{u.province}</td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-500 space-y-0.5">
                              <div>{u.watchHistory.length} vídeos vistos</div>
                              <div>{u.completedQuizzes.length} quizzes· {u.subscriptions.length} subs.</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleToggleUserActive(u.id)} className="flex items-center gap-1 text-xs">
                              {u.isActive
                                ? <><ToggleRight size={16} style={{ color: '#5C8A6E' }} /> <span style={{ color: '#5C8A6E' }}>Activo</span></>
                                : <><ToggleLeft size={16} style={{ color: '#D64E12' }} /> <span style={{ color: '#D64E12' }}>Inactivo</span></>
                              }
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-400">
                              Desde {formatDate(u.joinedAt)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum utilizador encontrado</p>
                  </div>
                )}
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filteredUsers.map(u => (
                  <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{u.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                      {!isSuperAdmin || u.role === 'SUPERADMIN' || u.id === user?.id ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                          {ROLE_LABELS[u.role as BackendUserRole] ?? u.role}
                        </span>
                      ) : null}
                    </div>
                    {isAdmin && u.role !== 'SUPERADMIN' && u.id !== user?.id && (
                      <div className="mb-3">
                        <label className="text-xs text-gray-400 block mb-1">Papel</label>
                        <select
                          value={u.role}
                          disabled={promotingUserId === u.id}
                          onChange={(e) => void handlePromoteUser(u, e.target.value as BackendUserRole)}
                          className="w-full px-3 py-2 rounded-xl border text-sm bg-white disabled:opacity-50"
                        >
                          {PROMOTABLE_ROLES
                            .filter(role => isSuperAdmin || (role !== 'ADMIN' && role !== 'SUPERADMIN'))
                            .map((role) => (
                              <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                            ))}
                        </select>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div>
                        <span className="text-gray-400 block mb-0.5">Província</span>
                        <span className="text-gray-900 font-medium">{u.province}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Desde</span>
                        <span className="text-gray-900 font-medium">{formatDate(u.joinedAt)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {u.watchHistory.length} vídeos Â· {u.completedQuizzes.length} quizzes Â· {u.subscriptions.length} subscrições
                    </div>
                    <button onClick={() => handleToggleUserActive(u.id)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors" style={u.isActive ? { backgroundColor: '#EBF3EE', color: '#2E5C3E' } : { backgroundColor: '#FDEDEC', color: '#D64E12' }}>
                      {u.isActive
                        ? <><ToggleRight size={16} /> Activo</>
                        : <><ToggleLeft size={16} /> Inactivo</>
                      }
                    </button>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-10 text-gray-400 bg-white rounded-2xl">
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum utilizador encontrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== FORUM MANAGEMENT ===== */}
          {activeTab === 'forum' && (
            <div>
              <div className="mb-6">
                <h1 className="text-gray-900 text-xl md:text-2xl font-bold">Moderação do Fórum</h1>
                <p className="text-sm text-gray-500">{forumPosts.length} tópicos Â· {forumPosts.reduce((a, p) => a + p.replies.length, 0)} respostas</p>
              </div>

              {/* Forum stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total tópicos', value: forumPosts.length, color: '#7B1D2D' },
                  { label: 'Tópicos privados', value: forumPosts.filter(p => p.isPrivate).length, color: '#C9A84C' },
                  { label: 'Tópicos abertos', value: forumPosts.filter(p => !p.isPrivate).length, color: '#5C8A6E' },
                  { label: 'Fixados', value: forumPosts.filter(p => p.isPinned).length, color: '#D64E12' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
                    <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {forumPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {post.isPinned && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#F0E6C4', color: '#7A5C00' }}>
                              <Pin size={10} /> Fixado
                            </span>
                          )}
                          {post.isPrivate ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                              <Lock size={10} /> Privado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                              <Globe size={10} /> Aberto
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#EBF3EE', color: '#2E5C3E' }}>{post.category}</span>
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{post.content}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{post.likes} gostos</span>
                          <span>{formatViews(post.views)} vistas</span>
                          <span>{post.replies.length} respostas</span>
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto flex-shrink-0">
                        <button
                          onClick={() => handleTogglePin(post.id)}
                          className="flex-1 sm:flex-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                          style={post.isPinned ? { backgroundColor: '#F0E6C4', color: '#7A5C00' } : { backgroundColor: '#F5E8EB', color: '#7B1D2D' }}
                        >
                          <Pin size={12} /> {post.isPinned ? 'Desafixar' : 'Fixar'}
                        </button>
                        {deleteConfirm === `forum-${post.id}` ? (
                          <div className="flex-1 sm:flex-auto flex gap-1">
                            <button onClick={() => handleDeletePost(post.id)} className="flex-1 px-2 py-1 rounded-lg text-xs text-white" style={{ backgroundColor: '#D64E12' }}>Sim</button>
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-2 py-1 rounded-lg text-xs bg-gray-200 text-gray-700">Não</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(`forum-${post.id}`)}
                            className="flex-1 sm:flex-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={12} /> Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h1 className="text-gray-900 text-xl md:text-2xl font-bold">Definições do Sistema</h1>
                <p className="text-sm text-gray-500">Configurações globais da plataforma</p>
              </div>

              <div className="space-y-3 mb-8">
                {systemSettings.map(setting => (
                  <div key={setting.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-gray-900">{setting.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{setting.desc}</div>
                    </div>
                    <button
                      onClick={() => handleToggleSetting(setting.id)}
                      className="w-12 h-6 rounded-full relative cursor-pointer flex-shrink-0 transition-colors duration-200"
                      style={{ backgroundColor: setting.active ? '#7B1D2D' : '#E5E7EB' }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                        style={{ left: setting.active ? '26px' : '2px' }}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Platform info */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-sm text-gray-900 mb-4">Informação da Plataforma</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Nome da plataforma', value: 'Economia com História â€“ Angola' },
                    { label: 'Versão', value: '2.0.0' },
                    { label: 'Admin actual', value: user?.name || 'N/A' },
                    { label: 'Total de conteúdos', value: `${contentItems.length} conteúdos` },
                    { label: 'Total de utilizadores', value: `${users.length} utilizadores` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(123,29,45,0.08)' }}>
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>{/* end main content area */}
      </div>{/* end flex body (sidebar + main) */}

      {/* ===== PREVIEW OVERLAY ===== */}
      {showPreview && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-white">
          {/* Preview bar */}
          <div
            className="flex items-center justify-between px-3 sm:px-5 py-2.5 flex-shrink-0 shadow-lg"
            style={{ backgroundColor: '#3D0B14' }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C9A84C' }} />
              <span className="text-white text-xs font-medium tracking-wide hidden sm:inline">Pré-visualização do site</span>
              <span className="text-white text-xs font-medium sm:hidden">Pré-visualização</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full hidden sm:inline-block"
                style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
              >
                Modo leitura
              </span>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs px-2 sm:px-3 py-1.5 rounded-full border transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}
            >
              <X size={13} /> <span className="hidden sm:inline">Fechar pré-visualização</span><span className="sm:hidden">Fechar</span>
            </button>
          </div>
          {/* Scrollable site content */}
          <div className="flex-1 overflow-y-auto">
            <HomePage />
          </div>
        </div>
      )}

      {/* ===== USER CREATION MODAL ===== */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
              <div>
                <h2 className="font-bold text-gray-900 text-base sm:text-lg">Novo utilizador</h2>
                <p className="text-xs text-gray-400 mt-0.5">Criar conta manualmente</p>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Nome completo *</label>
                <input
                  value={userForm.name}
                  onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nome do utilizador"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.ao"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                />
              </div>
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Senha *</label>
                <input
                  type="text"
                  value={userForm.password}
                  onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                />
              </div>
              {/* Role & Province */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Papel</label>
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm(f => ({ ...f, role: e.target.value as BackendUserRole }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm bg-white focus:outline-none"
                    style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                  >
                    {ASSIGNABLE_ROLES.map((role) => (
                      <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Província</label>
                  <select
                    value={userForm.province}
                    onChange={e => setUserForm(f => ({ ...f, province: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm bg-white focus:outline-none"
                    style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                  >
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {/* Bio (optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Bio (opcional)</label>
                <textarea
                  value={userForm.bio}
                  onChange={e => setUserForm(f => ({ ...f, bio: e.target.value }))}
                  rows={2}
                  placeholder="Breve descrição do utilizador..."
                  className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none"
                  style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                />
              </div>
              {/* Info box */}
              <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: '#F5E8EB' }}>
                <span className="font-semibold" style={{ color: '#7B1D2D' }}>Nota: </span>
                <span className="text-gray-600">O utilizador será criado com a senha visível acima. Partilhe as credenciais de forma segura.</span>
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-3 rounded-2xl border text-sm font-medium text-gray-700 hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUser}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#7B1D2D' }}
                >
                  <Check size={16} /> Criar utilizador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== QUIZ MODAL ===== */}
      {showQuizModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowQuizModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
              <h2 className="font-bold text-gray-900">Novo quiz</h2>
              <button onClick={() => setShowQuizModal(false)} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Título *</label>
                <input
                  value={quizForm.title}
                  onChange={(e) => setQuizForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nota mínima (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={quizForm.passingScore}
                    onChange={(e) => setQuizForm((f) => ({ ...f, passingScore: Number(e.target.value) || 60 }))}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Dificuldade</label>
                  <select
                    value={quizForm.difficulty}
                    onChange={(e) => setQuizForm((f) => ({ ...f, difficulty: e.target.value as typeof f.difficulty }))}
                    className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
                  >
                    <option value="facil">Fácil</option>
                    <option value="medio">Médio</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 uppercase">Perguntas</span>
                  <button
                    type="button"
                    onClick={() => setQuizForm((f) => ({
                      ...f,
                      questions: [...f.questions, { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }],
                    }))}
                    className="text-xs px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: '#7B1D2D' }}
                  >
                    + Pergunta
                  </button>
                </div>
                {quizForm.questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-xl border" style={{ borderColor: 'rgba(123,29,45,0.12)' }}>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold" style={{ color: '#7B1D2D' }}>Pergunta {qIdx + 1}</span>
                      {quizForm.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuizForm((f) => ({
                            ...f,
                            questions: f.questions.filter((_, i) => i !== qIdx),
                          }))}
                          className="text-xs text-red-500"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                    <input
                      value={q.question}
                      onChange={(e) => setQuizForm((f) => {
                        const questions = [...f.questions];
                        questions[qIdx] = { ...questions[qIdx], question: e.target.value };
                        return { ...f, questions };
                      })}
                      placeholder="Texto da pergunta"
                      className="w-full px-3 py-2 rounded-xl border text-sm mb-3"
                    />
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctIndex === optIdx}
                          onChange={() => setQuizForm((f) => {
                            const questions = [...f.questions];
                            questions[qIdx] = { ...questions[qIdx], correctIndex: optIdx };
                            return { ...f, questions };
                          })}
                        />
                        <input
                          value={opt}
                          onChange={(e) => setQuizForm((f) => {
                            const questions = [...f.questions];
                            const options = [...questions[qIdx].options];
                            options[optIdx] = e.target.value;
                            questions[qIdx] = { ...questions[qIdx], options };
                            return { ...f, questions };
                          })}
                          placeholder={`Opção ${String.fromCharCode(65 + optIdx)}`}
                          className="flex-1 px-3 py-1.5 rounded-lg border text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowQuizModal(false)} className="flex-1 py-3 rounded-2xl border text-sm font-medium text-gray-700">
                  Cancelar
                </button>
                <button
                  onClick={() => void handleSaveQuiz()}
                  disabled={isSavingQuiz}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#5C8A6E' }}
                >
                  {isSavingQuiz ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                  Criar quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTENT MODAL ===== */}
      {showContentModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowContentModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
              <h2 className="font-bold text-gray-900 text-base sm:text-lg">{editingId ? 'Editar conteúdo' : 'Novo conteúdo'}</h2>
              <button onClick={() => setShowContentModal(false)} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {/* Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Tipo</label>
                  <select value={contentForm.type} onChange={e => setContentForm(f => ({ ...f, type: e.target.value as any }))} className="w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none" style={{ borderColor: 'rgba(123,29,45,0.2)' }}>
                    <option value="article">Artigo</option>
                    <option value="video">Vídeo</option>
                    <option value="podcast">Podcast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Estado</label>
                  <select value={contentForm.status} onChange={e => setContentForm(f => ({ ...f, status: e.target.value as any }))} className="w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none" style={{ borderColor: 'rgba(123,29,45,0.2)' }}>
                    <option value="draft">Rascunho</option>
                    <option value="under_review">Submeter para Revisão</option>
                    <option value="published">Publicar Diretamente (Admin)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Título *</label>
                <input value={contentForm.title} onChange={e => setContentForm(f => ({ ...f, title: e.target.value }))} placeholder="Título do conteúdo" className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(123,29,45,0.2)' }} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Descrição *</label>
                <textarea value={contentForm.description} onChange={e => setContentForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Breve descrição..." className="w-full px-3 py-2 rounded-xl border text-sm resize-none focus:outline-none" style={{ borderColor: 'rgba(123,29,45,0.2)' }} />
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Categoria</label>
                  <select value={contentForm.category} onChange={e => setContentForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none" style={{ borderColor: 'rgba(123,29,45,0.2)' }}>
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Duração</label>
                  <input value={contentForm.duration} onChange={e => setContentForm(f => ({ ...f, duration: e.target.value }))} placeholder="ex: 15 min ou 24:30" className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(123,29,45,0.2)' }} />
                </div>
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Autor</label>
                <select value={contentForm.authorId} onChange={e => setContentForm(f => ({ ...f, authorId: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none" style={{ borderColor: 'rgba(123,29,45,0.2)' }}>
                  {AUTHORS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">URL da Miniatura</label>
                <input value={contentForm.thumbnail} onChange={e => setContentForm(f => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(123,29,45,0.2)' }} />
              </div>

              {/* File upload section for video/audio/image */}
              {contentForm.type !== 'article' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    {contentForm.type === 'video' ? 'URL do Vídeo' : 'URL do Áudio/Podcast'}
                    <span className="text-gray-400 font-normal ml-1 normal-case">(cole uma URL ou faça upload abaixo)</span>
                  </label>
                  <input
                    type="url"
                    value={contentForm.fileUrl}
                    onChange={e => setContentForm(f => ({ ...f, fileUrl: e.target.value }))}
                    placeholder={contentForm.type === 'video' ? 'https://exemplo.com/video.mp4' : 'https://exemplo.com/audio.mp3'}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none mb-3"
                    style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                  />
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    {contentForm.type === 'video' ? 'Ou Upload de Vídeo' : 'Ou Upload de Áudio/Podcast'}
                  </label>
                  <FileUpload
                    fileType={contentForm.type === 'video' ? 'video' : 'audio'}
                    onFileSelected={handleFileUpload}
                    maxSizeMB={500}
                    isLoading={isUploading}
                  />
                  {uploadProgress.progress > 0 && uploadProgress.progress < 100 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Loader size={16} className="text-blue-500 animate-spin" />
                        <span className="text-sm font-medium text-blue-700">
                          Enviando {uploadProgress.file}...
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-blue-600 mt-1">{Math.round(uploadProgress.progress)}%</p>
                    </div>
                  )}
                  {uploadProgress.progress === 100 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-700">
                        ✓ Ficheiro enviado com sucesso!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Image upload for thumbnail */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Upload de Miniatura (Opcional)</label>
                <FileUpload
                  fileType="image"
                  onFileSelected={handleFileUpload}
                  maxSizeMB={10}
                  isLoading={isUploading}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Tags (separadas por vírgula)</label>
                <input value={contentForm.tags} onChange={e => setContentForm(f => ({ ...f, tags: e.target.value }))} placeholder="inflação, kwanza, angola..." className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(123,29,45,0.2)' }} />
              </div>

              {/* Jindungo & Featured toggles */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setContentForm(f => ({ ...f, isJindungo: !f.isJindungo }))}
                  className="flex items-center justify-between p-3 rounded-xl border-2 transition-all"
                  style={contentForm.isJindungo
                    ? { borderColor: '#D64E12', backgroundColor: '#FEF0E6' }
                    : { borderColor: '#E5E7EB', backgroundColor: 'white' }
                  }
                >
                  <div className="flex items-center gap-2">
                    <Flame size={16} style={{ color: contentForm.isJindungo ? '#D64E12' : '#9CA3AF' }} />
                    <span className="text-sm font-medium" style={{ color: contentForm.isJindungo ? '#D64E12' : '#6B7280' }}>Jindungo</span>
                  </div>
                  <div
                    className="w-9 h-5 rounded-full relative transition-colors"
                    style={{ backgroundColor: contentForm.isJindungo ? '#D64E12' : '#D1D5DB' }}
                  >
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: contentForm.isJindungo ? '18px' : '2px' }} />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setContentForm(f => ({ ...f, featured: !f.featured }))}
                  className="flex items-center justify-between p-3 rounded-xl border-2 transition-all"
                  style={contentForm.featured
                    ? { borderColor: '#C9A84C', backgroundColor: '#F8F2DE' }
                    : { borderColor: '#E5E7EB', backgroundColor: 'white' }
                  }
                >
                  <div className="flex items-center gap-2">
                    <Star size={16} style={{ color: contentForm.featured ? '#C9A84C' : '#9CA3AF' }} />
                    <span className="text-sm font-medium" style={{ color: contentForm.featured ? '#C9A84C' : '#6B7280' }}>Destaque</span>
                  </div>
                  <div
                    className="w-9 h-5 rounded-full relative transition-colors"
                    style={{ backgroundColor: contentForm.featured ? '#C9A84C' : '#D1D5DB' }}
                  >
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: contentForm.featured ? '18px' : '2px' }} />
                  </div>
                </button>
              </div>

              {/* Content body */}
              {contentForm.type === 'article' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Conteúdo (texto do artigo)</label>
                  <div className="border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-inset focus-within:border-transparent transition-all" style={{ borderColor: 'rgba(123,29,45,0.2)', '--tw-ring-color': 'rgba(123,29,45,0.2)' } as React.CSSProperties}>
                    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('bold')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Negrito"><Bold size={15} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('italic')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Itálico"><Italic size={15} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('underline')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Sublinhado"><Underline size={15} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('strikeThrough')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Rasurado"><Strikethrough size={15} /></button>
                      
                      <div className="w-px h-5 bg-gray-300 mx-1" />
                      
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('justifyLeft')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Alinhar à Esquerda"><AlignLeft size={15} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('justifyCenter')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Centrar"><AlignCenter size={15} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('justifyRight')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Alinhar à Direita"><AlignRight size={15} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('justifyFull')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Justificar"><AlignJustify size={15} /></button>
                      
                      <div className="w-px h-5 bg-gray-300 mx-1" />
                      
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('formatBlock', 'H1')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Título 1"><Heading1 size={15} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('formatBlock', 'H2')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Título 2"><Heading2 size={15} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('formatBlock', 'H3')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Título 3"><Heading3 size={15} /></button>
                      
                      <div className="w-px h-5 bg-gray-300 mx-1" />

                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Lista com marcas"><List size={15} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('insertOrderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors flex gap-0.5 items-center" title="Lista numerada"><span className="text-[10px] font-bold">1.</span><List size={15} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('formatBlock', 'BLOCKQUOTE')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Citação"><Quote size={15} /></button>
                      
                      <div className="w-px h-5 bg-gray-300 mx-1" />
                      
                      <div className="relative">
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addLink} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Link"><LinkIcon size={15} /></button>
                        {linkPrompt.show && (
                          <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-xl shadow-xl border z-50 flex items-center gap-2" style={{ borderColor: 'rgba(123,29,45,0.1)', width: '280px' }}>
                            <input
                              type="text"
                              autoFocus
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') confirmLink(); if (e.key === 'Escape') setLinkPrompt({ show: false, range: null, text: '' }); }}
                              className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-red-800"
                            />
                            <button type="button" onClick={confirmLink} className="p-1.5 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors">
                              <Check size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execFormat('formatBlock', 'DIV')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors text-xs font-medium ml-auto" title="Remover formatação de bloco">Texto Normal</button>
                    </div>
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorInput}
                      onBlur={handleEditorInput}
                      onFocus={() => document.execCommand('defaultParagraphSeparator', false, 'p')}
                      className="editor-content w-full px-4 py-3 text-sm min-h-[250px] focus:outline-none bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowContentModal(false)} className="flex-1 py-3 rounded-2xl border text-sm font-medium text-gray-700 hover:bg-gray-50" style={{ borderColor: '#E5E7EB' }}>
                  Cancelar
                </button>
                <button onClick={() => void handleSaveContent()} disabled={isUploading} className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: '#7B1D2D' }}>
                  <Save size={16} /> {editingId ? 'Actualizar' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
