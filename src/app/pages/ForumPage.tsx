import { useState } from 'react';
import { Link } from 'react-router';
import {
  MessageSquare, Pin, Eye, Heart, Plus, Lock, Filter, TrendingUp, Clock, X, Send, Globe
} from 'lucide-react';
import { FORUM_POSTS, CATEGORIES, getUserById, formatViews, formatDate, ForumPost } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export function ForumPage() {
  const { isLoggedIn, user, openLogin } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([...FORUM_POSTS]);

  // New topic form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Inflação');
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [newTags, setNewTags] = useState('');
  const [formError, setFormError] = useState('');

  const filtered = posts
    .filter(p => activeCategory === 'Todos' || p.category === activeCategory)
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'views') return b.views - a.views;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  const handleOpenNewTopic = () => {
    if (!isLoggedIn) { openLogin(); return; }
    setShowNewTopicModal(true);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newTitle.trim()) { setFormError('O título é obrigatório.'); return; }
    if (!newContent.trim()) { setFormError('O conteúdo é obrigatório.'); return; }

    const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const newPost: ForumPost = {
      id: `f${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      authorId: user!.id,
      category: newCategory,
      likes: 0,
      views: 0,
      replies: [],
      publishedAt: new Date().toISOString().split('T')[0],
      isPinned: false,
      tags,
      status: 'published',
      isPrivate: newIsPrivate,
      approvedUsers: newIsPrivate ? [user!.id] : [],
    };

    // Also push to the global array so thread page can find it
    FORUM_POSTS.unshift(newPost);
    setPosts(prev => [newPost, ...prev]);

    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewCategory('Inflação');
    setNewIsPrivate(false);
    setNewTags('');
    setShowNewTopicModal(false);
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#7B1D2D' }}>
              <MessageSquare size={20} className="text-white" />
            </div>
            <h1 className="text-gray-900" style={{ fontSize: '1.5rem' }}>Fórum de Discussão</h1>
          </div>
          <p className="text-sm text-gray-500 ml-13">Debate, partilha e aprende com a comunidade angolana</p>
        </div>
        <button
          onClick={handleOpenNewTopic}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 flex-shrink-0"
          style={{ backgroundColor: '#7B1D2D' }}
        >
          <Plus size={16} /> Novo tópico
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Tópicos', value: posts.length, icon: MessageSquare },
          { label: 'Participantes', value: '1.2K', icon: Eye },
          { label: 'Respostas', value: posts.reduce((acc, p) => acc + p.replies.length, 0), icon: Heart },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-3 flex items-center gap-2 shadow-sm">
            <s.icon size={16} style={{ color: '#7B1D2D' }} />
            <div>
              <div className="font-bold text-sm text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <Globe size={12} className="text-gray-400" /> Fórum aberto
        </span>
        <span className="flex items-center gap-1.5">
          <Lock size={12} style={{ color: '#7B1D2D' }} /> Fórum privado (requer aprovação)
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1 bg-white rounded-full p-1 border" style={{ borderColor: 'rgba(123,29,45,0.15)' }}>
          {[
            { v: 'recent', l: 'Recentes', icon: Clock },
            { v: 'popular', l: 'Populares', icon: Heart },
            { v: 'views', l: 'Mais vistos', icon: TrendingUp },
          ].map(s => (
            <button
              key={s.v}
              onClick={() => setSortBy(s.v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={sortBy === s.v ? { backgroundColor: '#7B1D2D', color: 'white' } : { color: '#6B7280' }}
            >
              <s.icon size={12} /> {s.l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {['Todos', ...CATEGORIES.slice(1, 7)].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-all"
            style={activeCategory === cat
              ? { backgroundColor: '#7B1D2D', color: 'white' }
              : { backgroundColor: 'white', color: '#374151', border: '1px solid rgba(123,29,45,0.15)' }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="space-y-3">
        {filtered.map(post => {
          const author = getUserById(post.authorId);
          return (
            <Link
              key={post.id}
              to={`/forum/${post.id}`}
              className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <img
                  src={author?.avatar}
                  alt={author?.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1 flex-wrap">
                    {post.isPinned && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: '#F0E6C4', color: '#7A5C00' }}>
                        <Pin size={10} /> Fixado
                      </span>
                    )}
                    {post.isPrivate ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                        <Lock size={10} /> Privado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 bg-gray-100 text-gray-500">
                        <Globe size={10} /> Aberto
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: '#EBF3EE', color: '#2E5C3E' }}>
                      {post.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1.5 leading-snug group-hover:text-[#7B1D2D] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="font-medium text-gray-600">{author?.name}</span>
                    <span>{formatDate(post.publishedAt)}</span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Heart size={12} /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {formatViews(post.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} /> {post.replies.length}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA for non-logged */}
      {!isLoggedIn && (
        <div className="mt-8 p-6 rounded-2xl text-center" style={{ backgroundColor: '#F5E8EB' }}>
          <MessageSquare size={28} className="mx-auto mb-3" style={{ color: '#7B1D2D' }} />
          <p className="font-semibold text-gray-900 mb-1">Participa no debate</p>
          <p className="text-sm text-gray-600 mb-4">Entra para criar tópicos, responder e dar gostos</p>
          <button onClick={openLogin} className="px-8 py-2.5 rounded-full text-sm text-white font-medium" style={{ backgroundColor: '#7B1D2D' }}>
            Criar conta gratuita
          </button>
        </div>
      )}

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewTopicModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare size={18} style={{ color: '#7B1D2D' }} /> Novo Tópico
              </h2>
              <button onClick={() => setShowNewTopicModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTopic} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF0E6', color: '#D64E12' }}>
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Título *</label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Escreve o título do teu tópico..."
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm bg-white focus:outline-none"
                    style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                  >
                    {CATEGORIES.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tags (opcional)</label>
                  <input
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    placeholder="tag1, tag2, ..."
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Conteúdo *</label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Escreve o teu tópico em detalhe..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                />
              </div>

              {/* Privacy toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all"
                style={{ backgroundColor: newIsPrivate ? '#F5E8EB' : '#F8F4F1' }}
                onClick={() => setNewIsPrivate(!newIsPrivate)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: newIsPrivate ? '#7B1D2D' : '#E5E7EB' }}>
                    {newIsPrivate ? <Lock size={16} className="text-white" /> : <Globe size={16} className="text-gray-500" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {newIsPrivate ? 'Fórum Privado' : 'Fórum Aberto'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {newIsPrivate
                        ? 'Apenas utilizadores aprovados por ti podem comentar'
                        : 'Qualquer utilizador registado pode participar'
                      }
                    </div>
                  </div>
                </div>
                <div
                  className="w-11 h-6 rounded-full relative flex-shrink-0 transition-colors"
                  style={{ backgroundColor: newIsPrivate ? '#7B1D2D' : '#D1D5DB' }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                    style={{ left: newIsPrivate ? '22px' : '2px' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTopicModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-white font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#7B1D2D' }}
                >
                  <Send size={14} /> Publicar tópico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
