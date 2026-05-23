import { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  Play, FileText, Headphones, Eye, Heart, Bookmark, Share2, Bell, BellOff,
  Lock, MessageSquare, Send, Clock, ChevronRight, Flame, ThumbsUp, Star
} from 'lucide-react';
import { CONTENT_ITEMS, AUTHORS, getAuthorById, formatViews, formatDate } from '../data/mockData';
import { ContentCard } from '../components/ui/ContentCard';
import { useAuth } from '../context/AuthContext';

export function ContentDetailPage() {
  const { id } = useParams();
  const { isLoggedIn, user, openLogin, subscribeToAuthor, unsubscribeFromAuthor, saveContent, unsaveContent, addToHistory } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{ id: string; text: string; user: string; avatar: string; date: string; likes: number }[]>([
    { id: '1', text: 'Conteúdo excelente! Aprendi muito sobre a hiperinflação angolana. Este é exactamente o tipo de material que precisamos para as nossas aulas.', user: 'Maria Fernandes', avatar: 'https://images.unsplash.com/photo-1739300293504-234817eead52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', date: '2024-03-16', likes: 12 },
    { id: '2', text: 'Muito bem explicado. A parte sobre o impacto nas famílias foi especialmente tocante. A minha família viveu esses momentos difíceis.', user: 'Carlos Mwangi', avatar: 'https://images.unsplash.com/photo-1608052026785-0bc249c733e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', date: '2024-03-17', likes: 8 },
  ]);
  const [liked, setLiked] = useState(false);

  const content = CONTENT_ITEMS.find(c => c.id === id);

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-gray-700 mb-2">Conteúdo não encontrado</h2>
          <Link to="/" className="text-sm" style={{ color: '#7B1D2D' }}>Voltar ao início</Link>
        </div>
      </div>
    );
  }

  const author = getAuthorById(content.authorId);
  const isSubscribed = user?.subscriptions.includes(content.authorId);
  const isSaved = user?.savedContent.includes(content.id);
  const isJindungoLocked = content.isJindungo && !isSubscribed;
  const related = CONTENT_ITEMS.filter(c => c.id !== content.id && (c.category === content.category || c.authorId === content.authorId)).slice(0, 4);

  const handleSubscribe = () => {
    if (!isLoggedIn) { openLogin(); return; }
    if (isSubscribed) unsubscribeFromAuthor(content.authorId);
    else subscribeToAuthor(content.authorId);
  };

  const handleSave = () => {
    if (!isLoggedIn) { openLogin(); return; }
    if (isSaved) unsaveContent(content.id);
    else saveContent(content.id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments(prev => [{
      id: Date.now().toString(),
      text: comment,
      user: user!.name,
      avatar: user!.avatar,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    }, ...prev]);
    setComment('');
  };

  const TypeIcon = content.type === 'video' ? Play : content.type === 'article' ? FileText : Headphones;
  const typeLabel = content.type === 'video' ? 'Vídeo' : content.type === 'article' ? 'Artigo' : 'Podcast';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Media player / Thumbnail */}
          <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-5 shadow-lg">
            <img src={content.thumbnail} alt={content.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {content.type === 'video' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 cursor-pointer hover:bg-white/30 transition-colors">
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </div>
                  <span className="text-white/80 text-sm">Clica para reproduzir</span>
                </>
              )}
              {content.type === 'podcast' && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-72 text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#5C8A6E' }}>
                    <Headphones size={28} className="text-white" />
                  </div>
                  <p className="text-white font-medium text-sm mb-3">{content.title}</p>
                  <div className="flex items-center justify-center gap-4">
                    <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                      <Play size={16} fill="white" />
                    </button>
                  </div>
                  <div className="mt-3 h-1 bg-white/20 rounded-full">
                    <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: '#C9A84C' }} />
                  </div>
                  <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>12:34</span><span>{content.duration}</span>
                  </div>
                </div>
              )}
              {content.type === 'article' && (
                <div className="flex flex-col items-center">
                  <FileText size={40} className="text-white/60 mb-2" />
                  <span className="text-white/70 text-sm">Artigo — {content.duration} de leitura</span>
                </div>
              )}
            </div>
            {content.isJindungo && (
              <div className="absolute top-3 left-3">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#D64E12' }}>
                  <Flame size={11} /> Jindungo
                </span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs">
              <Clock size={11} /> {content.duration}
            </div>
          </div>

          {/* Title and meta */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                <TypeIcon size={11} /> {typeLabel}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {content.category}
              </span>
              {content.isJindungo && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#D64E12' }}>
                  <Flame size={11} /> Jindungo
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl text-gray-900 leading-snug mb-3">{content.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Eye size={14} /> {formatViews(content.views)} visualizações</span>
              <span className="flex items-center gap-1"><Heart size={14} /> {formatViews(content.likes + (liked ? 1 : 0))} gostos</span>
              <span>{formatDate(content.publishedAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
            <button
              onClick={() => { if (!isLoggedIn) { openLogin(); return; } setLiked(!liked); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
              style={liked
                ? { backgroundColor: '#F5E8EB', color: '#7B1D2D' }
                : { backgroundColor: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }
              }
            >
              <ThumbsUp size={16} fill={liked ? '#7B1D2D' : 'none'} /> Gostei
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
              style={isSaved
                ? { backgroundColor: '#F5E8EB', color: '#7B1D2D' }
                : { backgroundColor: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }
              }
            >
              <Bookmark size={16} fill={isSaved ? '#7B1D2D' : 'none'} /> {isSaved ? 'Guardado' : 'Guardar'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-white text-gray-600 transition-all hover:bg-gray-50" style={{ border: '1px solid #E5E7EB' }}>
              <Share2 size={16} /> Partilhar
            </button>
          </div>

          {/* Author card */}
          {author && (
            <div className="flex items-start gap-4 bg-white rounded-2xl p-4 mb-6 shadow-sm">
              <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{author.name}</div>
                    <div className="text-xs text-gray-500">{author.specialty} · {formatViews(author.subscribers)} subscritores</div>
                  </div>
                  <button
                    onClick={handleSubscribe}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={isSubscribed
                      ? { backgroundColor: '#F5E8EB', color: '#7B1D2D' }
                      : { backgroundColor: '#7B1D2D', color: 'white' }
                    }
                  >
                    {isSubscribed ? <><BellOff size={14} /> Subscrito</> : <><Bell size={14} /> Subscrever</>}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{author.bio}</p>
              </div>
            </div>
          )}

          {/* Jindungo gate for non-subscribers */}
          {isJindungoLocked && (
            <div
              className="rounded-2xl overflow-hidden mb-6 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #5C1520 0%, #7B1D2D 50%, #9E2A3E 100%)' }}
            >
              <div className="relative p-8 text-center">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: '#C9A84C', transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full opacity-10" style={{ background: '#C9A84C', transform: 'translate(-30%, 30%)' }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)' }}>
                      <Flame size={22} style={{ color: '#C9A84C' }} />
                    </div>
                  </div>
                  <h3 className="text-white text-lg mb-2">Conteúdo Jindungo — Exclusivo para Subscritores</h3>
                  <p className="text-white/70 text-sm mb-2 max-w-md mx-auto">
                    Este conteúdo em destaque está reservado para subscritores de <strong className="text-white/90">{author?.name}</strong>.
                    Subscreve gratuitamente para aceder.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mb-6 text-xs" style={{ color: 'rgba(201,168,76,0.9)' }}>
                    <Star size={12} fill="currentColor" />
                    <span>Acesso imediato após subscrição</span>
                    <Star size={12} fill="currentColor" />
                  </div>
                  {isLoggedIn ? (
                    <button
                      onClick={handleSubscribe}
                      className="px-8 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105"
                      style={{ backgroundColor: '#C9A84C', color: 'white' }}
                    >
                      Subscrever {author?.name}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={openLogin}
                        className="px-8 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105"
                        style={{ backgroundColor: '#C9A84C', color: 'white' }}
                      >
                        Entrar e Subscrever
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Sobre este conteúdo</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{content.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {content.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Article content */}
          {!isJindungoLocked && content.type === 'article' && (
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Conteúdo do Artigo</h3>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-3">
                {content.content.split('\n\n').map((para, i) => (
                  <p key={i} className={para.startsWith('**') ? 'font-semibold text-gray-900' : ''}
                    dangerouslySetInnerHTML={{
                      __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comments section */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={16} style={{ color: '#7B1D2D' }} />
              Comentários ({comments.length})
            </h3>

            {isLoggedIn ? (
              <form onSubmit={handleComment} className="flex gap-3 mb-6">
                <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Adiciona um comentário..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all"
                      style={{ backgroundColor: '#7B1D2D' }}
                    >
                      <Send size={14} /> Comentar
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div
                className="flex items-center justify-between p-4 rounded-2xl mb-6"
                style={{ backgroundColor: '#F5E8EB' }}
              >
                <div className="flex items-center gap-2 text-sm" style={{ color: '#7B1D2D' }}>
                  <Lock size={16} />
                  <span>Entra para comentar e participar no debate</span>
                </div>
                <button
                  onClick={openLogin}
                  className="px-4 py-1.5 rounded-full text-sm text-white font-medium"
                  style={{ backgroundColor: '#7B1D2D' }}
                >
                  Entrar
                </button>
              </div>
            )}

            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{c.user}</span>
                      <span className="text-xs text-gray-400">{formatDate(c.date)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
                    <button className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      <ThumbsUp size={12} /> {c.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar — related content */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Conteúdos Relacionados</h3>
            <div className="space-y-1">
              {related.map(c => (
                <ContentCard key={c.id} content={c} variant="horizontal" />
              ))}
            </div>

            <div className="mt-6">
              <Link
                to="/quiz"
                className="flex items-center justify-between p-4 rounded-2xl text-white"
                style={{ background: 'linear-gradient(135deg, #7B1D2D, #9E2A3E)' }}
              >
                <div>
                  <div className="font-semibold text-sm">Quiz Relacionado</div>
                  <div className="text-xs text-white/80 mt-0.5">Testa os teus conhecimentos</div>
                </div>
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
