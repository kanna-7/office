"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";

type Preview = {
  preview: {
    baseSalary: number;
    totalDeductions: number;
    netSalary: number;
    deductions: { code: string; label: string; amount: number }[];
  };
  leave: { used: number; allowance: number; extra: number };
};

export default function SalaryPage() {
  const [data, setData] = useState<Preview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Preview>("/api/salary/me/preview")
      .then(setData)
      .catch(() => setErr("Could not load salary preview"));
  }, []);

  if (err) return <p className="text-sm text-red-700">{err}</p>;
  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  const p = data.preview;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Salary</h1>
          <p className="mt-1 text-sm text-muted">Estimate from attendance, leave policy, and base pay.</p>
        </div>
        <Link
          href="/employee/payslips"
          className="text-sm font-medium text-corp-800 underline-offset-4 transition hover:text-accent hover:underline"
        >
          Payslips →
        </Link>
      </div>

      <Card title="This month" description="Preview — final figures after payroll run">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Base salary</dt>
            <dd className="font-medium tabular-nums text-ink">{p.baseSalary.toFixed(2)}</dd>
          </div>
          {p.deductions.map((d) => (
            <div key={d.code} className="flex justify-between gap-4">
              <dt className="text-muted">{d.label}</dt>
              <dd className="font-medium tabular-nums text-corp-600">-{d.amount.toFixed(2)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-corp-100 pt-3">
            <dt className="font-medium text-ink">Total deductions</dt>
            <dd className="font-semibold tabular-nums text-corp-600">-{p.totalDeductions.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-ink">Net (estimate)</dt>
            <dd className="font-semibold tabular-nums text-ink">{p.netSalary.toFixed(2)}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Leave impact" description="Current month">
        <dl className="space-y-3 text-sm text-muted">
          <div className="flex justify-between">
            <dt>Allowance</dt>
            <dd className="font-medium text-ink">{data.leave.allowance}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Used (approved)</dt>
            <dd className="font-medium text-ink">{data.leave.used}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Extra chargeable days</dt>
            <dd className="font-medium text-ink">{data.leave.extra}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
