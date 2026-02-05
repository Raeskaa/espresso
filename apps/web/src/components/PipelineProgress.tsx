"use client";

import { 
  Search,
  Lightbulb,
  Paintbrush,
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";

export interface PipelineProgressData {
  stage: 'pending' | 'analyzing' | 'planning' | 'generating' | 'validating' | 'complete' | 'failed';
  stageProgress: number;
  currentVariation: number;
  totalVariations: number;
  message: string;
  estimatedTimeRemaining: number;
  startedAt: number;
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

export function PipelineProgress({ progress }: PipelineProgressProps) {
  if (!progress) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Starting generation...</p>
      </div>
    );
  }

  const currentStage = progress.stage;

  if (currentStage === 'failed') {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <p className="text-gray-800 font-medium mb-1">Generation failed</p>
        <p className="text-sm text-gray-500">{progress.message || 'Something went wrong'}</p>
      </div>
    );
  }

  if (currentStage === 'complete') {
    return (
      <div className="py-16 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-4" />
        <p className="text-gray-800 font-medium mb-1">Generation complete!</p>
        <p className="text-sm text-gray-500">Your variations are ready</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Stage indicators */}
      <div className="flex justify-center gap-2 mb-8">
        {STAGES.map((stage, index) => {
          const isComplete = isStageComplete(currentStage, stage.id);
          const isActive = isStageActive(currentStage, stage.id);
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full transition-all
                  ${isComplete ? 'bg-black text-white' : ''}
                  ${isActive ? 'bg-gray-900 text-white' : ''}
                  ${!isComplete && !isActive ? 'bg-gray-100 text-gray-400' : ''}
                `}
              >
                {isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              {index < STAGES.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    isComplete ? 'bg-black' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current stage info */}
      <div className="text-center mb-6">
        <p className="text-lg font-medium text-gray-800 mb-1">
          {STAGES.find(s => s.id === currentStage)?.label || 'Processing'}
        </p>
        <p className="text-sm text-gray-500">
          {progress.message}
        </p>
      </div>

      {/* Variation progress (only during generating/validating) */}
      {(currentStage === 'generating' || currentStage === 'validating') && (
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Variation {progress.currentVariation} of {progress.totalVariations}</span>
            <span>{progress.stageProgress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-300"
              style={{ width: `${progress.stageProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Estimated time */}
      {progress.estimatedTimeRemaining > 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">
          About {Math.ceil(progress.estimatedTimeRemaining / 60)} min remaining
        </p>
      )}
    </div>
  );
}
