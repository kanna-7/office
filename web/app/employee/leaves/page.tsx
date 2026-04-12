"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, TextArea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

type Leave = {
  _id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  adminTag: string;
  status: string;
  createdAt: string;
};

export default function LeavesPage() {
  const [rows, setRows] = useState<Leave[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [adminTag, setAdminTag] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function load() {
    api<Leave[]>("/api/leaves/me").then(setRows).catch(() => setErr("Could not load leaves"));
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    try {
      await api("/api/leaves", {
        method: "POST",
        body: JSON.stringify({ startDate, endDate, reason, adminTag }),
      });
      setMsg("Leave request submitted.");
      setStartDate("");
      setEndDate("");
      setReason("");
      setAdminTag("");
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Leaves</h1>
        <p className="mt-1 text-sm text-muted">Submit requests and track approval status.</p>
      </div>

      <Card title="Apply for leave">
        <form className="space-y-5 text-sm" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Start date</Label>
              <Input className="mt-1.5" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End date</Label>
              <Input className="mt-1.5" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Reason</Label>
            <TextArea className="mt-1.5" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div>
            <Label>Optional note to Admin / HR</Label>
            <Input className="mt-1.5" value={adminTag} onChange={(e) => setAdminTag(e.target.value)} />
          </div>
          {msg && <p className="text-sm text-success">{msg}</p>}
          {err && <p className="text-sm text-red-700">{err}</p>}
          <Button variant="primary" type="submit" className="rounded-md">
            Submit request
          </Button>
        </form>
      </Card>

      <Card title="Your requests">
        {rows.length === 0 && <p className="text-sm text-muted">No requests yet.</p>}
        <ul className="divide-y divide-corp-100">
          {rows.map((l) => (
            <li key={l._id} className="flex flex-col gap-2 py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-medium text-ink">
                  {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()} ·{" "}
                  {l.totalDays} day(s)
                </span>
                <Badge
                  tone={
                    l.status === "approved" ? "success" : l.status === "rejected" ? "neutral" : "warning"
                  }
                >
                  {l.status}
                </Badge>
              </div>
              {l.reason && <p className="text-muted">{l.reason}</p>}
              {l.adminTag && <p className="text-xs text-corp-400">Note to HR: {l.adminTag}</p>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
