"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";

type AdminDash = {
  activeEmployees: number;
  pendingLeaveRequests: number;
  adminUnreadNotifications: number;
  checkInsToday: number;
  serverDateKey: string;
};

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDash | null>(null);

  useEffect(() => {
    api<AdminDash>("/api/dashboard/admin").then(setData);
  }, []);

  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Operational overview · {data.serverDateKey}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Active employees" description="Accounts in good standing">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-corp-900">{data.activeEmployees}</p>
          <Link
            href="/admin/employees"
            className="mt-4 inline-flex text-sm font-medium text-corp-800 underline-offset-4 hover:text-accent hover:underline"
          >
            Manage
          </Link>
        </Card>
        <Card title="Pending leaves" description="Awaiting decision">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-corp-800">{data.pendingLeaveRequests}</p>
          <Link
            href="/admin/leaves"
            className="mt-4 inline-flex text-sm font-medium text-corp-800 underline-offset-4 hover:text-accent hover:underline"
          >
            Review
          </Link>
        </Card>
        <Card title="Check-ins today" description="Distinct attendance rows">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-corp-900">{data.checkInsToday}</p>
          <Link
            href="/admin/attendance"
            className="mt-4 inline-flex text-sm font-medium text-corp-800 underline-offset-4 hover:text-accent hover:underline"
          >
            Reports
          </Link>
        </Card>
        <Card title="Unread alerts" description="Your notification inbox">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-corp-800">{data.adminUnreadNotifications}</p>
          <Link
            href="/admin/notifications"
            className="mt-4 inline-flex text-sm font-medium text-corp-800 underline-offset-4 hover:text-accent hover:underline"
          >
            Inbox
          </Link>
        </Card>
      </div>
    </div>
  );
}
