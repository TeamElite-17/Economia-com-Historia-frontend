import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Star, CheckCircle, XCircle, FileText, Play, Headphones,
  Clock, Search, RefreshCw, ArrowLeft, Loader, Inbox,
  Flame, Globe, TrendingUp, AlertCircle, Eye
} from 'lucide-react';
import {
  getReadyToPublishBackend,
  approveContentBackend,
  rejectContentBackend,
  extractArray,
  mapContentItem,
  bootstrapWebData,
} from '../data/backendApi';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../data/mockData';
import { MediaPlayer } from '../components/ui/MediaPlayer';

interface ApprovalItem {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'podcast';
  category: string;
  authorId: string;
  authorName: string;
  thumbnail: string;
  isJindungo: boolean;
  publishedAt: string;
  views: number;
  likes: number;
  content: string;
}

function mapApproval(raw: Record<string, unknown>): ApprovalItem {
  const item = mapContentItem(raw);
  const author = MOCK_USERS.find(u => u.id === item.authorId);
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    category: item.category,
    authorId: item.authorId,
    authorName: author?.name ?? 'Autor desconhecido',
    thumbnail: item.thumbnail,
    isJindungo: item.isJindungo,
    publishedAt: item.publishedAt,
    views: item.views,
    likes: item.likes,
    content: item.content,
  };
}

const TYPE_ICON = { video: Play, article: FileText, podcast: Headphones };
const TYPE_LABEL = { video: 'Vídeo', article: 'Artigo', podcast: 'Podcast' };
const TYPE_COLOR = { video: '#7B1D2D', article: '#C9A84C', podcast: '#5C8A6E' };

export function AprovadorPage() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const [stats, setStats] = useState({ published: 0, rejected: 0 });

  const isAprovador = user?.role === 'APROVADOR' || user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const raw = await getReadyToPublishBackend();
      const arr = extractArray<Record<string, unknown>>(raw);
      setItems(arr.map(mapApproval));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  if (!isLoggedIn || !isAprovador) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F0EBE8' }}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FFF8E6' }}>
            <Star size={32} style={{ color: '#C9A84C' }} />
          </div>
          <h2 className="text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-gray-500 mb-6">Esta área é exclusiva para Aprovadores.</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#7B1D2D' }}>
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const handlePublish = async (item: ApprovalItem) => {
    setProcessing(item.id);
    try {
      await approveContentBackend(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      setStats(s => ({ ...s, published: s.published + 1 }));
      setSelected(null);
      showNotif('success', `"${item.title}" publicado com sucesso!`);
      // Sincroniza o array global para a homepage mostrar o novo conteúdo
      void bootstrapWebData().catch(() => undefined);
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao publicar conteúdo.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    setProcessing(item.id);
    try {
      await rejectContentBackend(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      setStats(s => ({ ...s, rejected: s.rejected + 1 }));
      setSelected(null);
      showNotif('success', `"${item.title}" devolvido para revisão.`);
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao rejeitar conteúdo.');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = items.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.authorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-md" style={{ backgroundColor: '#5C3A00', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C9A84C' }}>
            <Star size={14} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-tight">Painel do Aprovador</div>
            <div className="text-xs leading-tight" style={{ color: '#E8C97A' }}>Economia com História Angola</div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '')}&background=C9A84C&color=fff&size=56`} alt="" />
            </div>
            <span className="text-white/80 text-xs hidden sm:block">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ backgroundColor: notification.type === 'success' ? '#5C3A00' : '#7B1D2D', color: 'white' }}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {notification.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Aguardam Aprovação', value: items.length, color: '#C9A84C', icon: Clock },
            { label: 'Publicados hoje', value: stats.published, color: '#1A4A3A', icon: Globe },
            { label: 'Devolvidos', value: stats.rejected, color: '#7B1D2D', icon: XCircle },
            { label: 'Total processado', value: stats.published + stats.rejected, color: '#5C3A00', icon: TrendingUp },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}18` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* List */}
          <div className="lg:w-1/2 xl:w-2/5 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Pesquisar..."
                      className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-yellow-400"
                    />
                  </div>
                  <button onClick={load} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-50 max-h-[calc(100vh-320px)] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-400">
                    <Loader size={24} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">A carregar...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-10 text-center">
                    <Inbox size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Nenhum conteúdo aguarda aprovação</p>
                    <p className="text-xs text-gray-400 mt-1">Tudo publicado por agora!</p>
                  </div>
                ) : filtered.map(item => {
                  const Icon = TYPE_ICON[item.type];
                  const isActive = selected?.id === item.id;
                  return (
                    <button key={item.id} onClick={() => setSelected(item)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-3"
                      style={isActive ? { backgroundColor: '#FFF8E6' } : {}}>
                      <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                        {item.thumbnail
                          ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${TYPE_COLOR[item.type]}18` }}>
                              <Icon size={18} style={{ color: TYPE_COLOR[item.type] }} />
                            </div>
                        }
                        {item.isJindungo && (
                          <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C9A84C' }}>
                            <Flame size={9} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.authorName} · {TYPE_LABEL[item.type]}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#F0FDF4', color: '#166534' }}>
                            ✓ Revisto
                          </span>
                          {item.isJindungo && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FFF8E6', color: '#92400E' }}>
                              🔥 Jindungo
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="flex-1">
            {selected ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative h-44 bg-gray-100">
                  {selected.thumbnail
                    ? <img src={selected.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5C3A00, #C9A84C)' }}>
                        <Globe size={48} className="text-white/30" />
                      </div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#F0FDF4', color: '#166534' }}>
                    <CheckCircle size={11} />
                    Aprovado pelo Revisor
                  </div>
                  {selected.isJindungo && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#C9A84C', color: 'white' }}>
                      <Flame size={11} />
                      Jindungo
                    </div>
                  )}
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-1"
                      style={{ backgroundColor: `${TYPE_COLOR[selected.type]}CC`, color: 'white' }}>
                      {(() => { const Icon = TYPE_ICON[selected.type]; return <Icon size={10} />; })()}
                      {TYPE_LABEL[selected.type]}
                    </div>
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{selected.title}</h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selected.authorName)}&background=5C3A00&color=fff&size=56`}
                      alt="" className="w-9 h-9 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{selected.authorName}</div>
                      <div className="text-xs text-gray-400">{selected.category} · {selected.publishedAt?.slice(0, 10)}</div>
                    </div>
                    <div className="ml-auto flex gap-3 text-center">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{selected.views}</div>
                        <div className="text-xs text-gray-400">Views</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{selected.likes}</div>
                        <div className="text-xs text-gray-400">Gostos</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Descrição</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.description || 'Sem descrição.'}</p>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Conteúdo</h4>
                    <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                      {selected.type === 'article' ? (
                        <div className="p-4 prose prose-sm max-w-none text-gray-700 max-h-64 overflow-y-auto" dangerouslySetInnerHTML={{ __html: selected.content }} />
                      ) : (selected.type === 'video' || selected.type === 'podcast') && selected.content ? (
                        <div className="aspect-video bg-black">
                          <MediaPlayer
                            src={selected.content}
                            type={selected.type}
                            title={selected.title}
                            poster={selected.thumbnail}
                          />
                        </div>
                      ) : (
                        <div className="p-4 text-sm text-gray-400">Sem conteúdo.</div>
                      )}
                    </div>
                  </div>

                  {/* Final checklist */}
                  <div className="bg-amber-50 rounded-xl p-4 mb-5 border border-amber-100">
                    <div className="text-xs font-semibold text-amber-800 mb-2">⚠️ Decisão Final de Publicação</div>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Ao publicar, este conteúdo ficará imediatamente visível a todos os utilizadores da plataforma.
                      Certifique-se de que o conteúdo está adequado e não viola as normas editoriais.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(selected)}
                      disabled={processing === selected.id}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                      {processing === selected.id ? <Loader size={16} className="animate-spin" /> : <XCircle size={16} />}
                      Devolver ao Revisor
                    </button>
                    <button
                      onClick={() => handlePublish(selected)}
                      disabled={processing === selected.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #5C3A00, #C9A84C)', color: 'white' }}>
                      {processing === selected.id ? <Loader size={16} className="animate-spin" /> : <Globe size={16} />}
                      Publicar Agora
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm h-64 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center" style={{ backgroundColor: '#FFF8E6' }}>
                  <Star size={28} style={{ color: '#C9A84C' }} />
                </div>
                <p className="text-gray-700 font-semibold">Selecione um conteúdo</p>
                <p className="text-sm text-gray-400 mt-1">Clique num item à esquerda para decidir se publica ou devolve ao revisor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
