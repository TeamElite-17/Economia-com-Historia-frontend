import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, BookOpen, Award, Bell, Settings, Camera, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';
import { CONTENT_ITEMS, QUIZZES, AUTHORS, formatViews, formatDate } from '../data/mockData';
import { ContentCard } from '../components/ui/ContentCard';
import { useAuth } from '../context/AuthContext';

type Tab = 'overview' | 'history' | 'saved' | 'quizzes' | 'settings';

export function ProfilePage() {
  const { user, isLoggedIn, openLogin, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F5E8EB' }}>
            <User size={32} style={{ color: '#7B1D2D' }} />
          </div>
          <h2 className="text-gray-900 mb-2">Perfil</h2>
          <p className="text-sm text-gray-500 mb-6">Entra para ver o teu perfil e acompanhar o teu progresso</p>
          <button onClick={openLogin} className="px-8 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#7B1D2D' }}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const watchedContent = CONTENT_ITEMS.filter(c => user?.watchHistory.includes(c.id));
  const savedContent = CONTENT_ITEMS.filter(c => user?.savedContent.includes(c.id));
  const completedQuizzes = QUIZZES.filter(q => user?.completedQuizzes.includes(q.id));
  const subscribedAuthors = AUTHORS.filter(a => user?.subscriptions.includes(a.id));

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'overview', label: 'Visão Geral', icon: User },
    { id: 'history', label: 'Histórico', icon: BookOpen },
    { id: 'saved', label: 'Guardados', icon: Bell },
    { id: 'quizzes', label: 'Quizzes', icon: Award },
    { id: 'settings', label: 'Definições', icon: Settings },
  ];

  const handleSave = () => {
    updateUser({ name: editName, bio: editBio });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="h-28 relative" style={{ background: 'linear-gradient(135deg, #7B1D2D 0%, #9E2A3E 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C9A84C 0%, transparent 50%)' }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4 flex-wrap sm:flex-nowrap">
            <div className="relative">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
              />
              <button className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#7B1D2D' }}>
                <Camera size={12} className="text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0 pb-1">
              {editing ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="text-lg font-bold text-gray-900 border-b-2 focus:outline-none w-full"
                  style={{ borderColor: '#7B1D2D' }}
                />
              ) : (
                <h1 className="text-gray-900 break-words" style={{ fontSize: '1.25rem' }}>{user?.name}</h1>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1 whitespace-nowrap"><MapPin size={13} /> {user?.province || 'Angola'}</span>
                <span className="flex items-center gap-1 whitespace-nowrap"><Calendar size={13} /> Desde {formatDate(user?.joinedAt || '')}</span>
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                    Administrador
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#7B1D2D' }}>
                    <Save size={14} /> Guardar
                  </button>
                  <button onClick={() => setEditing(false)} className="p-1.5 rounded-xl bg-gray-100 text-gray-600">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Edit2 size={14} /> Editar
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <textarea
              value={editBio}
              onChange={e => setEditBio(e.target.value)}
              rows={2}
              placeholder="Escreve uma bio..."
              className="w-full text-sm text-gray-600 border rounded-xl p-3 focus:outline-none resize-none"
              style={{ borderColor: 'rgba(123,29,45,0.2)' }}
            />
          ) : (
            <p className="text-sm text-gray-600">{user?.bio || 'Sem bio ainda. Clica em "Editar" para adicionar.'}</p>
          )}

          {/* Quick stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
            <div className="text-center">
              <div className="font-bold text-gray-900">{watchedContent.length}</div>
              <div className="text-xs text-gray-500">Vistos</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">{completedQuizzes.length}</div>
              <div className="text-xs text-gray-500">Quizzes</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">{subscribedAuthors.length}</div>
              <div className="text-xs text-gray-500">Subscrições</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">{savedContent.length}</div>
              <div className="text-xs text-gray-500">Guardados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0"
            style={activeTab === tab.id
              ? { backgroundColor: '#7B1D2D', color: 'white' }
              : { color: '#6B7280' }
            }
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Progress */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Progresso de aprendizagem</h3>
            <div className="space-y-3">
              {QUIZZES.map(q => {
                const done = user?.completedQuizzes.includes(q.id);
                return (
                  <div key={q.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{q.title}</span>
                        <span className="text-xs font-medium" style={{ color: done ? '#5C8A6E' : '#C9A84C' }}>
                          {done ? 'Completo' : 'Pendente'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: done ? '100%' : '0%', backgroundColor: done ? '#5C8A6E' : '#7B1D2D' }} />
                      </div>
                    </div>
                    {done && <Award size={16} style={{ color: '#5C8A6E' }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subscribed authors */}
          {subscribedAuthors.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Autores subscritos</h3>
              <div className="space-y-3">
                {subscribedAuthors.map(a => (
                  <div key={a.id} className="flex items-center gap-3">
                    <img src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{a.name}</div>
                      <div className="text-xs text-gray-500">{a.specialty}</div>
                    </div>
                    <span className="text-xs text-gray-400">{formatViews(a.subscribers)} subs.</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {watchedContent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {watchedContent.map(c => <ContentCard key={c.id} content={c} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Ainda não viste nenhum conteúdo</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div>
          {savedContent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedContent.map(c => <ContentCard key={c.id} content={c} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Bell size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum conteúdo guardado ainda</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-3">
          {QUIZZES.map(q => {
            const done = user?.completedQuizzes.includes(q.id);
            return (
              <div key={q.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                <img src={q.thumbnail} alt={q.title} className="w-16 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 line-clamp-1">{q.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{q.questions.length} perguntas · {q.estimatedTime}</div>
                </div>
                <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium" style={done ? { backgroundColor: '#EBF3EE', color: '#5C8A6E' } : { backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                  {done ? 'Completo' : 'Por fazer'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Definições da conta</h3>
            <div className="space-y-3">
              {[
                { label: 'Notificações por email', desc: 'Recebe atualizações sobre novos conteúdos' },
                { label: 'Novidades no fórum', desc: 'Notificações de respostas aos teus tópicos' },
                { label: 'Recomendações personalizadas', desc: 'Conteúdos baseados nos teus interesses' },
              ].map(setting => (
                <div key={setting.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'rgba(123,29,45,0.08)' }}>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{setting.label}</div>
                    <div className="text-xs text-gray-500">{setting.desc}</div>
                  </div>
                  <div className="w-10 h-5 rounded-full relative cursor-pointer" style={{ backgroundColor: '#7B1D2D' }}>
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full py-3 rounded-2xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Terminar sessão
          </button>
        </div>
      )}
    </div>
  );
}
