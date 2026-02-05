"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ArrowLeft,
  Download,
  RefreshCw,
  Check,
  Loader2,
  Share2,
  Trash2
} from "lucide-react";
import { getGeneration } from "@/app/actions/generation";

interface Generation {
  id: string;
  originalImageUrl: string;
  generatedImageUrls: string[];
  fixes: {
    fixEyeContact: boolean;
    improvePosture: boolean;
    adjustAngle: boolean;
    enhanceLighting: boolean;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export default function GenerationResultPage() {
  const params = useParams();
  const router = useRouter();
  const generationId = params.id as string;
  
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchGeneration = async () => {
      const data = await getGeneration(generationId);
      if (data) {
        setGeneration(data as Generation);
        
        // If still processing, poll for updates
        if (data.status === 'processing') {
          interval = setInterval(async () => {
            const updated = await getGeneration(generationId);
            if (updated) {
              setGeneration(updated as Generation);
              if (updated.status !== 'processing') {
                clearInterval(interval);
              }
            }
          }, 2000);
        }
      }
      setLoading(false);
    };

    fetchGeneration();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generationId]);

  const handleDownload = async (imageUrl: string, index: number) => {
    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `espresso-${generationId}-variation-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!generation) return;
    setDownloading(true);
    
    for (let i = 0; i < generation.generatedImageUrls.length; i++) {
      await handleDownload(generation.generatedImageUrls[i], i);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
    }
    
    setDownloading(false);
  };

  const getAppliedFixes = () => {
    if (!generation) return [];
    const fixes = [];
    if (generation.fixes.fixEyeContact) fixes.push('Eye Contact');
    if (generation.fixes.improvePosture) fixes.push('Posture');
    if (generation.fixes.adjustAngle) fixes.push('Angle');
    if (generation.fixes.enhanceLighting) fixes.push('Lighting');
    return fixes;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading generation...</p>
        </div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-medium mb-4">Generation not found</p>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Status & Info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Your Results</h1>
            {generation.status === 'completed' && (
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                Complete
              </span>
            )}
            {generation.status === 'processing' && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            Applied fixes: {getAppliedFixes().join(', ')}
          </p>
        </div>

        {generation.status === 'processing' ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </div>
            <p className="text-xl font-medium mt-8 mb-2">Generating your variations...</p>
            <p className="text-muted-foreground text-center max-w-md">
              Our AI is analyzing your photo and creating 5 enhanced variations. This usually takes 10-30 seconds.
            </p>
          </div>
        ) : generation.status === 'completed' ? (
          <>
            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <Button
                variant="gradient"
                onClick={handleDownloadAll}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download All
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Link href="/generate">
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4" />
                  New Generation
                </Button>
              </Link>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {generation.generatedImageUrls.map((url, index) => (
                <div
                  key={index}
                  className={`
                    relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200
                    ${selectedImage === index 
                      ? 'border-primary ring-4 ring-primary/20 scale-105' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  onClick={() => setSelectedImage(selectedImage === index ? null : index)}
                >
                  <img
                    src={url}
                    alt={`Variation ${index + 1}`}
                    className="w-full aspect-[4/5] object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(url, index);
                        }}
                        className="w-full py-2 px-4 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {selectedImage === index && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Variation number */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Image Preview */}
            {selectedImage !== null && (
              <div className="mt-8 p-6 rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Variation #{selectedImage + 1}</h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(generation.generatedImageUrls[selectedImage], selectedImage)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <img
                    src={generation.generatedImageUrls[selectedImage]}
                    alt={`Variation ${selectedImage + 1} large`}
                    className="max-h-[60vh] rounded-xl"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl font-medium text-red-500 mb-4">Generation failed</p>
            <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
            <Link href="/generate">
              <Button variant="gradient">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
