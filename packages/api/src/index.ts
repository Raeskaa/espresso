import { router } from './trpc';
import { generationRouter } from './routers/generation';
import { userRouter } from './routers/user';

export const appRouter = router({
  generation: generationRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

// Re-export
export { router, publicProcedure, protectedProcedure } from './trpc';
export type { Context } from './trpc';
