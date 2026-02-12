"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  Eye,
  Move,
  Sun,
  Camera,
  Loader2,
  Check,
  Sparkles,
  SlidersHorizontal
} from "lucide-react";
import { createGeneration, analyzeImage } from "@/app/actions/generation";
import { cn } from "@/lib/utils";

interface FixOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const fixOptions: FixOption[] = [
  {
    id: "fixEyeContact",
    label: "Eye Contact",
    description: "Look at the camera",
    icon: <Eye className="w-5 h-5" />,
  },
  {
    id: "improvePosture",
    label: "Posture",
    description: "Stand confident",
    icon: <Move className="w-5 h-5" />,
  },
  {
    id: "adjustAngle",
    label: "Angle",
    description: "Flattering perspective",
    icon: <Camera className="w-5 h-5" />,
  },
  {
    id: "enhanceLighting",
    label: "Lighting",
    description: "Soft, natural light",
    icon: <Sun className="w-5 h-5" />,
  },
];

// Intensity slider component
function IntensitySlider({
  value,
  onChange,
  label
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="mt-3 px-4 py-3 bg-[#FFFEF5] rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#2D4A3E]/60">Intensity</span>
        <span className="text-xs font-medium text-[#2D4A3E]">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-[#2D4A3E]/10 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#2D4A3E]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110"
      />
      <div className="flex justify-between text-[10px] text-[#2D4A3E]/40 mt-1">
        <span>Subtle</span>
        <span>Moderate</span>
        <span>Strong</span>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selectedFixes, setSelectedFixes] = useState<Set<string>>(new Set());
  const [intensities, setIntensities] = useState<Record<string, number>>({
    fixEyeContact: 5,
    improvePosture: 5,
    adjustAngle: 5,
    enhanceLighting: 5,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
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

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    try {
      const compressedImage = await compressImage(file, 800, 0.7);
      setImage(compressedImage);
      setFileName(file.name);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileChange(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const toggleFix = (id: string) => {
    setSelectedFixes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!image || selectedFixes.size === 0) return;

    setIsGenerating(true);

    try {
      const base64Data = image.split(',')[1];

      const fixes = {
        fixEyeContact: selectedFixes.has('fixEyeContact'),
        improvePosture: selectedFixes.has('improvePosture'),
        adjustAngle: selectedFixes.has('adjustAngle'),
        enhanceLighting: selectedFixes.has('enhanceLighting'),
      };

      const result = await createGeneration({ imageBase64: base64Data, fixes });

      if (result.success && result.generationId) {
        router.push(`/generation/${result.generationId}`);
      } else {
        alert(result.error || 'Generation failed. Please try again.');
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setFileName("");
    setSelectedFixes(new Set());
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2D4A3E] mb-1">Quick Fix</h1>
        <p className="text-[#2D4A3E]/60">
          Upload a photo and select what to improve. Get 5 variations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upload */}
        <div>
          <h2 className="text-sm font-medium text-[#2D4A3E]/60 mb-3">1. Upload photo</h2>

          {!image ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
                isDragging
                  ? "border-[#2D4A3E] bg-[#2D4A3E]/5"
                  : "border-[#2D4A3E]/20 hover:border-[#2D4A3E]/40 bg-white"
              )}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="w-16 h-16 rounded-2xl bg-[#2D4A3E]/5 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-[#2D4A3E]/40" />
              </div>
              <p className="text-sm text-[#2D4A3E] font-medium mb-1">
                Drop your photo here
              </p>
              <p className="text-xs text-[#2D4A3E]/50">
                or click to browse
              </p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-[#2D4A3E]/10 bg-white">
              <img
                src={image}
                alt="Upload preview"
                className="w-full aspect-square object-cover"
              />
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-white/90 backdrop-blur-sm border-t border-[#2D4A3E]/10">
                <p className="text-sm text-[#2D4A3E]/70 truncate">{fileName}</p>
              </div>
            </div>
          )}

          {/* Analyze button */}
          {image && (
            <button
              onClick={() => {/* TODO: Analyze */ }}
              disabled={isAnalyzing}
              className="w-full mt-4 py-3 px-4 border border-[#2D4A3E]/10 rounded-xl text-sm text-[#2D4A3E]/70 hover:bg-[#2D4A3E]/5 transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI Analyze (optional)
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Fix Selection */}
        <div>
          <h2 className="text-sm font-medium text-[#2D4A3E]/60 mb-3">2. Select fixes</h2>

          <div className="space-y-3">
            {fixOptions.map((option) => {
              const isSelected = selectedFixes.has(option.id);

              return (
                <div key={option.id}>
                  <button
                    onClick={() => toggleFix(option.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4",
                      isSelected
                        ? "border-[#2D4A3E] bg-white shadow-sm"
                        : "border-[#2D4A3E]/10 bg-white hover:border-[#2D4A3E]/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-[#2D4A3E] text-white"
                        : "bg-[#2D4A3E]/5 text-[#2D4A3E]/60"
                    )}>
                      {option.icon}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#2D4A3E]">{option.label}</p>
                      <p className="text-xs text-[#2D4A3E]/50">{option.description}</p>
                    </div>

                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected
                        ? "border-[#2D4A3E] bg-[#2D4A3E]"
                        : "border-[#2D4A3E]/20"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>

                  {/* Intensity slider - shown when selected */}
                  {isSelected && (
                    <IntensitySlider
                      value={intensities[option.id]}
                      onChange={(v) => setIntensities(prev => ({ ...prev, [option.id]: v }))}
                      label={option.label}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Generate button */}
          <div className="mt-6">
            <Button
              onClick={handleGenerate}
              disabled={!image || selectedFixes.size === 0 || isGenerating}
              size="lg"
              className="w-full bg-[#2D4A3E] text-white hover:bg-[#1f352d]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Generate 5 variations"
              )}
            </Button>

            <p className="text-center text-xs text-[#2D4A3E]/50 mt-3">
              Uses 1 credit · Results in ~30 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
