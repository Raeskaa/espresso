"use client";
import React, { useState } from 'react';
import { ImageIcon, Loader2, Download, Star, Trash2 } from 'lucide-react';
import { deleteDatingPhotoHistory } from '@/app/actions/generation';
import { useRouter } from 'next/navigation';

interface DatingPhotoHistoryItem {
  id: string;
  userId: string;
  imageUrl: string;
  prompt: string;
  score: number;
  approved: number;
  createdAt: Date | string; // Handle both due to serialization
}

interface DatingPhotoHistoryProps {
  initialPhotos?: DatingPhotoHistoryItem[];
}

export function DatingPhotoHistory({ initialPhotos = [] }: DatingPhotoHistoryProps) {
  const [photos, setPhotos] = useState<DatingPhotoHistoryItem[]>(initialPhotos);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  if (!initialPhotos.length && !photos.length) {
    return (
      <div className="py-12 text-center border border-dashed border-[#2D4A3E]/15 rounded-xl bg-white">
        <ImageIcon className="w-10 h-10 text-[#2D4A3E]/15 mx-auto mb-3" />
        <p className="text-sm text-[#2D4A3E]/50">No dating photos generated yet.</p>
        <p className="text-xs text-[#2D4A3E]/30 mt-1">
          Use the Dating Studio to create stunning profile photos.
        </p>
      </div>
    );
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dating-photo-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    setDeletingId(id);
    try {
      await deleteDatingPhotoHistory(id);
      // Update local state for immediate feedback
      setPhotos(prev => prev.filter(p => p.id !== id));
      router.refresh(); 
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete photo');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {photos.map((photo, index) => (
        <div key={photo.id} className="group relative aspect-[4/5] rounded-xl border border-[#2D4A3E]/10 overflow-hidden bg-white hover:shadow-lg hover:border-[#2D4A3E]/20 transition-all">
          <img
            src={photo.imageUrl}
            alt={photo.prompt || 'Generated photo'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Score badge */}
          {photo.score > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-[#2D4A3E]">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {photo.score}
            </div>
          )}

          {/* Approved badge */}
          {photo.approved === 1 && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-emerald-500/90 text-xs font-medium text-white">
              ✓
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between gap-2">
              <span className="text-white text-xs truncate flex-1">
                {new Date(photo.createdAt).toLocaleDateString()}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(photo.id);
                  }}
                  disabled={deletingId === photo.id}
                  className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === photo.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(photo.imageUrl, index);
                  }}
                  className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white text-[#2D4A3E] transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
