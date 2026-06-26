import { useParams, Navigate, Link } from 'react-router';
import { Users, FileText, MapPin, Eye, Heart, CheckCircle, Youtube, Instagram, Facebook, Globe, Bell, BellOff, Check } from 'lucide-react';
import { AUTHORS, CONTENT_ITEMS, formatViews, formatDate } from '../data/mockData';
import { ContentCard } from '../components/ui/ContentCard';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export function AuthorPage() {
  const { id } = useParams<{ id: string }>();
  const { user, updateUser, subscribeToAuthor, unsubscribeFromAuthor, getSubscriptionNotifPref, setSubscriptionNotifPref } = useAuth();
  
  const author = AUTHORS.find(a => a.id === id);
  const authorContents = CONTENT_ITEMS.filter(c => c.authorId === id && c.status === 'published');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  
  const isSubscribed = user?.subscriptions.includes(author?.id || '');

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

  if (!author) {
    return <Navigate to="/explorar" />;
  }

  const handleSubscribeToggle = async () => {
    if (!user) {
      alert('Inicia sessão para subscrever a este autor.');
      return;
    }
    try {
      setIsSubmitting(true);
      if (isSubscribed) {
        await unsubscribeFromAuthor(author.id);
        updateUser({ subscriptions: user.subscriptions.filter(s => s !== author.id) });
      } else {
        await subscribeToAuthor(author.id);
        updateUser({ subscriptions: [...user.subscriptions, author.id] });
      }
    } catch (err) {
      alert('Erro ao atualizar subscrição. Tenta novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-12 relative">
      {/* Background Banner */}
      <div className="absolute top-0 left-0 right-0 h-[380px] md:h-[320px] w-full z-0" style={{ backgroundColor: 'rgba(123, 29, 45, 0.04)' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 relative z-10">
        <div className="flex flex-col-reverse md:flex-row gap-12 mb-16">
          {/* Left Column: Info */}
          <div className="flex-1">
            <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
              {author.specialty}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{author.name}</h1>
            <p className="text-base text-gray-500 font-medium mb-6">
              @{author.name.replace(/\s+/g, '').toLowerCase()}
            </p>

            <div className="flex gap-8 mb-8">
              <div>
                <div className="text-xl font-bold text-gray-900">{formatViews(author.subscribers + (isSubscribed ? 1 : 0))}</div>
                <div className="text-sm text-gray-500">Subscritores</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{authorContents.length}</div>
                <div className="text-sm text-gray-500">Publicações</div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre mim</h2>
              <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line max-w-3xl">
                {author.bio || `Especialista em ${author.specialty} associado a ${author.institution}.`}
              </div>
            </div>
          </div>
          
          {/* Right Column: Avatar & Actions */}
          <div className="w-full md:w-80 flex-shrink-0 flex flex-col items-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm border w-full flex flex-col items-center" style={{ borderColor: 'rgba(123,29,45,0.1)' }}>
              <img 
                src={author.avatar} 
                alt={author.name} 
                className="w-40 h-40 rounded-full border border-gray-100 object-cover shadow-sm mb-6"
              />
              
              <div className="flex items-center gap-3 w-full justify-center mb-6">
                {author.websiteUrl && (
                  <a href={author.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border hover:bg-gray-50 transition-colors text-gray-600">
                    <Globe size={18} />
                  </a>
                )}
                {author.youtubeUrl && (
                  <a href={author.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border hover:bg-gray-50 transition-colors text-gray-600">
                    <Youtube size={18} />
                  </a>
                )}
                {author.instagramUrl && (
                  <a href={author.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border hover:bg-gray-50 transition-colors text-gray-600">
                    <Instagram size={18} />
                  </a>
                )}
                {author.facebookUrl && (
                  <a href={author.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border hover:bg-gray-50 transition-colors text-gray-600">
                    <Facebook size={18} />
                  </a>
                )}
              </div>

              <div className="flex w-full items-center gap-2">
                {isSubscribed ? (
                  <>
                    <button 
                      onClick={handleSubscribeToggle}
                      className="flex-1 flex justify-center items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:bg-gray-200"
                      style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Subscrito
                    </button>
                    <div className="relative" ref={notifMenuRef}>
                      <button
                        onClick={() => setShowNotifMenu(v => !v)}
                        className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-gray-200"
                        style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                        title="Gerir notificações"
                      >
                        {getSubscriptionNotifPref(author.id) === 'NONE'
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
                            const active = getSubscriptionNotifPref(author.id) === pref;
                            return (
                              <button
                                key={pref}
                                onClick={() => { setSubscriptionNotifPref(author.id, pref); setShowNotifMenu(false); }}
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
                    onClick={handleSubscribeToggle}
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: '#7B1D2D', color: 'white', boxShadow: '0 2px 10px rgba(123,29,45,0.3)' }}
                  >
                    <Bell size={15} />
                    Subscrever
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Minhas publicações ({authorContents.length})</h2>
          
          {authorContents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {authorContents.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F5E8EB' }}>
                <FileText size={28} style={{ color: '#7B1D2D' }} />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Sem publicações</h3>
              <p className="text-sm text-gray-500">Este autor ainda não publicou nenhum conteúdo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
