// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// ✅ authOptions를 별도로 export
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

// ✅ handler 생성
const handler = NextAuth(authOptions);

// ✅ handler와 authOptions 모두 export
export { handler as GET, handler as POST, authOptions };
