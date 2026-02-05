"use client";

import { Eye, Move, Camera, Sun, AlertTriangle, CheckCircle } from "lucide-react";

interface IssueDetection {
  present: boolean;
  severity: 1 | 2 | 3 | 4 | 5;
  description: string;
}

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
    eyeContact: IssueDetection;
    posture: IssueDetection;
    angle: IssueDetection;
    lighting: IssueDetection;
  };
  overallQuality: number;
  summary: string;
}

interface AnalysisPreviewProps {
  analysis: AnalysisResult;
  selectedFixes: Set<string>;
  onToggleFix: (fixId: string) => void;
}

const FIX_CONFIG = {
  eyeContact: {
    id: "fixEyeContact",
    label: "Eye Contact",
    icon: Eye,
    issueKey: "eyeContact" as const,
  },
  posture: {
    id: "improvePosture",
    label: "Posture",
    icon: Move,
    issueKey: "posture" as const,
  },
  angle: {
    id: "adjustAngle",
    label: "Angle",
    icon: Camera,
    issueKey: "angle" as const,
  },
  lighting: {
    id: "enhanceLighting",
    label: "Lighting",
    icon: Sun,
    issueKey: "lighting" as const,
  },
};

function getSeverityColor(severity: number): string {
  if (severity <= 2) return "text-green-600";
  if (severity <= 3) return "text-yellow-600";
  return "text-red-600";
}

function getSeverityBg(severity: number): string {
  if (severity <= 2) return "bg-green-50";
  if (severity <= 3) return "bg-yellow-50";
  return "bg-red-50";
}

export function AnalysisPreview({ analysis, selectedFixes, onToggleFix }: AnalysisPreviewProps) {
  if (!analysis.face.detected) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">No face detected</span>
        </div>
        <p className="text-sm text-red-600 mt-1">
          Please upload a photo with a clearly visible face.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Photo Analysis</span>
          <span className="text-xs text-gray-500">
            Quality: {analysis.overallQuality}/100
          </span>
        </div>
        <p className="text-sm text-gray-600">{analysis.summary}</p>
      </div>

      {/* Issues & Recommendations */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-500">Detected Issues</span>
        
        {Object.entries(FIX_CONFIG).map(([key, config]) => {
          const issue = analysis.issuesDetected[config.issueKey];
          const isSelected = selectedFixes.has(config.id);
          const Icon = config.icon;

          return (
            <button
              key={key}
              onClick={() => onToggleFix(config.id)}
              className={`
                w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3
                ${isSelected 
                  ? "border-black bg-gray-50" 
                  : issue.present 
                    ? `border-gray-200 ${getSeverityBg(issue.severity)}` 
                    : "border-gray-100 bg-gray-50 opacity-60"
                }
              `}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${isSelected ? "bg-black text-white" : issue.present ? getSeverityColor(issue.severity) + " bg-white" : "bg-gray-100 text-gray-400"}
              `}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{config.label}</span>
                  {issue.present ? (
                    <span className={`text-xs ${getSeverityColor(issue.severity)}`}>
                      Severity: {issue.severity}/5
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Good
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {issue.present ? issue.description : "No issues detected"}
                </p>
              </div>

              <div className={`
                w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0
                ${isSelected ? "border-black bg-black" : "border-gray-300"}
              `}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Gaze</p>
          <p className="text-sm font-medium capitalize">{analysis.face.gazeDirection}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Posture</p>
          <p className="text-sm font-medium capitalize">{analysis.pose.bodyPosture.replace('_', ' ')}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Lighting</p>
          <p className="text-sm font-medium capitalize">{analysis.lighting.quality}</p>
        </div>
      </div>
    </div>
  );
}
