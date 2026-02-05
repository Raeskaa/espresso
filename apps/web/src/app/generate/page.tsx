"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Upload, 
  X, 
  Eye, 
  Move, 
  Sun, 
  Camera,
  ArrowLeft,
  Loader2,
  Check
} from "lucide-react";

interface FixOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const fixOptions: FixOption[] = [
  {
    id: "fixEyeContact",
    label: "Fix Eye Contact",
    description: "Look directly at the camera",
    icon: <Eye className="w-6 h-6" />,
    color: "primary",
  },
  {
    id: "improvePosture",
    label: "Improve Posture",
    description: "Confident, upright stance",
    icon: <Move className="w-6 h-6" />,
    color: "secondary",
  },
  {
    id: "adjustAngle",
    label: "Adjust Angle",
    description: "Find the most flattering angle",
    icon: <Camera className="w-6 h-6" />,
    color: "orange-500",
  },
  {
    id: "enhanceLighting",
    label: "Enhance Lighting",
    description: "Soft, flattering light",
    icon: <Sun className="w-6 h-6" />,
    color: "pink-500",
  },
];

export default function GeneratePage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selectedFixes, setSelectedFixes] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
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
      // TODO: Call API to generate images
      // For now, simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // TODO: Navigate to results page
      // router.push(`/generation/${generationId}`);
      alert("Generation complete! (Demo - API not connected yet)");
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
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">New Generation</h1>
          <p className="text-muted-foreground">
            Upload a photo and select what you want to fix
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">1. Upload Photo</h2>
            
            {!image ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                  transition-all duration-200
                  ${isDragging 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }
                `}
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
                
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                
                <p className="text-lg font-medium mb-2">
                  Drop your photo here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Supports JPG, PNG, WebP
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-border">
                <img
                  src={image}
                  alt="Uploaded preview"
                  className="w-full aspect-square object-cover"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-sm truncate">{fileName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Fix Selection */}
          <div>
            <h2 className="text-lg font-semibold mb-4">2. Select Fixes</h2>
            
            <div className="space-y-3">
              {fixOptions.map((option) => {
                const isSelected = selectedFixes.has(option.id);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleFix(option.id)}
                    className={`
                      w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                      ${isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/30"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}
                      `}>
                        {option.icon}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${isSelected 
                          ? "border-primary bg-primary" 
                          : "border-muted-foreground"
                        }
                      `}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Generate Button */}
            <div className="mt-8">
              <Button
                onClick={handleGenerate}
                disabled={!image || selectedFixes.size === 0 || isGenerating}
                size="xl"
                variant="gradient"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate 5 Variations
                  </>
                )}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-3">
                This will use 1 credit
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
