import type { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string | null;
      name?: string | null;
      image?: string | null;
      emailVerified?: Date | null;
      isMachine?: boolean;
      invalidLoginAttempts?: number;
      lockedAt?: Date | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    role: string | null;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
    isMachine: boolean;
    invalidLoginAttempts: number;
    lockedAt?: Date | null;
    passwordHash?: string;
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    role: string | null;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
    isMachine?: boolean;
    invalidLoginAttempts?: number;
    lockedAt?: Date | null;
  }
}

export type SafeUser = Omit<User, 'hashedPassword'> & {
  role: Role;
};
