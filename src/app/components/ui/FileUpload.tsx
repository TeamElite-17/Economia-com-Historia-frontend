import { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelected: (file: File, type: 'video' | 'audio' | 'image') => void;
  fileType: 'video' | 'audio' | 'image';
  maxSizeMB?: number;
  isLoading?: boolean;
}

export function FileUpload({
  onFileSelected,
  fileType,
  maxSizeMB = 500,
  isLoading = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileTypeConfig = {
    video: {
      accept: 'video/mp4,video/quicktime,video/x-msvideo,video/x-matroska',
      extensions: 'MP4, MOV, AVI, MKV',
      label: 'Vídeo',
    },
    audio: {
      accept: 'audio/mpeg,audio/ogg,audio/wav,audio/webm',
      extensions: 'MP3, WAV, OGG, M4A',
      label: 'Áudio/Podcast',
    },
    image: {
      accept: 'image/jpeg,image/png,image/webp,image/gif',
      extensions: 'JPG, PNG, WEBP, GIF',
      label: 'Imagem',
    },
  };

  const config = fileTypeConfig[fileType];

  const extensionAllowed = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    const allowed: Record<'video' | 'audio' | 'image', string[]> = {
      video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
      audio: ['mp3', 'wav', 'ogg', 'm4a', 'webm', 'aac'],
      image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    };
    return allowed[fileType].includes(ext);
  };

  const validateFile = (file: File): boolean => {
    setError(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ficheiro demasiado grande. Máximo: ${maxSizeMB}MB`);
      return false;
    }

    const validTypes = config.accept.split(',').map((type) => type.trim());
    const mimeOk = !file.type || validTypes.includes(file.type);
    const extOk = extensionAllowed(file.name);

    if (!mimeOk && !extOk) {
      setError(`Tipo de ficheiro inválido. Permitidos: ${config.extensions}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelected(file, fileType);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor={`file-input-${fileType}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative block border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}`}
      >
        <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
          <Upload size={32} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Clique ou arraste um ficheiro {config.label.toLowerCase()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Formatos suportados: {config.extensions}
            </p>
            <p className="text-xs text-gray-500">
              Tamanho máximo: {maxSizeMB}MB
            </p>
          </div>
        </div>
        <input
          type="file"
          accept={config.accept}
          onChange={handleInputChange}
          className="sr-only"
          id={`file-input-${fileType}`}
          disabled={isLoading}
        />
      </label>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {selectedFile && !error && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-800">
                {selectedFile.name}
              </p>
              <p className="text-xs text-green-700">
                {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setError(null);
            }}
            className="p-1 hover:bg-green-100 rounded"
            disabled={isLoading}
          >
            <X size={18} className="text-green-600" />
          </button>
        </div>
      )}
    </div>
  );
}
