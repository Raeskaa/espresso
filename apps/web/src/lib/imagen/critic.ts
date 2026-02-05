/**
 * Espresso Image Pipeline - Critic Stage
 * 
 * Validates the edited image by comparing it to the original.
 * Detects distortions, identity drift, and quality issues.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from './config';
import { CRITIC_SYSTEM_PROMPT, buildCriticUserPrompt } from './prompts';
import { parseJsonResponse } from './utils';
import type { CriticResult, StepValidation, EditType, FixTemplate } from './types';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GOOGLE_AI_API_KEY environment variable');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Validate an edited image by comparing to original
 */
export async function validate(
  originalImageBase64: string,
  editedImageBase64: string
): Promise<CriticResult> {
  console.log('[Critic] Validating edited image...');

  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: CONFIG.models.critic,
    generationConfig: {
      temperature: 0.3, // Low temp for consistent evaluation
      topP: 0.8,
    },
  });

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${CRITIC_SYSTEM_PROMPT}\n\n${buildCriticUserPrompt()}\n\nNow compare these two images. First image is ORIGINAL, second is EDITED.`,
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: originalImageBase64,
              },
            },
            {
              inlineData: {
                mimeType: 'image/png',
                data: editedImageBase64,
              },
            },
          ],
        },
      ],
    });

    const responseText = result.response.text();
    console.log('[Critic] Raw response length:', responseText.length);

    const critique = parseJsonResponse<CriticResult>(responseText);
    
    if (!critique) {
      console.error('[Critic] Failed to parse response, using conservative pass');
      return createConservativeResult();
    }

    // Calculate weighted overall score if not provided
    if (!critique.scores.overall) {
      critique.scores.overall = calculateOverallScore(critique.scores);
    }

    // Determine decision based on score and issues
    critique.decision = determineDecision(critique);

    console.log('[Critic] Validation complete:', {
      decision: critique.decision,
      overall: critique.scores.overall,
      identity: critique.scores.identityPreservation,
      faceDistortion: critique.issues.faceDistortion.detected,
    });

    return critique;
  } catch (error) {
    console.error('[Critic] Error during validation:', error);
    return createConservativeResult();
  }
}

interface StepValidationResponse {
  samePerson: boolean;
  editApplied: boolean;
  naturalnessScore: number;
  hasArtifacts: boolean;
  artifactDescription?: string | null;
}

/**
 * Validate a single sequential edit step
 */
export async function validateStep(
  originalImageBase64: string,
  editedImageBase64: string,
  editType: EditType,
  template: FixTemplate
): Promise<StepValidation> {
  console.log(`[Critic] Validating step ${editType}...`);

  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: CONFIG.models.stepValidator,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
    },
  });

  const prompt = `Compare the ORIGINAL image (first) with the EDITED image (second).

The intended change was: "${template.promptModifier}"

Answer:
1) Is this clearly the same person? (yes/no)
2) Was the ${editType} edit applied successfully? (yes/no)
3) Does the edited image look natural? (score 0-100)
4) Are there any visible distortions or artifacts? (yes/no, describe if yes)

Output JSON exactly:
{
  "samePerson": boolean,
  "editApplied": boolean,
  "naturalnessScore": number,
  "hasArtifacts": boolean,
  "artifactDescription": string | null
}`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: originalImageBase64,
              },
            },
            {
              inlineData: {
                mimeType: 'image/png',
                data: editedImageBase64,
              },
            },
          ],
        },
      ],
    });

    const responseText = result.response.text();
    const parsed = parseJsonResponse<StepValidationResponse>(responseText);

    if (!parsed) {
      return {
        identityPreserved: true,
        editApplied: false,
        naturalness: 60,
        canProceed: false,
        feedback: 'Failed to parse validation response',
      };
    }

    const identityPreserved = parsed.samePerson;
    const naturalness = parsed.naturalnessScore;
    const canProceed = identityPreserved && parsed.editApplied && naturalness >= CONFIG.validation.minNaturalnessScore && !parsed.hasArtifacts;

    return {
      identityPreserved,
      editApplied: parsed.editApplied,
      naturalness,
      canProceed,
      feedback: parsed.hasArtifacts ? parsed.artifactDescription || undefined : undefined,
    };
  } catch (error) {
    console.error('[Critic] Error during step validation:', error);
    return {
      identityPreserved: true,
      editApplied: false,
      naturalness: 60,
      canProceed: false,
      feedback: 'Step validation failed',
    };
  }
}

/**
 * Calculate weighted overall score
 */
function calculateOverallScore(scores: CriticResult['scores']): number {
  const { identityPreservation, editAccuracy, naturalness, technicalQuality } = scores;
  const weights = CONFIG.criticWeights;
  
  return Math.round(
    identityPreservation * weights.identityPreservation +
    editAccuracy * weights.editAccuracy +
    naturalness * weights.naturalness +
    technicalQuality * weights.technicalQuality
  );
}

/**
 * Determine pass/retry/fail based on scores and issues
 */
function determineDecision(critique: CriticResult): 'pass' | 'retry' | 'fail' {
  const { scores, issues } = critique;
  
  // Critical issues = automatic fail
  if (issues.faceDistortion.detected && issues.faceDistortion.severity >= 7) {
    return 'fail';
  }
  if (issues.identityDrift.detected && issues.identityDrift.severity >= 7) {
    return 'fail';
  }
  
  // Score-based decision
  if (scores.overall >= CONFIG.thresholds.passScore) {
    // Even with passing score, fail if identity is compromised
    if (scores.identityPreservation < 70) {
      return 'retry';
    }
    return 'pass';
  }
  
  if (scores.overall >= CONFIG.thresholds.retryMinScore) {
    return 'retry';
  }
  
  return 'fail';
}

/**
 * Create a conservative result when critic fails
 * We err on the side of passing to avoid blocking legitimate images
 */
function createConservativeResult(): CriticResult {
  return {
    scores: {
      identityPreservation: 75,
      editAccuracy: 70,
      naturalness: 70,
      technicalQuality: 75,
      overall: 72,
    },
    issues: {
      faceDistortion: { detected: false, description: 'Unable to analyze', severity: 0 },
      colorShift: { detected: false, description: 'Unable to analyze', severity: 0 },
      artifacts: { detected: false, description: 'Unable to analyze', severity: 0 },
      identityDrift: { detected: false, description: 'Unable to analyze', severity: 0 },
      unnaturalEdits: { detected: false, description: 'Unable to analyze', severity: 0 },
    },
    decision: 'pass', // Conservative: pass when unsure
    feedback: 'Critic analysis failed, allowing image through with conservative pass.',
    retryRecommendations: {
      reduceIntensity: false,
      intensityReduction: 0,
      avoidAreas: [],
      alternativeApproach: '',
    },
  };
}
