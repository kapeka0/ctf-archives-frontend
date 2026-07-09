"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useRouter } from "@/i18n/routing";

function SubmitForm() {
  const t = useTranslations("Submit");
  const router = useRouter();
  const submit = useMutation(api.submissions.submit);
  const [pending, setPending] = useState(false);

  const schema = z.object({
    name: z.string().min(1, t("required")).max(100),
    year: z.string().regex(/^\d{4}$/, t("yearError")),
    url: z.union([z.string().url(t("urlError")), z.literal("")]).optional(),
    categories: z.string().optional(),
    notes: z.string().max(500).optional(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", year: "", url: "", categories: "", notes: "" },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setPending(true);
    try {
      await submit({
        name: data.name,
        year: data.year,
        url: data.url || undefined,
        categories: (data.categories ?? "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        notes: data.notes || undefined,
      });
      toast.success(t("success"));
      router.push("/");
    } catch {
      toast.error(t("error"));
    } finally {
      setPending(false);
    }
  };

  const fields = [
    { name: "name" as const, label: t("name"), placeholder: "DEF CON CTF" },
    { name: "year" as const, label: t("year"), placeholder: "2025" },
    { name: "url" as const, label: t("url"), placeholder: "https://ctftime.org/event/..." },
    { name: "categories" as const, label: t("categories"), placeholder: "pwn, crypto, web" },
    { name: "notes" as const, label: t("notes"), placeholder: t("notesPlaceholder") },
  ];

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {fields.map((f) => (
          <FormField
            control={form.control}
            key={f.name}
            name={f.name}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </FormLabel>
                <FormControl>
                  <Input disabled={pending} placeholder={f.placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button className="w-full" disabled={pending} type="submit">
          {pending ? <Loader2 className="size-4 animate-spin" /> : t("cta")}
        </Button>
      </form>
    </Form>
  );
}

export default SubmitForm;
