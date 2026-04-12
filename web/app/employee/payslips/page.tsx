"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, apiUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type RecordRow = {
  _id: string;
  year: number;
  month: number;
  baseSalary: number;
  totalDeductions: number;
  netSalary: number;
  finalized: boolean;
};

async function downloadPdf(recordId: string) {
  const token = getToken();
  const res = await fetch(apiUrl(`/api/payslips/${recordId}/pdf`), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payslip-${recordId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

function PayslipsInner() {
  const params = useSearchParams();
  const highlight = params.get("highlight");
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<RecordRow[]>("/api/salary/me/records")
      .then(setRows)
      .catch(() => setErr("Could not load payslips"));
  }, []);

  if (err) return <p className="text-sm text-red-700">{err}</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Payslips</h1>
        <p className="mt-1 text-sm text-muted">Monthly payroll records. Download PDF or open detail view.</p>
      </div>

      <Card title="Records">
        {rows.length === 0 && <p className="text-sm text-muted">No payroll records yet.</p>}
        <ul className="divide-y divide-corp-100">
          {rows.map((r) => (
            <li
              key={r._id}
              className={`flex flex-col gap-3 py-4 text-sm sm:flex-row sm:items-center sm:justify-between ${
                highlight === r._id ? "rounded-md bg-corp-50/80 -mx-2 px-2" : ""
              }`}
            >
              <div>
                <div className="font-medium text-ink">
                  {r.year}-{String(r.month).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted">
                  Net {r.netSalary.toFixed(2)} · Deductions {r.totalDeductions.toFixed(2)}
                  {r.finalized ? " · Finalized" : " · Draft"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => downloadPdf(r._id).catch(() => alert("PDF download failed"))}
                >
                  PDF
                </Button>
                <a
                  className="inline-flex items-center justify-center rounded-md border border-corp-200 bg-white px-3 py-1.5 text-xs font-medium text-corp-800 transition hover:bg-corp-50"
                  href={`/employee/payslips/${r._id}`}
                >
                  View
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default function PayslipsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <PayslipsInner />
    </Suspense>
  );
}
