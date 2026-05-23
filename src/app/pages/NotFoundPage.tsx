import { Link } from 'react-router';
import { BookOpen, Home, Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: '#F8F4F1' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C9A84C' }}>
          <BookOpen size={22} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight" style={{ color: '#7B1D2D' }}>Economia com</div>
          <div className="font-bold text-sm leading-tight" style={{ color: '#C9A84C' }}>História Angola</div>
        </div>
      </div>

      {/* 404 Visual */}
      <div className="mb-6 relative">
        <div
          className="text-[120px] md:text-[160px] font-bold leading-none select-none"
          style={{ color: 'rgba(123,29,45,0.08)' }}
        >
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#7B1D2D' }}
          >
            <Compass size={36} className="text-white" />
          </div>
        </div>
      </div>

      <h1 className="text-gray-900 mb-3" style={{ fontSize: '1.5rem' }}>
        Página não encontrada
      </h1>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        A página que procuras não existe ou foi movida. Explora o nosso conteúdo sobre história económica de Angola.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ backgroundColor: '#7B1D2D' }}
        >
          <Home size={16} /> Voltar ao início
        </Link>
        <Link
          to="/explorar"
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all hover:bg-white"
          style={{ borderColor: 'rgba(123,29,45,0.2)', color: '#7B1D2D' }}
        >
          <Compass size={16} /> Explorar conteúdos
        </Link>
      </div>
    </div>
  );
}
