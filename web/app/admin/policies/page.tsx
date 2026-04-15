"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, TextArea, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

type Policy = {
  _id: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("1.0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api.get<Policy[]>("/api/policies");
      setPolicies(res);
    } catch {
      setError("Could not load policies");
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
      await api.post("/api/policies", { title, content, version });
      setShowForm(false);
      setTitle("");
      setContent("");
      setVersion("1.0");
      load();
    } catch (err: any) {
      setError(err?.message || "Failed to create policy");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Policies</h1>
          <p className="mt-1 text-sm text-muted">Company policies for employee acknowledgement</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Policy"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      {showForm && (
        <Card title="Create Policy">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label>Title</Label>
              <Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Policy title" />
            </div>
            <div>
              <Label>Content</Label>
              <TextArea className="mt-1.5" rows={6} value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Full policy text (minimum 10 characters)" />
            </div>
            <div>
              <Label>Version</Label>
              <Input className="mt-1.5" value={version} onChange={(e) => setVersion(e.target.value)} required placeholder="e.g. 1.0" />
            </div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating…" : "Create Policy"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {policies.length === 0 ? (
          <Card><p className="text-sm text-muted">No policies created yet.</p></Card>
        ) : (
          policies.map((p) => (
            <Card key={p._id}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-corp-900">{p.title}</h3>
                  <Badge tone={p.isActive ? "success" : "neutral"}>{p.isActive ? "Active" : "Inactive"}</Badge>
                  <span className="text-xs text-muted">v{p.version}</span>
                </div>
                <p className="text-sm text-corp-700 leading-relaxed whitespace-pre-wrap">{p.content}</p>
                <p className="text-xs text-muted">Created {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
