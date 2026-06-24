import { NavLink } from 'react-router';
import { Home, Compass, Flame, HelpCircle, MessageSquare, Bell, User, Settings, ChevronRight, BookOpen, Eye, Star, Users, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', icon: Home, label: 'Início', exact: true },
  { to: '/explorar', icon: Compass, label: 'Explorar' },
  { to: '/explorar?filter=jindungo', icon: Flame, label: 'Jindungo', isHot: true },
  { to: '/quiz', icon: HelpCircle, label: 'Quiz' },
  { to: '/forum', icon: MessageSquare, label: 'Fórum' },
];

const userNavItems = [
  { to: '/subscricoes', icon: Bell, label: 'Subscrições' },
  { to: '/perfil', icon: User, label: 'Perfil' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isLoggedIn, isAdmin, isSuperAdmin, isStaff, userRole, canPublish, openLogin } = useAuth();

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 flex flex-col transition-all duration-300 overflow-y-auto overflow-x-hidden
          ${isOpen ? 'w-64' : 'w-0 md:w-16'}`}
        style={{ backgroundColor: '#FAF7F5', borderRight: '1px solid rgba(123,29,45,0.1)' }}
      >
        <div className="flex flex-col gap-1 p-2 pt-4 min-w-64 md:min-w-0">
          {/* Main nav */}
          <div className="mb-2">
            {(isOpen || true) && (
              <div
                className={`px-3 mb-1 text-xs font-semibold uppercase tracking-wider transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'}`}
                style={{ color: '#9E2A3E' }}
              >
                {isOpen && 'Menu'}
              </div>
            )}
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => window.innerWidth < 768 && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all group relative
                  ${isActive
                    ? 'text-white font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`
                }
                style={({ isActive }) => isActive ? { backgroundColor: '#7B1D2D' } : {}}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={20}
                      className="flex-shrink-0"
                      style={item.isHot && !isActive ? { color: '#D64E12' } : {}}
                    />
                    <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0 pointer-events-none'}`}>
                      {item.label}
                    </span>
                    {item.isHot && isOpen && (
                      <span
                        className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{
                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#FEF0E6',
                          color: isActive ? 'white' : '#D64E12'
                        }}
                      >
                        Quente
                      </span>
                    )}
                    {/* Tooltip for collapsed state */}
                    {!isOpen && (
                      <div className="hidden md:flex absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="h-px mx-2 mb-2" style={{ backgroundColor: 'rgba(123,29,45,0.1)' }} />

          {/* User nav */}
          <div className="mb-2">
            {isOpen && (
              <div
                className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#9E2A3E' }}
              >
                Conta
              </div>
            )}
            {userNavItems.map(item => (
              isLoggedIn ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => window.innerWidth < 768 && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all group relative
                    ${isActive
                      ? 'text-white font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`
                  }
                  style={({ isActive }) => isActive ? { backgroundColor: '#7B1D2D' } : {}}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={20} className="flex-shrink-0" />
                      <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        {item.label}
                      </span>
                      {!isOpen && (
                        <div className="hidden md:flex absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ) : (
                <button
                  key={item.to}
                  onClick={openLogin}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-gray-400 hover:text-gray-600 hover:bg-white transition-all group relative"
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {item.label}
                  </span>
                  {isOpen && <ChevronRight size={14} className="ml-auto opacity-40" />}
                </button>
              )
            ))}

            {canPublish && (
              <NavLink
                to="/publicar"
                onClick={() => window.innerWidth < 768 && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all group relative
                  ${isActive ? 'text-white font-medium' : 'hover:bg-white'}`
                }
                style={({ isActive }) => isActive ? { backgroundColor: '#5C8A6E' } : { color: '#2E5C3E' }}
              >
                <BookOpen size={20} className="flex-shrink-0" />
                <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  Publicar
                </span>
              </NavLink>
            )}

            {/* Role-specific dashboard links */}
            {userRole === 'REVISOR' && (
              <NavLink
                to="/revisor"
                onClick={() => window.innerWidth < 768 && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all group relative
                  ${isActive ? 'text-white font-medium' : 'hover:bg-white'}`
                }
                style={({ isActive }) => isActive ? { backgroundColor: '#1A4A3A' } : { color: '#1A4A3A' }}
              >
                {({ isActive }) => (
                  <>
                    <Eye size={20} className="flex-shrink-0" />
                    <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      Painel Revisor
                    </span>
                  </>
                )}
              </NavLink>
            )}
            {userRole === 'APROVADOR' && (
              <NavLink
                to="/aprovador"
                onClick={() => window.innerWidth < 768 && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all group relative
                  ${isActive ? 'text-white font-medium' : 'hover:bg-white'}`
                }
                style={({ isActive }) => isActive ? { backgroundColor: '#5C3A00' } : { color: '#5C3A00' }}
              >
                {({ isActive }) => (
                  <>
                    <Star size={20} className="flex-shrink-0" />
                    <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      Painel Aprovador
                    </span>
                  </>
                )}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => window.innerWidth < 768 && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all group relative
                  ${isActive ? 'text-white font-medium' : 'hover:bg-white'}`
                }
                style={({ isActive }) => isActive ? { backgroundColor: '#7B1D2D' } : { color: '#7B1D2D' }}
              >
                {({ isActive }) => (
                  <>
                    <Shield size={20} className="flex-shrink-0" />
                    <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      {isSuperAdmin ? 'Super Admin CMS' : 'Admin CMS'}
                    </span>
                  </>
                )}
              </NavLink>
            )}
          </div>

          {/* CTA for non-logged users */}
          {!isLoggedIn && isOpen && (
            <div
              className="mx-2 mt-4 p-4 rounded-2xl"
              style={{ backgroundColor: '#F5E8EB' }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: '#7B1D2D' }}>
                Acede a mais funcionalidades
              </p>
              <p className="text-xs text-gray-600 mb-3">
                Regista-te para participar em quizzes, comentar e subscrever autores.
              </p>
              <button
                onClick={openLogin}
                className="w-full py-2 rounded-xl text-sm text-white font-medium transition-colors"
                style={{ backgroundColor: '#7B1D2D' }}
              >
                Entrar
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
