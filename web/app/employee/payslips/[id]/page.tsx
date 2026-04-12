"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";

type Rec = {
  year: number;
  month: number;
  baseSalary: number;
  deductions: { label: string; amount: number }[];
  totalDeductions: number;
  netSalary: number;
};

export default function PayslipViewPage() {
  const { id } = useParams<{ id: string }>();
  const [rec, setRec] = useState<Rec | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api<Rec>(`/api/payslips/${id}`)
      .then(setRec)
      .catch(() => setErr("Could not load payslip"));
  }, [id]);

  if (err) return <p className="text-sm text-red-700">{err}</p>;
  if (!rec) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/employee/payslips" className="text-sm font-medium text-muted underline-offset-4 hover:text-accent hover:underline">
        ← Payslips
      </Link>
      <Card title={`Payslip ${rec.year}-${String(rec.month).padStart(2, "0")}`}>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Base</dt>
            <dd className="font-medium tabular-nums text-ink">{rec.baseSalary.toFixed(2)}</dd>
          </div>
          {rec.deductions.map((d, i) => (
            <div key={i} className="flex justify-between">
              <dt className="text-muted">{d.label}</dt>
              <dd className="tabular-nums text-corp-600">-{d.amount.toFixed(2)}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-corp-100 pt-3">
            <dt className="font-medium text-ink">Total deductions</dt>
            <dd className="font-semibold tabular-nums text-corp-600">-{rec.totalDeductions.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-semibold text-ink">Net</dt>
            <dd className="font-semibold tabular-nums text-ink">{rec.netSalary.toFixed(2)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
