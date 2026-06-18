"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const inputClassName =
  "w-full pl-11 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all";

type FieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  error?: string;
};

export function NameField<T extends FieldValues & { name: string }>({
  name,
  control,
  error,
}: FieldProps<T>) {
  return (
    <Field>
      <FieldLabel className="text-muted-foreground">Name</FieldLabel>
      <FieldContent>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="Your name"
                className={inputClassName}
                {...field}
              />
            )}
          />
        </div>
      </FieldContent>
      <FieldError>{error}</FieldError>
    </Field>
  );
}

export function EmailField<T extends FieldValues & { email: string }>({
  name,
  control,
  error,
}: FieldProps<T>) {
  return (
    <Field>
      <FieldLabel className="text-muted-foreground">E-mail</FieldLabel>
      <FieldContent>
        <div className="relative">
          <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Input
                type="email"
                placeholder="you@example.com"
                className={inputClassName}
                {...field}
              />
            )}
          />
        </div>
      </FieldContent>
      <FieldError>{error}</FieldError>
    </Field>
  );
}

export function PasswordField<T extends FieldValues>({
  name,
  control,
  error,
  label = "Password",
  showForgot = false,
}: FieldProps<T> & { label?: string; showForgot?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field>
      <div className="flex items-center justify-between">
        <FieldLabel className="text-muted-foreground">{label}</FieldLabel>
        {showForgot && (
          <Button
            variant="ghost"
            className="text-sm text-primary hover:underline hover:bg-transparent"
          >
            Forgot?
          </Button>
        )}
      </div>
      <FieldContent>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                className="w-full pl-11 pr-11 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="********"
                {...field}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeOffIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </Button>
            </div>
          )}
        />
      </FieldContent>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
