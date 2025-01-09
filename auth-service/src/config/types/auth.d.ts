// auth-service/src/types/auth.d.ts

import { User as PrismaUser } from '@prisma/client';

declare namespace Express {
    export interface Request {
        user?: {
            id: string;
            email: string;
            // Aggiungi altri campi se necessario
        };
    }
}
