import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MediaAsset[];
  onUpload: (files: FileList) => void;
  onDelete: (id: string) => void;
  onSelect?: (asset: MediaAsset) => void;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  isOpen,
  onClose,
  assets,
  onUpload,
  onDelete,
  onSelect
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-hall-900 border border-hall-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-hall-800 flex justify-between items-center bg-hall-950 shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2 text-ink">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            Media Manager
          </h2>
          <button 
            onClick={onClose} 
            className="text-hall-400 hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
              isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-hall-700 hover:border-hall-600 hover:bg-hall-800/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*"
              onChange={handleFileSelect}
            />
            <Upload className="w-10 h-10 text-hall-400 mb-4" />
            <p className="text-ink font-medium mb-1">Click or drag images to upload</p>
            <p className="text-hall-400 text-sm">Supports JPG, PNG, SVG, WEBP</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {assets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-hall-500">
                <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                <p>No media assets uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {assets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className="group relative bg-hall-800 rounded-xl overflow-hidden border border-hall-700 hover:border-indigo-500 transition-colors cursor-pointer aspect-square"
                    onClick={() => onSelect && onSelect(asset)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/html", `<img src="${asset.url}" alt="${asset.name}" class="w-full h-auto rounded-xl shadow-sm" />`);
                      e.dataTransfer.setData("application/forge-component", "Image");
                    }}
                  >
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(asset.id);
                          }}
                          className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-xs text-white truncate px-1 drop-shadow-md">
                        {asset.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
