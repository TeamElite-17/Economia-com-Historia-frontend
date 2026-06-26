import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, Filter, X, Flame, Play, FileText, Headphones, SlidersHorizontal, Users, CheckCircle } from 'lucide-react';
import { CONTENT_ITEMS, CATEGORIES, getAuthorById, AUTHORS, formatViews } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { ContentCard } from '../components/ui/ContentCard';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais Recentes' },
  { value: 'popular', label: 'Mais Vistos' },
  { value: 'liked', label: 'Mais Curtidos' },
];

const TYPE_FILTERS = [
  { value: 'all', label: 'Todos os tipos', icon: SlidersHorizontal },
  { value: 'video', label: 'Vídeos', icon: Play },
  { value: 'article', label: 'Artigos', icon: FileText },
  { value: 'podcast', label: 'Podcasts', icon: Headphones },
];

export function ExplorePage() {
  const { user, updateUser, subscribeToAuthor, unsubscribeFromAuthor } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || '';
  const initialQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeType, setActiveType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showJindungo, setShowJindungo] = useState(initialFilter === 'jindungo');

  const matchedAuthor = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return AUTHORS.find(a => a.name.toLowerCase().includes(q) || a.specialty.toLowerCase().includes(q));
  }, [search]);

  const filtered = useMemo(() => {
    let items = [...CONTENT_ITEMS];
    if (showJindungo) items = items.filter(c => c.isJindungo);
    if (activeCategory !== 'Todos') items = items.filter(c => c.category === activeCategory);
    if (activeType !== 'all') items = items.filter(c => c.type === activeType);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(c => {
        const author = getAuthorById(c.authorId);
        return c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some(t => t.toLowerCase().includes(q)) ||
          (author && author.name.toLowerCase().includes(q));
      });
    }
    if (sortBy === 'popular') items.sort((a, b) => b.views - a.views);
    else if (sortBy === 'liked') items.sort((a, b) => b.likes - a.likes);
    else items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return items;
  }, [search, activeCategory, activeType, sortBy, showJindungo]);

  const clearFilters = () => {
    setActiveCategory('Todos');
    setActiveType('all');
    setShowJindungo(false);
    setSearch('');
  };

  const hasFilters = activeCategory !== 'Todos' || activeType !== 'all' || showJindungo || search;

  const handleSubscribeToggle = async (authorId: string) => {
    if (!user) {
      alert('Inicia sessão para subscrever a este autor.');
      return;
    }
    try {
      setIsSubmitting(true);
      const isSubscribed = user.subscriptions.includes(authorId);
      if (isSubscribed) {
        await unsubscribeFromAuthor(authorId);
        updateUser({ subscriptions: user.subscriptions.filter(s => s !== authorId) });
      } else {
        await subscribeToAuthor(authorId);
        updateUser({ subscriptions: [...user.subscriptions, authorId] });
      }
    } catch (err) {
      alert('Erro ao atualizar subscrição. Tenta novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-1" style={{ fontSize: '1.5rem' }}>Explorar Conteúdos</h1>
        <p className="text-gray-500 text-sm">Descobre vídeos, artigos e podcasts sobre a história económica de Angola</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar por título, tema, palavra-chave..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border shadow-sm text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: 'rgba(123,29,45,0.15)', '--tw-ring-color': '#7B1D2D' } as React.CSSProperties}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Jindungo toggle */}
        <button
          onClick={() => setShowJindungo(!showJindungo)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
          style={showJindungo
            ? { backgroundColor: '#D64E12', color: 'white' }
            : { backgroundColor: 'white', color: '#D64E12', border: '1px solid #D64E12' }
          }
        >
          <Flame size={14} /> Jindungo
        </button>

        {/* Type filter */}
        <div className="flex gap-1 bg-white rounded-full p-1 border" style={{ borderColor: 'rgba(123,29,45,0.15)' }}>
          {TYPE_FILTERS.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveType(t.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={activeType === t.value
                ? { backgroundColor: '#7B1D2D', color: 'white' }
                : { color: '#6B7280' }
              }
            >
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-full text-sm bg-white border cursor-pointer focus:outline-none"
          style={{ borderColor: 'rgba(123,29,45,0.15)', color: '#374151' }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-gray-500 hover:text-gray-700 bg-white border transition-all"
            style={{ borderColor: 'rgba(0,0,0,0.1)' }}
          >
            <X size={14} /> Limpar filtros
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {CATEGORIES.map(cat => (
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

      {/* Results count */}
      <div className="flex items-center gap-2 mb-5">
        <Filter size={14} className="text-gray-400" />
        <span className="text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          {activeCategory !== 'Todos' && ` em "${activeCategory}"`}
          {search && ` para "${search}"`}
        </span>
      </div>

      {/* Author Match Result */}
      {matchedAuthor && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Canais correspondentes</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden group">
            {/* Background Hint */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full transform translate-x-10 -translate-y-10 group-hover:bg-[#F5E8EB] transition-colors duration-500 z-0"></div>
            
            <Link to={`/autor/${matchedAuthor.id}`} className="relative z-10 flex-shrink-0">
              <img 
                src={matchedAuthor.avatar} 
                alt={matchedAuthor.name} 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2"
                style={{ borderColor: '#F5E8EB' }}
              />
            </Link>
            
            <div className="flex-1 text-center sm:text-left relative z-10 flex flex-col justify-center h-full pt-2">
              <Link to={`/autor/${matchedAuthor.id}`} className="block group-hover:text-[#7B1D2D] transition-colors">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 flex items-center justify-center sm:justify-start gap-2">
                  {matchedAuthor.name}
                  <CheckCircle size={16} className="text-gray-400" />
                </h3>
              </Link>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-sm text-gray-500 mb-3">
                <span>@{matchedAuthor.name.replace(/\s+/g, '').toLowerCase()}</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  {formatViews(matchedAuthor.subscribers + (user?.subscriptions.includes(matchedAuthor.id) ? 1 : 0))} subscritores
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{CONTENT_ITEMS.filter(c => c.authorId === matchedAuthor.id).length} publicações</span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 max-w-2xl mb-4 sm:mb-0">
                {matchedAuthor.bio || `Especialista em ${matchedAuthor.specialty} associado a ${matchedAuthor.institution}.`}
              </p>
            </div>
            
            <div className="relative z-10 flex-shrink-0 flex items-center justify-center sm:h-full sm:pt-6">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleSubscribeToggle(matchedAuthor.id);
                }}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full font-semibold transition-all shadow-sm text-sm"
                style={user?.subscriptions.includes(matchedAuthor.id)
                  ? { backgroundColor: '#EBF3EE', color: '#5C8A6E', border: '1px solid #5C8A6E' } 
                  : { backgroundColor: '#1C1917', color: 'white' }}
              >
                {user?.subscriptions.includes(matchedAuthor.id) ? 'Subscrito' : 'Subscrever'}
              </button>
            </div>
          </div>
          
          {/* Author Recent Content preview could go here if wanted */}
          {search.trim() && (
            <div className="mt-4 mb-2">
              <h3 className="font-semibold text-gray-900">Mais recentes do canal {matchedAuthor.name}</h3>
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(content => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F5E8EB' }}>
            <Search size={28} style={{ color: '#7B1D2D' }} />
          </div>
          <h3 className="font-semibold text-gray-700 mb-2">Nenhum resultado encontrado</h3>
          <p className="text-sm text-gray-500 mb-4">Tenta ajustar os filtros ou pesquisar por outros termos</p>
          <button onClick={clearFilters} className="px-6 py-2 rounded-full text-sm text-white" style={{ backgroundColor: '#7B1D2D' }}>
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
