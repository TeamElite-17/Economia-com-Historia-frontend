import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  BookOpen, Loader, Check, AlertTriangle, ShieldAlert,
  Send, CheckCircle, XCircle, Play, Headphones, FileText,
  Bold, Italic, List, Link as LinkIcon, Quote, Heading1, Heading2, Heading3,
  Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FileUpload } from '../components/ui/FileUpload';
import {
  CATEGORIES, CONTENT_ITEMS, ContentItem, formatDate,
} from '../data/mockData';
import {
  approveContentBackend,
  createContentItemBackend,
  updateContentItemBackend,
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
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [form, setForm] = useState(INITIAL_FORM);
  const editorRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<ContentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [linkPrompt, setLinkPrompt] = useState<{ show: boolean; range: Range | null; text: string }>({ show: false, range: null, text: '' });
  const [linkUrl, setLinkUrl] = useState('https://');

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
    if (editId) {
      const itemToEdit = CONTENT_ITEMS.find((c) => c.id === editId);
      if (itemToEdit && itemToEdit.authorId === user?.id) {
        setForm({
          title: itemToEdit.title,
          description: itemToEdit.description,
          type: itemToEdit.type,
          category: itemToEdit.category,
          duration: itemToEdit.duration,
          tags: itemToEdit.tags.join(', '),
          content: itemToEdit.type === 'article' ? itemToEdit.content : '',
          fileUrl: itemToEdit.type !== 'article' ? itemToEdit.content : '',
          thumbnailUrl: itemToEdit.thumbnail,
        });
        setTimeout(() => {
          if (editorRef.current && itemToEdit.type === 'article') {
            editorRef.current.innerHTML = itemToEdit.content;
          }
        }, 50);
      }
    }
  }, [userRole, editId, user?.id]);

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

  const handleEditorInput = () => {
    if (editorRef.current) {
      setForm((f) => ({ ...f, content: editorRef.current!.innerHTML }));
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
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        mediaType,
        sourceUrl: form.type === 'article' ? form.content : (form.fileUrl?.replace(/^\/api/, '')),
        fileUrl: (form.fileUrl || undefined)?.replace(/^\/api/, ''),
        thumbnailUrl: (form.thumbnailUrl || undefined)?.replace(/^\/api/, ''),
        regionTag: form.category,
        durationSeconds: parseDurationToSeconds(form.duration),
        status,
        categories: tags.map((tag) => ({ name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') })),
      };

      let contentId = editId || '';
      if (editId) {
        await updateContentItemBackend(editId, payload);
        showNotif('success', 'Conteúdo atualizado com sucesso!');
      } else {
        const created = await createContentItemBackend(payload);
        contentId = String(created.contentId ?? created.id ?? '');
      }

      const contentIdStr = String(contentId || '');
      if (!editId && userRole === 'ESCRITOR' && contentIdStr) {
        // Escritor: cria como DRAFT e submete para revisão
        await submitContentForReviewBackend(contentIdStr);
        showNotif('success', 'Conteúdo enviado para revisão! Aguarda aprovação do revisor.');
      } else if (!editId && status === 'PUBLISHED') {
        // APROVADOR, ADMIN, SUPERADMIN: publicado directamente
        showNotif('success', 'Conteúdo publicado com sucesso!');
        CONTENT_ITEMS.unshift({
          ...form,
          id: contentIdStr || `c${Date.now()}`,
          authorId: user?.id || '',
          tags,
          views: 0,
          likes: 0,
          publishedAt: new Date().toISOString().split('T')[0],
          isJindungo: false,
          featured: false,
          thumbnail: form.thumbnailUrl || 'https://images.unsplash.com/photo-1602516807029-0d2b26a43766?w=800',
          status: 'published',
          content: form.type === 'article' ? form.content : form.fileUrl,
        });
      } else if (!editId) {
        // REVISOR: cria como UNDER_REVIEW (aguarda aprovador)
        showNotif('success', 'Conteúdo submetido para aprovação final!');
      } else if (editId) {
        // Update local state if editing
        const idx = CONTENT_ITEMS.findIndex(c => c.id === editId);
        if (idx >= 0) {
          CONTENT_ITEMS[idx] = {
            ...CONTENT_ITEMS[idx],
            ...form,
            tags,
            thumbnail: form.thumbnailUrl || CONTENT_ITEMS[idx].thumbnail,
            content: form.type === 'article' ? form.content : form.fileUrl,
          };
        }
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
          <h1 className="text-xl font-bold text-gray-900">{editId ? 'Editar conteúdo' : 'Publicar conteúdo'}</h1>
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
            <div className="border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: 'rgba(123,29,45,0.15)' }}>
              <div className="bg-gray-50 border-b p-2 flex items-center gap-1 flex-wrap" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
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
                className="editor-content w-full px-4 py-3 text-sm min-h-[250px] focus:outline-none focus:ring-inset focus:ring-2 bg-white"
                style={{ '--tw-ring-color': 'rgba(123,29,45,0.2)' } as React.CSSProperties}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Usa os botões acima para formatar o texto como num editor de texto normal.</p>
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
          {editId ? 'Guardar alterações'
            : userRole === 'ESCRITOR' ? 'Enviar para revisão'
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
