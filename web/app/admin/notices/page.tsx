"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, TextArea, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

type Notice = {
  _id: string;
  title: string;
  description: string;
  date: string;
  isImportant: boolean;
  createdBy?: { name: string };
  createdAt: string;
};

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isImportant, setIsImportant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api.get<Notice[]>("/api/notices");
      setNotices(res);
    } catch {
      setError("Could not load notices");
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
      await api.post("/api/notices", { title, description, date, isImportant });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setIsImportant(false);
      load();
    } catch (err: any) {
      setError(err?.message || "Failed to create notice");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this notice?")) return;
    try {
      await api.delete(`/api/notices/${id}`);
      load();
    } catch (err: any) {
      setError(err?.message || "Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Notices</h1>
          <p className="mt-1 text-sm text-muted">Create and manage company-wide notices</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Notice"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      {showForm && (
        <Card title="Create Notice">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label>Title</Label>
              <Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Notice title" />
            </div>
            <div>
              <Label>Description</Label>
              <TextArea className="mt-1.5" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Notice content" />
            </div>
            <div>
              <Label>Date</Label>
              <Input className="mt-1.5" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isImportant" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} className="h-4 w-4 rounded border-corp-300" />
              <label htmlFor="isImportant" className="text-sm text-corp-700">Mark as important</label>
            </div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating…" : "Create Notice"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {notices.length === 0 ? (
          <Card><p className="text-sm text-muted">No notices yet.</p></Card>
        ) : (
          notices.map((n) => (
            <Card key={n._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-corp-900">{n.title}</h3>
                    {n.isImportant && <Badge tone="warning">Important</Badge>}
                  </div>
                  <p className="mt-2 text-sm text-corp-700 leading-relaxed whitespace-pre-wrap">{n.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                    <span>{new Date(n.date).toLocaleDateString()}</span>
                    {n.createdBy && <span>by {n.createdBy.name}</span>}
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => onDelete(n._id)}>Delete</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
