"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PipelineProgress, PipelineProgressData } from "@/components/PipelineProgress";
import { BumblePreview, TinderPreview, HingePreview } from "@/components/dating-preview/PhonePreview";
import { 
  ArrowLeft,
  Download,
  Loader2,
  Check,
  Smartphone
} from "lucide-react";
import { getGeneration } from "@/app/actions/generation";

const STYLE_NAMES = ['Natural', 'Professional', 'Editorial', 'Warm', 'Cool'];

interface VariationResult {
  index: number;
  style: string;
  success: boolean;
  imageUrl?: string;
  attempts: number;
  fallback: boolean;
}

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
  pipelineStage?: string;
  pipelineProgress?: PipelineProgressData | null;
  variationResults?: VariationResult[] | null;
  createdAt: Date;
}

export default function GenerationResultPage() {
  const params = useParams();
  const generationId = params.id as string;
  
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [showPhonePreview, setShowPhonePreview] = useState(false);
  const [selectedApp, setSelectedApp] = useState<'bumble' | 'tinder' | 'hinge'>('bumble');

  // Check if this is a dating studio generation
  const isDatingGeneration = generationId.startsWith('dating_');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchGeneration = async () => {
      const data = await getGeneration(generationId);
      if (data) {
        setGeneration(data as Generation);
        
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
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `espresso-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getAppliedFixes = () => {
    if (!generation) return [];
    const fixes = [];
    if (generation.fixes.fixEyeContact) fixes.push('Eye contact');
    if (generation.fixes.improvePosture) fixes.push('Posture');
    if (generation.fixes.adjustAngle) fixes.push('Angle');
    if (generation.fixes.enhanceLighting) fixes.push('Lighting');
    return fixes;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Generation not found</p>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          
          <span className="font-semibold">Results</span>
          
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Status */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-semibold">Your variations</h1>
            {generation.status === 'completed' && (
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                Complete
              </span>
            )}
            {generation.status === 'processing' && (
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {getAppliedFixes().join(' · ')}
          </p>
        </div>

        {generation.status === 'processing' ? (
          <div className="py-8">
            <PipelineProgress progress={generation.pipelineProgress || null} />
          </div>
        ) : generation.status === 'completed' ? (
          <>
            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {generation.generatedImageUrls.map((url, index) => {
                const styleName = generation.variationResults?.[index]?.style || STYLE_NAMES[index] || `Variation ${index + 1}`;
                return (
                  <div
                    key={index}
                    className={`
                      relative aspect-[4/5] rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                      ${selectedImage === index ? 'border-black' : 'border-transparent hover:border-gray-200'}
                    `}
                    onClick={() => setSelectedImage(selectedImage === index ? null : index)}
                  >
                    <img
                      src={url}
                      alt={styleName}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Style label */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                      <span className="text-white text-xs font-medium capitalize">{styleName}</span>
                    </div>

                    {/* Selected indicator */}
                    {selectedImage === index && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Image Preview */}
            {selectedImage !== null && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium capitalize">
                    {generation.variationResults?.[selectedImage]?.style || STYLE_NAMES[selectedImage] || `Variation ${selectedImage + 1}`}
                  </span>
                  <div className="flex gap-2">
                    {isDatingGeneration && (
                      <Button
                        size="sm"
                        variant={showPhonePreview ? "default" : "outline"}
                        onClick={() => setShowPhonePreview(!showPhonePreview)}
                      >
                        <Smartphone className="w-4 h-4 mr-1" />
                        Preview in App
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(generation.generatedImageUrls[selectedImage], selectedImage)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center gap-8">
                  {/* Main image */}
                  <img
                    src={generation.generatedImageUrls[selectedImage]}
                    alt={generation.variationResults?.[selectedImage]?.style || STYLE_NAMES[selectedImage] || `Variation ${selectedImage + 1}`}
                    className="max-h-[500px] rounded-lg"
                  />
                  
                  {/* Phone preview */}
                  {showPhonePreview && isDatingGeneration && (
                    <div className="flex flex-col items-center gap-4">
                      {/* App selector */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedApp('bumble')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            selectedApp === 'bumble' ? 'bg-[#FFC629] text-black' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          🐝 Bumble
                        </button>
                        <button
                          onClick={() => setSelectedApp('tinder')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            selectedApp === 'tinder' ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          🔥 Tinder
                        </button>
                        <button
                          onClick={() => setSelectedApp('hinge')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            selectedApp === 'hinge' ? 'bg-[#5C5C5C] text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          💜 Hinge
                        </button>
                      </div>
                      
                      {/* Phone mockup */}
                      {selectedApp === 'bumble' && (
                        <BumblePreview
                          photos={[generation.generatedImageUrls[selectedImage]]}
                          name="You"
                          age={25}
                          bio="Living my best life ☕️ | Love good conversations and spontaneous adventures"
                          occupation="Creative Professional"
                        />
                      )}
                      {selectedApp === 'tinder' && (
                        <TinderPreview
                          photos={[generation.generatedImageUrls[selectedImage]]}
                          name="You"
                          age={25}
                          bio="Living my best life ☕️ | Love good conversations and spontaneous adventures"
                          distance="2 miles away"
                        />
                      )}
                      {selectedApp === 'hinge' && (
                        <HingePreview
                          photos={[generation.generatedImageUrls[selectedImage]]}
                          name="You"
                          age={25}
                          prompts={[
                            { question: "A life goal of mine", answer: "To travel to every continent and try the local coffee" }
                          ]}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <Link href="/generate">
                <Button variant="outline">New generation</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="py-24 text-center">
            <p className="text-gray-600 mb-4">Generation failed</p>
            <Link href="/generate">
              <Button>Try again</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
