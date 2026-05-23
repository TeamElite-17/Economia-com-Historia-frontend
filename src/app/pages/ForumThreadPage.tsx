import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Heart, Eye, Pin, Send, Lock, MessageSquare, ThumbsUp, Globe, UserCheck, Clock } from 'lucide-react';
import { FORUM_POSTS, getUserById, formatDate, formatViews } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export function ForumThreadPage() {
  const { id } = useParams();
  const { isLoggedIn, user, openLogin } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(() => {
    const post = FORUM_POSTS.find(p => p.id === id);
    return post?.replies || [];
  });
  const [liked, setLiked] = useState(false);
  const [accessRequested, setAccessRequested] = useState(false);

  const post = FORUM_POSTS.find(p => p.id === id);
  if (!post) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-gray-700 mb-2">Tópico não encontrado</h2>
        <Link to="/forum" className="text-sm" style={{ color: '#7B1D2D' }}>Voltar ao fórum</Link>
      </div>
    </div>
  );

  const author = getUserById(post.authorId);
  const isOwner = user?.id === post.authorId;
  const isApproved = !post.isPrivate || isOwner || (user && post.approvedUsers.includes(user.id));
  const canComment = isLoggedIn && isApproved;

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplies(prev => [...prev, {
      id: Date.now().toString(),
      content: replyText,
      authorId: user!.id,
      publishedAt: new Date().toISOString().split('T')[0],
      likes: 0,
    }]);
    setReplyText('');
  };

  const handleRequestAccess = () => {
    if (!isLoggedIn) { openLogin(); return; }
    setAccessRequested(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/forum" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft size={16} /> Fórum de Discussão
      </Link>

      {/* Main post */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {post.isPinned && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F0E6C4', color: '#7A5C00' }}>
                <Pin size={10} /> Fixado
              </span>
            )}
            {post.isPrivate ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}>
                <Lock size={10} /> Fórum Privado
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                <Globe size={10} /> Fórum Aberto
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#EBF3EE', color: '#2E5C3E' }}>
              {post.category}
            </span>
            {post.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600">#{tag}</span>
            ))}
          </div>

          {/* Private banner for non-approved */}
          {post.isPrivate && !isApproved && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl mb-4"
              style={{ backgroundColor: '#F5E8EB' }}
            >
              <Lock size={18} style={{ color: '#7B1D2D' }} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#7B1D2D' }}>Fórum Privado</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Este tópico requer aprovação do criador para participar. Podes ler o conteúdo mas não podes comentar sem autorização.
                </p>
              </div>
            </div>
          )}

          {/* Private approved badge */}
          {post.isPrivate && isApproved && isLoggedIn && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-4"
              style={{ backgroundColor: '#EBF3EE' }}
            >
              <UserCheck size={15} style={{ color: '#2E5C3E' }} />
              <span className="text-xs font-medium" style={{ color: '#2E5C3E' }}>
                {isOwner ? 'Criaste este fórum privado' : 'Tens acesso aprovado a este fórum'}
              </span>
            </div>
          )}

          <h1 className="text-gray-900 mb-4" style={{ fontSize: '1.25rem', lineHeight: '1.4' }}>{post.title}</h1>

          {/* Author */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
            <img src={author?.avatar} alt={author?.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="font-semibold text-sm text-gray-900">{author?.name}</div>
              <div className="text-xs text-gray-500">{formatDate(post.publishedAt)}</div>
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Eye size={12} /> {formatViews(post.views)}</span>
              <span className="flex items-center gap-1"><Heart size={12} /> {post.likes + (liked ? 1 : 0)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="text-sm text-gray-700 leading-relaxed mb-5 space-y-3">
            {post.content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (!isLoggedIn) { openLogin(); return; } setLiked(!liked); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all"
              style={liked
                ? { backgroundColor: '#F5E8EB', color: '#7B1D2D' }
                : { backgroundColor: '#F8F4F1', color: '#6B7280' }
              }
            >
              <ThumbsUp size={15} fill={liked ? '#7B1D2D' : 'none'} />
              Gostei ({post.likes + (liked ? 1 : 0)})
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-600">
              <MessageSquare size={15} /> {replies.length} respostas
            </button>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare size={16} style={{ color: '#7B1D2D' }} />
          Respostas ({replies.length})
        </h3>
        {replies.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Ainda não há respostas. Sê o primeiro a comentar.</p>
          </div>
        )}
        <div className="space-y-3">
          {replies.map(reply => {
            const replyAuthor = getUserById(reply.authorId);
            const displayName = replyAuthor?.name || 'Utilizador';
            const displayAvatar = replyAuthor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7B1D2D&color=fff&size=200`;
            return (
              <div key={reply.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <img src={displayAvatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">{displayName}</div>
                    <div className="text-xs text-gray-400">{formatDate(reply.publishedAt)}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{reply.content}</p>
                <button
                  onClick={() => !isLoggedIn && openLogin()}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ThumbsUp size={12} /> {reply.likes} gostos
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Adicionar resposta</h3>

        {canComment ? (
          <form onSubmit={handleReply} className="flex gap-3">
            <img src={user?.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1" />
            <div className="flex-1">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Escreve a tua resposta..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'rgba(123,29,45,0.2)' }}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm text-white font-medium"
                  style={{ backgroundColor: '#7B1D2D' }}
                >
                  <Send size={14} /> Responder
                </button>
              </div>
            </div>
          </form>
        ) : !isLoggedIn ? (
          <div className="flex items-center justify-between p-4 rounded-2xl" style={{ backgroundColor: '#F5E8EB' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7B1D2D' }}>
              <Lock size={16} />
              <span>Entra para participar na discussão</span>
            </div>
            <button onClick={openLogin} className="px-4 py-1.5 rounded-full text-sm text-white" style={{ backgroundColor: '#7B1D2D' }}>
              Entrar
            </button>
          </div>
        ) : post.isPrivate && !isApproved ? (
          <div className="flex flex-col items-center text-center p-6 rounded-2xl" style={{ backgroundColor: '#F5E8EB' }}>
            <Lock size={24} className="mb-3" style={{ color: '#7B1D2D' }} />
            <p className="font-semibold text-gray-900 text-sm mb-1">Fórum Privado</p>
            <p className="text-xs text-gray-600 mb-4">
              Este fórum requer aprovação do criador ({author?.name}) para poderes comentar.
            </p>
            {accessRequested ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm" style={{ backgroundColor: '#EBF3EE', color: '#2E5C3E' }}>
                <Clock size={14} />
                Pedido de acesso enviado — aguarda aprovação
              </div>
            ) : (
              <button
                onClick={handleRequestAccess}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm text-white font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: '#7B1D2D' }}
              >
                <UserCheck size={14} /> Solicitar acesso
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
