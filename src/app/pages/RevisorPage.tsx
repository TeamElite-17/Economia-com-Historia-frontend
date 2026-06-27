import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ShieldCheck, Eye, CheckCircle, XCircle, FileText, Play, Headphones,
  Clock, Search, RefreshCw, ChevronRight, AlertTriangle, BookOpen,
  Flame, ArrowLeft, Loader, Filter, BarChart3, Inbox
} from 'lucide-react';
import {
  getPendingContentBackend,
  readyForApprovalBackend,
  rejectAsReviewerBackend,
  extractArray,
  mapContentItem,
} from '../data/backendApi';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../data/mockData';
import { MediaPlayer } from '../components/ui/MediaPlayer';

interface PendingItem {
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
  content: string;
}

function mapPending(raw: Record<string, unknown>): PendingItem {
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
    content: item.content,
  };
}

const TYPE_ICON = { video: Play, article: FileText, podcast: Headphones };
const TYPE_LABEL = { video: 'Vídeo', article: 'Artigo', podcast: 'Podcast' };
const TYPE_COLOR = { video: '#7B1D2D', article: '#C9A84C', podcast: '#5C8A6E' };

export function RevisorPage() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'video' | 'article' | 'podcast'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [selected, setSelected] = useState<PendingItem | null>(null);
  const [stats, setStats] = useState({ reviewed: 0, approved: 0, rejected: 0 });

  const isRevisor = user?.role === 'REVISOR' || user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const raw = await getPendingContentBackend();
      const arr = extractArray<Record<string, unknown>>(raw);
      setItems(arr.map(mapPending));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  if (!isLoggedIn || !isRevisor) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F0EBE8' }}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F5E8EB' }}>
            <ShieldCheck size={32} style={{ color: '#7B1D2D' }} />
          </div>
          <h2 className="text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-gray-500 mb-6">Esta área é exclusiva para Revisores.</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#7B1D2D' }}>
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = async (item: PendingItem) => {
    setProcessing(item.id);
    try {
      await readyForApprovalBackend(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      setStats(s => ({ ...s, reviewed: s.reviewed + 1, approved: s.approved + 1 }));
      setSelected(null);
      showNotif('success', `"${item.title}" aprovado e enviado para o Aprovador!`);
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao aprovar conteúdo.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (item: PendingItem) => {
    setProcessing(item.id);
    try {
      await rejectAsReviewerBackend(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      setStats(s => ({ ...s, reviewed: s.reviewed + 1, rejected: s.rejected + 1 }));
      setSelected(null);
      showNotif('success', `"${item.title}" rejeitado. O autor será notificado.`);
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao rejeitar conteúdo.');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = items.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.authorName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || i.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0EBE8' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-md" style={{ backgroundColor: '#1A4A3A', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#5C8A6E' }}>
            <ShieldCheck size={14} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-tight">Painel do Revisor</div>
            <div className="text-xs leading-tight" style={{ color: '#8EC9A8' }}>Economia com História Angola</div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '')}&background=5C8A6E&color=fff&size=56`} alt="" />
            </div>
            <span className="text-white/80 text-xs hidden sm:block">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in"
          style={{ backgroundColor: notification.type === 'success' ? '#1A4A3A' : '#7B1D2D', color: 'white' }}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {notification.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pendentes', value: items.length, color: '#C9A84C', icon: Clock },
            { label: 'Revistos hoje', value: stats.reviewed, color: '#5C8A6E', icon: Eye },
            { label: 'Aprovados', value: stats.approved, color: '#1A4A3A', icon: CheckCircle },
            { label: 'Rejeitados', value: stats.rejected, color: '#7B1D2D', icon: XCircle },
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
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Pesquisar conteúdo..."
                      className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-400"
                    />
                  </div>
                  <button onClick={load} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors" title="Actualizar">
                    <RefreshCw size={16} />
                  </button>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(['all', 'article', 'video', 'podcast'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                      style={filter === f
                        ? { backgroundColor: '#1A4A3A', color: 'white' }
                        : { backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                      {f === 'all' ? 'Todos' : TYPE_LABEL[f]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50 max-h-[calc(100vh-320px)] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-400">
                    <Loader size={24} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">A carregar...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-10 text-center">
                    <Inbox size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Nenhum conteúdo pendente</p>
                    <p className="text-xs text-gray-400 mt-1">Todos os conteúdos foram revistos!</p>
                  </div>
                ) : filtered.map(item => {
                  const Icon = TYPE_ICON[item.type];
                  const isActive = selected?.id === item.id;
                  return (
                    <button key={item.id} onClick={() => setSelected(item)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-3"
                      style={isActive ? { backgroundColor: '#F0F7F4' } : {}}>
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
                        <div className="text-xs text-gray-400 mt-0.5">{item.category}</div>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-green-600 flex-shrink-0 mt-1" />}
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
                {/* Content preview header */}
                <div className="relative h-40 bg-gray-100">
                  {selected.thumbnail
                    ? <img src={selected.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1A4A3A, #5C8A6E)' }}>
                        <BookOpen size={48} className="text-white/30" />
                      </div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {selected.isJindungo && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#C9A84C', color: 'white' }}>
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
                    <h3 className="text-white font-bold text-base leading-tight line-clamp-2">{selected.title}</h3>
                  </div>
                </div>

                <div className="p-5">
                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selected.authorName)}&background=1A4A3A&color=fff&size=56`}
                      alt="" className="w-9 h-9 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{selected.authorName}</div>
                      <div className="text-xs text-gray-400">{selected.category} · {selected.publishedAt?.slice(0, 10)}</div>
                    </div>
                  </div>

                  {/* Description */}
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

                  {/* Checklist */}
                  <div className="bg-amber-50 rounded-xl p-4 mb-5 border border-amber-100">
                    <div className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      Critérios de Revisão
                    </div>
                    {['Título claro e informativo', 'Descrição adequada e sem erros', 'Tipo de conteúdo correcto', 'Conteúdo relevante e educativo', 'Informação factualmente correcta'].map(c => (
                      <div key={c} className="flex items-center gap-2 text-xs text-amber-800 py-0.5">
                        <div className="w-3.5 h-3.5 rounded border border-amber-300 flex-shrink-0" />
                        {c}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(selected)}
                      disabled={processing === selected.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                      {processing === selected.id ? <Loader size={16} className="animate-spin" /> : <XCircle size={16} />}
                      Rejeitar
                    </button>
                    <button
                      onClick={() => handleApprove(selected)}
                      disabled={processing === selected.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#1A4A3A', color: 'white' }}>
                      {processing === selected.id ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      Aprovar para Aprovador
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm h-64 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center" style={{ backgroundColor: '#F0F7F4' }}>
                  <Eye size={28} style={{ color: '#1A4A3A' }} />
                </div>
                <p className="text-gray-700 font-semibold">Selecione um conteúdo</p>
                <p className="text-sm text-gray-400 mt-1">Clique num item à esquerda para ver os detalhes e tomar uma decisão.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
