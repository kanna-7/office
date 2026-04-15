"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Table, Th, Td, Tr } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

type SOP = {
  _id: string;
  title: string;
  category: string;
  fileName: string;
  fileSize: number;
  uploadedBy?: { name: string };
  createdAt: string;
};

export default function AdminSOPsPage() {
  const [sops, setSOPs] = useState<SOP[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("HR");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api.get<SOP[]>("/api/sops");
      setSOPs(res);
    } catch {
      setError("Could not load SOPs");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("sop", file);
      await api.post("/api/sops/upload", formData, {
        headers: {},
      });
      setShowForm(false);
      setTitle("");
      setFile(null);
      load();
    } catch (err: any) {
      setError(err?.message || "Failed to upload SOP");
    } finally {
      setLoading(false);
    }
  }

  async function onDownload(id: string, fileName: string) {
    try {
      const blob = await api<Blob>(`/api/sops/download/${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || "Download failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this SOP?")) return;
    try {
      await api.delete(`/api/sops/${id}`);
      load();
    } catch (err: any) {
      setError(err?.message || "Failed to delete");
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">SOPs</h1>
          <p className="mt-1 text-sm text-muted">Standard Operating Procedures</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Upload SOP"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      {showForm && (
        <Card title="Upload SOP">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label>Title</Label>
              <Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="SOP title" />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="mt-1.5 w-full rounded-md border border-corp-200 bg-white px-3 py-2 text-sm text-ink"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="HR">HR</option>
                <option value="Technical">Technical</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <Label>File (PDF or Word)</Label>
              <Input className="mt-1.5" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
            </div>
            <Button type="submit" variant="primary" disabled={loading || !file}>
              {loading ? "Uploading…" : "Upload SOP"}
            </Button>
          </form>
        </Card>
      )}

      <Card>
        {sops.length === 0 ? (
          <p className="text-sm text-muted">No SOPs uploaded yet.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>File</Th>
                <Th>Size</Th>
                <Th>Uploaded By</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sops.map((s) => (
                <Tr key={s._id}>
                  <Td className="font-medium">{s.title}</Td>
                  <Td><Badge tone="info">{s.category}</Badge></Td>
                  <Td className="max-w-[120px] truncate">{s.fileName}</Td>
                  <Td>{formatSize(s.fileSize)}</Td>
                  <Td>{s.uploadedBy?.name || "—"}</Td>
                  <Td>{new Date(s.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onDownload(s._id, s.fileName)}>Download</Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(s._id)}>Delete</Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
