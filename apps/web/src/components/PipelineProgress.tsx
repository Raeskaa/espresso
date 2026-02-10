"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Lightbulb,
  Paintbrush,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export interface PipelineProgressData {
  stage: 'pending' | 'analyzing' | 'planning' | 'generating' | 'validating' | 'complete' | 'failed';
  stageProgress?: number;
  currentVariation?: number;
  totalVariations?: number;
  message?: string;
  estimatedTimeRemaining?: number;
  startedAt?: number;
  // Dating studio-specific fields
  type?: string;
  targetApp?: string;
  progress?: number;
  errors?: string[];
}

interface PipelineProgressProps {
  progress: PipelineProgressData | null;
}

const STAGES = [
  { id: 'analyzing', label: 'Analyzing', icon: Search, description: 'Understanding your photo' },
  { id: 'planning', label: 'Planning', icon: Lightbulb, description: 'Creating edit strategy' },
  { id: 'generating', label: 'Generating', icon: Paintbrush, description: 'Creating variations' },
  { id: 'validating', label: 'Validating', icon: CheckCircle2, description: 'Quality check' },
];

const STAGE_ORDER = ['pending', 'analyzing', 'planning', 'generating', 'validating', 'complete'];

// Dynamic messages for each stage
const STAGE_MESSAGES: Record<string, string[]> = {
  pending: [
    "Warming up the AI...",
    "Preparing your photo for enhancement...",
    "Getting everything ready...",
  ],
  analyzing: [
    "Studying your facial features...",
    "Detecting lighting conditions...",
    "Analyzing composition and framing...",
    "Understanding the scene...",
    "Mapping key details...",
  ],
  planning: [
    "Designing the perfect edits...",
    "Crafting your enhancement strategy...",
    "Planning natural improvements...",
    "Optimizing for best results...",
  ],
  generating: [
    "Creating your variations...",
    "Applying intelligent edits...",
    "Rendering high-quality results...",
    "Fine-tuning the details...",
    "Making each variation unique...",
  ],
  validating: [
    "Checking quality and accuracy...",
    "Verifying natural appearance...",
    "Ensuring identity preservation...",
    "Running final quality checks...",
  ],
};

function getStageIndex(stage: string): number {
  const idx = STAGE_ORDER.indexOf(stage);
  return idx >= 0 ? idx : 0;
}

function isStageComplete(currentStage: string, checkStage: string): boolean {
  return getStageIndex(currentStage) > getStageIndex(checkStage);
}

function isStageActive(currentStage: string, checkStage: string): boolean {
  return currentStage === checkStage;
}

function useRotatingMessage(stage: string): string {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = STAGE_MESSAGES[stage] || STAGE_MESSAGES.pending;

  useEffect(() => {
    setMessageIndex(0);
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [stage, messages.length]);

  return messages[messageIndex];
}

// Calculate overall progress percentage
function getOverallProgress(progress: PipelineProgressData): number {
  const stageWeights: Record<string, { start: number; end: number }> = {
    pending: { start: 0, end: 5 },
    analyzing: { start: 5, end: 25 },
    planning: { start: 25, end: 40 },
    generating: { start: 40, end: 85 },
    validating: { start: 85, end: 95 },
    complete: { start: 100, end: 100 },
  };

  const weight = stageWeights[progress.stage] || stageWeights.pending;
  const stageProgress = progress.stageProgress || progress.progress || 0;
  const range = weight.end - weight.start;

  return Math.min(weight.start + (stageProgress / 100) * range, 99);
}

export function PipelineProgress({ progress }: PipelineProgressProps) {
  const currentStage = progress?.stage || 'pending';
  const dynamicMessage = useRotatingMessage(currentStage);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Track elapsed time
  useEffect(() => {
    const startTime = progress?.startedAt || Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [progress?.startedAt]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (!progress) {
    return (
      <div className="py-16 text-center">
        <div className="relative mx-auto w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full bg-[#2D4A3E]/5 animate-ping" />
          <div className="relative w-full h-full rounded-full bg-[#2D4A3E]/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-[#2D4A3E]/40 animate-pulse" />
          </div>
        </div>
        <p className="text-[#2D4A3E] font-medium mb-1">Starting generation...</p>
        <p className="text-sm text-[#2D4A3E]/50">This usually takes 30–60 seconds</p>
      </div>
    );
  }

  if (currentStage === 'failed') {
    return (
      <div className="py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-[#2D4A3E] font-medium mb-1">Generation failed</p>
        <p className="text-sm text-[#2D4A3E]/50">{progress.message || 'Something went wrong. Please try again.'}</p>
      </div>
    );
  }

  if (currentStage === 'complete') {
    return (
      <div className="py-16 text-center animate-in fade-in duration-500">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        </div>
        <p className="text-[#2D4A3E] font-medium mb-1">Generation complete!</p>
        <p className="text-sm text-[#2D4A3E]/50">Your variations are ready</p>
      </div>
    );
  }

  const overallProgress = getOverallProgress(progress);

  return (
    <div className="py-8 max-w-lg mx-auto">
      {/* Overall progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#2D4A3E]/50">Overall progress</span>
          <span className="text-xs font-medium text-[#2D4A3E]/70">{Math.round(overallProgress)}%</span>
        </div>
        <div className="h-2 bg-[#2D4A3E]/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2D4A3E] to-[#3d6b5a] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex justify-center gap-2 mb-8">
        {STAGES.map((stage, index) => {
          const isComplete = isStageComplete(currentStage, stage.id);
          const isActive = isStageActive(currentStage, stage.id);
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                    ${isComplete ? 'bg-[#2D4A3E] text-white scale-100' : ''}
                    ${isActive ? 'bg-[#2D4A3E] text-white scale-110 shadow-lg shadow-[#2D4A3E]/20' : ''}
                    ${!isComplete && !isActive ? 'bg-[#2D4A3E]/8 text-[#2D4A3E]/30' : ''}
                  `}
                >
                  {isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#2D4A3E]' : isComplete ? 'text-[#2D4A3E]/60' : 'text-[#2D4A3E]/30'
                  }`}>
                  {stage.label}
                </span>
              </div>
              {index < STAGES.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 mb-5 transition-colors duration-300 ${isComplete ? 'bg-[#2D4A3E]' : 'bg-[#2D4A3E]/10'
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic message */}
      <div className="text-center mb-6">
        <p className="text-sm text-[#2D4A3E] font-medium mb-1 transition-all duration-300">
          {progress.message || dynamicMessage}
        </p>
        <p className="text-xs text-[#2D4A3E]/40">
          {elapsedTime > 0 && `${formatTime(elapsedTime)} elapsed`}
          {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
            <> · ~{Math.ceil(progress.estimatedTimeRemaining / 60)} min remaining</>
          )}
        </p>
      </div>

      {/* Variation progress (during generating/validating) */}
      {(currentStage === 'generating' || currentStage === 'validating') && progress.currentVariation !== undefined && (
        <div className="bg-[#2D4A3E]/5 rounded-xl p-4">
          <div className="flex justify-between text-xs text-[#2D4A3E]/60 mb-2">
            <span>Variation {progress.currentVariation} of {progress.totalVariations || 5}</span>
            <span>{progress.stageProgress || 0}%</span>
          </div>
          <div className="h-1.5 bg-[#2D4A3E]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D4A3E] rounded-full transition-all duration-500"
              style={{ width: `${progress.stageProgress || 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
