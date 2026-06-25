import { useState } from 'react';
import { X, Eye, EyeOff, BookOpen, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';

const PROVINCES = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire',
];

export function AuthModal() {
  const { authMode, closeAuthModal, login, register, openLogin, openRegister } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    
    if (isForgotMode) {
      if (!email) { setError('Email é obrigatório.'); setLoading(false); return; }
      try {
        const res = await fetch('http://localhost:8080/api/v1/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (res.ok) {
          setForgotMessage('Verifique o seu email para um link de recuperação.');
        } else {
          setError('Ocorreu um erro ao tentar recuperar a senha.');
        }
      } catch (err) {
        setError('Erro de ligação ao servidor.');
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    if (authMode === 'login') {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Erro ao entrar.');
      }
    } else {
      if (!name.trim()) { setError('Nome é obrigatório.'); setLoading(false); return; }
      if (!province) { setError('Selecciona a tua província.'); setLoading(false); return; }
      const result = await register(name, email, password, province);
      if (!result.success) setError(result.error || 'Erro ao registar.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAuthModal} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="p-6 pb-4" style={{ background: 'linear-gradient(135deg, #7B1D2D 0%, #9E2A3E 100%)' }}>
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C9A84C' }}>
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Economia com História</div>
              <div className="text-white/70 text-xs">Angola</div>
            </div>
          </div>
          <h2 className="text-white text-xl">
            {isForgotMode ? 'Recuperar senha' : authMode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
          </h2>
          <p className="text-white/70 text-sm mt-1">
            {isForgotMode 
              ? 'Insira o seu email para receber o link' 
              : authMode === 'login'
                ? 'Entra para aceder a todas as funcionalidades'
                : 'Regista-te para começar a aprender'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">


          {!isForgotMode && authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="O teu nome"
                required
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'rgba(123,29,45,0.2)', '--tw-ring-color': '#7B1D2D' } as React.CSSProperties}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplo.ao"
              required
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: 'rgba(123,29,45,0.2)' }}
            />
          </div>

          {!isForgotMode && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                {authMode === 'login' && (
                  <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs text-[#7B1D2D] hover:underline">
                    Esqueci-me da senha
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Insira a sua palavra-passe"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {!isForgotMode && authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Província</label>
              <select
                value={province}
                onChange={e => setProvince(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-white"
                style={{ borderColor: 'rgba(123,29,45,0.2)' }}
              >
                <option value="">Selecciona a tua província</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
              {error}
            </div>
          )}
          {forgotMessage && (
            <div className="p-3 rounded-xl text-sm text-green-700 bg-green-50 border border-green-200">
              {forgotMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium text-sm transition-all disabled:opacity-60"
            style={{ backgroundColor: '#7B1D2D' }}
          >
            {loading ? 'A processar...' : isForgotMode ? 'Enviar link' : authMode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <p className="text-center text-sm text-gray-600">
            {isForgotMode ? (
              <button type="button" onClick={() => setIsForgotMode(false)} className="font-medium" style={{ color: '#7B1D2D' }}>
                Voltar ao login
              </button>
            ) : authMode === 'login' ? (
              <>Ainda não tens conta?{' '}
                <button type="button" onClick={openRegister} className="font-medium" style={{ color: '#7B1D2D' }}>
                  Registar
                </button>
              </>
            ) : (
              <>Já tens conta?{' '}
                <button type="button" onClick={openLogin} className="font-medium" style={{ color: '#7B1D2D' }}>
                  Entrar
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
