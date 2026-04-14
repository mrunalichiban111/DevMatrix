import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/', // Using custom modal on home
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        // can add fields here
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
