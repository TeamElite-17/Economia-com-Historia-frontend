import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Search, Menu, X, Bell, User, LogOut, Settings, Shield, ChevronDown, BookOpen,
  Flame, HelpCircle, MessageSquare, Bookmark, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CONTENT_ITEMS } from '../../data/mockData';

interface HeaderProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

export function Header({ onMenuToggle, sidebarOpen }: HeaderProps) {
  const { user, isLoggedIn, isAdmin, openLogin, openRegister, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock notifications
  const notifications = [
    { id: '1', title: 'Novo conteúdo Jindungo', desc: 'Prof. Domingos publicou um novo vídeo sobre inflação', time: 'há 2h', unread: true, icon: Flame, iconColor: '#D64E12' },
    { id: '2', title: 'Quiz completado!', desc: 'Ganhas-te o badge Prata ao completar 2 quizzes', time: 'há 1 dia', unread: true, icon: HelpCircle, iconColor: '#C9A84C' },
    { id: '3', title: 'Resposta no fórum', desc: 'Carlos respondeu ao teu tópico sobre musseques', time: 'há 2 dias', unread: false, icon: MessageSquare, iconColor: '#5C8A6E' },
  ];

  const unreadCount = isLoggedIn ? notifications.filter(n => n.unread).length : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explorar?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setSearchQuery('');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Quick search suggestions
  const suggestions = searchQuery.trim()
    ? CONTENT_ITEMS.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  return (
    <header
      style={{ backgroundColor: '#7B1D2D' }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center gap-3 px-4 shadow-lg"
    >
      {/* Hamburger + Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#C9A84C' }}>
            <BookOpen size={18} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-white font-semibold text-sm leading-tight">Economia com</div>
            <div style={{ color: '#C9A84C' }} className="font-bold text-sm leading-tight">História Angola</div>
          </div>
        </Link>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-2xl mx-auto relative hidden sm:block" ref={searchRef}>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Pesquisar conteúdos, temas, autores..."
              className="w-full h-9 pl-4 pr-10 rounded-full bg-white/15 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* Quick search dropdown */}
        {searchFocused && (searchQuery.trim() ? suggestions.length > 0 : true) && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-100">
            {searchQuery.trim() === '' ? (
              <div className="p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Pesquisas rápidas</div>
                <div className="flex flex-wrap gap-2">
                  {['Inflação', 'Kwanza', 'Petróleo', 'Musseques', 'Independência', 'Diamantes'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setSearchQuery(tag); }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                      style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map(c => (
                  <Link
                    key={c.id}
                    to={`/conteudo/${c.id}`}
                    onClick={() => { setSearchFocused(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <img src={c.thumbnail} alt="" className="w-10 h-7 rounded object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                      <p className="text-xs text-gray-400">{c.category} · {c.type}</p>
                    </div>
                  </Link>
                ))}
                <div className="px-4 py-2 border-t border-gray-50">
                  <button
                    onClick={() => { navigate(`/explorar?q=${encodeURIComponent(searchQuery)}`); setSearchFocused(false); setSearchQuery(''); }}
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: '#7B1D2D' }}
                  >
                    <Search size={12} /> Ver todos os resultados para "{searchQuery}"
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-400">Nenhum resultado para "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Mobile search icon */}
        <button
          onClick={() => navigate('/explorar')}
          className="sm:hidden p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Pesquisar"
        >
          <Search size={20} />
        </button>

        {isLoggedIn ? (
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors relative"
                aria-label="Notificações"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: '#C9A84C' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900">Notificações</span>
                      <span className="text-xs text-gray-400">{unreadCount} não lidas</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {notifications.map(notif => (
                        <div
                          key={notif.id}
                          className="flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 cursor-pointer"
                          style={notif.unread ? { backgroundColor: '#FDFAF8' } : {}}
                        >
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: notif.iconColor + '20' }}
                          >
                            <notif.icon size={14} style={{ color: notif.iconColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.desc}</p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Clock size={10} /> {notif.time}
                            </p>
                          </div>
                          {notif.unread && (
                            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#C9A84C' }} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-50">
                      <button className="text-xs font-medium w-full text-center py-1" style={{ color: '#7B1D2D' }}>
                        Ver todas as notificações
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover border-2 border-white/30"
                />
                <span className="hidden md:block text-sm">{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className={`hidden md:block opacity-70 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <div className="font-semibold text-sm" style={{ color: '#1C1917' }}>{user?.name}</div>
                      <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                      {isAdmin && (
                        <span
                          className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}
                        >
                          <Shield size={10} /> Admin
                        </span>
                      )}
                    </div>
                    <div className="py-1">
                      <Link
                        to="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User size={16} /> O meu perfil
                      </Link>
                      <Link
                        to="/subscricoes"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Bookmark size={16} /> Subscrições
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: '#7B1D2D' }}
                        >
                          <Settings size={16} /> Painel Admin
                        </Link>
                      )}
                      <div className="h-px mx-4 my-1 bg-gray-100" />
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={openLogin}
              className="px-5 py-1.5 text-sm rounded-full text-white font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#C9A84C' }}
            >
              Entrar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}