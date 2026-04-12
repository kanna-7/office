"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input, Label, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PerformanceLineChart, type PerfPoint } from "@/components/charts/PerformanceLineChart";

type Resp = { title: string; details: string };
type Fb = { author?: string; body: string; createdAt?: string };

type Employee = {
  id: string;
  email: string;
  name: string;
  baseSalary: number;
  isActive: boolean;
  responsibilities: Resp[];
  hrRemarks: string;
  performanceMonthly: PerfPoint[];
  feedbacks: Fb[];
};

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [emp, setEmp] = useState<Employee | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [fbAuthor, setFbAuthor] = useState("HR");
  const [fbBody, setFbBody] = useState("");

  function load() {
    if (!id) return;
    api<Employee>(`/api/users/${id}`)
      .then(setEmp)
      .catch(() => setErr("Could not load employee"));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!emp || !id) return;
    setMsg(null);
    setErr(null);
    try {
      const updated = await api<Employee>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: emp.name,
          baseSalary: emp.baseSalary,
          isActive: emp.isActive,
          responsibilities: emp.responsibilities,
          hrRemarks: emp.hrRemarks,
          performanceMonthly: emp.performanceMonthly,
          feedbacks: emp.feedbacks,
        }),
      });
      setEmp(updated);
      setMsg("Saved.");
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Save failed");
    }
  }

  function addResponsibility() {
    if (!emp) return;
    setEmp({ ...emp, responsibilities: [...(emp.responsibilities || []), { title: "", details: "" }] });
  }

  function updateResp(i: number, patch: Partial<Resp>) {
    if (!emp) return;
    const next = [...emp.responsibilities];
    next[i] = { ...next[i], ...patch };
    setEmp({ ...emp, responsibilities: next });
  }

  function removeResp(i: number) {
    if (!emp) return;
    setEmp({ ...emp, responsibilities: emp.responsibilities.filter((_, j) => j !== i) });
  }

  function addPerfRow() {
    if (!emp) return;
    const d = new Date();
    setEmp({
      ...emp,
      performanceMonthly: [...(emp.performanceMonthly || []), { year: d.getFullYear(), month: d.getMonth() + 1, score: 80 }],
    });
  }

  function updatePerf(i: number, patch: Partial<PerfPoint>) {
    if (!emp) return;
    const next = [...emp.performanceMonthly];
    next[i] = { ...next[i], ...patch };
    setEmp({ ...emp, performanceMonthly: next });
  }

  function removePerf(i: number) {
    if (!emp) return;
    setEmp({ ...emp, performanceMonthly: emp.performanceMonthly.filter((_, j) => j !== i) });
  }

  function appendFeedback() {
    if (!emp || !fbBody.trim()) return;
    const entry: Fb = { author: fbAuthor.trim() || "HR", body: fbBody.trim(), createdAt: new Date().toISOString() };
    setEmp({ ...emp, feedbacks: [...(emp.feedbacks || []), entry] });
    setFbBody("");
  }

  if (err && !emp) return <p className="text-sm text-red-700">{err}</p>;
  if (!emp) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link href="/admin/employees" className="text-sm font-medium text-muted underline-offset-4 hover:text-accent hover:underline">
          ← Employees
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">{emp.name}</h1>
        <p className="mt-1 text-sm text-muted">{emp.email}</p>
      </div>

      <form className="space-y-8" onSubmit={save}>
        <Card title="Account">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input className="mt-1.5" value={emp.name} onChange={(e) => setEmp({ ...emp, name: e.target.value })} />
            </div>
            <div>
              <Label>Base salary</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                step="0.01"
                value={emp.baseSalary}
                onChange={(e) => setEmp({ ...emp, baseSalary: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="active"
                type="checkbox"
                className="h-4 w-4 rounded border-corp-300"
                checked={emp.isActive}
                onChange={(e) => setEmp({ ...emp, isActive: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm text-ink">
                Active
              </label>
            </div>
          </div>
        </Card>

        <Card title="Responsibilities" description="Visible on the employee dashboard.">
          <div className="space-y-4">
            {(emp.responsibilities || []).map((r, i) => (
              <div key={i} className="rounded-md border border-corp-100 bg-corp-50/30 p-4">
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-muted hover:text-ink" onClick={() => removeResp(i)}>
                    Remove
                  </button>
                </div>
                <Label>Title</Label>
                <Input className="mt-1.5" value={r.title} onChange={(e) => updateResp(i, { title: e.target.value })} />
                <Label>Details</Label>
                <TextArea className="mt-1.5" rows={2} value={r.details} onChange={(e) => updateResp(i, { details: e.target.value })} />
              </div>
            ))}
            <Button variant="outline" type="button" className="text-xs" onClick={addResponsibility}>
              Add responsibility
            </Button>
          </div>
        </Card>

        <Card title="HR remarks" description="Shown to the employee on their dashboard.">
          <TextArea rows={4} value={emp.hrRemarks} onChange={(e) => setEmp({ ...emp, hrRemarks: e.target.value })} />
        </Card>

        <Card title="Performance (monthly scores)" description="0–100 per month — drives the performance chart.">
          <PerformanceLineChart data={emp.performanceMonthly || []} />
          <div className="mt-4 space-y-2">
            {(emp.performanceMonthly || []).map((p, i) => (
              <div key={i} className="flex flex-wrap items-end gap-2">
                <div>
                  <Label>Year</Label>
                  <Input
                    className="mt-1 w-24"
                    type="number"
                    value={p.year}
                    onChange={(e) => updatePerf(i, { year: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Month</Label>
                  <Input
                    className="mt-1 w-20"
                    type="number"
                    min={1}
                    max={12}
                    value={p.month}
                    onChange={(e) => updatePerf(i, { month: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Score</Label>
                  <Input
                    className="mt-1 w-20"
                    type="number"
                    min={0}
                    max={100}
                    value={p.score}
                    onChange={(e) => updatePerf(i, { score: Number(e.target.value) })}
                  />
                </div>
                <Button variant="ghost" type="button" className="text-xs" onClick={() => removePerf(i)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="outline" type="button" className="text-xs" onClick={addPerfRow}>
              Add month
            </Button>
          </div>
        </Card>

        <Card title="Feedback" description="Append entries shown on the employee dashboard.">
          <ul className="mb-4 space-y-3">
            {(emp.feedbacks || []).map((f, i) => (
              <li key={i} className="rounded-md border border-corp-100 px-3 py-2 text-sm">
                <div className="text-xs text-muted">
                  {(f.author || "HR") + " · " + (f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "")}
                </div>
                <p className="mt-1 text-ink">{f.body}</p>
              </li>
            ))}
          </ul>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Author</Label>
              <Input className="mt-1.5" value={fbAuthor} onChange={(e) => setFbAuthor(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Message</Label>
              <TextArea className="mt-1.5" rows={2} value={fbBody} onChange={(e) => setFbBody(e.target.value)} />
            </div>
          </div>
          <Button variant="secondary" type="button" className="mt-3 text-xs" onClick={appendFeedback}>
            Queue feedback (save form to persist)
          </Button>
          <p className="mt-2 text-xs text-muted">
            Clicking the button adds the message to the list below; press <strong>Save profile</strong> to write to the server.
          </p>
        </Card>

        {msg && <p className="text-sm text-success">{msg}</p>}
        {err && <p className="text-sm text-red-700">{err}</p>}

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" type="submit" className="rounded-md px-6">
            Save profile
          </Button>
          <Link
            href="/admin/employees"
            className="inline-flex items-center justify-center rounded-md border border-corp-200 bg-white px-4 py-2 text-sm font-medium text-corp-800 transition duration-200 hover:bg-corp-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
