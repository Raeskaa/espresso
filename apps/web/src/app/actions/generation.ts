"use server";

import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  getDb,
  users,
  generations,
  creditTransactions,
  datingPhotoHistory,
} from "@espresso/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { createServerClient } from "@/lib/supabase";
import { generateImageVariations } from "@/lib/imagen";
import { analyze } from "@/lib/imagen/analyzer";
import { getDefaultTemplate } from "@/lib/imagen/templates";
import { generateDatingProfilePhotos } from "@/lib/imagen/dating-studio";
import type { FixOptions } from "@espresso/utils";
import type {
  PipelineProgress,
  VariationResult,
  FixSelection,
} from "@/lib/imagen";
import type { AnalysisResult } from "@/lib/imagen/types";
import { waitUntil } from "@vercel/functions";

// Log env var availability at module load (visible in Vercel function logs)
console.log("[Generation] Module loaded. Env check:", {
  hasDbUrl: !!process.env.DATABASE_URL,
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  hasClerkKey: !!process.env.CLERK_SECRET_KEY,
  hasGoogleAiKey: !!process.env.GOOGLE_AI_API_KEY,
});

// Helper to generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

// Get or create user in database
async function getOrCreateUser(
  clerkUserId: string
): Promise<typeof users.$inferSelect> {
  console.log("[getOrCreateUser] Called for userId:", clerkUserId);
  const db = getDb();

  // Try to find existing user by Clerk ID
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, clerkUserId),
  });
  console.log(
    "[getOrCreateUser] Existing user found by ID:",
    !!existingUser,
    "credits:",
    existingUser?.credits
  );

  if (existingUser) {
    // Backfill credits for existing users if < 100
    if ((existingUser.credits ?? 0) < 100) {
      await db
        .update(users)
        .set({ credits: 100 })
        .where(eq(users.id, clerkUserId));
      existingUser.credits = 100;
    }
    return existingUser;
  }

  // Get user email from Clerk
  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    `${clerkUserId}@espresso.app`;
  console.log("[getOrCreateUser] Email from Clerk:", email);

  // Check if a user with same email already exists (Clerk ID may have changed)
  const existingByEmail = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingByEmail) {
    console.log(
      "[getOrCreateUser] Found existing user by email (ID mismatch: DB has",
      existingByEmail.id,
      ", Clerk has",
      clerkUserId,
      "). Using existing user."
    );
    // Backfill credits if needed
    if ((existingByEmail.credits ?? 0) < 100) {
      await db
        .update(users)
        .set({ credits: 100 })
        .where(eq(users.id, existingByEmail.id));
      existingByEmail.credits = 100;
    }
    return existingByEmail;
  }

  // Create new user with 100 free credits (or 1000 for admin)
  const isSpecialUser = email === "maheshtripathidec@gmail.com";
  const initialCredits = isSpecialUser ? 1000 : 100;

  const [newUser] = await db
    .insert(users)
    .values({
      id: clerkUserId,
      email,
      credits: initialCredits,
      subscriptionTier: "free",
    })
    .returning();

  console.log(
    "[getOrCreateUser] Created new user:",
    newUser.id,
    "credits:",
    newUser.credits
  );
  return newUser;
}

// Admin credit top-up: checks user.email (already loaded) vs ADMIN_EMAIL env var.
// No extra Clerk network call needed.
async function maybeTopUpAdminCredits(
  user: typeof users.$inferSelect
): Promise<typeof users.$inferSelect> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email === adminEmail && user.credits < 1000) {
    const db = getDb();
    await db.update(users).set({ credits: 1000 }).where(eq(users.id, user.id));
    return { ...user, credits: 1000 };
  }
  return user;
}

export async function createGeneration(options: {
  imageBase64: string;
  fixes: FixOptions;
}): Promise<{
  success: boolean;
  generationId?: string;
  error?: string;
  creditsRemaining?: number;
}> {
  const { imageBase64, fixes } = options;
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const db = getDb();
    let user = await getOrCreateUser(userId);

    // Top up credits for admin account if needed (no extra Clerk call)
    user = await maybeTopUpAdminCredits(user);

    // Check credits
    if (user.credits <= 0) {
      return {
        success: false,
        error:
          "Insufficient credits. Please purchase more credits to continue.",
      };
    }

    const generationId = generateId("gen");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Upload original image to Supabase Storage
    const supabase = createServerClient();
    const imagePath = `originals/${user.id}/${generationId}.jpg`;

    // Decode base64 and upload
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const { error: uploadError } = await supabase.storage
      .from("generations")
      .upload(imagePath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Continue anyway, we'll use a placeholder URL
    }

    const originalImageUrl = uploadError
      ? `data:image/jpeg;base64,${imageBase64.substring(0, 100)}...`
      : supabase.storage.from("generations").getPublicUrl(imagePath).data
          .publicUrl;

    // Create generation record
    await db.insert(generations).values({
      id: generationId,
      userId: user.id,
      originalImageUrl,
      generatedImageUrls: [],
      fixEyeContact: fixes.fixEyeContact,
      improvePosture: fixes.improvePosture,
      adjustAngle: fixes.adjustAngle,
      enhanceLighting: fixes.enhanceLighting,
      status: "processing",
      expiresAt,
    });

    // Deduct credit
    await db
      .update(users)
      .set({ credits: user.credits - 1, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Record credit transaction
    await db.insert(creditTransactions).values({
      id: generateId("txn"),
      userId: user.id,
      amount: -1,
      reason: "generation",
      generationId,
    });

    // Generate images asynchronously (in background)
    waitUntil(
      processGeneration(generationId, imageBase64, fixes, user.id).catch(
        console.error
      )
    );

    return {
      success: true,
      generationId,
      creditsRemaining: user.credits - 1,
    };
  } catch (error) {
    console.error("Error creating generation:", error);
    return {
      success: false,
      error: `Generation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Background processing function
async function processGeneration(
  generationId: string,
  imageBase64: string,
  fixes: FixOptions,
  userId: string
) {
  const db = getDb();

  try {
    // Progress callback to save real-time updates to database
    const onProgress = async (progress: PipelineProgress): Promise<void> => {
      await db
        .update(generations)
        .set({
          pipelineStage: progress.stage,
          pipelineProgress: progress as unknown as Record<string, unknown>,
        })
        .where(eq(generations.id, generationId));
    };

    // Convert boolean FixOptions to FixSelection array for sequential pipeline
    const fixSelections: FixSelection[] = [
      {
        editType: "eyeContact",
        enabled: fixes.fixEyeContact,
        template: getDefaultTemplate("eyeContact"),
      },
      {
        editType: "posture",
        enabled: fixes.improvePosture,
        template: getDefaultTemplate("posture"),
      },
      {
        editType: "angle",
        enabled: fixes.adjustAngle,
        template: getDefaultTemplate("angle"),
      },
      {
        editType: "lighting",
        enabled: fixes.enhanceLighting,
        template: getDefaultTemplate("lighting"),
      },
    ];

    // Generate image variations using the new agentic pipeline with incremental updates
    const result = await generateImageVariations({
      originalImageBase64: imageBase64,
      fixes,
      fixSelections,
      userId,
      generationId,
      onProgress,
      onVariationGenerated: async (variation) => {
        if (variation.success && variation.imageUrl) {
          // Use concatenation for atomic array append in jsonb
          await db
            .update(generations)
            .set({
              generatedImageUrls: sql`array_append(COALESCE(generated_image_urls, ARRAY[]::text[]), ${variation.imageUrl})`,
              variationResults: sql`COALESCE(variation_results, '[]'::jsonb) || ${JSON.stringify(
                [variation]
              )}::jsonb`,
            })
            .where(eq(generations.id, generationId));
        }
      },
    });

    // Extract successful image URLs from variations
    const generatedUrls = result.variations
      .filter((v: VariationResult) => v.success && v.imageUrl)
      .map((v: VariationResult) => v.imageUrl as string);

    // Update generation with results
    await db
      .update(generations)
      .set({
        generatedImageUrls: generatedUrls,
        variationResults: result.variations as unknown as Record<
          string,
          unknown
        >[],
        pipelineStage: result.success ? "complete" : "failed",
        status: result.success ? "completed" : "failed",
        errorMessage: result.success
          ? null
          : "No successful variations generated",
      })
      .where(eq(generations.id, generationId));
  } catch (error) {
    console.error("Error processing generation:", error);

    // Mark as failed
    await db
      .update(generations)
      .set({
        status: "failed",
        pipelineStage: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(generations.id, generationId));
  }
}

export async function getGeneration(id: string) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const db = getDb();
    const generation = await db.query.generations.findFirst({
      where: eq(generations.id, id),
    });

    if (!generation || generation.userId !== userId) {
      return null;
    }

    // Check if stale (stuck in processing for > 10 mins)
    if (
      generation.status === "processing" &&
      Date.now() - new Date(generation.createdAt).getTime() > 10 * 60 * 1000
    ) {
      console.log("[getGeneration] Marking stale generation as failed:", id);
      try {
        await db
          .update(generations)
          .set({
            status: "failed",
            pipelineStage: "failed",
            errorMessage: "Generation timed out. Please try again.",
          })
          .where(eq(generations.id, id));

        // Update local object for return
        generation.status = "failed";
        generation.pipelineStage = "failed";
        generation.errorMessage = "Generation timed out. Please try again.";
      } catch (e) {
        console.error("[getGeneration] Failed to update stale generation:", e);
      }
    }

    return {
      id: generation.id,
      originalImageUrl: generation.originalImageUrl,
      generatedImageUrls: generation.generatedImageUrls || [],
      fixes: {
        fixEyeContact: generation.fixEyeContact,
        improvePosture: generation.improvePosture,
        adjustAngle: generation.adjustAngle,
        enhanceLighting: generation.enhanceLighting,
      },
      status: generation.status,
      pipelineStage: generation.pipelineStage,
      pipelineProgress: generation.pipelineProgress as PipelineProgress | null,
      variationResults: generation.variationResults as VariationResult[] | null,
      errorMessage: generation.errorMessage,
      createdAt: generation.createdAt,
    };
  } catch (error) {
    console.error("Error getting generation:", error);
    return null;
  }
}

export const getCredits = cache(async function getCredits() {
  console.log("[getCredits] Called");
  const { userId } = await auth();
  console.log("[getCredits] userId:", userId);

  if (!userId) {
    console.log("[getCredits] No userId, returning 0");
    return 0;
  }

  try {
    const user = await getOrCreateUser(userId);
    console.log("[getCredits] User credits:", user.credits);
    return user.credits;
  } catch (error) {
    console.error("[getCredits] Error getting credits:", error);
    return 0;
  }
});

export async function getUserGenerations() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  try {
    const db = getDb();
    // Use stable DB user.id (not raw Clerk userId which may diverge after email-fallback path)
    const dbUser = await getOrCreateUser(userId);
    const userGenerations = await db.query.generations.findMany({
      where: eq(generations.userId, dbUser.id),
      orderBy: (generations, { desc }) => [desc(generations.createdAt)],
      limit: 20,
    });

    return userGenerations.map((g) => ({
      id: g.id,
      originalImageUrl: g.originalImageUrl,
      generatedImageUrls: g.generatedImageUrls || [],
      status: g.status,
      createdAt: g.createdAt,
    }));
  } catch (error) {
    console.error("Error getting user generations:", error);
    return [];
  }
}

// Analyze an image without starting a generation
export async function analyzeImage(imageBase64: string): Promise<{
  success: boolean;
  analysis?: AnalysisResult;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const analysis = await analyze(imageBase64);
    return { success: true, analysis };
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Analysis failed",
    };
  }
}

// Dating Studio generation
export async function createDatingProfileGeneration(options: {
  selfies: { data: string }[];
  references: { data: string }[];
  targetApp: string;
}): Promise<{
  success: boolean;
  generationId?: string;
  error?: string;
  creditsRemaining?: number;
}> {
  const {
    selfies: wrappedSelfies,
    references: wrappedReferences,
    targetApp,
  } = options;
  const selfies = wrappedSelfies.map((s) => s.data);
  const references = wrappedReferences.map((r) => r.data);
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    console.log("[createDatingProfileGeneration] Starting...");
    const db = getDb();
    let user = await getOrCreateUser(userId);
    console.log(
      "[createDatingProfileGeneration] User found, credits:",
      user.credits
    );

    // Top up credits for admin account if needed (no extra Clerk call)
    user = await maybeTopUpAdminCredits(user);
    console.log(
      "[createDatingProfileGeneration] After admin check, credits:",
      user.credits
    );

    // Dating studio costs 5 credits
    const creditCost = 5;

    if (user.credits < creditCost) {
      console.log(
        "[createDatingProfileGeneration] Insufficient credits:",
        user.credits,
        "<",
        creditCost
      );
      return {
        success: false,
        error: `Insufficient credits. Dating Profile Studio requires ${creditCost} credits.`,
      };
    }

    const generationId = generateId("dating");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Upload selfies to Supabase Storage
    const supabase = createServerClient();
    const uploadedSelfieUrls: string[] = [];

    for (let i = 0; i < selfies.length; i++) {
      const imagePath = `dating/${user.id}/${generationId}/selfie_${i}.jpg`;
      const imageBuffer = Buffer.from(selfies[i], "base64");

      const { error: uploadError } = await supabase.storage
        .from("generations")
        .upload(imagePath, imageBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        const url = supabase.storage.from("generations").getPublicUrl(imagePath)
          .data.publicUrl;
        uploadedSelfieUrls.push(url);
      }
    }

    // Create generation record
    await db.insert(generations).values({
      id: generationId,
      userId: user.id,
      originalImageUrl: uploadedSelfieUrls[0] || "",
      generatedImageUrls: [],
      status: "processing",
      pipelineStage: "analyzing",
      expiresAt,
      // Store dating studio metadata in pipeline progress
      pipelineProgress: {
        type: "dating_studio",
        targetApp,
        selfieCount: selfies.length,
        referenceCount: references.length,
        stage: "analyzing",
        message: "Analyzing your photos...",
      } as unknown as Record<string, unknown>,
    });

    // Deduct credits
    await db
      .update(users)
      .set({ credits: user.credits - creditCost, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Record credit transaction
    await db.insert(creditTransactions).values({
      id: generateId("txn"),
      userId: user.id,
      amount: -creditCost,
      reason: "dating_studio",
      generationId,
    });

    // Process in background
    waitUntil(
      processDatingGeneration(
        generationId,
        selfies,
        references,
        targetApp,
        userId
      ).catch(console.error)
    );

    return {
      success: true,
      generationId,
      creditsRemaining: user.credits - creditCost,
    };
  } catch (error) {
    console.error("Error creating dating profile generation:", error);
    return {
      success: false,
      error: `Dating generation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Background processing for dating studio
async function processDatingGeneration(
  generationId: string,
  selfies: string[],
  references: string[],
  targetApp: string,
  userId: string
) {
  const db = getDb();
  const supabase = createServerClient();

  try {
    // Update progress - analyzing
    await db
      .update(generations)
      .set({
        pipelineStage: "analyzing",
        pipelineProgress: {
          type: "dating_studio",
          targetApp,
          stage: "analyzing",
          message: "Analyzing your photos and inspiration images...",
          progress: 10,
        } as unknown as Record<string, unknown>,
      })
      .where(eq(generations.id, generationId));

    // Update progress - generating
    await db
      .update(generations)
      .set({
        pipelineStage: "generating",
        pipelineProgress: {
          type: "dating_studio",
          targetApp,
          stage: "generating",
          message: "Creating your dating profile photos with AI...",
          progress: 30,
        } as unknown as Record<string, unknown>,
      })
      .where(eq(generations.id, generationId));

    // Use the new dating studio module to generate photos with incremental updates
    console.log(
      "[Dating Generation] Starting with",
      selfies.length,
      "selfies and",
      references.length,
      "references"
    );

    const uploadedUrls: string[] = [];

    const result = await generateDatingProfilePhotos(
      selfies,
      references,
      5,
      async (dataUrl, i) => {
        const base64Data = dataUrl.split(",")[1];
        if (!base64Data) return;

        console.log(
          `[Dating Generation] Processing photo ${i + 1} incrementally...`
        );

        try {
          const imagePath = `dating/${userId}/${generationId}/generated_${i}.png`;
          const imageBuffer = Buffer.from(base64Data, "base64");

          const { error: uploadError } = await supabase.storage
            .from("generations")
            .upload(imagePath, imageBuffer, {
              contentType: "image/png",
              upsert: true,
            });

          let url: string;
          if (!uploadError) {
            url = supabase.storage.from("generations").getPublicUrl(imagePath)
              .data.publicUrl;

            // Save to dating photo history
            try {
              await db.insert(datingPhotoHistory).values({
                id: generateId("dating_photo"),
                userId,
                imageUrl: url,
                prompt: `Dating Studio - ${targetApp}`,
                customization: { targetApp } as unknown as Record<
                  string,
                  unknown
                >,
                score: 0,
                approved: 1,
                createdAt: new Date(),
              });
            } catch (historyError) {
              console.error(
                "[Dating Generation] Failed to save to history:",
                historyError
              );
            }
          } else {
            console.error("Upload error:", uploadError);
            return; // Skip this photo if upload fails, avoiding data URL in DB
          }

          uploadedUrls.push(url);

          // Update generation record INCREMENTALLY using concatenation
          await db
            .update(generations)
            .set({
              generatedImageUrls: sql`array_append(COALESCE(generated_image_urls, ARRAY[]::text[]), ${url})`,
              variationResults: sql`COALESCE(variation_results, '[]'::jsonb) || ${JSON.stringify(
                [
                  {
                    index: i,
                    style: `Photo ${i + 1}`,
                    success: true,
                    imageUrl: url,
                  },
                ]
              )}::jsonb`,
              pipelineProgress: {
                type: "dating_studio",
                targetApp,
                stage: "generating",
                message: `Generated ${uploadedUrls.length} photos...`,
                progress: 30 + (uploadedUrls.length / 5) * 60,
              } as unknown as Record<string, unknown>,
            })
            .where(eq(generations.id, generationId));
        } catch (error) {
          console.error(
            `[Dating Generation] Increment update error for photo ${i + 1}:`,
            error
          );
        }
      }
    );

    console.log(
      "[Dating Generation] Batch complete. Total uploaded:",
      uploadedUrls.length
    );

    // Update generation with final results and status
    await db
      .update(generations)
      .set({
        // Note: generatedImageUrls is already updated incrementally
        pipelineStage: uploadedUrls.length > 0 ? "complete" : "failed",
        status: uploadedUrls.length > 0 ? "completed" : "failed",
        pipelineProgress: {
          type: "dating_studio",
          targetApp,
          stage: "complete",
          message:
            uploadedUrls.length > 0
              ? `Generated ${uploadedUrls.length} dating profile photos!`
              : "Generation failed",
          progress: 100,
          errors: result.errors,
        } as unknown as Record<string, unknown>,
        errorMessage:
          uploadedUrls.length > 0
            ? null
            : result.errors.join(", ") || "No photos could be generated",
      })
      .where(eq(generations.id, generationId));
  } catch (error) {
    console.error("Error processing dating generation:", error);

    await db
      .update(generations)
      .set({
        status: "failed",
        pipelineStage: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(generations.id, generationId));
  }
}

export async function deleteGeneration(id: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const db = getDb();
  await db
    .delete(generations)
    .where(and(eq(generations.id, id), eq(generations.userId, user.id)));

  revalidatePath("/history");
}

export async function getUserDatingPhotoHistory() {
  const user = await currentUser();
  if (!user) {
    return [];
  }

  try {
    const db = getDb();
    const history = await db
      .select()
      .from(datingPhotoHistory)
      .where(eq(datingPhotoHistory.userId, user.id))
      .orderBy(desc(datingPhotoHistory.createdAt));

    return history;
  } catch (error) {
    console.error("Error fetching dating photo history:", error);
    return [];
  }
}

export async function deleteDatingPhotoHistory(id: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const db = getDb();
  await db
    .delete(datingPhotoHistory)
    .where(
      and(eq(datingPhotoHistory.id, id), eq(datingPhotoHistory.userId, user.id))
    );

  revalidatePath("/history");
}

export const getCreditHistory = cache(async function getCreditHistory() {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const db = getDb();
    const dbUser = await getOrCreateUser(userId);
    const rows = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, dbUser.id))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(50);

    return rows.map((r) => ({
      id: r.id,
      amount: r.amount,
      reason: r.reason,
      generationId: r.generationId,
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error("[getCreditHistory] Error:", error);
    return [];
  }
});

export const getUserProfile = cache(async function getUserProfile() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const user = await getOrCreateUser(userId);
    return {
      credits: user.credits,
      subscriptionTier: (user.subscriptionTier ?? "free") as
        | "free"
        | "starter"
        | "pro",
    };
  } catch (error) {
    console.error("[getUserProfile] Error:", error);
    return null;
  }
});
