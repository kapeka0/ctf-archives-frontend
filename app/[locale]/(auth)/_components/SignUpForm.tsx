"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosed, EyeIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useRouter } from "@/i18n/routing";

function SignUpForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const tForm = useTranslations("Auth.zod");
  const tAuth = useTranslations("Auth");
  const tError = useTranslations("Auth.errors");
  const [showPassword, setshowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const signUpSchema = z
    .object({
      username: z
        .string()
        .min(3, { message: tForm("usernameLength") })
        .max(20, { message: tForm("usernameLength") })
        .regex(/^[a-zA-Z0-9_]+$/, { message: tForm("usernameChars") }),
      password: z
        .string()
        .min(8, { message: tForm("passwordLength") })
        .max(64, { message: tForm("passwordMaxLength") }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tAuth("passwordMismatch"),
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof signUpSchema>>({
    mode: "onChange",
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsPending(true);
    try {
      await signIn("password", {
        email: data.username.trim().toLowerCase(),
        password: data.password,
        flow: "signUp",
      });
      toast.success(tAuth("signUpSuccess"));
      router.push("/");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("already exists")) {
        form.setError("username", { type: "manual", message: tError("existingUser") });
        toast.error(tError("existingUser"));
      } else if (msg.includes("Invalid password")) {
        form.setError("password", { type: "manual", message: tError("invalidPassword") });
        toast.error(tError("invalidPassword"));
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-0 relative">
                <FormLabel className="text-sm text-muted-foreground font-normal">{tAuth("confirmPassword")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder={tAuth("confirmPassword")}
                    {...field}
                    className="placeholder:text-muted-foreground/50"
                    type={showPassword ? "text" : "password"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ShinyButton className="w-full" disabled={isPending} type="submit">
            {!isPending ? tAuth("signUp") : <Loader2 className="size-4 animate-spin" />}
          </ShinyButton>
        </form>
      </Form>
    </div>
  );
}

export default SignUpForm;
