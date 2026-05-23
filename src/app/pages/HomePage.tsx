import { useState } from 'react';
import { Link } from 'react-router';
import { Flame, BookOpen, Play, ArrowRight, Users, Award, MessageSquare, Star, HelpCircle, Map, ChevronRight } from 'lucide-react';
import { CONTENT_ITEMS, CATEGORIES, AUTHORS, QUIZZES, formatViews } from '../data/mockData';
import { ContentCard } from '../components/ui/ContentCard';
import { useAuth } from '../context/AuthContext';

// Angola provinces data for the stylized map
const ANGOLA_PROVINCES = [
  { name: 'Luanda', x: 22, y: 42, size: 'lg', desc: 'Capital e maior cidade' },
  { name: 'Benguela', x: 18, y: 56, size: 'md', desc: 'Porto principal' },
  { name: 'Huambo', x: 32, y: 54, size: 'md', desc: 'Planalto Central' },
  { name: 'Huíla', x: 30, y: 68, size: 'sm', desc: 'Sul do país' },
  { name: 'Bié', x: 42, y: 52, size: 'sm', desc: 'Região central' },
  { name: 'Malanje', x: 42, y: 35, size: 'sm', desc: 'Norte interior' },
  { name: 'Uíge', x: 33, y: 23, size: 'sm', desc: 'Café e cacau' },
  { name: 'Cabinda', x: 17, y: 10, size: 'sm', desc: 'Petróleo' },
  { name: 'Lunda Norte', x: 58, y: 28, size: 'sm', desc: 'Diamantes' },
  { name: 'Namibe', x: 18, y: 76, size: 'sm', desc: 'Deserto do Namibe' },
  { name: 'Cuando Cubango', x: 55, y: 70, size: 'sm', desc: 'Okavango' },
  { name: 'Moxico', x: 62, y: 55, size: 'sm', desc: 'Maior província' },
];

export function HomePage() {
  const { isLoggedIn, openRegister } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const featuredContent = CONTENT_ITEMS.find(c => c.featured && c.isJindungo) || CONTENT_ITEMS[0];
  const jindungoContent = CONTENT_ITEMS.filter(c => c.isJindungo);
  const filteredContent = activeCategory === 'Todos'
    ? CONTENT_ITEMS.filter(c => c.status === 'published')
    : CONTENT_ITEMS.filter(c => c.category === activeCategory && c.status === 'published');

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative h-[380px] sm:h-[420px] md:h-[500px] overflow-hidden">
        <img
          src={featuredContent.thumbnail}
          alt={featuredContent.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(92,21,32,0.97) 0%, rgba(92,21,32,0.75) 55%, rgba(92,21,32,0.25) 100%)' }}
        />
        <div className="relative z-10 h-full flex items-center px-4 sm:px-6 md:px-10">
          <div className="max-w-xl">
            {featuredContent.isJindungo && (
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#D64E12' }}>
                  <Flame size={12} /> <span className="hidden sm:inline">Jindungo — Conteúdo em Destaque</span><span className="sm:hidden">Jindungo</span>
                </span>
              </div>
            )}
            <h1 className="text-white text-xl sm:text-2xl md:text-4xl leading-tight mb-2 sm:mb-3">
              {featuredContent.title}
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-4 sm:mb-6 line-clamp-2">
              {featuredContent.description}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to={`/conteudo/${featuredContent.id}`}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: '#C9A84C' }}
              >
                <Play size={16} fill="white" /> Ver Agora
              </Link>
              <Link
                to="/explorar"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white border border-white/40 hover:bg-white/10 transition-all"
              >
                Explorar <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 max-w-7xl mx-auto">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {[
            { icon: BookOpen, label: 'Conteúdos', value: `${CONTENT_ITEMS.length}+`, color: '#7B1D2D' },
            { icon: Users, label: 'Utilizadores', value: '24K', color: '#C9A84C' },
            { icon: Award, label: 'Quizzes', value: QUIZZES.length.toString(), color: '#D64E12' },
            { icon: MessageSquare, label: 'Debates', value: '38', color: '#5C8A6E' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: '#1C1917' }}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Jindungo Section */}
        <section className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D64E12' }}>
                <Flame size={16} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base sm:text-lg">Jindungo</h2>
                <p className="text-xs text-gray-500 hidden sm:block">Os conteúdos mais quentes — exclusivos para subscritores</p>
              </div>
            </div>
            <Link
              to="/explorar?filter=jindungo"
              className="flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
              style={{ color: '#7B1D2D' }}
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {jindungoContent.slice(0, 4).map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </section>

        {/* Category filter + Content Grid */}
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="font-bold text-gray-900 text-base sm:text-lg">Explorar por Tema</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
            {CATEGORIES.slice(0, 8).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={activeCategory === cat
                  ? { backgroundColor: '#7B1D2D', color: 'white' }
                  : { backgroundColor: 'white', color: '#374151', border: '1px solid rgba(123,29,45,0.15)' }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredContent.slice(0, 8).map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              to="/explorar"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ backgroundColor: '#7B1D2D' }}
            >
              Ver todos os conteúdos <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Angola Map Section */}
        <section className="mb-8 sm:mb-10">
          <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
            <div className="flex flex-col lg:flex-row">
              {/* Map */}
              <div className="flex-1 relative p-6 sm:p-8 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F8F4F1 0%, #F0EBE8 100%)', minHeight: '320px' }}>
                {/* Decorative background */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #7B1D2D 0%, transparent 70%)' }} />

                {/* Map title */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Map size={16} style={{ color: '#7B1D2D' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7B1D2D' }}>Angola — Províncias</span>
                </div>

                {/* Simplified Angola SVG outline */}
                <div className="relative w-full max-w-xs aspect-square">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    {/* Simplified Angola shape */}
                    <path
                      d="M 20 15 L 28 12 L 35 10 L 45 8 L 55 10 L 65 15 L 72 22 L 75 32 L 78 42 L 75 52 L 70 62 L 65 72 L 58 80 L 50 88 L 40 85 L 32 80 L 24 72 L 18 62 L 14 50 L 12 40 L 14 28 Z"
                      fill="rgba(123,29,45,0.06)"
                      stroke="rgba(123,29,45,0.2)"
                      strokeWidth="1"
                    />
                    {/* Cabinda exclave (separate box north) */}
                    <rect x="13" y="5" width="8" height="8" rx="1" fill="rgba(123,29,45,0.06)" stroke="rgba(123,29,45,0.2)" strokeWidth="1" />
                    <line x1="17" y1="13" x2="20" y2="15" stroke="rgba(123,29,45,0.15)" strokeWidth="0.5" strokeDasharray="1,1" />
                  </svg>

                  {/* Province dots */}
                  {ANGOLA_PROVINCES.map(p => (
                    <button
                      key={p.name}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      onMouseEnter={() => setHoveredProvince(p.name)}
                      onMouseLeave={() => setHoveredProvince(null)}
                    >
                      <div
                        className="rounded-full border-2 border-white shadow-md transition-all duration-200"
                        style={{
                          width: p.size === 'lg' ? 16 : p.size === 'md' ? 12 : 9,
                          height: p.size === 'lg' ? 16 : p.size === 'md' ? 12 : 9,
                          backgroundColor: hoveredProvince === p.name ? '#C9A84C' : '#7B1D2D',
                          transform: hoveredProvince === p.name ? 'scale(1.4)' : 'scale(1)',
                        }}
                      />
                      {(p.size === 'lg' || p.size === 'md' || hoveredProvince === p.name) && (
                        <div
                          className="absolute left-full ml-1.5 whitespace-nowrap text-xs font-semibold pointer-events-none"
                          style={{ color: hoveredProvince === p.name ? '#C9A84C' : '#7B1D2D', top: '50%', transform: 'translateY(-50%)' }}
                        >
                          {p.name}
                        </div>
                      )}
                      {hoveredProvince === p.name && (
                        <div
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs text-white whitespace-nowrap z-10 shadow-lg"
                          style={{ backgroundColor: '#7B1D2D' }}
                        >
                          {p.desc}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info panel */}
              <div className="lg:w-72 p-5 sm:p-6 flex flex-col justify-center border-t lg:border-t-0 lg:border-l" style={{ borderColor: 'rgba(123,29,45,0.08)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#F5E8EB' }}>
                  <Map size={16} style={{ color: '#7B1D2D' }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Angola em Números</h3>
                <p className="text-sm text-gray-500 mb-5">18 províncias, mais de 33 milhões de habitantes e uma história económica rica e complexa.</p>

                <div className="space-y-3 mb-6">
                  {[
                    { label: 'Províncias', value: '18', color: '#7B1D2D' },
                    { label: 'População estimada', value: '33M+', color: '#C9A84C' },
                    { label: '2.º produtor de petróleo em África', value: '90%+ exportações', color: '#D64E12' },
                    { label: 'Terra arável', value: '35M ha', color: '#5C8A6E' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(123,29,45,0.08)' }}>
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/explorar"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#7B1D2D' }}
                >
                  Explorar conteúdos <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <div className="text-center mb-8">
            <h2 className="font-bold text-gray-900 mb-2">Como funciona a plataforma</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">Aprende ao teu ritmo, testa os teus conhecimentos e participa na comunidade</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: BookOpen,
                title: 'Assiste e lê',
                desc: 'Acede a vídeos, artigos e podcasts sobre história económica de Angola. Sem registo para os conteúdos gratuitos.',
                color: '#7B1D2D',
                link: '/explorar',
                linkLabel: 'Explorar conteúdos',
              },
              {
                icon: HelpCircle,
                title: 'Faz os quizzes',
                desc: 'Testa os teus conhecimentos com quizzes interativos, recebe feedback imediato e sobe no ranking da comunidade.',
                color: '#C9A84C',
                link: '/quiz',
                linkLabel: 'Ver quizzes',
              },
              {
                icon: MessageSquare,
                title: 'Debate no fórum',
                desc: 'Participa em discussões abertas ou cria fóruns privados. Partilha perspetivas e aprende com outros utilizadores.',
                color: '#5C8A6E',
                link: '/forum',
                linkLabel: 'Entrar no fórum',
              },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: item.color + '15' }}>
                  <item.icon size={24} style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.desc}</p>
                <Link
                  to={item.link}
                  className="flex items-center gap-1.5 text-sm font-medium transition-all group-hover:gap-2"
                  style={{ color: item.color }}
                >
                  {item.linkLabel} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Authors section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Especialistas em Destaque</h2>
              <p className="text-sm text-gray-500">Subscreve os nossos professores e investigadores</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AUTHORS.map(author => (
              <div key={author.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-12 h-12 rounded-full object-cover border-2"
                    style={{ borderColor: '#F5E8EB' }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{author.name}</div>
                    <div className="text-xs text-gray-500 truncate">{author.specialty}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">{author.bio}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {formatViews(author.subscribers)} subs.
                  </span>
                  <span className="text-xs truncate max-w-[120px]" style={{ color: '#7B1D2D' }}>
                    {author.institution?.split(' ').slice(0, 3).join(' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Quiz CTA */}
        <section className="mb-10">
          <div
            className="rounded-3xl overflow-hidden shadow-sm"
            style={{ background: 'linear-gradient(135deg, #2E5C3E 0%, #5C8A6E 100%)' }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6 p-8">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                  <HelpCircle size={18} className="text-white" />
                  <span className="text-white font-semibold text-sm">Quiz em Destaque</span>
                </div>
                <h3 className="text-white text-xl mb-2">{QUIZZES[0].title}</h3>
                <p className="text-white/70 text-sm mb-4">{QUIZZES[0].description}</p>
                <div className="flex items-center gap-4 text-xs text-white/60 justify-center md:justify-start mb-5">
                  <span>{QUIZZES[0].questions.length} perguntas</span>
                  <span>{QUIZZES[0].estimatedTime}</span>
                  <span>{formatViews(QUIZZES[0].participants)} participantes</span>
                </div>
                <Link
                  to={`/quiz/${QUIZZES[0].id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: '#C9A84C', color: 'white' }}
                >
                  Fazer o quiz <ChevronRight size={16} />
                </Link>
              </div>
              <div className="relative w-32 h-32 flex-shrink-0">
                <img src={QUIZZES[0].thumbnail} alt="" className="w-full h-full object-cover rounded-2xl opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold text-white">{QUIZZES[0].questions.length}</div>
                </div>
                <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-white/80">perguntas</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        {!isLoggedIn && (
          <section
            className="rounded-3xl p-8 md:p-12 text-center mb-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7B1D2D 0%, #9E2A3E 50%, #5C1520 100%)' }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#C9A84C', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: '#C9A84C', transform: 'translate(-30%, 30%)' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star size={20} style={{ color: '#C9A84C' }} />
                <span className="text-white font-semibold">Totalmente Gratuito</span>
                <Star size={20} style={{ color: '#C9A84C' }} />
              </div>
              <h2 className="text-white text-2xl md:text-3xl mb-3">
                Aprende a história económica de Angola
              </h2>
              <p className="text-white/80 mb-6 max-w-md mx-auto text-sm">
                Junta-te a mais de 24.000 angolanos que já usam a plataforma para aprender, debater e crescer.
                Cria a tua conta e acede a quizzes, fóruns e muito mais.
              </p>
              <button
                onClick={openRegister}
                className="px-8 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105"
                style={{ backgroundColor: '#C9A84C', color: 'white' }}
              >
                Criar conta gratuita
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
