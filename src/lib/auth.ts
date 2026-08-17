import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { db } from '@/db';
import { profiles, userRoles } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        console.log(credentials.email)
        // Find user by email
        const [user] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.email, credentials.email))
          .limit(1);

        console.log(user);
        if (!user)
          throw new Error('البريد الإلكتروني او كلمة مرور خاطئة');

        // Verify password using bcrypt
        console.log(credentials.password, user.passwordHash)
        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('البريد الإلكتروني او كلمة مرور خاطئة');
        }

        // Fetch user role
        const [roleData] = await db
          .select()
          .from(userRoles)
          .where(eq(userRoles.userId, user.id))
          .limit(1);

        
        if (roleData.role !== 'admin') {
          if (user.subscriptionActive === false)
            throw new Error("هذا الحساب غير مفعل. يرجى التواصل مع الدعم الفني لتفعيل الحساب.");

          // Check if user subscription ends yet
          const today = new Date();

          if (today > new Date(user.subscriptionEndsAt)) {
            await db
            .from(profiles)
            .set({
              subscriptionActive: false,
              subscriptionEndsAt: null
            })
            .where(eq(profiles.id, user.id));

            throw new Error("هذا الحساب غير مفعل. يرجى التواصل مع الدعم الفني لتفعيل الحساب.");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: roleData?.role || 'student',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, add user ID and role to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID and role to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
