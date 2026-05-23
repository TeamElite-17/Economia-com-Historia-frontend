import { Link } from 'react-router';
import { Play, FileText, Headphones, Eye, Heart, Clock, Flame, Lock } from 'lucide-react';
import { ContentItem, getAuthorById, formatViews, formatDate } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface ContentCardProps {
  content: ContentItem;
  variant?: 'default' | 'horizontal' | 'compact';
}

const TYPE_CONFIG = {
  video: { icon: Play, label: 'Vídeo', color: '#7B1D2D', bg: '#F5E8EB' },
  article: { icon: FileText, label: 'Artigo', color: '#4A6FA5', bg: '#EBF0F8' },
  podcast: { icon: Headphones, label: 'Podcast', color: '#5C8A6E', bg: '#EBF3EE' },
};

export function ContentCard({ content, variant = 'default' }: ContentCardProps) {
  let user = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const auth = useAuth();
    user = auth.user;
  } catch {
    // Outside AuthProvider
  }
  const author = getAuthorById(content.authorId);
  const typeConf = TYPE_CONFIG[content.type];
  const TypeIcon = typeConf.icon;
  const isJindungoLocked = content.isJindungo && !user?.subscriptions.includes(content.authorId);

  if (variant === 'horizontal') {
    return (
      <Link to={`/conteudo/${content.id}`} className="flex gap-3 group p-2 rounded-xl hover:bg-white transition-all">
        <div className="relative w-36 h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <img src={content.thumbnail} alt={content.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-xs text-white font-medium bg-black/60">
            {content.duration}
          </div>
          <div className="absolute top-1 left-1">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: typeConf.color, color: 'white' }}>
              <TypeIcon size={10} />
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-[#7B1D2D] transition-colors">
            {content.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{author?.name}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Eye size={10} />{formatViews(content.views)}</span>
            <span>{formatDate(content.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/conteudo/${content.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all group">
        <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: typeConf.bg }}>
          <TypeIcon size={18} style={{ color: typeConf.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#7B1D2D] transition-colors">{content.title}</p>
          <p className="text-xs text-gray-500">{content.duration} · {author?.name?.split(' ')[0]}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/conteudo/${content.id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={content.thumbnail}
          alt={content.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: typeConf.color }}>
            <TypeIcon size={11} />
            {typeConf.label}
          </span>
        </div>

        {/* Jindungo badge */}
        {content.isJindungo && (
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#D64E12' }}>
              <Flame size={10} /> Jindungo
            </span>
            {isJindungoLocked && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <Lock size={9} /> Subscritores
              </span>
            )}
          </div>
        )}

        {/* Duration */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs text-white font-medium bg-black/70">
          <span className="flex items-center gap-1">
            <Clock size={10} /> {content.duration}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3.5">
        {/* Category */}
        <span
          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2"
          style={{ backgroundColor: '#F5E8EB', color: '#7B1D2D' }}
        >
          {content.category}
        </span>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-[#7B1D2D] transition-colors">
          {content.title}
        </h3>

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={author?.avatar}
            alt={author?.name}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs text-gray-500 truncate">{author?.name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye size={12} /> {formatViews(content.views)}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} /> {formatViews(content.likes)}
          </span>
          <span className="ml-auto">{formatDate(content.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
