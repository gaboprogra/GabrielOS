import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowedEmail = process.env.ALLOWED_GOOGLE_EMAIL?.toLowerCase();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.events",

          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();

      if (!email || !allowedEmail) {
        return false;
      }

      return email === allowedEmail;
    },
  },
});
