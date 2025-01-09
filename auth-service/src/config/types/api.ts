// auth-service/src/config/types/api.ts

export type ApiErrorCodes =
    'INVALID_REQUEST'
    | 'INTERNAL_ERROR'
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'BAD_REQUEST'
    | 'CONFLICT'
    | 'VALIDATION_ERROR'
    | 'GENERIC_ERROR';

export enum ActivityType {
    SIGN_UP = 'SIGN_UP',
    SIGN_IN = 'SIGN_IN',
    SIGN_OUT = 'SIGN_OUT',
    UPDATE_PASSWORD = 'UPDATE_PASSWORD',
    DELETE_ACCOUNT = 'DELETE_ACCOUNT',
    UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
    CREATE_TEAM = 'CREATE_TEAM',
    REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
    INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
    ACCEPT_INVITATION = 'ACCEPT_INVITATION',
};

export interface User {
    id: string;
    email: string;
    name: string;
    dateOfBirth: string; // Mantieni come stringa
    supermarkets: string[];
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface UpdateUserDTO {
    name?: string;
    dateOfBirth?: string;
    supermarkets?: string[];
    // Aggiungi altri campi che desideri permettere di aggiornare
}
