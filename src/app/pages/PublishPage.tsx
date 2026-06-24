import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  BookOpen, Loader, Check, AlertTriangle, ShieldAlert,
  Send, CheckCircle, XCircle, Play, Headphones, FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FileUpload } from '../components/ui/FileUpload';
import {
  CATEGORIES, CONTENT_ITEMS, ContentItem, formatDate,
} from '../data/mockData';
import {
  approveContentBackend,
  createContentItemBackend,
  extractArray,
  getPendingContentBackend,
  mapContentItem,
  parseDurationToSeconds,
  rejectContentBackend,
  submitContentForReviewBackend,
  uploadAudioFile,
  uploadImageFile,
  uploadVideoFile,
} from '../data/backendApi';
import { canApproveContent, ROLE_LABELS, type BackendUserRole } from '../data/roles';

const INITIAL_FORM = {
  title: '',
  description: '',
  type: 'article' as 'video' | 'article' | 'podcast',
  category: 'Finanças Pessoais',
  duration: '10 min',
  tags: '',
  content: '',
  fileUrl: '',
  thumbnailUrl: '',
};

export function PublishPage() {
  const { isLoggedIn, canPublish, userRole, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [pending, setPending] = useState<ContentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadPending = async () => {
    if (!canApproveContent(userRole)) return;
    try {
      const data = await getPendingContentBackend();
      setPending(extractArray<Record<string, unknown>>(data).map((item) => mapContentItem(item)));
    } catch {
      setPending([]);
    }
  };

  useEffect(() => {
    void loadPending();
  }, [userRole]);

  if (!isLoggedIn || !canPublish) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <ShieldAlert size={40} className="mx-auto mb-4" style={{ color: '#7B1D2D' }} />
          <h2 className="text-gray-900 mb-2">Área de publicação</h2>
          <p className="text-sm text-gray-500 mb-6">
            Apenas professores, revisores, aprovadores e administradores podem publicar conteúdo.
          </p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-full text-white text-sm" style={{ backgroundColor: '#7B1D2D' }}>
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (file: File, type: 'video' | 'audio' | 'image') => {
    setIsUploading(true);
    try {
      const response =
        type === 'video' ? await uploadVideoFile(file)
        : type === 'audio' ? await uploadAudioFile(file)
        : await uploadImageFile(file);

      if (type === 'image') {
        setForm((f) => ({ ...f, thumbnailUrl: response.url }));
      } else {
        setForm((f) => ({ ...f, fileUrl: response.url, content: response.url }));
      }
      showNotif('success', 'Ficheiro carregado com sucesso!');
    } catch (error) {
      showNotif('error', error instanceof Error ? error.message : 'Erro no upload');
    } finally {
      setIsUploading(false);
    }
  };

  const defaultStatus = (): string => {
    if (userRole === 'ESCRITOR') return 'DRAFT';        // submete para revisão depois
    if (userRole === 'REVISOR') return 'UNDER_REVIEW';  // aguarda aprovação final
    if (userRole === 'APROVADOR') return 'PUBLISHED';   // publica directamente
    if (userRole === 'ADMIN') return 'PUBLISHED';       // publica directamente
    if (userRole === 'SUPERADMIN') return 'PUBLISHED';  // publica directamente
    return 'PUBLISHED';
  };

  const handlePublish = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      showNotif('error', 'Título e descrição são obrigatórios.');
      return;
    }
    if ((form.type === 'video' || form.type === 'podcast') && !form.fileUrl) {
      showNotif('error', `Carregue o ficheiro de ${form.type === 'video' ? 'vídeo' : 'áudio'}.`);
      return;
    }

    setIsSaving(true);
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const mediaType = form.type === 'video' ? 'VIDEO' : form.type === 'podcast' ? 'AUDIO' : 'TEXT';
    const status = defaultStatus();

    try {
      const created = await createContentItemBackend({
        title: form.title.trim(),
        description: form.description.trim(),
        mediaType,
        sourceUrl: form.type === 'article' ? form.content : form.fileUrl,
        fileUrl: form.fileUrl || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        regionTag: form.category,
        durationSeconds: parseDurationToSeconds(form.duration),
        status,
        categories: tags.map((tag) => ({ name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') })),
      });

      const contentId = String(created.contentId ?? created.id ?? '');
      if (userRole === 'ESCRITOR' && contentId) {
        // Escritor: cria como DRAFT e submete para revisão
        await submitContentForReviewBackend(contentId);
        showNotif('success', 'Conteúdo enviado para revisão! Aguarda aprovação do revisor.');
      } else if (status === 'PUBLISHED') {
        // APROVADOR, ADMIN, SUPERADMIN: publicado directamente
        showNotif('success', 'Conteúdo publicado com sucesso!');
        CONTENT_ITEMS.unshift({
          ...form,
          id: contentId || `c${Date.now()}`,
          tags,
          views: 0,
          likes: 0,
          publishedAt: new Date().toISOString().split('T')[0],
          isJindungo: false,
          featured: false,
          thumbnail: form.thumbnailUrl || 'https://images.unsplash.com/photo-1602516807029-0d2b26a43766?w=800',
          status: 'published',
        });
      } else {
        // REVISOR: cria como UNDER_REVIEW (aguarda aprovador)
        showNotif('success', 'Conteúdo submetido para aprovação final!');
      }

      setForm(INITIAL_FORM);
      void loadPending();
    } catch (error) {
      showNotif('error', error instanceof Error ? error.message : 'Erro ao guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {notification && (
        <div
          className="fixed top-20 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm shadow-lg flex items-center gap-2"
          style={{ backgroundColor: notification.type === 'success' ? '#5C8A6E' : '#D64E12' }}
        >
          {notification.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {notification.msg}
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={20} style={{ color: '#7B1D2D' }} />
          <h1 className="text-xl font-bold text-gray-900">Publicar conteúdo</h1>
        </div>
        <p className="text-sm text-gray-500">
          {ROLE_LABELS[userRole as BackendUserRole]} · {user?.name}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
              className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
            >
              <option value="article">Artigo</option>
              <option value="video">Vídeo</option>
              <option value="podcast">Podcast</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
            >
              {CATEGORIES.slice(1).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Título *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border text-sm resize-none"
          />
        </div>

        {form.type !== 'article' && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              {form.type === 'video' ? 'Ficheiro de vídeo *' : 'Ficheiro de áudio *'}
            </label>
            <FileUpload
              fileType={form.type === 'video' ? 'video' : 'audio'}
              onFileSelected={handleFileUpload}
              isLoading={isUploading}
            />
            {form.fileUrl && (
              <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                <CheckCircle size={14} /> Ficheiro pronto
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Miniatura (opcional)</label>
          <FileUpload fileType="image" onFileSelected={handleFileUpload} isLoading={isUploading} maxSizeMB={10} />
        </div>

        {form.type === 'article' && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Texto do artigo</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 rounded-xl border text-sm resize-y"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Duração</label>
            <input
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              placeholder="ex: 15 min"
              className="w-full px-3 py-2 rounded-xl border text-sm"
            />
          </div>
          {/* Autor — é sempre o utilizador autenticado, não seleccionável */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Autor</label>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
              style={{ backgroundColor: '#F8F4F1', borderColor: '#E5DDD8' }}
            >
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '')}&background=7B1D2D&color=fff&size=32`}
                alt=""
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
              <span className="text-gray-700 font-medium truncate">{user?.name}</span>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>Você</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => void handlePublish()}
          disabled={isSaving || isUploading}
          className="w-full py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: '#7B1D2D' }}
        >
          {isSaving ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          {userRole === 'ESCRITOR' ? 'Enviar para revisão'
            : userRole === 'REVISOR' ? 'Submeter para aprovação'
            : 'Publicar conteúdo'}
        </button>
      </div>

      {canApproveContent(userRole) && (
        <PendingQueue
          pending={pending}
          onApprove={async (id) => {
            try {
              await approveContentBackend(id);
              showNotif('success', 'Conteúdo aprovado!');
              setPending((prev) => prev.filter((c) => c.id !== id));
            } catch {
              showNotif('error', 'Não foi possível aprovar.');
            }
          }}
          onReject={async (id) => {
            try {
              await rejectContentBackend(id);
              showNotif('success', 'Conteúdo rejeitado.');
              setPending((prev) => prev.filter((c) => c.id !== id));
            } catch {
              showNotif('error', 'Não foi possível rejeitar.');
            }
          }}
        />
      )}
    </div>
  );
}

function PendingQueue({
  pending,
  onApprove,
  onReject,
}: {
  pending: ContentItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={18} style={{ color: '#7B1D2D' }} />
        Pendentes de aprovação
      </h2>
      {pending.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum conteúdo em revisão.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.type === 'video' ? <Play size={12} /> : item.type === 'podcast' ? <Headphones size={12} /> : <FileText size={12} />}
                  <span className="text-sm font-medium text-gray-900 truncate">{item.title}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                <span className="text-xs text-gray-400">{formatDate(item.publishedAt)}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => onApprove(item.id)} className="p-2 rounded-lg bg-green-50 text-green-700" title="Aprovar">
                  <CheckCircle size={16} />
                </button>
                <button onClick={() => onReject(item.id)} className="p-2 rounded-lg bg-red-50 text-red-600" title="Rejeitar">
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
