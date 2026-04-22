"use client";

import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import type { LoginPayload } from "@/types";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginPayload) => {
    try {
      await login(values);
    } catch {
      // Error toast is already handled in useAuth. This prevents runtime overlay.
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-app-accent/20 blur-[90px]" />
      <Card className="relative w-full max-w-md rounded-3xl p-6 md:p-8">
        <div className="mb-6 text-center">
          <p className="font-display text-3xl font-bold">Clarivoice</p>
          <p className="mt-2 text-sm text-app-text-secondary">
            Secure admin access for operations and host control
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm text-app-text-secondary">
              Email / Phone
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-text-muted" />
              <Input
                {...register("emailOrPhone", {
                  required: "Email or phone is required",
                })}
                className="pl-9"
                placeholder="Enter email or phone"
              />
            </div>
            {errors.emailOrPhone ? (
              <p className="mt-1 text-xs text-app-danger">{errors.emailOrPhone.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm text-app-text-secondary">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-text-muted" />
              <Input
                type="password"
                {...register("password", { required: "Password is required" })}
                className="pl-9"
                placeholder="Enter password"
              />
            </div>
            {errors.password ? (
              <p className="mt-1 text-xs text-app-danger">{errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoggingIn}>
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-app-text-muted">
          Role-based access is enabled for super admin, admin, and support manager.
        </p>
      </Card>
    </div>
  );
}
