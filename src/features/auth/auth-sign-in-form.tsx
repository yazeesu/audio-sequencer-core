"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  EmailField,
  PasswordField,
} from "@/src/features/auth/auth-form-fields";

const formSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

type FormSchema = z.infer<typeof formSchema>;

export default function AuthSignInForm() {
  const form = useForm<FormSchema>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    signIn("credentials", {
      email: data.email,
      password: data.password,
    });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EmailField
        name="email"
        control={form.control}
        error={form.formState.errors.email?.message}
      />
      <PasswordField
        name="password"
        control={form.control}
        error={form.formState.errors.password?.message}
        showForgot
      />
      <Button
        type="submit"
        className="w-full h-12 rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-primary/25"
      >
        Sign In
      </Button>
    </form>
  );
}
