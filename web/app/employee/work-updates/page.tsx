"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, TextArea, Label } from "@/components/ui/Input";
import { Table, Th, Td, Tr } from "@/components/ui/Table";

type WorkUpdate = {
  _id: string;
  date: string;
  tasksCompleted: string;
  workHours: number;
  notes: string;
};

type Resp = {
  workUpdates: WorkUpdate[];
  pagination: { page: number; total: number; pages: number };
};

export default function EmployeeWorkUpdatesPage() {
  const [updates, setUpdates] = useState<WorkUpdate[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState("8");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(p = 1) {
    try {
      const res = await api.get<Resp>(`/api/work-updates/my?page=${p}&limit=10`);
      setUpdates(res.workUpdates);
      setPage(res.pagination.page);
      setTotalPages(res.pagination.pages);
    } catch {
      setError("Could not load work updates");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/work-updates", {
        date,
        tasksCompleted: tasks,
        workHours: parseFloat(hours),
        notes,
      });
      setShowForm(false);
      setTasks("");
      setHours("8");
      setNotes("");
      load(1);
    } catch (err: any) {
      setError(err?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Work Updates</h1>
          <p className="mt-1 text-sm text-muted">Submit and track your daily work updates</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Update"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      {showForm && (
        <Card title="Submit Work Update">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label>Date</Label>
              <Input className="mt-1.5" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <Label>Tasks Completed</Label>
              <TextArea className="mt-1.5" rows={3} value={tasks} onChange={(e) => setTasks(e.target.value)} required placeholder="Describe what you worked on today..." />
            </div>
            <div>
              <Label>Work Hours</Label>
              <Input className="mt-1.5" type="number" min="0" max="24" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} required />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <TextArea className="mt-1.5" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any blockers, comments, etc." />
            </div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Submitting…" : "Submit Update"}
            </Button>
          </form>
        </Card>
      )}

      <Card>
        {updates.length === 0 ? (
          <p className="text-sm text-muted">No work updates yet. Click &ldquo;+ New Update&rdquo; to get started.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Tasks</Th>
                <Th>Hours</Th>
                <Th>Notes</Th>
              </tr>
            </thead>
            <tbody>
              {updates.map((u) => (
                <Tr key={u._id}>
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
