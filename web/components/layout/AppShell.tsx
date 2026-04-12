"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearSession, getStoredUser, type Role } from "@/lib/auth";
import {
  IconAttendance,
  IconBell,
  IconDashboard,
  IconLeaves,
  IconLogout,
  IconMenu,
  IconSalary,
  IconSettings,
  IconUsers,
} from "@/components/icons";

type NavItem = { href: string; label: string; icon: React.ReactNode };

function NavLink({
  href,
  label,
  icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
        active ? "bg-white/10 text-white" : "text-corp-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="h-5 w-5 shrink-0 opacity-80 transition-opacity duration-200 group-hover:opacity-100">{icon}</span>
      {label}
    </Link>
  );
}

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const employeeNav: NavItem[] = [
    { href: "/employee", label: "Dashboard", icon: <IconDashboard className="h-5 w-5" /> },
    { href: "/employee/attendance", label: "Attendance", icon: <IconAttendance className="h-5 w-5" /> },
    { href: "/employee/leaves", label: "Leaves", icon: <IconLeaves className="h-5 w-5" /> },
    { href: "/employee/salary", label: "Salary", icon: <IconSalary className="h-5 w-5" /> },
  ];

  const adminNav: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: <IconDashboard className="h-5 w-5" /> },
    { href: "/admin/employees", label: "Employees", icon: <IconUsers className="h-5 w-5" /> },
    { href: "/admin/settings", label: "Settings", icon: <IconSettings className="h-5 w-5" /> },
    { href: "/admin/attendance", label: "Attendance", icon: <IconAttendance className="h-5 w-5" /> },
    { href: "/admin/leaves", label: "Leaves", icon: <IconLeaves className="h-5 w-5" /> },
    { href: "/admin/salary", label: "Payroll", icon: <IconSalary className="h-5 w-5" /> },
  ];

  const nav = role === "admin" ? adminNav : employeeNav;
  const notifPath = role === "admin" ? "/admin/notifications" : "/employee/notifications";
  const initial = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();
  const closeMobile = () => setMobileOpen(false);

  const sidebar = (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full min-h-screen w-60 flex-col border-r border-corp-800 bg-corp-900 shadow-xl transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none ${
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-corp-800 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">
          OP
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-white">Office Portal</div>
          <div className="text-[11px] text-corp-400">{role === "admin" ? "Admin" : "Employee"}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href}
            onNavigate={closeMobile}
          />
        ))}
      </nav>
      <div className="shrink-0 border-t border-corp-800 p-3 text-xs text-corp-400">
        <div className="truncate font-medium text-corp-200">{user?.name}</div>
        <div className="truncate">{user?.email}</div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-page">
      <div
        className={`fixed inset-0 z-40 bg-corp-900/40 transition-opacity duration-300 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
        onClick={closeMobile}
      />
      {sidebar}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-corp-200/80 bg-white/90 px-4 shadow-nav backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-corp-200 text-corp-700 transition duration-200 hover:bg-corp-50 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-corp-800">Workspace</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href={notifPath}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-corp-600 transition duration-200 hover:bg-corp-100 hover:text-corp-900"
              aria-label="Notifications"
            >
              <IconBell className="h-5 w-5" />
            </Link>
            <div
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-corp-200 bg-corp-50 text-xs font-semibold text-corp-800"
              title={user?.email || ""}
            >
              {initial}
            </div>
            <button
              type="button"
              onClick={() => {
                clearSession();
                router.replace("/login");
              }}
              className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-md border border-corp-200 px-2.5 text-xs font-medium text-corp-700 transition duration-200 hover:bg-corp-50 sm:px-3"
            >
              <IconLogout className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
