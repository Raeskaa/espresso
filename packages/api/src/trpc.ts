import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

// Context type - will be extended with auth
export interface Context {
  userId: string | null;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to require authentication
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
