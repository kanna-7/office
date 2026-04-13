"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

interface Document {
  _id: string;
  type: string;
  fileName: string;
  verified: boolean;
  createdAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await api.get("/documents/my");
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      setUploading(true);
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadDocuments();
      setSelectedType("");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const response = await api.get(`/documents/download/${id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download document");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await api.delete(`/documents/${id}`);
      await loadDocuments();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete document");
    }
  };

  const documentTypes = [
    { value: "10th_marksheet", label: "10th Marksheet" },
    { value: "12th_marksheet", label: "12th Marksheet" },
    { value: "certificate", label: "Certificate" },
  ];

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find(dt => dt.value === type)?.label || type;
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Document Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <select
                name="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select type</option>
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">File</label>
              <input
                type="file"
                name="document"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">My Documents</h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{getDocumentTypeLabel(doc.type)}</p>
                  <p className="text-sm text-gray-600">{doc.fileName}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    doc.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {doc.verified ? "Verified" : "Pending"}
                  </span>
                  <Button
                    onClick={() => handleDownload(doc._id, doc.fileName)}
                    variant="outline"
                    size="sm"
                  >
                    Download
                  </Button>
                  {!doc.verified && (
                    <Button
                      onClick={() => handleDelete(doc._id)}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No documents uploaded yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}