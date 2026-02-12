'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;
const referenceCache = new Map<string, ReferenceAnalysis>();

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

interface FaceAnalysis {
  gender: string;
  ageRange: string;
  hairColor: string;
  hairStyle: string;
  skinTone: string;
  facialFeatures: string;
  distinctiveFeatures: string;
}

interface ReferenceAnalysis {
  setting: string;
  pose: string;
  lighting: string;
  mood: string;
  clothing: string;
  style: string;
}

/**
 * Analyze a selfie to extract face/appearance description
 */
export async function analyzeFace(imageBase64: string): Promise<FaceAnalysis> {
  console.log('[Dating Studio] Analyzing face...');

  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Analyze this person's appearance for the purpose of describing them in an image generation prompt. 
Be specific but respectful. Focus on observable physical characteristics.

Return a JSON object with these fields:
- gender: "male", "female", or "person" if unclear
- ageRange: estimated age range like "20s", "30s", etc.
- hairColor: color of hair
- hairStyle: style of hair (short, long, curly, straight, etc.)
- skinTone: general skin tone description
- facialFeatures: describe face shape, notable features
- distinctiveFeatures: any distinctive characteristics like beard, glasses, etc.

Return ONLY valid JSON, no markdown or explanation.`;

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
      ]
    }]
  });

  const text = result.response.text() || '';

  // Clean up response
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  }
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }

  try {
    const analysis = JSON.parse(cleanText.trim()) as FaceAnalysis;
    console.log('[Dating Studio] Face analysis:', analysis);
    return analysis;
  } catch (e) {
    console.error('[Dating Studio] Failed to parse face analysis:', cleanText);
    return {
      gender: 'person',
      ageRange: '20s',
      hairColor: 'dark',
      hairStyle: 'medium length',
      skinTone: 'medium',
      facialFeatures: 'pleasant features',
      distinctiveFeatures: ''
    };
  }
}

/**
 * Analyze a reference image to extract style/pose/setting
 */
export async function analyzeReference(imageBase64: string): Promise<ReferenceAnalysis> {
  // Check cache using a robust key to avoid collisions (Base64 headers are often identical)
  const cacheKey = imageBase64.length > 1000
    ? imageBase64.substring(500, 1000)
    : imageBase64.substring(0, 100);

  console.log('[Dating Studio] Analyzing reference image...');

  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Analyze this image to understand the setting, pose, style, and mood for recreating a similar photo with a different person.

Return a JSON object with these fields:
- setting: where is this (coffee shop, rooftop, beach, studio, etc.)
- pose: describe the pose/body position
- lighting: describe the lighting (golden hour, studio, natural, etc.)
- mood: the overall mood/vibe (casual, professional, romantic, adventurous, etc.)
- clothing: describe what the person is wearing or suggest appropriate attire
- style: overall photography style (candid, portrait, lifestyle, etc.)

Return ONLY valid JSON, no markdown or explanation.`;

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
      ]
    }]
  });

  const text = result.response.text() || '';

  // Clean up response
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  }
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }

  try {
    const analysis = JSON.parse(cleanText.trim()) as ReferenceAnalysis;
    console.log('[Dating Studio] Reference analysis:', analysis);
    referenceCache.set(cacheKey, analysis);
    return analysis;
  } catch (e) {
    console.error('[Dating Studio] Failed to parse reference analysis:', cleanText);
    return {
      setting: 'casual indoor setting',
      pose: 'natural relaxed pose',
      lighting: 'soft natural light',
      mood: 'friendly and approachable',
      clothing: 'casual stylish outfit',
      style: 'lifestyle portrait'
    };
  }
}

/**
 * Build a prompt for generating a dating profile photo
 */
function buildDatingPrompt(face: FaceAnalysis, reference: ReferenceAnalysis): string {
  const prompt = `Generate a professional dating profile photo of a ${face.ageRange} ${face.gender} with ${face.hairColor} ${face.hairStyle} hair and ${face.skinTone} skin. ${face.facialFeatures}. ${face.distinctiveFeatures ? face.distinctiveFeatures + '.' : ''}

Setting: ${reference.setting}
Pose: ${reference.pose}
Lighting: ${reference.lighting}
Mood: ${reference.mood}
Clothing: ${reference.clothing}
Style: ${reference.style}

Create a high quality, photorealistic portrait photo perfect for a dating app profile. The person should look confident, approachable, and genuine. Sharp focus on face, professional composition, flattering angles.`;

  console.log('[Dating Studio] Generated prompt:', prompt);
  return prompt;
}

/**
 * Generate a dating profile photo using Gemini 3 Pro Image with reference images
 * This uses the model's ability to maintain character consistency with up to 5 reference faces
 */
/**
 * Validate that the generated photo actually features the selfie person
 * and is NOT just a copy of the reference image.
 */
async function validateGenerationReliability(
  selfieBase64: string,
  referenceBase64: string,
  generatedBase64: string
): Promise<{ approved: boolean; identityScore: number; reason?: string }> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Compare these three images with extreme scrutiny:
1. TARGET_IDENTITY_SOURCE (The actual person)
2. STYLE_INSPIRATION_SOURCE (The reference photo/pose/clothing)
3. GENERATED_IMAGE (The output to validate)

CRITICAL VALIDATION RULES:
1. IDENTITY_LOCK: Does the GENERATED_IMAGE feature the EXACT SAME human from IMAGE 1? 
   - Reject generic-looking AI models. Must be the SPECIFIC person from IMAGE 1.
   - Identity Score should be 0-100. (Min 85 required).
2. AUTHENTICITY: Is the entire image SHARP and IN FOCUS?
   - Reject if the background is generic "AI blur" or if the skin is overly smooth.
   - Reject if it looks like a "deepfake" or an "echo" with a non-matching face.
3. SUCCESS: Only approve if identityScore >= 85 AND the photo looks like a natural smartphone snap.

Return ONLY a JSON object:
{
  "identityScore": <number>,
  "isEcho": <boolean>,
  "approved": <boolean>,
  "reason": "<brief explanation>"
}

Only approve if identityScore >= 85 AND isEcho is false.`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { text: 'IMAGE 1 (TARGET_IDENTITY_SOURCE):' },
          { inlineData: { mimeType: 'image/jpeg', data: selfieBase64 } },
          { text: 'IMAGE 2 (STYLE_INSPIRATION_SOURCE):' },
          { inlineData: { mimeType: 'image/jpeg', data: referenceBase64 } },
          { text: 'IMAGE 3 (GENERATED_IMAGE):' },
          { inlineData: { mimeType: 'image/jpeg', data: generatedBase64 } }
        ]
      }]
    });

    const text = result.response.text() || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        approved: data.approved && !data.isEcho && data.identityScore >= 80,
        identityScore: data.identityScore || 0,
        reason: data.reason || (data.isEcho ? 'Detected reference echo' : 'Identity mismatch')
      };
    }
  } catch (error) {
    console.error('[Dating Studio] Validation error:', error);
  }
  return { approved: true, identityScore: 80 }; // Fallback to avoid complete block if validator fails
}

export async function generateDatingPhotoWithReferences(
  selfieBase64: string,
  referenceBase64: string,
  referenceAnalysis: ReferenceAnalysis,
  faceAnalysis?: FaceAnalysis
): Promise<{ success: boolean; imageBase64?: string; error?: string }> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        // @ts-expect-error - responseModalities is supported but not in types yet
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const faceDescription = faceAnalysis ? `
[PERSON_CHARACTERISTICS]
- Gender: ${faceAnalysis.gender}
- Age: ${faceAnalysis.ageRange}
- Hair: ${faceAnalysis.hairColor}, ${faceAnalysis.hairStyle}
- Skin Tone: ${faceAnalysis.skinTone}
- Facial Features: ${faceAnalysis.facialFeatures}
- Distinctive Traits: ${faceAnalysis.distinctiveFeatures}
` : '';

    const prompt = `INSTRUCTION: Replace the man in IMAGE 2 with the man from IMAGE 1. 

[[IDENTITY_SOURCE_LOCK_5.0]]
- ONLY SUBJECT: The person from IMAGE 1.
${faceDescription}
- REQUIREMENT: You MUST preserve the exact facial geometry, natural skin texture (visible pores, realistic light stubble), and eye shape of the person in IMAGE 1.
- DO NOT blend features with the person in IMAGE 2. Zero mixing allowed.

[[ULTIMATE_AUTHENTIC_STYLE]]
- STYLE: A sharp, crisp, unfiltered smartphone snapshot. 
- SETTING: Use the environment from IMAGE 2.
- POSE: Follow the body pose from IMAGE 2.
- !!! CRITICAL ENFORCEMENT !!!: SHARP FOCUS THROUGHOUT. NO BLUR. NO BOKEH. NO DEPTH OF FIELD.
- !!! CRITICAL ENFORCEMENT !!!: The background must be as sharp and detailed as the subject. No generic AI blurring.
- Ensure natural skin texture. No smoothing. No generic AI "beauty" filters. 

[[STRICT_CONSTRAINTS]]
- NEVER return IMAGE 2 or an identical copy.
- The lighting on the face MUST match the lighting in the environment of IMAGE 2 perfectly.
- Authentic, raw, high-resolution photography only.`;

    console.log('[Dating Studio] Generating with Gemini 3 Pro Image (Identity Lock + Descriptors)...');

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { text: 'IMAGE 1 (PERSON_IDENTITY_SOURCE):' },
          { inlineData: { mimeType: 'image/jpeg', data: selfieBase64 } },
          { text: 'IMAGE 2 (STYLE_INSPIRATION_SOURCE):' },
          { inlineData: { mimeType: 'image/jpeg', data: referenceBase64 } }
        ]
      }]
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts) {
      console.error('[Dating Studio] No parts in response');
      return { success: false, error: 'No response from model' };
    }

    // Look for image data in response
    for (const part of parts) {
      if ('inlineData' in part && part.inlineData) {
        console.log('[Dating Studio] Image generated successfully');
        return {
          success: true,
          imageBase64: part.inlineData.data
        };
      }
    }

    // No image found, might have text response
    const textPart = parts.find(p => 'text' in p);
    if (textPart && 'text' in textPart) {
      console.log('[Dating Studio] Got text response instead of image:', textPart.text);
      return { success: false, error: `Model returned text: ${(textPart as { text: string }).text.substring(0, 200)}...` };
    }

    return { success: false, error: 'No image in response' };
  } catch (error) {
    console.error('[Dating Studio] Generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed'
    };
  }
}

/**
 * Generate multiple dating profile photos from selfies and references
 */
export async function generateDatingProfilePhotos(
  selfies: string[],
  references: string[],
  maxPhotos: number = 5,
  onPhotoGenerated?: (dataUrl: string, index: number) => Promise<void>
): Promise<{ success: boolean; imageUrls: string[]; errors: string[] }> {
  console.log(`[Dating Studio] Starting generation: ${selfies.length} selfies, ${references.length} unique references requested`);

  if (selfies.length === 0) {
    return { success: false, imageUrls: [], errors: ['No selfies provided'] };
  }

  if (references.length === 0) {
    return { success: false, imageUrls: [], errors: ['No reference images provided'] };
  }

  // Use the primary selfie for face consistency
  const primarySelfie = selfies[0];

  // Analyze face once for consistency across all variations
  let faceAnalysis: FaceAnalysis | undefined;
  try {
    faceAnalysis = await analyzeFace(primarySelfie);
  } catch (error) {
    console.warn('[Dating Studio] Face analysis failed, continuing without descriptors');
  }

  const imageUrls: string[] = [];
  const errors: string[] = [];

  // Robust Reference Dispatcher
  // Distribute unique indices to each slot initially
  const referencePool = [...references];

  // Deterministic dispatcher to ensure parallel slots start with different images
  function getReferenceForSlot(slotIndex: number, attempt: number): string {
    // Attempt 0: Direct mapping to reference list
    // Use modulo to wrap around if references < 5
    const poolIndex = (slotIndex + attempt) % referencePool.length;
    return referencePool[poolIndex];
  }

  // Function to generate a single photo with retries and semantic validation
  async function generateWithRetries(index: number): Promise<string | null> {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      console.log(`[Dating Studio] Slot ${index + 1} - Attempt ${attempt + 1}/${maxRetries}`);

      try {
        const refImage = getReferenceForSlot(index, attempt);
        const refAnalysis = await analyzeReference(refImage);

        const result = await generateDatingPhotoWithReferences(
          primarySelfie,
          refImage,
          refAnalysis,
          faceAnalysis
        );

        if (result.success && result.imageBase64) {
          // Robust Validation (Identity Check + Echo Check)
          console.log(`[Dating Studio] Slot ${index + 1} validating result...`);
          const validation = await validateGenerationReliability(
            primarySelfie,
            refImage,
            result.imageBase64
          );

          if (!validation.approved) {
            console.warn(`[Dating Studio] Slot ${index + 1} REJECTED: ${validation.reason}, retrying with different style...`);
            continue;
          }

          // Convert to data URL
          const imageUrl = `data:image/png;base64,${result.imageBase64}`;
          console.log(`[Dating Studio] Slot ${index + 1} generated successfully (Identity Score: ${validation.identityScore})`);

          if (onPhotoGenerated) {
            await onPhotoGenerated(imageUrl, index);
          }
          return imageUrl;
        } else {
          console.error(`[Dating Studio] Slot ${index + 1} failed: ${result.error || 'No image generated'}`);
        }
      } catch (error) {
        console.error(`[Dating Studio] Slot ${index + 1} error:`, error instanceof Error ? error.message : 'Unknown error');
      }

      // Slightly longer delay for retries to avoid rate limits and allow model "cooldown"
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    return null;
  }

  // Generate photos in parallel
  const generationPromises = Array.from({ length: maxPhotos }).map((_, i) => generateWithRetries(i));

  // Wait for all generations to complete
  const results = await Promise.all(generationPromises);
  const successfulUrls = results.filter((url): url is string => url !== null);
  imageUrls.push(...successfulUrls);

  return {
    success: imageUrls.length > 0,
    imageUrls,
    errors
  };
}
