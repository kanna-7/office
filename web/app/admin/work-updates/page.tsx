"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Table, Th, Td, Tr } from "@/components/ui/Table";

type WorkUpdate = {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  date: string;
  tasksCompleted: string;
  workHours: number;
  notes: string;
};

type Resp = {
  workUpdates: WorkUpdate[];
  pagination: { page: number; total: number; pages: number };
};

export default function AdminWorkUpdatesPage() {
  const [updates, setUpdates] = useState<WorkUpdate[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load(p = 1) {
    try {
      let url = `/api/work-updates?page=${p}&limit=15`;
      if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
      const res = await api.get<Resp>(url);
      setUpdates(res.workUpdates);
      setPage(res.pagination.page);
      setTotalPages(res.pagination.pages);
    } catch {
      setError("Could not load work updates");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFilter(e: React.FormEvent) {
    e.preventDefault();
    load(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Work Updates</h1>
        <p className="mt-1 text-sm text-muted">Employee daily work update submissions</p>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <Card>
        <form className="flex flex-wrap items-end gap-4" onSubmit={onFilter}>
          <div>
            <Label>Start Date</Label>
            <Input className="mt-1" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input className="mt-1" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Button type="submit" variant="secondary">Filter</Button>
          <Button type="button" variant="ghost" onClick={() => { setStartDate(""); setEndDate(""); load(1); }}>Clear</Button>
        </form>
      </Card>

      <Card>
        {updates.length === 0 ? (
          <p className="text-sm text-muted">No work updates found.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Date</Th>
                <Th>Tasks</Th>
                <Th>Hours</Th>
                <Th>Notes</Th>
              </tr>
            </thead>
            <tbody>
              {updates.map((u) => (
                <Tr key={u._id}>
                  <Td>{u.userId?.name || "Unknown"}</Td>
                  <Td>{new Date(u.date).toLocaleDateString()}</Td>
                  <Td className="max-w-xs truncate">{u.tasksCompleted}</Td>
                  <Td>{u.workHours}h</Td>
                  <Td className="max-w-xs truncate">{u.notes || "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</Button>
            <span className="text-sm text-muted">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => load(page + 1)}>Next</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
