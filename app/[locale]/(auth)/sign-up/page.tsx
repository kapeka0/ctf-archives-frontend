import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import SignUpForm from "../_components/SignUpForm";

function SignUpPage() {
  const tAuth = useTranslations("Auth");

  return (
    <div className="w-full max-w-sm">
      <div className="space-y-1.5">
        <p className="font-mono text-xs tracking-wider text-muted-foreground">
          {"// "}
          {tAuth("signUp")}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{tAuth("join")}</h1>
        <p className="text-base text-muted-foreground">{tAuth("joinMessage")}</p>
      </div>

      <div className="mt-7">
        <SignUpForm />
      </div>

      <p className="mt-6 font-mono text-xs text-muted-foreground">
        {tAuth("alreadyAccount")}{" "}
        <Link className="text-brand hover:underline" href="/sign-in">
          {tAuth("signIn")}
        </Link>
      </p>
    </div>
  );
}

export default SignUpPage;
