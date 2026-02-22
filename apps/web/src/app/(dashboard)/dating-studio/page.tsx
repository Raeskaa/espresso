"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Plus,
  Loader2,
  Sparkles,
  ImageIcon,
  Check,
  MessageCircle,
  Heart,
  RefreshCw,
  Settings2,
  Camera,
  Shirt,
  MapPin,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PipelineProgress, type PipelineProgressData } from "@/components/PipelineProgress";
import { ShimmerCardGrid } from "@/components/ShimmerCard";
import { createDatingProfileGeneration, getGeneration } from "@/app/actions/generation";

// Types
type ProfileTone = 'witty' | 'sincere' | 'adventurous' | 'intellectual' | 'laid-back';
type ProfileType = 'relationship' | 'casual' | 'friendship' | 'unsure';

interface GeneratedPhoto {
  url: string;
  prompt: string;
  score: number;
  approved: boolean;
}

interface BumblePrompt {
  question: string;
  answer: string;
}

// Photo customization options
interface PhotoCustomization {
  keepOriginalClothes: boolean;
  environment: 'keep' | 'outdoor' | 'urban' | 'cafe' | 'gym' | 'beach' | 'travel';
  lighting: 'natural' | 'golden-hour' | 'studio' | 'moody';
  style: 'casual' | 'smart-casual' | 'formal' | 'athletic' | 'creative';
}

// Bumble-style prompts
const BUMBLE_QUESTIONS = [
  "Two truths and a lie...",
  "My go-to karaoke song is...",
  "The way to win me over is...",
  "I'm looking for someone who...",
  "A perfect day for me looks like...",
  "I geek out on...",
  "My most irrational fear is...",
  "The key to my heart is...",
];

// Profile tones
const PROFILE_TONES: { id: ProfileTone; label: string; emoji: string; description: string }[] = [
  { id: 'witty', label: 'Witty & Playful', emoji: '😏', description: 'Clever humor, flirty banter' },
  { id: 'sincere', label: 'Sincere & Genuine', emoji: '💫', description: 'Honest, heartfelt, authentic' },
  { id: 'adventurous', label: 'Adventurous', emoji: '🌍', description: 'Travel, experiences, spontaneous' },
  { id: 'intellectual', label: 'Intellectual', emoji: '📚', description: 'Deep conversations, curious' },
  { id: 'laid-back', label: 'Laid-back', emoji: '😎', description: 'Chill, easygoing, relaxed' },
];

// Profile types
const PROFILE_TYPES: { id: ProfileType; label: string; emoji: string }[] = [
  { id: 'relationship', label: 'Looking for a relationship', emoji: '💕' },
  { id: 'casual', label: 'Something casual', emoji: '✨' },
  { id: 'friendship', label: 'New friends', emoji: '🤝' },
  { id: 'unsure', label: 'Still figuring it out', emoji: '🤷' },
];

const ENVIRONMENTS = [
  { id: 'keep', label: 'Keep Original', icon: '📍' },
  { id: 'outdoor', label: 'Outdoors/Nature', icon: '🌲' },
  { id: 'urban', label: 'City/Urban', icon: '🏙️' },
  { id: 'cafe', label: 'Café/Restaurant', icon: '☕' },
  { id: 'gym', label: 'Gym/Active', icon: '💪' },
  { id: 'beach', label: 'Beach/Water', icon: '🏖️' },
  { id: 'travel', label: 'Travel/Landmark', icon: '✈️' },
];

const OUTFIT_STYLES = [
  { id: 'casual', label: 'Casual', icon: '👕' },
  { id: 'smart-casual', label: 'Smart Casual', icon: '👔' },
  { id: 'formal', label: 'Formal', icon: '🤵' },
  { id: 'athletic', label: 'Athletic', icon: '🏃' },
  { id: 'creative', label: 'Creative/Artsy', icon: '🎨' },
];

export default function DatingStudioPage() {
  // User photos
  const [selfies, setSelfies] = useState<string[]>([]);
  const [references, setReferences] = useState<string[]>([]);

  // Profile settings
  const [profileTone, setProfileTone] = useState<ProfileTone>('witty');
  const [profileType, setProfileType] = useState<ProfileType>('relationship');
  const [bio, setBio] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileAge, setProfileAge] = useState<number>(25);
  const [prompts, setPrompts] = useState<BumblePrompt[]>([
    { question: BUMBLE_QUESTIONS[0], answer: '' },
    { question: BUMBLE_QUESTIONS[3], answer: '' },
    { question: BUMBLE_QUESTIONS[7], answer: '' },
  ]);

  // Photo customization
  const [customization, setCustomization] = useState<PhotoCustomization>({
    keepOriginalClothes: false,
    environment: 'keep',
    lighting: 'natural',
    style: 'casual',
  });

  // Generated photos
  const [generatedPhotos, setGeneratedPhotos] = useState<GeneratedPhoto[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'customize' | 'profile'>('photos');

  // Real-time polling state
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgressData | null>(null);
  const [revealedUrls, setRevealedUrls] = useState<string[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for generation progress
  const pollGeneration = useCallback(async (genId: string) => {
    try {
      const data = await getGeneration(genId);
      if (!data) return;

      // Update pipeline progress
      if (data.pipelineProgress) {
        setPipelineProgress(data.pipelineProgress as PipelineProgressData);
      }

      // Reveal images as they come in
      if (data.generatedImageUrls && data.generatedImageUrls.length > 0) {
        setRevealedUrls(data.generatedImageUrls);
      }

      // Check for completion
      if (data.status === 'completed') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsGenerating(false);
        setGenerationProgress(100);

        // Convert to GeneratedPhoto format
        if (data.generatedImageUrls && data.generatedImageUrls.length > 0) {
          const photos: GeneratedPhoto[] = data.generatedImageUrls.map((url, i) => ({
            url,
            prompt: `Photo ${i + 1}`,
            score: Math.max(80, 95 - i * 2), // Ordered best-first by the AI pipeline
            approved: true,
          }));
          setGeneratedPhotos(photos);
          setSelectedPhotoIndex(0);
        }
      } else if (data.status === 'failed') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsGenerating(false);
        setError(data.errorMessage || 'Generation failed. Please try again.');
      }
    } catch (err) {
      console.error('Polling error:', err);
      // Stop polling on repeated errors to avoid infinite loop
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      setIsGenerating(false);
      setError('Connection error. Please refresh and check your history.');
    }
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Compress image
  const compressImage = (dataUrl: string, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = dataUrl;
    });
  };

  // File upload handler
  const handleFileUpload = async (files: FileList | null, target: 'selfies' | 'references') => {
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      const imageUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const compressedUrl = await compressImage(imageUrl);
      newImages.push(compressedUrl);
    }

    if (target === 'selfies') {
      setSelfies(prev => [...prev, ...newImages].slice(0, 5));
    } else {
      setReferences(prev => [...prev, ...newImages].slice(0, 10));
    }
  };

  const removeImage = (index: number, target: 'selfies' | 'references') => {
    if (target === 'selfies') {
      setSelfies(prev => prev.filter((_, i) => i !== index));
    } else {
      setReferences(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Generate photos - uses server action with real-time polling
  const handleGenerate = async () => {
    if (selfies.length === 0) {
      setError('Please upload at least one photo of yourself');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setGeneratedPhotos([]);
    setRevealedUrls([]);
    setPipelineProgress(null);

    try {
      // Extract base64 data from data URLs
      const selfieData = selfies.map(s => s.split(',')[1] || s);
      const referenceData = references.map(r => r.split(',')[1] || r);

      // Call server action (returns immediately, processes in background)
      const result = await createDatingProfileGeneration({
        selfies: selfieData.map(data => ({ data })),
        references: referenceData.map(data => ({ data })),
        targetApp: 'bumble'
      });

      if (!result.success || !result.generationId) {
        setError(result.error || 'Failed to start generation');
        setIsGenerating(false);
        return;
      }

      // Start polling for progress
      setGenerationId(result.generationId);
      pollingRef.current = setInterval(() => {
        pollGeneration(result.generationId!);
      }, 2000);

      // Initial poll
      pollGeneration(result.generationId);

    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to start generation. Please try again.');
      setIsGenerating(false);
    }
  };

  // Update prompt answer
  const updatePromptAnswer = (index: number, answer: string) => {
    setPrompts(prev => prev.map((p, i) => i === index ? { ...p, answer } : p));
  };

  const canGenerate = selfies.length >= 1;

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-64px)] h-auto overflow-y-auto md:overflow-hidden">
      {/* Left Panel - Controls */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#2D4A3E]/10 bg-white md:overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-[#2D4A3E]/10">
          <h1 className="text-lg font-bold text-[#2D4A3E]">Dating Studio</h1>
          <p className="text-xs text-[#2D4A3E]/60">Create your perfect dating profile</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2D4A3E]/10">
          {(['photos', 'customize', 'profile'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 text-xs font-medium capitalize transition-colors",
                activeTab === tab
                  ? "text-[#2D4A3E] border-b-2 border-[#2D4A3E]"
                  : "text-[#2D4A3E]/50 hover:text-[#2D4A3E]/70"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <>
              {/* Your Photos */}
              <div>
                <label className="text-sm font-medium text-[#2D4A3E] mb-2 block">
                  Your Photos ({selfies.length}/5)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {selfies.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#2D4A3E]/10">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i, 'selfies')}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {selfies.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-[#2D4A3E]/20 hover:border-[#2D4A3E]/40 cursor-pointer flex flex-col items-center justify-center transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files, 'selfies')}
                        className="hidden"
                      />
                      <Plus className="w-5 h-5 text-[#2D4A3E]/40" />
                    </label>
                  )}
                </div>
              </div>

              {/* Inspiration Photos */}
              <div>
                <label className="text-sm font-medium text-[#2D4A3E] mb-2 block">
                  Inspiration (optional)
                </label>
                <p className="text-xs text-[#2D4A3E]/50 mb-2">
                  Add photos for pose/style reference
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {references.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#2D4A3E]/10">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i, 'references')}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/50 flex items-center justify-center"
                      >
                        <X className="w-2 h-2 text-white" />
                      </button>
                    </div>
                  ))}
                  {references.length < 10 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-[#2D4A3E]/20 hover:border-[#2D4A3E]/40 cursor-pointer flex items-center justify-center transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files, 'references')}
                        className="hidden"
                      />
                      <Plus className="w-4 h-4 text-[#2D4A3E]/40" />
                    </label>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Customize Tab */}
          {activeTab === 'customize' && (
            <>
              {/* Environment */}
              <div>
                <label className="text-sm font-medium text-[#2D4A3E] mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Environment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ENVIRONMENTS.map(env => (
                    <button
                      key={env.id}
                      onClick={() => setCustomization(c => ({ ...c, environment: env.id as PhotoCustomization['environment'] }))}
                      className={cn(
                        "p-2 rounded-lg text-xs text-left transition-all",
                        customization.environment === env.id
                          ? "bg-[#2D4A3E] text-white"
                          : "bg-[#2D4A3E]/5 hover:bg-[#2D4A3E]/10 text-[#2D4A3E]"
                      )}
                    >
                      <span className="mr-1">{env.icon}</span> {env.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outfit Style */}
              <div>
                <label className="text-sm font-medium text-[#2D4A3E] mb-2 flex items-center gap-2">
                  <Shirt className="w-4 h-4" /> Outfit Style
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="keepClothes"
                    checked={customization.keepOriginalClothes}
                    onChange={(e) => setCustomization(c => ({ ...c, keepOriginalClothes: e.target.checked }))}
                    className="rounded border-[#2D4A3E]/30"
                  />
                  <label htmlFor="keepClothes" className="text-xs text-[#2D4A3E]/70">
                    Keep my original clothes
                  </label>
                </div>
                {!customization.keepOriginalClothes && (
                  <div className="grid grid-cols-2 gap-2">
                    {OUTFIT_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setCustomization(c => ({ ...c, style: style.id as PhotoCustomization['style'] }))}
                        className={cn(
                          "p-2 rounded-lg text-xs text-left transition-all",
                          customization.style === style.id
                            ? "bg-[#2D4A3E] text-white"
                            : "bg-[#2D4A3E]/5 hover:bg-[#2D4A3E]/10 text-[#2D4A3E]"
                        )}
                      >
                        <span className="mr-1">{style.icon}</span> {style.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lighting */}
              <div>
                <label className="text-sm font-medium text-[#2D4A3E] mb-2 flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Lighting
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'natural', label: 'Natural', icon: '☀️' },
                    { id: 'golden-hour', label: 'Golden Hour', icon: '🌅' },
                    { id: 'studio', label: 'Studio', icon: '💡' },
                    { id: 'moody', label: 'Moody', icon: '🌙' },
                  ].map(light => (
                    <button
                      key={light.id}
                      onClick={() => setCustomization(c => ({ ...c, lighting: light.id as PhotoCustomization['lighting'] }))}
                      className={cn(
                        "p-2 rounded-lg text-xs text-left transition-all",
                        customization.lighting === light.id
                          ? "bg-[#2D4A3E] text-white"
                          : "bg-[#2D4A3E]/5 hover:bg-[#2D4A3E]/10 text-[#2D4A3E]"
                      )}
                    >
                      <span className="mr-1">{light.icon}</span> {light.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              {/* Profile Tone */}
              <div>
                <label className="text-sm font-medium text-[#2D4A3E] mb-2 block">
                  Profile Tone
                </label>
                <div className="space-y-2">
                  {PROFILE_TONES.map(tone => (
                    <button
                      key={tone.id}
                      onClick={() => setProfileTone(tone.id)}
                      className={cn(
                        "w-full p-2 rounded-lg text-left transition-all",
                        profileTone === tone.id
                          ? "bg-[#2D4A3E] text-white"
                          : "bg-[#2D4A3E]/5 hover:bg-[#2D4A3E]/10 text-[#2D4A3E]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{tone.emoji}</span>
                        <div>
                          <div className="text-xs font-medium">{tone.label}</div>
                          <div className={cn(
                            "text-[10px]",
                            profileTone === tone.id ? "text-white/70" : "text-[#2D4A3E]/50"
                          )}>
                            {tone.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Looking For */}
              <div>
                <label className="text-sm font-medium text-[#2D4A3E] mb-2 block">
                  Looking For
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PROFILE_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setProfileType(type.id)}
                      className={cn(
                        "p-2 rounded-lg text-xs text-left transition-all",
                        profileType === type.id
                          ? "bg-[#2D4A3E] text-white"
                          : "bg-[#2D4A3E]/5 hover:bg-[#2D4A3E]/10 text-[#2D4A3E]"
                      )}
                    >
                      <span className="mr-1">{type.emoji}</span> {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Age */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-[#2D4A3E]/70 mb-1 block">Your Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full p-2 text-xs rounded-lg border border-[#2D4A3E]/20 focus:border-[#2D4A3E]/40 focus:outline-none"
                    maxLength={30}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#2D4A3E]/70 mb-1 block">Age</label>
                  <input
                    type="number"
                    value={profileAge}
                    onChange={(e) => setProfileAge(Math.max(18, Math.min(99, parseInt(e.target.value) || 18)))}
                    min={18}
                    max={99}
                    className="w-full p-2 text-xs rounded-lg border border-[#2D4A3E]/20 focus:border-[#2D4A3E]/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-sm font-medium text-[#2D4A3E] mb-2 block">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  className="w-full h-24 p-2 text-xs rounded-lg border border-[#2D4A3E]/20 focus:border-[#2D4A3E]/40 focus:outline-none resize-none"
                  maxLength={300}
                />
                <div className="text-[10px] text-[#2D4A3E]/40 text-right">{bio.length}/300</div>
              </div>
            </>
          )}
        </div>

        {/* Generate Button */}
        <div className="p-4 border-t border-[#2D4A3E]/10 bg-white sticky bottom-0">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="w-full bg-[#2D4A3E] hover:bg-[#1a2d24] text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating ({generationProgress}%)
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Photos
              </>
            )}
          </Button>
          {error && (
            <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>

      {/* Center Panel - Generation/Preview */}
      <div className="flex-1 bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {isGenerating ? (
            /* Real-time Generation Progress */
            <div className="py-8">
              <h2 className="text-lg font-semibold text-[#2D4A3E] mb-2 text-center">
                Creating your dating photos
              </h2>
              <p className="text-xs text-[#2D4A3E]/50 text-center mb-6">
                This typically takes 1-2 minutes
              </p>

              {/* Pipeline Progress */}
              <PipelineProgress progress={pipelineProgress} />

              {/* Shimmer Cards */}
              <div className="mt-8">
                <p className="text-xs text-[#2D4A3E]/40 mb-4 text-center">
                  Your photos will appear here as they&apos;re generated
                </p>
                <ShimmerCardGrid
                  total={5}
                  revealedUrls={revealedUrls}
                  labels={['Photo 1', 'Photo 2', 'Photo 3', 'Photo 4', 'Photo 5']}
                />
              </div>
            </div>
          ) : generatedPhotos.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-24 h-24 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-[#2D4A3E]/40" />
              </div>
              <h2 className="text-xl font-semibold text-[#2D4A3E] mb-2">
                Ready to create your perfect profile?
              </h2>
              <p className="text-sm text-[#2D4A3E]/60 max-w-md mb-6">
                Upload your photos, customize the style, and we&apos;ll generate
                stunning dating profile photos that look authentically you.
              </p>
              {selfies.length === 0 && (
                <label className="px-6 py-3 rounded-xl bg-[#2D4A3E] text-white text-sm font-medium cursor-pointer hover:bg-[#1a2d24] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, 'selfies')}
                    className="hidden"
                  />
                  Upload Your Photos
                </label>
              )}
              {selfies.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-green-600 font-medium">
                    ✓ {selfies.length} photo{selfies.length > 1 ? 's' : ''} uploaded
                  </p>
                  <Button
                    onClick={handleGenerate}
                    className="bg-[#2D4A3E] hover:bg-[#1a2d24]"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Photos
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Generated Photos Grid */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#2D4A3E]">
                  Generated Photos
                </h2>
                <span className="text-xs text-[#2D4A3E]/60">
                  Click a photo to preview in profile
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedPhotos.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={cn(
                      "relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all",
                      selectedPhotoIndex === index
                        ? "ring-4 ring-[#2D4A3E] ring-offset-2"
                        : "hover:scale-[1.02]"
                    )}
                  >
                    <img
                      src={photo.url}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {photo.approved && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                        Photo {index + 1}/{generatedPhotos.length}
                      </span>
                      <button
                        className="p-1.5 rounded-full bg-black/50 hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Regenerate single photo
                        }}
                      >
                        <RefreshCw className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Regenerate Button */}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  variant="outline"
                  className="border-[#2D4A3E]/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Bumble Preview (Full Height) */}
      <div className="w-full md:w-[380px] bg-gradient-to-b from-yellow-50 to-yellow-100/50 border-t md:border-t-0 md:border-l border-yellow-200/50 flex flex-col flex-shrink-0">
        {/* Bumble Header */}
        <div className="p-3 bg-[#FFC629] sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐝</span>
              <span className="font-bold text-gray-900">bumble</span>
            </div>
            <Settings2 className="w-5 h-5 text-gray-900" />
          </div>
        </div>

        {/* Scrollable Profile Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Photo */}
          <div className="aspect-[3/4] bg-gray-200 relative">
            {generatedPhotos.length > 0 ? (
              <img
                src={generatedPhotos[selectedPhotoIndex]?.url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : selfies.length > 0 ? (
              <img
                src={selfies[0]}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ImageIcon className="w-16 h-16 text-gray-300" />
              </div>
            )}

            {/* Photo Dots */}
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 px-4">
              {(generatedPhotos.length > 0 ? generatedPhotos : selfies.map(s => ({ url: s }))).slice(0, 6).map((_, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPhotoIndex(i)}
                  className={cn(
                    "flex-1 h-1 rounded-full transition-colors cursor-pointer",
                    i === selectedPhotoIndex ? "bg-white" : "bg-white/40"
                  )}
                />
              ))}
            </div>

            {/* Name & Age Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{profileName || 'Your Name'}, {profileAge}</h3>
                  <p className="text-sm text-white/80 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> 2 miles away
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Check className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-white">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-4 space-y-4 bg-white">
            {/* Bio */}
            <div className="pb-4 border-b border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                {bio || "Your bio will appear here. Write something about yourself in the Profile tab!"}
              </p>
            </div>

            {/* Looking For Badge */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Looking for</p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#FFC629]/20 text-gray-800 text-sm font-medium">
                {PROFILE_TYPES.find(t => t.id === profileType)?.emoji}{' '}
                {PROFILE_TYPES.find(t => t.id === profileType)?.label}
              </div>
            </div>

            {/* Prompts */}
            <div className="space-y-3 pt-2">
              <p className="text-xs text-gray-500">Prompts</p>
              {prompts.map((prompt, index) => (
                <div key={index} className="p-4 rounded-2xl bg-gray-50">
                  <p className="text-xs font-medium text-[#FFC629] mb-2">{prompt.question}</p>
                  <textarea
                    value={prompt.answer}
                    onChange={(e) => updatePromptAnswer(index, e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full text-sm text-gray-900 bg-transparent resize-none focus:outline-none placeholder:text-gray-400"
                    rows={2}
                  />
                </div>
              ))}
            </div>

            {/* More Photos Grid */}
            {(generatedPhotos.length > 1 || selfies.length > 1) && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-2">More photos</p>
                <div className="grid grid-cols-3 gap-2">
                  {(generatedPhotos.length > 0 ? generatedPhotos : selfies.map(s => ({ url: s }))).slice(1, 7).map((photo, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedPhotoIndex(i + 1)}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center justify-center gap-4">
            <button className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X className="w-7 h-7 text-gray-400" />
            </button>
            <button className="w-16 h-16 rounded-full bg-[#FFC629] flex items-center justify-center hover:bg-[#FFD54F] transition-colors shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </button>
            <button className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <MessageCircle className="w-7 h-7 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
