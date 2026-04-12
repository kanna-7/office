"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Table, Th, Tr, Td } from "@/components/ui/Table";

type Row = {
  _id: string;
  dateKey: string;
  userId: { name: string; email: string };
  checkInAt?: string;
  checkOutAt?: string;
  isLate?: boolean;
  latePenaltyAmount?: number;
};

export default function AdminAttendancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function load() {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const qs = q.toString();
    api<Row[]>(`/api/attendance/report${qs ? `?${qs}` : ""}`).then(setRows);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Attendance</h1>
        <p className="mt-1 text-sm text-muted">Filter by date key (YYYY-MM-DD). Latest 500 rows.</p>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label>From</Label>
            <Input className="mt-1.5 w-40" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="2026-04-01" />
          </div>
          <div>
            <Label>To</Label>
            <Input className="mt-1.5 w-40" value={to} onChange={(e) => setTo(e.target.value)} placeholder="2026-04-30" />
          </div>
          <Button variant="primary" type="button" className="rounded-md" onClick={load}>
            Apply
          </Button>
        </div>
      </Card>

      <Card title="Records">
        <Table>
          <thead>
            <tr className="border-b border-corp-100">
              <Th>Date</Th>
              <Th>Employee</Th>
              <Th>Check-in</Th>
              <Th>Check-out</Th>
              <Th>Late</Th>
              <Th className="text-right">Penalty</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r._id}>
                <Td className="font-mono text-xs text-muted">{r.dateKey}</Td>
                <Td>
                  <div className="font-medium text-ink">{r.userId?.name}</div>
                  <div className="text-xs text-muted">{r.userId?.email}</div>
                </Td>
                <Td className="text-muted">{r.checkInAt ? new Date(r.checkInAt).toLocaleString() : "—"}</Td>
                <Td className="text-muted">{r.checkOutAt ? new Date(r.checkOutAt).toLocaleString() : "—"}</Td>
                <Td>{r.isLate ? "Yes" : "No"}</Td>
                <Td className="text-right tabular-nums">{r.latePenaltyAmount?.toFixed?.(2) ?? "0"}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
