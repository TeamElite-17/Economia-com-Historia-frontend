import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AuthModal } from '../ui/AuthModal';
import { useAuth } from '../../context/AuthContext';

function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { showAuthModal } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F8F4F1' }}>
        <Outlet />
        {showAuthModal && <AuthModal />}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F4F1' }}>
      <Header
        onMenuToggle={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex pt-16 min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main
          className={`flex-1 transition-all duration-300 min-w-0 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}
        >
          <Outlet />
        </main>
      </div>

      {showAuthModal && <AuthModal />}
    </div>
  );
}

export function Root() {
  return <RootLayout />;
}
