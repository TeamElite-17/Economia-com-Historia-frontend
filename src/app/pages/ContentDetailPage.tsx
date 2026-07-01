import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  Play, FileText, Headphones, Eye, Heart, Bookmark, Share2, Bell, BellOff,
  Lock, MessageSquare, Send, Clock, ChevronRight, Flame, ThumbsUp, Star, Check
} from 'lucide-react';
import { CONTENT_ITEMS, AUTHORS, MOCK_USERS, getAuthorById, formatViews, formatDate } from '../data/mockData';
import { ContentCard } from '../components/ui/ContentCard';
import { MediaPlayer } from '../components/ui/MediaPlayer';
import { AiSummaryPanel } from '../components/ui/AiSummaryPanel';
import { useAuth } from '../context/AuthContext';
import {
  getContentStatsBackend,
  toggleContentLikeBackend,
  registerContentViewBackend,
  getCommentsByContentItemBackend,
  createContentCommentBackend,
  type ContentCommentResponse,
} from '../data/backendApi';

interface LocalComment {
  id: string;
  text: string;
  user: string;
  avatar: string;
  date: string;
  likes: number;
}

function mapBackendComment(c: ContentCommentResponse): LocalComment {
  return {
    id: c.commentId,
    text: c.content,
    user: c.userName || 'Utilizador',
    avatar: c.userAvatar
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.userName || 'U')}&background=7B1D2D&color=fff&size=200`,
    date: c.commentedAt ? c.commentedAt.split('T')[0] : new Date().toISOString().split('T')[0],
    likes: 0,
  };
}

export function ContentDetailPage() {
  const { id } = useParams();
  const { isLoggedIn, user, openLogin, subscribeToAuthor, unsubscribeFromAuthor, saveContent, unsaveContent, addToHistory, getSubscriptionNotifPref, setSubscriptionNotifPref } = useAuth();

  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);

  const [commentLoading, setCommentLoading] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const viewRegistered = useRef(false);

  const content = CONTENT_ITEMS.find(c => c.id === id);

  // Carrega estatísticas (likes) e estado do like do utilizador
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getContentStatsBackend(id)
      .then((stats) => {
        if (cancelled) return;
        setLikeCount(stats.likeCount ?? 0);
        if (stats.likedByCurrentUser !== null) {
          setLiked(stats.likedByCurrentUser ?? false);
        }
        setStatsLoaded(true);
      })
      .catch(() => {
        setStatsLoaded(true);
      });

    return () => { cancelled = true; };
  }, [id]);

  // Carrega comentários da BD
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getCommentsByContentItemBackend(id)
      .then((backendComments) => {
        if (cancelled) return;
        setComments(backendComments.map(mapBackendComment));
        setCommentsLoaded(true);
      })
      .catch(() => {
        setCommentsLoaded(true);
      });

    return () => { cancelled = true; };
  }, [id]);

  // Regista visualização (uma vez por montagem)
  useEffect(() => {
    if (!id || viewRegistered.current) return;
    viewRegistered.current = true;
    registerContentViewBackend(id).catch(() => undefined);
  }, [id]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    if (!showNotifMenu) return;
    const handler = (e: MouseEvent) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifMenu]);

  // Adiciona ao histórico do utilizador
  useEffect(() => {
    if (!isLoggedIn || !id) return;
    addToHistory(id);
  }, [addToHistory, id, isLoggedIn]);

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

  const authorFromList = getAuthorById(content.authorId);
  // Fallback: constrói um autor básico a partir de MOCK_USERS se não estiver em AUTHORS ainda
  const authorFromUsers = !authorFromList && content.authorId
    ? (() => {
        const u = MOCK_USERS.find(u => u.id === content.authorId);
        if (!u) return undefined;
        return {
          id: u.id,
          name: u.name,
          avatar: u.avatar,
          bio: u.bio || '',
          subscribers: 0,
          specialty: 'Escritor / Professor',
          institution: 'ISPTEC',
        };
      })()
    : undefined;
  const author = authorFromList ?? authorFromUsers;
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

  const handleLike = async () => {
    if (!isLoggedIn) { openLogin(); return; }
    if (likeLoading) return;
    setLikeLoading(true);

    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const result = await toggleContentLikeBackend(content.id);
      // Sincroniza com resposta real do backend
      setLiked(result.liked);
      // Recarrega contagem real
      getContentStatsBackend(content.id)
        .then(stats => setLikeCount(stats.likeCount ?? 0))
        .catch(() => undefined);
    } catch {
      // Reverte em caso de erro
      setLiked(!newLiked);
      setLikeCount(prev => newLiked ? Math.max(0, prev - 1) : prev + 1);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || commentLoading) return;
    setCommentLoading(true);

    // Optimistic update
    const draft: LocalComment = {
      id: `draft-${Date.now()}`,
      text: comment,
      user: user!.name,
      avatar: user!.avatar,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    };
    setComments(prev => [draft, ...prev]);
    setComment('');

    try {
      const created = await createContentCommentBackend({
        contentItemId: content.id,
        content: draft.text,
        userId: user!.id,
      });
      // Substitui o rascunho pelo comentário real com ID da BD
      setComments(prev => prev.map(c =>
        c.id === draft.id ? mapBackendComment(created) : c
      ));
    } catch {
      // Mantém o comentário local em memória (não guardado na BD, mas visível na sessão)
    } finally {
      setCommentLoading(false);
    }
  };

  const TypeIcon = content.type === 'video' ? Play : content.type === 'article' ? FileText : Headphones;
  const typeLabel = content.type === 'video' ? 'Vídeo' : content.type === 'article' ? 'Artigo' : 'Podcast';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Media player / Thumbnail */}
          <div className="relative mb-5 shadow-lg">
            {!isJindungoLocked ? (
              <>
                {content.type === 'video' && content.content && (
                  <MediaPlayer
                    src={content.content}
                    type="video"
                    title={content.title}
                    poster={content.thumbnail}
                  />
                )}
                {content.type === 'podcast' && content.content && (
                  <MediaPlayer
                    src={content.content}
                    type="audio"
                    title={content.title}
                    poster={content.thumbnail}
                  />
                )}
                {content.type === 'article' && (
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
                    <img src={content.thumbnail} alt={content.title} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <FileText size={40} className="text-white/60 mb-2" />
                      <span className="text-white/70 text-sm">Artigo — {content.duration} de leitura</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center flex-col gap-3">
                <Lock size={40} className="text-white/60" />
                <p className="text-white/70 text-sm">Conteúdo exclusivo para subscritores</p>
              </div>
            )}
            {content.isJindungo && (
              <div className="absolute top-3 left-3 z-10">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#D64E12' }}>
                  <Flame size={11} /> Jindungo
                </span>
              </div>
            )}
            {(content.type === 'video' || content.type === 'podcast') && (
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs">
                <Clock size={11} /> {content.duration}
              </div>
            )}
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
              <span className="flex items-center gap-1">
                <Heart size={14} />
                {statsLoaded ? formatViews(likeCount) : formatViews(content.likes)} gostos
              </span>
              <span>{formatDate(content.publishedAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
            <button
              id="like-button"
              onClick={handleLike}
              disabled={likeLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
              style={liked
                ? { backgroundColor: '#F5E8EB', color: '#7B1D2D' }
                : { backgroundColor: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }
              }
            >
              <ThumbsUp size={16} fill={liked ? '#7B1D2D' : 'none'} />
              {liked ? 'Gostei' : 'Gostei'} {statsLoaded && likeCount > 0 ? `(${likeCount})` : ''}
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

            {/* AI Summary icon button — posicionado no extremo direito */}
            {!isJindungoLocked && (
              <div style={{ marginLeft: 'auto' }}>
                <AiSummaryPanel
                  contentType={content.type}
                  title={content.title}
                  description={content.description}
                  body={content.type === 'article' ? content.content : undefined}
                  mediaUrl={content.type !== 'article' ? content.content : undefined}
                />
              </div>
            )}
          </div>

          {/* Author card — estilo YouTube */}
          {author && (
            <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
              {/* Linha principal: avatar + info + acções */}
              <div className="flex items-center gap-4">
                {/* Avatar com borda de cor */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-full p-0.5"
                    style={{ background: 'linear-gradient(135deg, #7B1D2D, #C9A84C)' }}
                  >
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>
                </div>

                {/* Nome e subscritores */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-base leading-tight">{author.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {author.specialty} · <span className="font-medium text-gray-700">{formatViews(author.subscribers)}</span> subscritores
                  </div>
                </div>

                {/* Botões Subscrever + Notificações */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isSubscribed ? (
                    <>
                      {/* Botão "Subscrito" */}
                      <button
                        id="author-subscribe-button"
                        onClick={handleSubscribe}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:bg-gray-200"
                        style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Subscrito
                      </button>
                      {/* Botão de notificações com dropdown */}
                      <div className="relative" ref={notifMenuRef}>
                        <button
                          id="author-notification-button"
                          onClick={() => setShowNotifMenu(v => !v)}
                          className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-gray-200"
                          style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                          title="Gerir notificações"
                        >
                          {getSubscriptionNotifPref(content.authorId) === 'NONE'
                            ? <BellOff size={16} />
                            : <Bell size={16} fill="#374151" />}
                        </button>
                        {showNotifMenu && (
                          <div
                            className="absolute right-0 top-11 z-50 bg-white rounded-2xl shadow-xl border overflow-hidden"
                            style={{ minWidth: 220, borderColor: 'rgba(0,0,0,0.08)' }}
                          >
                            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notificações</p>
                            </div>
                            {[
                              { pref: 'ALL' as const, label: 'Todas', icon: <Bell size={15} />, desc: 'Receber todas as notificações' },
                              { pref: 'NONE' as const, label: 'Nenhuma', icon: <BellOff size={15} />, desc: 'Não receber notificações' },
                            ].map(({ pref, label, icon, desc }) => {
                              const active = getSubscriptionNotifPref(content.authorId) === pref;
                              return (
                                <button
                                  key={pref}
                                  onClick={() => { setSubscriptionNotifPref(content.authorId, pref); setShowNotifMenu(false); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                                >
                                  <span style={{ color: active ? '#7B1D2D' : '#6B7280' }}>{icon}</span>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">{label}</div>
                                    <div className="text-xs text-gray-400">{desc}</div>
                                  </div>
                                  {active && <Check size={14} style={{ color: '#7B1D2D' }} />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <button
                      id="author-subscribe-button"
                      onClick={handleSubscribe}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
                      style={{ backgroundColor: '#7B1D2D', color: 'white', boxShadow: '0 2px 10px rgba(123,29,45,0.3)' }}
                    >
                      <Bell size={15} />
                      Subscrever
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              {author.bio && (
                <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-2 pl-[4.5rem]">{author.bio}</p>
              )}
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
              <div className="editor-content prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.content }} />
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
                    id="comment-input"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Adiciona um comentário..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: 'rgba(123,29,45,0.2)' }}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      id="submit-comment-button"
                      type="submit"
                      disabled={commentLoading || !comment.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all disabled:opacity-50"
                      style={{ backgroundColor: '#7B1D2D' }}
                    >
                      <Send size={14} /> {commentLoading ? 'A guardar...' : 'Comentar'}
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

            {/* Lista de comentários */}
            {!commentsLoaded ? (
              <div className="flex items-center justify-center py-6 text-gray-400 text-sm">
                <span>A carregar comentários...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Ainda não há comentários. Sê o primeiro a comentar.</p>
              </div>
            ) : (
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
            )}
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
