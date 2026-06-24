import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { bootstrapWebData } from './data/backendApi';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bootstrapWebData()
      .catch(() => { /* fallback: usa mockdata se backend offline */ })
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#FBF7F4', gap: '16px'
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '4px solid #F5E8EB',
          borderTopColor: '#7B1D2D',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#7B1D2D', fontWeight: 600, fontSize: 14 }}>
          A carregar dados...
        </p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
