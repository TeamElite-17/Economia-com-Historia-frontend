import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Eye, EyeOff, BookOpen, Lock } from 'lucide-react';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!token) {
      setError('Token de recuperação inválido ou ausente.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.message || 'Ocorreu um erro ao redefinir a senha.');
      }
    } catch (err) {
      setError('Erro de ligação ao servidor.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 pb-4" style={{ background: 'linear-gradient(135deg, #7B1D2D 0%, #9E2A3E 100%)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C9A84C' }}>
              <Lock size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Economia com História</div>
            </div>
          </div>
          <h2 className="text-white text-xl">Redefinir Senha</h2>
          <p className="text-white/70 text-sm mt-1">
            Crie uma nova senha para a sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl text-green-700 bg-green-50 border border-green-200">
                Senha redefinida com sucesso! Já pode entrar com a sua nova senha.
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl text-white font-medium text-sm transition-all"
                style={{ backgroundColor: '#7B1D2D' }}
              >
                Voltar à página principal
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Insira a nova senha"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                    required
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3 rounded-xl text-white font-medium text-sm transition-all disabled:opacity-60"
                style={{ backgroundColor: '#7B1D2D' }}
              >
                {loading ? 'A processar...' : 'Guardar Nova Senha'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
