"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { tryCatch } from "@/src/shared/utils";
import { authCaller, authContract } from "@/src/shared/services/http/api/auth/requests";
import {
  EmailField,
  NameField,
  PasswordField,
} from "@/src/features/auth/auth-form-fields";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type FormSchema = z.infer<typeof formSchema>;

export default function AuthSignUpForm() {
  const form = useForm<FormSchema>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const [, error] = await tryCatch(
      authCaller.call(
        authContract.register(
          data.name,
          data.email,
          data.password,
          data.password_confirmation,
        ),
      ),
    );

    if (error) {
      return;
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
    });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <NameField
        name="name"
        control={form.control}
        error={form.formState.errors.name?.message}
      />
      <EmailField
        name="email"
        control={form.control}
        error={form.formState.errors.email?.message}
      />
      <PasswordField
        name="password"
        control={form.control}
        error={form.formState.errors.password?.message}
      />
      <PasswordField
        name="password_confirmation"
        control={form.control}
        error={form.formState.errors.password_confirmation?.message}
        label="Confirm password"
      />
      <Button
        type="submit"
        className="w-full h-12 rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-primary/25"
      >
        Sign Up
      </Button>
    </form>
  );
}
