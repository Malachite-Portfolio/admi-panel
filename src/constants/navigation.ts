import {
  BadgeDollarSign,
  ChartArea,
  CircleDollarSign,
  FileCheck2,
  Headset,
  Landmark,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminRole } from "@/types";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: AdminRole[];
};

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "admin", "support_manager"],
  },
  {
    label: "Hosts",
    href: "/hosts",
    icon: Headset,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Users",
    href: "/users",
    icon: UsersRound,
    roles: ["super_admin", "admin", "support_manager"],
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: Wallet,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Withdrawals",
    href: "/withdrawals",
    icon: Landmark,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Host KYC Review",
    href: "/host-kyc",
    icon: FileCheck2,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Referrals",
    href: "/referrals",
    icon: BadgeDollarSign,
    roles: ["super_admin", "admin", "support_manager"],
  },
  {
    label: "Sessions",
    href: "/sessions",
    icon: CircleDollarSign,
    roles: ["super_admin", "admin", "support_manager"],
  },
  {
    label: "Support",
    href: "/support",
    icon: UserRound,
    roles: ["super_admin", "admin", "support_manager"],
  },
  {
    label: "Analytics",
    href: "/dashboard#analytics",
    icon: ChartArea,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Logout",
    href: "/login",
    icon: LogOut,
    roles: ["super_admin", "admin", "support_manager"],
  },
];
