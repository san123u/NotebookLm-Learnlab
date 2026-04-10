import { useState, useCallback } from 'react';
import { Upload, Plus, FileText, Image, File, Trash2, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import type { Source } from '../../../services/notebookApi';

interface SourcesPanelProps {
  sources: Source[];
  selectedSourceIds: string[];
  onToggleSource: (id: string) => void;
  onUpload: (files: File[]) => void;
  onDelete: (id: string) => void;
  uploading: boolean;
}

const fileTypeIcon = (type: string) => {
  switch (type) {
    case 'pdf': return <FileText className="w-4 h-4 text-red-400" />;
    case 'docx': return <FileText className="w-4 h-4 text-blue-400" />;
    case 'pptx': return <FileText className="w-4 h-4 text-orange-400" />;
    case 'image': return <Image className="w-4 h-4 text-green-400" />;
    default: return <File className="w-4 h-4 text-gray-400" />;
  }
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function SourcesPanel({
  sources,
  selectedSourceIds,
  onToggleSource,
  onUpload,
  onDelete,
  uploading,
}: SourcesPanelProps) {
  const [showDropzone, setShowDropzone] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles);
      setShowDropzone(false);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
    },
    multiple: true,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Sources</h2>
        <button
          onClick={() => setShowDropzone(!showDropzone)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      {/* Upload Area */}
      {showDropzone && (
        <div className="p-3">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-sky-400 bg-sky-400/10'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                <span className="text-sm text-gray-400">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {isDragActive ? 'Drop files here' : 'Click or drag files'}
                </span>
                <span className="text-xs text-gray-500">
                  PDF, DOC, PPT, Images
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Always show upload button when no sources */}
      {!showDropzone && sources.length === 0 && (
        <div className="p-3">
          <button
            onClick={() => setShowDropzone(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
          >
            <Upload className="w-4 h-4" />
            + Add source
          </button>
        </div>
      )}

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {sources.length === 0 && !showDropzone && (
          <p className="text-center text-gray-500 text-sm py-4">
            No sources yet. Upload a document to get started.
          </p>
        )}

        {sources.map((source) => {
          const isSelected = selectedSourceIds.includes(source.id);
          return (
            <div
              key={source.id}
              className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-sky-500/15 border border-sky-500/30'
                  : 'hover:bg-gray-800/60 border border-transparent'
              }`}
              onClick={() => onToggleSource(source.id)}
            >
              <div className="flex-shrink-0">
                {fileTypeIcon(source.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">
                  {source.original_filename}
                </p>
                <p className="text-xs text-gray-500">
                  {formatSize(source.file_size)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(source.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
