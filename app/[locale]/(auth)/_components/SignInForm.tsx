"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosed, EyeIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useRouter } from "@/i18n/routing";

function SignInForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const tAuth = useTranslations("Auth");
  const tError = useTranslations("Auth.errors");
  const [showPassword, setshowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const formSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      await signIn("password", {
        email: data.username.trim().toLowerCase(),
        password: data.password,
        flow: "signIn",
      });
      toast.success(tAuth("signInSuccess"));
      router.push("/");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("InvalidAccountId") || msg.includes("Could not find")) {
        form.setError("username", { type: "manual", message: tError("userNotFound") });
        toast.error(tError("userNotFound"));
      } else if (msg.includes("InvalidSecret") || msg.includes("Invalid credentials")) {
        form.setError("password", { type: "manual", message: tError("wrongPassword") });
        toast.error(tError("wrongPassword"));
      } else if (msg.includes("TooManyFailedAttempts")) {
        toast.error(tError("tooManyAttempts"));
      } else {
        toast.error(tError("unexpected"));
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-3 px-2 pb-1">
      <Form {...form}>
        <form className="space-y-3 w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="text-sm text-muted-foreground font-normal">{tAuth("username")}</FormLabel>
                <FormControl>
                  <Input
                    autoCapitalize="none"
                    disabled={isPending}
                    placeholder={tAuth("usernamePlaceholder")}
                    {...field}
                    className="placeholder:text-muted-foreground/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-0 relative">
                <FormLabel className="text-sm text-muted-foreground font-normal">{tAuth("password")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      disabled={isPending}
                      placeholder={tAuth("passwordPlaceholder")}
                      {...field}
                      className="placeholder:text-muted-foreground/50"
                      type={showPassword ? "text" : "password"}
                    />
                    <span
                      className="absolute right-1 top-1/2 cursor-pointer text-muted-foreground"
                      onClick={() => setshowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeClosed className="absolute right-2 top-1/2 -translate-y-1/2 size-5" />
                      ) : (
                        <EyeIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-5" />
                      )}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ShinyButton className="w-full" disabled={isPending} type="submit">
            {!isPending ? tAuth("signIn") : <Loader2 className="size-4 animate-spin" />}
          </ShinyButton>
        </form>
      </Form>
    </div>
  );
}

export default SignInForm;
