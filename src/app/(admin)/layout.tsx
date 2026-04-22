import { RouteGuard } from "@/components/layout/route-guard";

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard>{children}</RouteGuard>;
}
