"use client";
import React, { useEffect, useState } from 'react';
import { ImageIcon, Loader2, Download, Star } from 'lucide-react';

interface DatingPhotoHistoryItem {
  id: string;
  userId: string;
  imageUrl: string;
  prompt: string;
  customization: any;
  score: number;
  approved: number;
  createdAt: string;
}

export function DatingPhotoHistory() {
  const [photos, setPhotos] = useState<DatingPhotoHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/history')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
      })
      .then(data => {
        setPhotos(data.history || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('[DatingPhotoHistory] Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-[#2D4A3E]/40">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Loading dating photos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-red-400">Failed to load dating photo history</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-[#2D4A3E]/50 underline hover:text-[#2D4A3E]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!photos.length) {
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {photos.map((photo, index) => (
        <div key={photo.id} className="group relative aspect-[4/5] rounded-xl border border-[#2D4A3E]/10 overflow-hidden bg-white hover:shadow-lg hover:border-[#2D4A3E]/20 transition-all">
          <img
            src={photo.imageUrl}
            alt={photo.prompt}
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
            <div className="flex items-center justify-between">
              <span className="text-white text-xs truncate max-w-[70%]">
                {new Date(photo.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload(photo.imageUrl, index);
                }}
                className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#2D4A3E]" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
