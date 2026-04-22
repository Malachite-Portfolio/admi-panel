"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import { PageLoader } from "@/components/ui/loader";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, isHydrated } = useAuthContext();

  useEffect(() => {
    if (isHydrated && !session?.accessToken) {
      router.replace("/login");
    }
  }, [isHydrated, router, session?.accessToken]);

  if (!isHydrated) {
    return <PageLoader />;
  }

  if (!session?.accessToken) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
