import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Fullscreen, SkipBack, SkipForward } from 'lucide-react';
import { resolveMediaUrl } from '../../data/backendApi';

interface MediaPlayerProps {
  src: string;
  type: 'video' | 'audio';
  title?: string;
  poster?: string;
  onLoadedMetadata?: (duration: number) => void;
}

export function MediaPlayer({
  src,
  type,
  title,
  poster,
  onLoadedMetadata,
}: MediaPlayerProps) {
  const mediaSrc = resolveMediaUrl(src);
  const posterSrc = poster ? resolveMediaUrl(poster) : undefined;
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play().catch(err => {
          setError('Erro ao reproduzir média');
          console.error(err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (type === 'video' && containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      const dur = mediaRef.current.duration;
      setDuration(dur);
      onLoadedMetadata?.(dur);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
  };

  const skip = (seconds: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.max(0, mediaRef.current.currentTime + seconds);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-black rounded-lg overflow-hidden shadow-lg"
    >
      {error && (
        <div className="w-full h-64 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-sm mb-2">Erro ao carregar média</p>
            <p className="text-gray-400 text-xs">{error}</p>
          </div>
        </div>
      )}

      {!error && (
        <>
          {type === 'video' ? (
            <video
              ref={mediaRef as React.Ref<HTMLVideoElement>}
              src={mediaSrc}
              poster={poster}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onLoadStart={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-auto bg-black"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
              {poster && (
                <img
                  src={posterSrc}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
              )}
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                    <Play size={40} className="text-white fill-white ml-1" />
                  </div>
                </div>
                <p className="text-white font-medium text-sm max-w-xs mx-auto">
                  {title || 'Áudio'}
                </p>
              </div>
              <audio
                ref={mediaRef as React.Ref<HTMLAudioElement>}
                src={mediaSrc}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          )}

          {/* Controles */}
          <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-4 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 transition-colors"
                style={{
                  background: `linear-gradient(to right, #7B1D2D 0%, #7B1D2D ${
                    duration ? (currentTime / duration) * 100 : 0
                  }%, #374151 ${duration ? (currentTime / duration) * 100 : 0}%, #374151 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={20} />
                  ) : (
                    <Play size={20} className="fill-white" />
                  )}
                </button>

                {/* Skip backward */}
                <button
                  onClick={() => skip(-10)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white hidden sm:block"
                  title="Recuar 10s"
                >
                  <SkipBack size={18} />
                </button>

                {/* Skip forward */}
                <button
                  onClick={() => skip(10)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white hidden sm:block"
                  title="Avançar 10s"
                >
                  <SkipForward size={18} />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white hidden sm:block"
                    title={isMuted ? 'Ativar som' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer hidden sm:block"
                    style={{
                      background: `linear-gradient(to right, #7B1D2D 0%, #7B1D2D ${
                        volume * 100
                      }%, #374151 ${volume * 100}%, #374151 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Fullscreen (video only) */}
              {type === 'video' && (
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white ml-auto"
                  title="Ecrã inteiro"
                >
                  <Fullscreen size={18} />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
