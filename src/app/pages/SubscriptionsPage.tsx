import { Link } from 'react-router';
import { Bell, BellOff, Lock, Users, Play, FileText, Headphones } from 'lucide-react';
import { AUTHORS, CONTENT_ITEMS, formatViews } from '../data/mockData';
import { ContentCard } from '../components/ui/ContentCard';
import { useAuth } from '../context/AuthContext';

export function SubscriptionsPage() {
  const { isLoggedIn, user, openLogin, unsubscribeFromAuthor } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F5E8EB' }}>
            <Bell size={32} style={{ color: '#7B1D2D' }} />
          </div>
          <h2 className="text-gray-900 mb-2">Subscrições</h2>
          <p className="text-sm text-gray-500 mb-6">
            Subscreve os teus especialistas favoritos e recebe notificações quando publicam novos conteúdos.
            Funciona como o YouTube — gratuito e sem publicidade.
          </p>
          <button onClick={openLogin} className="px-8 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#7B1D2D' }}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const subscribedAuthors = AUTHORS.filter(a => user?.subscriptions.includes(a.id));
  const feedContent = CONTENT_ITEMS
    .filter(c => user?.subscriptions.includes(c.authorId))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#7B1D2D' }}>
          <Bell size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '1.5rem' }}>Subscrições</h1>
          <p className="text-sm text-gray-500">{subscribedAuthors.length} autor{subscribedAuthors.length !== 1 ? 'es' : ''} subscrito{subscribedAuthors.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {subscribedAuthors.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F5E8EB' }}>
            <Users size={28} style={{ color: '#7B1D2D' }} />
          </div>
          <h3 className="font-semibold text-gray-700 mb-2">Ainda não subscreveste nenhum autor</h3>
          <p className="text-sm text-gray-500 mb-6">Explora o conteúdo e subscreve os especialistas que mais gostas</p>
          <Link to="/explorar" className="px-8 py-3 rounded-full text-sm text-white font-medium inline-block" style={{ backgroundColor: '#7B1D2D' }}>
            Explorar autores
          </Link>
        </div>
      ) : (
        <>
          {/* Subscribed authors */}
          <section className="mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Autores que segues</h2>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
              {subscribedAuthors.map(author => (
                <div key={author.id} className="flex-shrink-0 bg-white rounded-2xl p-4 w-52 shadow-sm">
                  <div className="text-center mb-3">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2"
                      style={{ borderColor: '#F5E8EB' }}
                    />
                    <div className="font-semibold text-sm text-gray-900 leading-tight">{author.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{author.specialty}</div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                      <Users size={10} /> {formatViews(author.subscribers)} subscritores
                    </div>
                  </div>
                  <button
                    onClick={() => unsubscribeFromAuthor(author.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}
                  >
                    <BellOff size={12} /> Cancelar
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Recent from subscriptions */}
          <section>
            <h2 className="font-semibold text-gray-900 mb-4">
              Conteúdos recentes dos teus autores
            </h2>
            {feedContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {feedContent.map(content => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">Nenhum conteúdo disponível dos teus autores</p>
              </div>
            )}
          </section>

          {/* Discover more authors */}
          <section className="mt-10">
            <h2 className="font-semibold text-gray-900 mb-4">Descobre mais autores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AUTHORS.filter(a => !user?.subscriptions.includes(a.id)).map(author => {
                const authorContent = CONTENT_ITEMS.filter(c => c.authorId === author.id);
                const typeCount = {
                  video: authorContent.filter(c => c.type === 'video').length,
                  article: authorContent.filter(c => c.type === 'article').length,
                  podcast: authorContent.filter(c => c.type === 'podcast').length,
                };
                return (
                  <div key={author.id} className="bg-white rounded-2xl p-5 shadow-sm flex gap-4">
                    <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">{author.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{author.institution}</div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        {typeCount.video > 0 && <span className="flex items-center gap-1"><Play size={10} /> {typeCount.video}</span>}
                        {typeCount.article > 0 && <span className="flex items-center gap-1"><FileText size={10} /> {typeCount.article}</span>}
                        {typeCount.podcast > 0 && <span className="flex items-center gap-1"><Headphones size={10} /> {typeCount.podcast}</span>}
                        <span className="flex items-center gap-1"><Users size={10} /> {formatViews(author.subscribers)}</span>
                      </div>
                      <Link
                        to={`/explorar`}
                        className="flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: '#7B1D2D' }}
                      >
                        <Bell size={11} /> Ver conteúdos
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
