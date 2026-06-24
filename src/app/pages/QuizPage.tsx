import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { HelpCircle, Clock, Users, Lock, ChevronRight, Award, Trophy, Medal, Star } from 'lucide-react';
import { QUIZZES, CATEGORIES, formatViews } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const DIFFICULTY_CONFIG = {
  facil: { label: 'Fácil', color: '#5C8A6E', bg: '#EBF3EE' },
  medio: { label: 'Médio', color: '#C9A84C', bg: '#F8F2DE' },
  dificil: { label: 'Difícil', color: '#D64E12', bg: '#FEF0E6' },
};

const BADGE_CONFIG = {
  ouro: { label: 'Ouro', color: '#C9A84C', bg: '#F8F2DE', icon: Trophy },
  prata: { label: 'Prata', color: '#6B7280', bg: '#F3F4F6', icon: Medal },
  bronze: { label: 'Bronze', color: '#A05C38', bg: '#FEF3EC', icon: Medal },
  participante: { label: 'Participante', color: '#7B1D2D', bg: '#F5E8EB', icon: Star },
};

// Entrada do ranking carregada do backend
interface RankingEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  points: number;
  quizzesCompleted: number;
}

type PageTab = 'quizzes' | 'ranking';

export function QuizPage() {
  const { isLoggedIn, user, openLogin } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [activeTab, setActiveTab] = useState<PageTab>('quizzes');
  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  // Carrega ranking quando o utilizador muda para o separador
  useEffect(() => {
    if (activeTab !== 'ranking') return;
    const backendUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');
    setRankingLoading(true);
    fetch(`${backendUrl}/v1/quiz-attempts/ranking`)
      .then(r => r.json())
      .then((data: RankingEntry[]) => setRankingData(Array.isArray(data) ? data : []))
      .catch(() => setRankingData([]))
      .finally(() => setRankingLoading(false));
  }, [activeTab]);

  const filtered = QUIZZES.filter(q => {
    if (activeCategory !== 'Todos' && q.category !== activeCategory) return false;
    if (activeDifficulty !== 'all' && q.difficulty !== activeDifficulty) return false;
    return true;
  });

  const currentUserRank = rankingData.findIndex(r => r.userId === user?.id) + 1;

  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#7B1D2D' }}>
            <HelpCircle size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: '1.5rem' }}>Quiz Interactivo</h1>
            <p className="text-sm text-gray-500">Testa e aprofunda os teus conhecimentos sobre a história económica angolana</p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm mb-6 w-fit">
        {[
          { id: 'quizzes' as PageTab, label: 'Quizzes', icon: HelpCircle },
          { id: 'ranking' as PageTab, label: 'Ranking', icon: Trophy },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all"
            style={activeTab === tab.id
              ? { backgroundColor: '#7B1D2D', color: 'white' }
              : { color: '#6B7280' }
            }
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ===== QUIZZES TAB ===== */}
      {activeTab === 'quizzes' && (
        <>
          {/* User stats (if logged in) */}
          {isLoggedIn && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                <div className="text-2xl font-bold" style={{ color: '#7B1D2D' }}>{user?.completedQuizzes.length || 0}</div>
                <div className="text-xs text-gray-500 mt-1">Quizzes completos</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                <div className="text-2xl font-bold" style={{ color: '#C9A84C' }}>{QUIZZES.length - (user?.completedQuizzes.length || 0)}</div>
                <div className="text-xs text-gray-500 mt-1">Disponíveis</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                <div className="text-2xl font-bold" style={{ color: '#5C8A6E' }}>
                  {user?.completedQuizzes.length ? Math.round((user.completedQuizzes.length / QUIZZES.length) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Progresso</div>
              </div>
            </div>
          )}

          {/* Locked banner for non-logged */}
          {!isLoggedIn && (
            <div
              className="flex items-center justify-between p-5 rounded-2xl mb-8"
              style={{ background: 'linear-gradient(135deg, #F5E8EB, #FAF7F5)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#7B1D2D' }}>
                  <Lock size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Cria uma conta para fazer os quizzes</div>
                  <div className="text-xs text-gray-500 mt-0.5">Acompanha o teu progresso, ganha pontos e compete no ranking</div>
                </div>
              </div>
              <button onClick={openLogin} className="px-5 py-2 rounded-full text-sm text-white font-medium flex-shrink-0" style={{ backgroundColor: '#7B1D2D' }}>
                Entrar
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex gap-1 bg-white rounded-full p-1 border" style={{ borderColor: 'rgba(123,29,45,0.15)' }}>
              {[{ v: 'all', l: 'Todas' }, { v: 'facil', l: 'Fácil' }, { v: 'medio', l: 'Médio' }, { v: 'dificil', l: 'Difícil' }].map(d => (
                <button
                  key={d.v}
                  onClick={() => setActiveDifficulty(d.v)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={activeDifficulty === d.v
                    ? { backgroundColor: '#7B1D2D', color: 'white' }
                    : { color: '#6B7280' }
                  }
                >
                  {d.l}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {['Todos', ...CATEGORIES.slice(1, 6)].map(cat => (
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
          </div>

          {/* Quiz grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(quiz => {
              const diff = DIFFICULTY_CONFIG[quiz.difficulty];
              const isCompleted = user?.completedQuizzes.includes(quiz.id);
              return (
                <div key={quiz.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="relative h-36 overflow-hidden">
                    <img src={quiz.thumbnail} alt={quiz.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: diff.bg, color: diff.color }}>
                        {diff.label}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#5C8A6E' }}>
                          <Award size={11} /> Completo
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                      {quiz.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-snug">{quiz.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{quiz.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1"><HelpCircle size={12} /> {quiz.questions.length} perguntas</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {quiz.estimatedTime}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {formatViews(quiz.participants)}</span>
                    </div>
                    {isLoggedIn ? (
                      <Link
                        to={`/quiz/${quiz.id}`}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm text-white font-medium transition-all"
                        style={{ backgroundColor: isCompleted ? '#5C8A6E' : '#7B1D2D' }}
                      >
                        <span>{isCompleted ? 'Refazer quiz' : 'Iniciar quiz'}</span>
                        <ChevronRight size={16} />
                      </Link>
                    ) : (
                      <button
                        onClick={openLogin}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}
                      >
                        <span className="flex items-center gap-2"><Lock size={14} /> Entrar para fazer o quiz</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ===== RANKING TAB ===== */}
      {activeTab === 'ranking' && (
        <div className="max-w-2xl">
          {/* User's position if logged in */}
          {isLoggedIn && currentUserRank > 0 && (
            <div
              className="flex items-center gap-4 p-4 rounded-2xl mb-6"
              style={{ background: 'linear-gradient(135deg, #7B1D2D 0%, #9E2A3E 100%)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                #{currentUserRank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm">A tua posição no ranking</div>
                <div className="text-white/70 text-xs mt-0.5">
                  {rankingData.find(r => r.userId === user?.id)?.points || 0} pontos ·{' '}
                  {rankingData.find(r => r.userId === user?.id)?.quizzesCompleted || 0} quizzes completos
                </div>
              </div>
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/30 flex-shrink-0"
              />
            </div>
          )}

          {/* How points work */}
          <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Star size={14} style={{ color: '#C9A84C' }} /> Como se ganham pontos
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { action: 'Quiz completo', points: '+500', color: '#7B1D2D' },
                { action: 'Resposta no fórum', points: '+50', color: '#5C8A6E' },
                { action: 'Conteúdo visto', points: '+10', color: '#C9A84C' },
              ].map(item => (
                <div key={item.action} className="p-3 rounded-xl" style={{ backgroundColor: '#F8F4F1' }}>
                  <div className="font-bold text-sm" style={{ color: item.color }}>{item.points}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.action}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
              <Trophy size={16} style={{ color: '#C9A84C' }} />
              <h3 className="font-semibold text-gray-900 text-sm">Tabela de Classificação</h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(123,29,45,0.06)' }}>
              {rankingLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-200 rounded-full mx-auto" style={{ borderTopColor: '#7B1D2D' }} />
                  <p className="text-xs text-gray-400 mt-2">A carregar ranking...</p>
                </div>
              ) : rankingData.length === 0 ? (
                <div className="p-8 text-center">
                  <Trophy size={28} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-gray-400">Ainda não há dados de ranking.</p>
                  <p className="text-xs text-gray-400 mt-1">Completa quizzes para aparecer aqui!</p>
                </div>
              ) : (
                rankingData.map((entry, index) => {
                  const badge = index === 0 ? BADGE_CONFIG.ouro
                    : index === 1 ? BADGE_CONFIG.prata
                    : index === 2 ? BADGE_CONFIG.bronze
                    : BADGE_CONFIG.participante;
                  const BadgeIcon = badge.icon;
                  const isCurrentUser = user?.id === entry.userId;
                  return (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-4 px-5 py-4 transition-colors"
                      style={isCurrentUser ? { backgroundColor: '#F5E8EB' } : {}}
                    >
                      <div className="w-7 text-center flex-shrink-0">
                        {index === 0 ? (
                          <Trophy size={20} style={{ color: '#C9A84C' }} />
                        ) : index === 1 ? (
                          <Medal size={20} style={{ color: '#9CA3AF' }} />
                        ) : index === 2 ? (
                          <Medal size={20} style={{ color: '#A05C38' }} />
                        ) : (
                          <span className="text-sm font-semibold text-gray-400">#{index + 1}</span>
                        )}
                      </div>
                      <img
                        src={entry.userAvatar}
                        alt={entry.userName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900 truncate">{entry.userName}</span>
                          {isCurrentUser && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: '#7B1D2D' }}>
                              Tu
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {entry.quizzesCompleted} quiz{entry.quizzesCompleted !== 1 ? 'zes' : ''} completo{entry.quizzesCompleted !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: badge.bg, color: badge.color }}
                        >
                          <BadgeIcon size={10} /> {badge.label}
                        </span>
                        <span className="font-bold text-sm" style={{ color: '#7B1D2D' }}>
                          {entry.points.toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {!isLoggedIn && (
            <div className="mt-6 p-5 rounded-2xl text-center" style={{ backgroundColor: '#F5E8EB' }}>
              <Trophy size={24} className="mx-auto mb-2" style={{ color: '#C9A84C' }} />
              <p className="font-semibold text-gray-900 text-sm mb-1">Entra para aparecer no ranking</p>
              <p className="text-xs text-gray-600 mb-3">Faz quizzes e participa no fórum para acumular pontos</p>
              <button onClick={openLogin} className="px-6 py-2 rounded-full text-sm text-white font-medium" style={{ backgroundColor: '#7B1D2D' }}>
                Criar conta gratuita
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
