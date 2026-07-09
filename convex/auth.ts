import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// Username + password only — no email, so nothing to verify. The username is
// stored as the account identifier (`email` field) and as the display name.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const username = (params.email as string) ?? "";
        return { email: username, name: username };
      },
    }),
  ],
});
