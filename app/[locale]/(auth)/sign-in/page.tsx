import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import SignInForm from "../_components/SignInForm";

function SignInPage() {
  const tAuth = useTranslations("Auth");

  return (
    <div className="w-full max-w-sm">
      <div className="space-y-1.5">
        <p className="font-mono text-xs tracking-wider text-muted-foreground">
          {"// "}
          {tAuth("signIn")}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{tAuth("welcome")}</h1>
        <p className="text-base text-muted-foreground">{tAuth("welcomeMessage")}</p>
      </div>

      <div className="mt-7">
        <SignInForm />
      </div>

      <p className="mt-6 font-mono text-xs text-muted-foreground">
        {tAuth("noAccount")}{" "}
        <Link className="text-brand hover:underline" href="/sign-up">
          {tAuth("signUp")}
        </Link>
      </p>
    </div>
  );
}

export default SignInPage;
