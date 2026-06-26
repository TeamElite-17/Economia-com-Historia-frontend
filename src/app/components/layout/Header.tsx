import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Search, Menu, X, Bell, User, LogOut, Settings, Shield, ChevronDown, BookOpen,
  MessageSquare, Bookmark, Clock, CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CONTENT_ITEMS, AUTHORS, getAuthorById } from '../../data/mockData';
import { requestJson } from '../../data/backendApi';

interface HeaderProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

interface Notif { notificationId: string; message: string; read: boolean; createdAt?: string; }

export function Header({ onMenuToggle, sidebarOpen }: HeaderProps) {
  const { user, isLoggedIn, isAdmin, isSuperAdmin, isStaff, canPublish, userRole, openLogin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [notifError, setNotifError] = useState('');
  const [notifLoading, setNotifLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    setNotifLoading(true);
    try {
      const data = await requestJson<Notif[]>('/v1/notifications/my');
      setNotifications(Array.isArray(data) ? data : []);
      setNotifError('');
    } catch (err) {
      console.error('[Notifications] fetch error:', err);
      setNotifError(String(err));
    } finally {
      setNotifLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) void fetchNotifications();
    const interval = isLoggedIn ? setInterval(fetchNotifications, 30000) : undefined;
    return () => { if (interval) clearInterval(interval); };
  }, [isLoggedIn, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await requestJson(`/v1/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.notificationId === notificationId ? { ...n, read: true } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await requestJson('/v1/notifications/my/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* ignore */ }
  };

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
  const sq = searchQuery.trim().toLowerCase();
  
  const authorSuggestions = sq
    ? AUTHORS.filter(a => a.name.toLowerCase().includes(sq)).slice(0, 2)
    : [];

  const contentSuggestions = sq
    ? CONTENT_ITEMS.filter(c => {
        const author = getAuthorById(c.authorId);
        return c.title.toLowerCase().includes(sq) ||
          c.category.toLowerCase().includes(sq) ||
          (author && author.name.toLowerCase().includes(sq));
      }).slice(0, 4)
    : [];
    
  const hasSuggestions = authorSuggestions.length > 0 || contentSuggestions.length > 0;

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
        {searchFocused && (searchQuery.trim() ? hasSuggestions : true) && (
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
            ) : hasSuggestions ? (
              <div className="py-2">
                {authorSuggestions.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Canais</div>
                    {authorSuggestions.map(a => (
                      <Link
                        key={a.id}
                        to={`/explorar?q=${encodeURIComponent(a.name)}`}
                        onClick={() => { setSearchFocused(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <img src={a.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                          <p className="text-xs text-gray-400">Canal</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {contentSuggestions.length > 0 && (
                  <div>
                    <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Conteúdos</div>
                    {contentSuggestions.map(c => (
                      <Link
                        key={c.id}
                        to={`/conteudo/${c.id}`}
                        onClick={() => { setSearchFocused(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <img src={c.thumbnail} alt="" className="w-10 h-7 rounded object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                          <p className="text-xs text-gray-400">{c.category} · {c.type}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
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
                onClick={() => {
                  const next = !notifOpen;
                  setNotifOpen(next);
                  setUserMenuOpen(false);
                  if (next) void fetchNotifications(); // actualiza ao abrir
                }}
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
                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                      {notifError ? (
                        <div className="py-6 text-center text-xs text-red-400 px-4">
                          Erro ao carregar: {notifError}
                        </div>
                      ) : notifLoading ? (
                        <div className="py-8 text-center text-sm text-gray-400">
                          <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto mb-2" style={{ borderColor: '#F5E8EB', borderTopColor: '#7B1D2D' }} />
                          A carregar...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">
                          <Bell size={22} className="mx-auto mb-2 opacity-30" />
                          Sem notificações
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.notificationId}
                            onClick={() => markAsRead(notif.notificationId)}
                            className="flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 cursor-pointer"
                            style={!notif.read ? { backgroundColor: '#FDFAF8' } : {}}
                          >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#F5E8EB' }}>
                              <MessageSquare size={14} style={{ color: '#7B1D2D' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-700 leading-relaxed">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Clock size={10} /> {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('pt-PT') : ''}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#C9A84C' }} />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-50 flex items-center justify-between">
                      <button onClick={markAllRead} className="text-xs font-medium flex items-center gap-1" style={{ color: '#7B1D2D' }}>
                        <CheckCheck size={12} /> Marcar todas como lidas
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
                      {isStaff && (
                        <span
                          className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={
                            isSuperAdmin ? { backgroundColor: '#F5F3FF', color: '#4C1D95' }
                            : isAdmin ? { backgroundColor: '#EFF6FF', color: '#1E3A5F' }
                            : userRole === 'APROVADOR' ? { backgroundColor: '#FFF8E6', color: '#5C3A00' }
                            : userRole === 'REVISOR' ? { backgroundColor: '#F0F7F4', color: '#1A4A3A' }
                            : { backgroundColor: '#F5E8EB', color: '#7B1D2D' }
                          }
                        >
                          <Shield size={10} />
                          {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Administrador' : userRole === 'APROVADOR' ? 'Aprovador' : userRole === 'REVISOR' ? 'Revisor' : 'Escritor'}
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

                      {/* ─── Role-specific panel links ─── */}
                      {canPublish && (
                        <Link
                          to="/publicar"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: '#2E5C3E' }}
                        >
                          <BookOpen size={16} /> Publicar conteúdo
                        </Link>
                      )}
                      {userRole === 'REVISOR' && (
                        <Link
                          to="/revisor"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: '#1A4A3A' }}
                        >
                          <Settings size={16} /> Painel do Revisor
                        </Link>
                      )}
                      {userRole === 'APROVADOR' && (
                        <Link
                          to="/aprovador"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: '#5C3A00' }}
                        >
                          <Settings size={16} /> Painel do Aprovador
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: '#7B1D2D' }}
                        >
                          <Shield size={16} /> {isSuperAdmin ? 'Super Admin CMS' : 'Admin CMS'}
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