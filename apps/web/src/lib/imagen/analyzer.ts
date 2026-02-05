/**
 * Espresso Image Pipeline - Analyzer Stage
 * 
 * Analyzes the input image to understand its current state
 * before planning any edits.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from './config';
import { ANALYZER_SYSTEM_PROMPT, buildAnalyzerUserPrompt } from './prompts';
import { parseJsonResponse } from './utils';
import type { AnalysisResult } from './types';

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
 * Analyze a portrait photo and return structured analysis
 */
export async function analyze(imageBase64: string): Promise<AnalysisResult> {
  console.log('[Analyzer] Starting image analysis...');
  
  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: CONFIG.models.analyzer,
    generationConfig: {
      temperature: 0.3, // Lower temp for more consistent analysis
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
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              text: `${ANALYZER_SYSTEM_PROMPT}\n\n${buildAnalyzerUserPrompt()}`,
            },
          ],
        },
      ],
    });

    const responseText = result.response.text();
    console.log('[Analyzer] Raw response length:', responseText.length);

    const analysis = parseJsonResponse<AnalysisResult>(responseText);
    
    if (!analysis) {
      console.error('[Analyzer] Failed to parse response, using fallback');
      return createFallbackAnalysis();
    }

    console.log('[Analyzer] Analysis complete:', {
      faceDetected: analysis.face.detected,
      gazeDirection: analysis.face.gazeDirection,
      overallQuality: analysis.overallQuality,
    });

    return analysis;
  } catch (error) {
    console.error('[Analyzer] Error during analysis:', error);
    return createFallbackAnalysis();
  }
}

/**
 * Create a fallback analysis when AI analysis fails
 */
function createFallbackAnalysis(): AnalysisResult {
  return {
    face: {
      detected: true,
      gazeDirection: 'away',
      gazeConfidence: 50,
      expression: 'neutral',
    },
    pose: {
      headTilt: 0,
      shoulderLine: 'level',
      shoulderAngle: 0,
      bodyPosture: 'upright',
    },
    lighting: {
      mainDirection: 'front',
      quality: 'medium',
      colorTemp: 'neutral',
      shadowIntensity: 50,
      highlightClipping: false,
    },
    composition: {
      subjectPosition: 'center',
      headroom: 'good',
      cameraAngle: 'eye_level',
    },
    issuesDetected: {
      eyeContact: { present: true, severity: 3, description: 'Unable to analyze - assuming eye contact fix needed' },
      posture: { present: false, severity: 1, description: 'Unable to analyze' },
      angle: { present: false, severity: 1, description: 'Unable to analyze' },
      lighting: { present: false, severity: 1, description: 'Unable to analyze' },
    },
    overallQuality: 60,
    summary: 'Fallback analysis used due to processing error. Conservative edits recommended.',
  };
}
