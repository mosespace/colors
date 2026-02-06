import { siteConfig } from '@/constants/site';
import LoginLink from '@/emails/login-link';
import WelcomeEmail from '@/emails/welcome-email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { Resend } from 'resend';
import { db } from './db';
import { validatePassword } from './password';

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 attempts per minute
});

const exceededLoginAttemptsThreshold = (user: {
  invalidLoginAttempts: number;
}) => {
  return user.invalidLoginAttempts >= 5;
};

const incrementLoginAttempts = async (userId: string) => {
  return await db.user.update({
    where: { id: userId },
    data: {
      invalidLoginAttempts: { increment: 1 },
    },
  });
};

const lockAccount = async (userId: string) => {
  return await db.user.update({
    where: { id: userId },
    data: {
      lockedAt: new Date(),
    },
  });
};

// Make sure db is properly initialized
if (!db) {
  throw new Error('❌ Database client not initialized');
}

const resend = new Resend(process.env.RESEND_API_KEY as any);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify-request', // Used for check email page
  },
  providers: [
    {
      id: 'resend',
      type: 'email',
      role: 'USER',
      maxAge: 5 * 60, // 5 minutes
      sendVerificationRequest: async (params: any) => {
        const { identifier: email, url } = params;
        const isDevelopment = process.env.NODE_ENV === 'development';
        try {
          if (isDevelopment) {
            console.log(`🪄 Magic Link: ${url}`);
            return;
          }

          await resend.emails.send({
            from: `${siteConfig.name} <welcome@mosespace.com>`,
            to: [email],
            subject: `Your ${process.env.NEXT_PUBLIC_APP_NAME} Login Link | Expires in 10 minutes!!!`,
            react: LoginLink({ url, email }),
          });

          console.log(`✅ Verification email sent successfully to: ${email}`);
        } catch (error) {
          console.error('❌ Error sending verification email:', error);
          throw new Error('Error sending verification email');
        }
      },
    } as any,
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          role: 'USER',
          email: profile.email,
          image: profile.avatar_url,
          isMachine: false,
          invalidLoginAttempts: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          role: 'USER',
          image: profile.picture,
          isMachine: false,
          invalidLoginAttempts: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      // @ts-ignore
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          const environment = process.env.NODE_ENV;

          if (environment === 'development') {
            console.log('Skipped ratelimit in development');
            const { success } = await ratelimit.limit(credentials.email);
            if (!success) {
              throw new Error('Too many login attempts');
            }
          }
          // Rate limiting check

          // Find user
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          // console.log('User:', user);

          if (!user || !user.passwordHash) {
            throw new Error('Invalid credentials');
          }

          // Check if account is locked
          if (user.lockedAt) {
            throw new Error('Account is locked');
          }

          // Check login attempts
          if (exceededLoginAttemptsThreshold(user)) {
            await lockAccount(user.id);
            throw new Error('Account locked due to too many attempts');
          }

          // Validate password
          const isValid = await validatePassword({
            password: credentials.password,
            passwordHash: user.passwordHash,
          });

          if (!isValid) {
            await incrementLoginAttempts(user.id);
            throw new Error('Invalid credentials');
          }

          // Reset login attempts on successful login
          await db.user.update({
            where: { id: user.id },
            data: { invalidLoginAttempts: 0 },
          });

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
      }

      // Handle updates to the user's data
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }

      // Refresh user data
      if (trigger === 'update' || !token.email) {
        const refreshedUser = await db.user.findUnique({
          where: { id: token.id },
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            image: true,
            emailVerified: true,
            isMachine: true,
            invalidLoginAttempts: true,
            lockedAt: true,
          },
        });

        if (refreshedUser) {
          token.name = refreshedUser.name;
          token.email = refreshedUser.email || '';
          token.role = refreshedUser.role;
          token.image = refreshedUser.image;
          token.emailVerified = refreshedUser.emailVerified;
          token.isMachine = refreshedUser.isMachine;
          token.invalidLoginAttempts = refreshedUser.invalidLoginAttempts;
          token.lockedAt = refreshedUser.lockedAt;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email!;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.emailVerified = token.emailVerified;
        session.user.isMachine = token.isMachine;
        session.user.invalidLoginAttempts = token.invalidLoginAttempts;
        session.user.lockedAt = token.lockedAt;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Send welcome email
        await resend.emails.send({
          from: '${siteConfig.name} <welcome@mosespace.com>',
          to: [user.email],
          subject: `Welcome to ${siteConfig.name}!`,
          react: WelcomeEmail({
            email: user.email,
            name: user.name || null,
          }),

          // send the welcome email 5 minutes after the user signed up
          scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        });
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
