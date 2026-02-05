"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnalysisPreview } from "@/components/AnalysisPreview";
import { TemplateSelectors } from "@/components/TemplateSelector";
import { 
  Upload, 
  X, 
  Eye, 
  Move, 
  Sun, 
  Camera,
  ArrowLeft,
  Loader2,
  Check,
  Sparkles
} from "lucide-react";
import { createGeneration, analyzeImage } from "@/app/actions/generation";
import { 
  EYE_CONTACT_TEMPLATES, 
  POSTURE_TEMPLATES, 
  ANGLE_TEMPLATES, 
  LIGHTING_TEMPLATES 
} from "@/lib/imagen/templates";

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

const TEMPLATES = {
  eyeContact: EYE_CONTACT_TEMPLATES,
  posture: POSTURE_TEMPLATES,
  angle: ANGLE_TEMPLATES,
  lighting: LIGHTING_TEMPLATES,
};

interface AnalysisResult {
  face: {
    detected: boolean;
    gazeDirection: string;
    gazeConfidence: number;
    expression: string;
  };
  pose: {
    headTilt: number;
    shoulderLine: string;
    bodyPosture: string;
  };
  lighting: {
    mainDirection: string;
    quality: string;
    colorTemp: string;
    shadowIntensity: number;
  };
  composition: {
    subjectPosition: string;
    headroom: string;
    cameraAngle: string;
  };
  issuesDetected: {
    eyeContact: { present: boolean; severity: 1 | 2 | 3 | 4 | 5; description: string };
    posture: { present: boolean; severity: 1 | 2 | 3 | 4 | 5; description: string };
    angle: { present: boolean; severity: 1 | 2 | 3 | 4 | 5; description: string };
    lighting: { present: boolean; severity: 1 | 2 | 3 | 4 | 5; description: string };
  };
  overallQuality: number;
  summary: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selectedFixes, setSelectedFixes] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [templateSelections, setTemplateSelections] = useState<Record<string, string>>({
    eyeContact: "direct",
    posture: "shoulders_back",
    angle: "flattering",
    lighting: "softer",
  });

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
      setAnalysis(null); // Reset analysis when new image uploaded
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    try {
      const base64Data = image.split(',')[1];
      const result = await analyzeImage(base64Data);
      
      if (result.success && result.analysis) {
        setAnalysis(result.analysis as AnalysisResult);
        
        // Auto-select fixes with issues
        const issues = result.analysis.issuesDetected;
        const autoFixes = new Set<string>();
        if (issues.eyeContact.present && issues.eyeContact.severity >= 3) autoFixes.add('fixEyeContact');
        if (issues.posture.present && issues.posture.severity >= 3) autoFixes.add('improvePosture');
        if (issues.angle.present && issues.angle.severity >= 3) autoFixes.add('adjustAngle');
        if (issues.lighting.present && issues.lighting.severity >= 3) autoFixes.add('enhanceLighting');
        
        if (autoFixes.size > 0) {
          setSelectedFixes(autoFixes);
        }
      } else {
        alert(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
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

  const handleSelectTemplate = (editType: string, templateId: string) => {
    setTemplateSelections((prev) => ({
      ...prev,
      [editType]: templateId,
    }));
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

      const result = await createGeneration(base64Data, fixes);
      
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
    setAnalysis(null);
    setSelectedFixes(new Set());
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          
          <span className="font-semibold">New Generation</span>
          
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12">
        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-3">1. Upload photo</h2>
          
          {!image ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragging ? "border-black bg-gray-50" : "border-gray-300 hover:border-gray-400"}
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
              
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                Drop your photo here
              </p>
              <p className="text-xs text-gray-400">
                or click to browse
              </p>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={image}
                alt="Upload preview"
                className="w-full aspect-square object-cover"
              />
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-white/90 backdrop-blur-sm border-t border-gray-100">
                <p className="text-sm text-gray-600 truncate">{fileName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Preview (optional) */}
        {image && !analysis && (
          <div className="mb-8">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze photo (optional)
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Get AI recommendations for fixes
            </p>
          </div>
        )}

        {/* Analysis Results with Smart Fix Selection */}
        {analysis && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 mb-3">2. Select fixes</h2>
            <AnalysisPreview 
              analysis={analysis} 
              selectedFixes={selectedFixes}
              onToggleFix={toggleFix}
            />
          </div>
        )}

        {/* Manual Fix Selection (when no analysis) */}
        {!analysis && image && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 mb-3">2. Select fixes</h2>
            
            <div className="space-y-2">
              {fixOptions.map((option) => {
                const isSelected = selectedFixes.has(option.id);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleFix(option.id)}
                    className={`
                      w-full p-4 rounded-lg border text-left transition-colors flex items-center gap-4
                      ${isSelected 
                        ? "border-black bg-gray-50" 
                        : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isSelected ? "bg-black text-white" : "bg-gray-100 text-gray-600"}
                    `}>
                      {option.icon}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                    
                    <div className={`
                      w-5 h-5 rounded-full border flex items-center justify-center
                      ${isSelected ? "border-black bg-black" : "border-gray-300"}
                    `}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Advanced: Template Selection */}
        {selectedFixes.size > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1"
            >
              {showAdvanced ? "Hide" : "Show"} advanced options
              <svg 
                className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAdvanced && (
              <div className="mt-4">
                <TemplateSelectors
                  selectedFixes={selectedFixes}
                  templateSelections={templateSelections}
                  onSelectTemplate={handleSelectTemplate}
                  templates={TEMPLATES}
                />
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        <div>
          <Button
            onClick={handleGenerate}
            disabled={!image || selectedFixes.size === 0 || isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate 5 variations"
            )}
          </Button>
          
          <p className="text-center text-xs text-gray-400 mt-3">
            Uses 1 credit
          </p>
        </div>
      </main>
    </div>
  );
}
