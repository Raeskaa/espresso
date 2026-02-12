/**
 * Espresso Image Pipeline - Type Definitions
 * 
 * This module defines all TypeScript interfaces for the agentic image editing pipeline.
 */

import type { FixOptions } from "@espresso/utils";

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceAnalysis {
  detected: boolean;
  boundingBox?: BoundingBox;
  gazeDirection: 'camera' | 'left' | 'right' | 'up' | 'down' | 'away';
  gazeConfidence: number;
  expression: string;
  landmarks?: {
    leftEye: Point;
    rightEye: Point;
    nose: Point;
    mouthCenter: Point;
  };
}

export interface PoseAnalysis {
  headTilt: number; // degrees, positive = right tilt
  shoulderLine: 'level' | 'left_high' | 'right_high';
  shoulderAngle: number;
  bodyPosture: 'upright' | 'slouched' | 'leaning_forward' | 'leaning_back';
}

export interface LightingAnalysis {
  mainDirection: 'front' | 'left' | 'right' | 'above' | 'below' | 'behind';
  quality: 'soft' | 'medium' | 'harsh';
  colorTemp: 'warm' | 'neutral' | 'cool';
  shadowIntensity: number; // 0-100
  highlightClipping: boolean;
}

export interface CompositionAnalysis {
  subjectPosition: 'center' | 'left' | 'right';
  headroom: 'too_much' | 'good' | 'too_little';
  cameraAngle: 'above' | 'eye_level' | 'below';
}

export interface IssueDetection {
  present: boolean;
  severity: 1 | 2 | 3 | 4 | 5;
  description: string;
}

export interface AnalysisResult {
  face: FaceAnalysis;
  pose: PoseAnalysis;
  lighting: LightingAnalysis;
  composition: CompositionAnalysis;
  issuesDetected: {
    eyeContact: IssueDetection;
    posture: IssueDetection;
    angle: IssueDetection;
    lighting: IssueDetection;
  };
  overallQuality: number; // 0-100
  summary: string;
}

// ============================================================================
// PLANNING TYPES
// ============================================================================

export interface EditStep {
  order: number;
  target: 'eyes' | 'face' | 'head' | 'shoulders' | 'body' | 'lighting' | 'global';
  action: string;
  intensity: number; // 0-100
  technicalGuidance: string;
  warningsAndConstraints: string[];
}

export interface RiskAssessment {
  identityRisk: 'low' | 'medium' | 'high';
  distortionRisk: 'low' | 'medium' | 'high';
  overallRisk: 'low' | 'medium' | 'high';
}

export interface StyleVariation {
  name: 'natural' | 'professional' | 'editorial' | 'warm' | 'cool';
  description: string;
  adjustments: {
    intensityMultiplier: number; // 0.5 - 1.5
    colorTempShift: number; // -500 to +500 Kelvin
    contrastAdjust: number; // -20 to +20
    clarityAdjust: number; // -20 to +20
  };
}

export interface EditPlan {
  reasoning: string; // Chain of thought
  strategy: 'conservative' | 'moderate' | 'aggressive';
  riskAssessment: RiskAssessment;
  steps: EditStep[];
  fallbackPlan: string;
}

// ============================================================================
// EDITOR TYPES
// ============================================================================

export interface EditRequest {
  originalImage: string; // base64
  plan: EditPlan;
  style: StyleVariation;
  intensityMultiplier: number;
  retryFeedback?: string;
  attempt: number;
}

export interface EditResult {
  success: boolean;
  imageBase64?: string;
  error?: string;
}

// ============================================================================
// CRITIC TYPES
// ============================================================================

export interface CriticScores {
  identityPreservation: number; // 0-100
  editAccuracy: number; // 0-100
  naturalness: number; // 0-100
  technicalQuality: number; // 0-100
  overall: number; // weighted average
}

export interface CriticIssue {
  detected: boolean;
  description: string;
  severity: number;
}

export interface RetryRecommendations {
  reduceIntensity: boolean;
  intensityReduction: number;
  avoidAreas: string[];
  alternativeApproach: string;
}

export interface CriticResult {
  scores: CriticScores;
  issues: {
    faceDistortion: CriticIssue;
    colorShift: CriticIssue;
    artifacts: CriticIssue;
    identityDrift: CriticIssue;
    unnaturalEdits: CriticIssue;
  };
  decision: 'pass' | 'retry' | 'fail';
  feedback: string;
  retryRecommendations: RetryRecommendations;
}

// ============================================================================
// PIPELINE TYPES
// ============================================================================

export type PipelineStage =
  | 'pending'
  | 'analyzing'
  | 'planning'
  | 'generating'
  | 'validating'
  | 'complete'
  | 'failed';

export interface PipelineProgress {
  stage: PipelineStage;
  stageProgress: number; // 0-100 within current stage
  currentVariation: number; // 1-5
  totalVariations: number;
  message: string;
  estimatedTimeRemaining: number; // seconds
  startedAt: number; // timestamp
}

export interface VariationResult {
  index: number;
  style: string;
  success: boolean;
  imageUrl?: string;
  scores?: CriticScores;
  attempts: number;
  fallback: boolean;
  error?: string;
}

export interface GenerationResult {
  success: boolean;
  variations: VariationResult[];
  analysis?: AnalysisResult;
  plan?: EditPlan;
  totalTime: number; // milliseconds
}

// ============================================================================
// SEQUENTIAL PIPELINE TYPES
// ============================================================================

export type EditType = 'eyeContact' | 'posture' | 'angle' | 'lighting';

export interface FixTemplate {
  id: string;
  editType: EditType;
  label: string;
  description: string;
  promptModifier: string;
  iconKey?: 'shouldersBack' | 'chinUp' | 'straightenHead' | 'leanIn';
  isDefault?: boolean;
}

export interface FixSelection {
  editType: EditType;
  enabled: boolean;
  template: FixTemplate;
  customPrompt?: string;
}

export interface StepValidation {
  identityPreserved: boolean;
  editApplied: boolean;
  naturalness: number;
  canProceed: boolean;
  feedback?: string;
}

export interface SequentialStep {
  editType: EditType;
  template: FixTemplate;
  attempts: number;
  success: boolean;
  validation?: StepValidation;
  error?: string;
}

export interface PipelineRun {
  id: number;
  steps: SequentialStep[];
  finalImageBase64?: string;
  finalImageUrl?: string;
  success: boolean;
}

export interface VariationProfile {
  id: string;
  label: string;
  intensityMultiplier: number;
  promptHint: string;
}

// ============================================================================
// FUNCTION PARAMETERS
// ============================================================================

export interface GenerateOptions {
  originalImageBase64: string;
  fixes: FixOptions;
  fixSelections: FixSelection[];
  userId: string;
  generationId: string;
  analysis?: AnalysisResult;
  onProgress?: (progress: PipelineProgress) => Promise<void>;
  onVariationGenerated?: (variation: VariationResult) => Promise<void>;
}
