"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PerformanceLineChart, type PerfPoint } from "@/components/charts/PerformanceLineChart";

type Feedback = { author?: string; body: string; createdAt?: string };
type Resp = { title?: string; details?: string };

type Dashboard = {
  today: { dateKey: string; attendance: unknown };
  leaveBalance: { allowance: number; usedApprovedDaysThisMonth: number; extraChargeableDays: number };
  salaryPreview: {
    baseSalary: number;
    totalDeductions: number;
    netSalary: number;
    deductions: { label: string; amount: number }[];
  };
  latestPayslipRecordId: string | null;
  unreadNotifications: number;
  recentLeaves: { _id: string; status: string; startDate: string; endDate: string; totalDays: number }[];
  profile: {
    responsibilities: Resp[];
    hrRemarks: string;
    performanceMonthly: PerfPoint[];
    feedbacks: Feedback[];
  };
};

export default function EmployeeDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Dashboard>("/api/dashboard/employee")
      .then(setData)
      .catch(() => setErr("Could not load dashboard"));
  }, []);

  if (err) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800">{err}</div>
    );
  }
  if (!data) {
    return <p className="text-sm text-muted">Loading dashboard…</p>;
  }

  const att = data.today.attendance as {
    checkInAt?: string;
    checkOutAt?: string;
    isLate?: boolean;
  } | null;

  const { profile } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Overview for {data.today.dateKey}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Attendance" description="Today’s check-in status">
          {!att && <p className="text-sm text-muted">No check-in yet.</p>}
          {att && (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Check-in</dt>
                <dd className="font-medium text-ink">
                  {att.checkInAt ? new Date(att.checkInAt).toLocaleString() : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Check-out</dt>
                <dd className="font-medium text-ink">
                  {att.checkOutAt ? new Date(att.checkOutAt).toLocaleString() : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Late</dt>
                <dd>
                  <Badge tone={att.isLate ? "warning" : "neutral"}>{att.isLate ? "Yes" : "On time"}</Badge>
                </dd>
              </div>
            </dl>
          )}
          <Link
            href="/employee/attendance"
            className="mt-4 inline-flex text-sm font-medium text-corp-800 underline-offset-4 transition hover:text-accent hover:underline"
          >
            Open attendance
          </Link>
        </Card>

        <Card title="Leave balance" description="Current month (per policy in Settings)">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Allowance</dt>
              <dd className="font-medium tabular-nums text-ink">{data.leaveBalance.allowance} days</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Approved used</dt>
              <dd className="font-medium tabular-nums text-ink">{data.leaveBalance.usedApprovedDaysThisMonth}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Extra (chargeable)</dt>
              <dd className="font-medium tabular-nums text-corp-800">
                {data.leaveBalance.extraChargeableDays}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Salary summary" description="Estimated net before payroll finalization">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Base</dt>
              <dd className="font-medium tabular-nums text-ink">{data.salaryPreview.baseSalary.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Deductions</dt>
              <dd className="font-medium tabular-nums text-corp-600">-{data.salaryPreview.totalDeductions.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-corp-100 pt-3">
              <dt className="font-medium text-ink">Net (estimate)</dt>
              <dd className="font-semibold tabular-nums text-ink">{data.salaryPreview.netSalary.toFixed(2)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/employee/salary"
              className="text-sm font-medium text-corp-800 underline-offset-4 hover:text-accent hover:underline"
            >
              Salary detail
            </Link>
            {data.latestPayslipRecordId && (
              <Link
                href="/employee/payslips"
                className="text-sm font-medium text-corp-800 underline-offset-4 hover:text-accent hover:underline"
              >
                Payslips
              </Link>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Responsibilities" description="Role expectations set by HR">
          {!profile.responsibilities?.length ? (
            <p className="text-sm text-muted">No responsibilities listed yet.</p>
          ) : (
            <ul className="space-y-3">
              {profile.responsibilities.map((r, i) => (
                <li key={i} className="rounded-md border border-corp-100 bg-corp-50/40 px-4 py-3">
                  <div className="text-sm font-medium text-ink">{r.title || "Item"}</div>
                  {r.details && <p className="mt-1 text-sm leading-relaxed text-muted">{r.details}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="HR remarks" description="Notes visible to you">
          {!profile.hrRemarks?.trim() ? (
            <p className="text-sm text-muted">No remarks yet.</p>
          ) : (
            <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">{profile.hrRemarks}</p>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Performance" description="Monthly scores (0–100)">
          <PerformanceLineChart data={profile.performanceMonthly || []} />
        </Card>

        <Card title="Feedback" description="From leadership / HR">
          {!profile.feedbacks?.length ? (
            <p className="text-sm text-muted">No feedback recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {profile.feedbacks.map((f, i) => (
                <li key={i} className="rounded-md border border-corp-100 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {f.author || "HR"}
                    </span>
                    {f.createdAt && (
                      <span className="text-[11px] text-corp-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{f.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Recent leave requests"
        action={
          data.unreadNotifications > 0 ? (
            <Link href="/employee/notifications" className="text-xs font-medium text-accent hover:underline">
              {data.unreadNotifications} unread
            </Link>
          ) : null
        }
      >
        {data.recentLeaves.length === 0 && <p className="text-sm text-muted">No requests yet.</p>}
        <ul className="divide-y divide-corp-100">
          {data.recentLeaves.map((l) => (
            <li key={l._id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div>
                <div className="font-medium text-ink">
                  {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted">{l.totalDays} day(s)</div>
              </div>
              <Badge
                tone={
                  l.status === "approved" ? "success" : l.status === "rejected" ? "neutral" : "warning"
                }
              >
                {l.status}
              </Badge>
            </li>
          ))}
        </ul>
        <Link
          href="/employee/leaves"
          className="mt-4 inline-flex text-sm font-medium text-corp-800 underline-offset-4 hover:text-accent hover:underline"
        >
          Manage leaves
        </Link>
      </Card>
    </div>
  );
}
