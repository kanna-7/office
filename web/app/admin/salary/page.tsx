"use client";

import { useEffect, useState } from "react";
import { api, apiUrl, ApiError } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Table, Th, Tr, Td } from "@/components/ui/Table";

type Rec = {
  _id: string;
  userId: { name: string; email: string };
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

export default function AdminSalaryPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [finalize, setFinalize] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<Rec[]>([]);

  function loadRecords() {
    const q = new URLSearchParams({ year: String(year), month: String(month) });
    api<Rec[]>(`/api/salary/records?${q.toString()}`).then(setRows);
  }

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setMsg(null);
    setErr(null);
    try {
      const res = await api<{ count: number }>("/api/salary/generate", {
        method: "POST",
        body: JSON.stringify({ year, month, finalize }),
      });
      setMsg(`Payroll updated for ${res.count} employee(s).`);
      loadRecords();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Payroll</h1>
        <p className="mt-1 text-sm text-muted">Generate monthly records from attendance and leave configuration.</p>
      </div>

      <Card title="Run payroll">
        <div className="grid items-end gap-4 md:grid-cols-3">
          <div>
            <Label>Year</Label>
            <Input className="mt-1.5" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
          <div>
            <Label>Month</Label>
            <Input className="mt-1.5" type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2 pb-1">
            <input
              id="fin"
              type="checkbox"
              className="h-4 w-4 rounded border-corp-300"
              checked={finalize}
              onChange={(e) => setFinalize(e.target.checked)}
            />
            <label htmlFor="fin" className="text-sm text-ink">
              Finalized
            </label>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button variant="primary" type="button" className="rounded-md" onClick={generate}>
            Run payroll
          </Button>
          <Button variant="outline" type="button" className="rounded-md" onClick={loadRecords}>
            Load records
          </Button>
          {msg && <span className="text-sm text-success">{msg}</span>}
          {err && <span className="text-sm text-red-700">{err}</span>}
        </div>
      </Card>

      <Card title="Monthly records">
        <Table>
          <thead>
            <tr className="border-b border-corp-100">
              <Th>Employee</Th>
              <Th>Period</Th>
              <Th className="text-right">Base</Th>
              <Th className="text-right">Deductions</Th>
              <Th className="text-right">Net</Th>
              <Th className="text-right">PDF</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r._id}>
                <Td>
                  <div className="font-medium text-ink">{r.userId?.name}</div>
                  <div className="text-xs text-muted">{r.userId?.email}</div>
                </Td>
                <Td className="font-mono text-xs">
                  {r.year}-{String(r.month).padStart(2, "0")}
                </Td>
                <Td className="text-right tabular-nums">{r.baseSalary.toFixed(2)}</Td>
                <Td className="text-right tabular-nums text-corp-600">{r.totalDeductions.toFixed(2)}</Td>
                <Td className="text-right font-medium tabular-nums text-ink">{r.netSalary.toFixed(2)}</Td>
                <Td className="text-right">
                  <button
                    type="button"
                    className="text-xs font-medium text-corp-800 underline-offset-4 hover:text-accent hover:underline"
                    onClick={() => downloadPdf(r._id).catch(() => alert("Download failed"))}
                  >
                    Download
                  </button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
