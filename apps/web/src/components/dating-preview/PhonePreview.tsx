"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart, X, MessageCircle, Star, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div className={cn("relative mx-auto", className)} style={{ width: 280, height: 580 }}>
      {/* Phone outer frame */}
      <div className="absolute inset-0 bg-[#1a1a1a] rounded-[2.5rem] p-1.5 shadow-2xl">
        {/* Phone screen */}
        <div className="bg-white h-full rounded-[2rem] overflow-hidden relative">
          {/* Notch / Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10" />
          
          {/* Screen content - scrollable */}
          <div className="h-full overflow-y-auto scrollbar-hide pt-10">
            {children}
          </div>
          
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-black/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Bumble-specific preview
interface BumblePreviewProps {
  photos: string[];
  name: string;
  age: number;
  bio: string;
  occupation?: string;
  prompts?: { question: string; answer: string }[];
}

export function BumblePreview({ photos, name, age, bio, occupation, prompts = [] }: BumblePreviewProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  return (
    <PhoneFrame>
      <div className="min-h-full bg-white">
        {/* Bumble Header */}
        <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="w-8" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#FFC629] flex items-center justify-center">
              <span className="text-black font-bold text-xs">b</span>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </div>

        {/* Photo Carousel */}
        <div className="relative aspect-[3/4] bg-gray-100">
          {photos.length > 0 ? (
            <img 
              src={photos[currentPhoto]} 
              alt={`Photo ${currentPhoto + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              No photos
            </div>
          )}
          
          {/* Photo indicators */}
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 px-4">
            {photos.map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i === currentPhoto ? "bg-white" : "bg-white/40"
                )}
              />
            ))}
          </div>
          
          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentPhoto(p => Math.max(0, p - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={() => setCurrentPhoto(p => Math.min(photos.length - 1, p + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-4">
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <span className="text-xl text-gray-600">{age}</span>
          </div>
          
          {occupation && (
            <p className="text-sm text-gray-500 mb-3">{occupation}</p>
          )}
          
          <p className="text-sm text-gray-700 mb-4">{bio}</p>
          
          {/* Prompts */}
          {prompts.map((prompt, i) => (
            <div key={i} className="mb-3 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">{prompt.question}</p>
              <p className="text-sm text-gray-800">{prompt.answer}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="sticky bottom-8 px-4 pb-4">
          <div className="flex items-center justify-center gap-6">
            <button className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-100">
              <X className="w-7 h-7 text-gray-400" />
            </button>
            <button className="w-16 h-16 rounded-full bg-[#FFC629] shadow-lg flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// Tinder-specific preview
interface TinderPreviewProps {
  photos: string[];
  name: string;
  age: number;
  bio: string;
  distance?: string;
}

export function TinderPreview({ photos, name, age, bio, distance = "2 miles away" }: TinderPreviewProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  return (
    <PhoneFrame>
      <div className="min-h-full bg-gray-50">
        {/* Tinder Header */}
        <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center justify-between">
          <div className="w-8 h-8 rounded-full bg-gray-100" />
          <div className="flex items-center gap-1">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-transparent bg-gradient-to-r from-[#FD297B] to-[#FF5864] bg-clip-text">tinder</span>
          </div>
          <MessageCircle className="w-6 h-6 text-gray-400" />
        </div>

        {/* Card */}
        <div className="px-3 pt-2">
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white">
            {/* Photo */}
            <div className="relative aspect-[3/4] bg-gray-200">
              {photos.length > 0 ? (
                <img 
                  src={photos[currentPhoto]} 
                  alt={`Photo ${currentPhoto + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  No photos
                </div>
              )}
              
              {/* Photo indicators */}
              <div className="absolute top-2 left-0 right-0 flex justify-center gap-1 px-3">
                {photos.map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i === currentPhoto ? "bg-white" : "bg-white/40"
                    )}
                  />
                ))}
              </div>

              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
              
              {/* Name and info */}
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-bold">{name}</h2>
                  <span className="text-xl">{age}</span>
                </div>
                <p className="text-sm opacity-80">{distance}</p>
              </div>
            </div>

            {/* Bio */}
            <div className="p-4">
              <p className="text-sm text-gray-700">{bio}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="fixed bottom-10 left-0 right-0 px-4">
          <div className="flex items-center justify-center gap-4">
            <button className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-100">
              <X className="w-6 h-6 text-[#FD297B]" />
            </button>
            <button className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FD297B] to-[#FF5864] shadow-lg flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-100">
              <Star className="w-6 h-6 text-[#00D4FF]" />
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// Hinge-specific preview
interface HingePreviewProps {
  photos: string[];
  name: string;
  age: number;
  prompts?: { question: string; answer: string }[];
}

export function HingePreview({ photos, name, age, prompts = [] }: HingePreviewProps) {
  return (
    <PhoneFrame>
      <div className="min-h-full bg-[#F5F5F5]">
        {/* Hinge Header */}
        <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="w-8" />
          <span className="font-serif text-xl font-medium text-gray-900">hinge</span>
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </div>

        {/* Profile content */}
        <div className="px-4 py-4 space-y-4">
          {/* First photo with name */}
          <div className="relative rounded-2xl overflow-hidden shadow-sm">
            {photos[0] && (
              <img 
                src={photos[0]} 
                alt="Photo 1"
                className="w-full aspect-[4/5] object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-baseline gap-2 text-white">
                <h2 className="text-xl font-semibold">{name}</h2>
                <span className="text-lg">{age}</span>
              </div>
            </div>
          </div>

          {/* Prompts interleaved with photos */}
          {prompts.map((prompt, i) => (
            <div key={i}>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500 mb-2">{prompt.question}</p>
                <p className="text-base text-gray-900">{prompt.answer}</p>
              </div>
              
              {photos[i + 1] && (
                <div className="mt-4 rounded-2xl overflow-hidden shadow-sm">
                  <img 
                    src={photos[i + 1]} 
                    alt={`Photo ${i + 2}`}
                    className="w-full aspect-[4/5] object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="sticky bottom-8 px-4 pb-4">
          <div className="flex items-center justify-center gap-4">
            <button className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
              <X className="w-6 h-6 text-gray-400" />
            </button>
            <button className="w-14 h-14 rounded-full bg-[#E91E63] shadow-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// App selector with previews
type DatingApp = 'bumble' | 'tinder' | 'hinge';

interface AppPreviewSelectorProps {
  currentApp: DatingApp;
  onAppChange: (app: DatingApp) => void;
  photos: string[];
  name: string;
  age: number;
  bio: string;
  occupation?: string;
  prompts?: { question: string; answer: string }[];
}

export function AppPreviewSelector({
  currentApp,
  onAppChange,
  photos,
  name,
  age,
  bio,
  occupation,
  prompts = []
}: AppPreviewSelectorProps) {
  const apps: { id: DatingApp; label: string; color: string }[] = [
    { id: 'bumble', label: 'Bumble', color: '#FFC629' },
    { id: 'tinder', label: 'Tinder', color: '#FD297B' },
    { id: 'hinge', label: 'Hinge', color: '#E91E63' },
  ];

  return (
    <div>
      {/* App tabs */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => onAppChange(app.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              currentApp === app.id
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            style={{
              backgroundColor: currentApp === app.id ? app.color : undefined
            }}
          >
            {app.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      {currentApp === 'bumble' && (
        <BumblePreview 
          photos={photos}
          name={name}
          age={age}
          bio={bio}
          occupation={occupation}
          prompts={prompts}
        />
      )}
      {currentApp === 'tinder' && (
        <TinderPreview 
          photos={photos}
          name={name}
          age={age}
          bio={bio}
        />
      )}
      {currentApp === 'hinge' && (
        <HingePreview 
          photos={photos}
          name={name}
          age={age}
          prompts={prompts}
        />
      )}
    </div>
  );
}
