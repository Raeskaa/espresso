/**
 * Espresso Image Pipeline - Main Orchestrator
 * 
 * Coordinates the full image editing pipeline:
 * 1. Analyzer - Understand the image
 * 2. Planner - Create edit strategy
 * 3. Editor - Generate variations (parallel)
 * 4. Critic - Validate each variation with retry loop
 */

import { analyze } from './analyzer';
import { generateSingleEdit } from './editor';
import { validateStep } from './critic';
import { uploadToSupabase, createProgress, generateFallbackUrl } from './utils';
import { CONFIG, VARIATION_PROFILES } from './config';
import { getDefaultTemplate } from './templates';
import type {
  GenerateOptions,
  GenerationResult,
  VariationResult,
  PipelineProgress,
  AnalysisResult,
  FixSelection,
  PipelineRun,
  SequentialStep,
  VariationProfile,
} from './types';

/**
 * Main entry point for the image generation pipeline
 */
export async function generateImageVariations(
  options: GenerateOptions
): Promise<GenerationResult> {
  const { originalImageBase64, fixes, fixSelections, userId, generationId, onProgress, onVariationGenerated, analysis: analysisOverride } = options;
  const startTime = Date.now();

  console.log('='.repeat(60));
  console.log('[Pipeline] Starting Espresso Image Generation');
  console.log('[Pipeline] Generation ID:', generationId);
  console.log('[Pipeline] Fixes:', fixes);
  console.log('='.repeat(60));

  let analysis: AnalysisResult | undefined;
  let plan: undefined;

  try {
    // ========================================================================
    // STAGE 1: ANALYZE
    // ========================================================================
    await updateProgress(onProgress, 'analyzing', 'Analyzing your photo...', 0);

    analysis = analysisOverride || await analyze(originalImageBase64);

    await updateProgress(onProgress, 'analyzing', 'Analysis complete', 100);
    console.log('[Pipeline] Analysis complete');

    // ========================================================================
    // STAGE 2: PLAN (reserved for future planning step)
    // ========================================================================
    await updateProgress(onProgress, 'planning', 'Preparing edits...', 100);

    // ========================================================================
    // STAGE 3-4: GENERATE + VALIDATE (Parallel)
    // ========================================================================
    await updateProgress(onProgress, 'generating', 'Starting generation...', 0, 1);

    const selectionList = normalizeFixSelections(fixSelections);
    const variations = await generateSequentialVariations(
      originalImageBase64,
      selectionList,
      analysis,
      userId,
      onProgress,
      onVariationGenerated
    );

    // ========================================================================
    // COMPLETE
    // ========================================================================
    await updateProgress(onProgress, 'complete', 'Complete!', 100);

    const totalTime = Date.now() - startTime;
    const successCount = variations.filter(v => v.success).length;

    console.log('='.repeat(60));
    console.log(`[Pipeline] Complete in ${totalTime}ms`);
    console.log(`[Pipeline] ${successCount}/${variations.length} variations successful`);
    console.log('='.repeat(60));

    return {
      success: successCount > 0,
      variations,
      analysis,
      plan,
      totalTime,
    };

  } catch (error) {
    console.error('[Pipeline] Fatal error:', error);

    await updateProgress(onProgress, 'failed', 'Generation failed', 0);

    return {
      success: false,
      variations: [],
      analysis,
      plan,
      totalTime: Date.now() - startTime,
    };
  }
}

function normalizeFixSelections(fixSelections: FixSelection[]): FixSelection[] {
  if (fixSelections && fixSelections.length > 0) {
    return fixSelections;
  }

  return CONFIG.sequential.editOrder.map((editType) => ({
    editType,
    enabled: false,
    template: getDefaultTemplate(editType),
  }));
}

async function generateSequentialVariations(
  originalImageBase64: string,
  fixSelections: FixSelection[],
  analysis: AnalysisResult,
  userId: string,
  onProgress?: (progress: PipelineProgress) => Promise<void>,
  onVariationGenerated?: (variation: VariationResult) => Promise<void>
): Promise<VariationResult[]> {
  const enabledFixes = fixSelections
    .filter((fix) => fix.enabled)
    .sort((a, b) => CONFIG.sequential.editOrder.indexOf(a.editType) - CONFIG.sequential.editOrder.indexOf(b.editType));

  const variationProfiles: VariationProfile[] = VARIATION_PROFILES.map((profile) => ({
    ...profile,
  }));

  const totalVariations = CONFIG.sequential.parallelPipelines;
  const pipelines = await Promise.all(
    Array.from({ length: totalVariations }).map((_, index) =>
      runSequentialPipeline(
        index,
        originalImageBase64,
        enabledFixes,
        analysis,
        variationProfiles[index % variationProfiles.length],
        onProgress,
        totalVariations
      )
    )
  );

  const results: VariationResult[] = [];
  for (const pipeline of pipelines) {
    let variation: VariationResult;
    if (!pipeline.success || !pipeline.finalImageBase64) {
      variation = {
        index: pipeline.id,
        style: 'sequential',
        success: false,
        imageUrl: generateFallbackUrl(pipeline.id),
        attempts: pipeline.steps.reduce((sum, step) => sum + step.attempts, 0),
        fallback: true,
        error: 'Sequential pipeline failed',
      };
    } else {
      const imageUrl = await uploadToSupabase(pipeline.finalImageBase64, userId, pipeline.id);
      variation = {
        index: pipeline.id,
        style: pipeline.steps.map((step) => step.editType).join('+') || 'sequential',
        success: true,
        imageUrl,
        attempts: pipeline.steps.reduce((sum, step) => sum + step.attempts, 0),
        fallback: false,
      };
    }

    results.push(variation);

    // Call callback immediately after individual variation is ready
    if (onVariationGenerated) {
      await onVariationGenerated(variation);
    }
  }

  return results;
}

async function runSequentialPipeline(
  pipelineId: number,
  originalImageBase64: string,
  fixes: FixSelection[],
  analysis: AnalysisResult,
  variationProfile: VariationProfile,
  onProgress: ((progress: PipelineProgress) => Promise<void>) | undefined,
  totalVariations: number
): Promise<PipelineRun> {
  let currentImage = originalImageBase64;
  const steps: SequentialStep[] = [];

  for (const fix of fixes) {
    let success = false;
    let attempts = 0;
    let lastValidation: SequentialStep['validation'];

    while (!success && attempts < CONFIG.sequential.maxRetriesPerStep) {
      attempts += 1;

      await updateProgress(
        onProgress,
        'generating',
        `Generating ${fix.editType} (variation ${pipelineId + 1})...`,
        Math.round(((pipelineId + 1) / totalVariations) * 100),
        pipelineId + 1,
        totalVariations
      );

      const result = await generateSingleEdit(
        currentImage,
        fix.editType,
        fix.template,
        analysis,
        fix.customPrompt,
        attempts,
        variationProfile.promptHint
      );

      if (!result.success || !result.imageBase64) {
        continue;
      }

      await updateProgress(
        onProgress,
        'validating',
        `Validating ${fix.editType} (variation ${pipelineId + 1})...`,
        Math.round(((pipelineId + 1) / totalVariations) * 100),
        pipelineId + 1,
        totalVariations
      );

      const validation = await validateStep(currentImage, result.imageBase64, fix.editType, fix.template);
      lastValidation = validation;

      if (validation.canProceed) {
        currentImage = result.imageBase64;
        success = true;
        break;
      }
    }

    steps.push({
      editType: fix.editType,
      template: fix.template,
      attempts,
      success,
      validation: lastValidation,
      error: success ? undefined : lastValidation?.feedback || 'Validation failed',
    });

    if (!success) {
      return {
        id: pipelineId,
        steps,
        success: false,
      };
    }
  }

  return {
    id: pipelineId,
    steps,
    finalImageBase64: currentImage,
    success: true,
  };
}


/**
 * Helper to update progress
 */
async function updateProgress(
  onProgress: ((progress: PipelineProgress) => Promise<void>) | undefined,
  stage: PipelineProgress['stage'],
  message: string,
  stageProgress: number,
  currentVariation: number = 0,
  totalVariations: number = 5
): Promise<void> {
  if (!onProgress) return;

  const progress = createProgress(
    stage,
    message,
    currentVariation,
    totalVariations,
    stageProgress
  );

  await onProgress(progress);
}

// Re-export types for convenience
export type { GenerateOptions, GenerationResult, VariationResult, PipelineProgress, FixSelection };
