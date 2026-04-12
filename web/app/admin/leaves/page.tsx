"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Leave = {
  _id: string;
  userId: { name: string; email: string };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  adminTag: string;
  status: string;
};

export default function AdminLeavesPage() {
  const [rows, setRows] = useState<Leave[]>([]);
  const [err, setErr] = useState<string | null>(null);

  function load() {
    api<Leave[]>("/api/leaves/pending")
      .then(setRows)
      .catch(() => setErr("Could not load pending leaves"));
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id: string, status: "approved" | "rejected") {
    setErr(null);
    try {
      await api(`/api/leaves/${id}/decision`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Leaves</h1>
        <p className="mt-1 text-sm text-muted">Approvals affect leave balance and payroll deductions.</p>
      </div>

      {err && <p className="text-sm text-red-700">{err}</p>}

      <Card title="Pending requests">
        {rows.length === 0 && <p className="text-sm text-muted">No pending requests.</p>}
        <ul className="divide-y divide-corp-100">
          {rows.map((l) => (
            <li key={l._id} className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
              <div className="text-sm">
                <div className="font-semibold text-ink">
                  {l.userId?.name}{" "}
                  <span className="font-normal text-muted">({l.userId?.email})</span>
                </div>
                <div className="mt-1 text-muted">
                  {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()} ·{" "}
                  {l.totalDays} day(s)
                </div>
                {l.reason && <p className="mt-2 leading-relaxed text-ink">{l.reason}</p>}
                {l.adminTag && <p className="mt-1 text-xs text-corp-400">Employee note: {l.adminTag}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="primary"
                  className="rounded-md bg-success text-white hover:opacity-95"
                  onClick={() => decide(l._id, "approved")}
                >
                  Approve
                </Button>
                <Button variant="outline" className="rounded-md border-corp-300 text-corp-800" onClick={() => decide(l._id, "rejected")}>
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
