import { pgTable, text, timestamp, integer, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core';
export { datingPhotoHistory } from './dating-photo-history';

// Enums
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'starter', 'pro']);
export const generationStatusEnum = pgEnum('generation_status', ['pending', 'processing', 'completed', 'failed']);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  credits: integer('credits').notNull().default(3),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Generations table
export const generations = pgTable('generations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  originalImageUrl: text('original_image_url').notNull(),
  generatedImageUrls: text('generated_image_urls').array(),
  fixEyeContact: boolean('fix_eye_contact').notNull().default(false),
  improvePosture: boolean('improve_posture').notNull().default(false),
  adjustAngle: boolean('adjust_angle').notNull().default(false),
  enhanceLighting: boolean('enhance_lighting').notNull().default(false),
  status: generationStatusEnum('status').notNull().default('pending'),
  errorMessage: text('error_message'),
  fixSelections: jsonb('fix_selections').default([]),
  // Pipeline progress tracking
  pipelineStage: text('pipeline_stage').default('pending'),
  pipelineProgress: jsonb('pipeline_progress').default({}),
  variationResults: jsonb('variation_results').default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});

// Credit transactions table
export const creditTransactions = pgTable('credit_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(), // Positive for additions, negative for usage
  reason: text('reason').notNull(), // 'generation', 'purchase', 'subscription', 'refund'
  generationId: text('generation_id').references(() => generations.id),
  stripePaymentId: text('stripe_payment_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
