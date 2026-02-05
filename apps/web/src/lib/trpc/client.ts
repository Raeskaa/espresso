'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@espresso/api';

export const trpc = createTRPCReact<AppRouter>();
