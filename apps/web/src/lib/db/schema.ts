import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const datingPhotoHistory = pgTable('dating_photo_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  imageUrl: text('image_url').notNull(),
  prompt: text('prompt').notNull(),
  customization: jsonb('customization').notNull(),
  score: integer('score').notNull(),
  approved: integer('approved').notNull(), // 0 or 1
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
