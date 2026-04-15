"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

interface Document {
  _id: string;
  userId: { name: string; email: string };
  type: string;
  fileName: string;
  verified: boolean;
  createdAt: string;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: "",
    type: "",
    verified: "",
  });

  useEffect(() => {
    loadDocuments();
  }, [filters]);

  const loadDocuments = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get<any>(`/api/documents?${params}`);
      // Backend returns { documents: [...], pagination: {...} }
      setDocuments(response.documents || []);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.patch(`/api/documents/${id}/verify`);
      await loadDocuments();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to verify document");
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const blob = await api.get<Blob>(`/api/documents/download/${id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(blob);
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

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by employee email..."
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Types</option>
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={filters.verified}
            onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Pending</option>
          </select>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc._id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">{doc.userId.name} ({doc.userId.email})</p>
                <p className="text-sm text-gray-600">{getDocumentTypeLabel(doc.type)} - {doc.fileName}</p>
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
                    onClick={() => handleVerify(doc._id)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Verify
                  </Button>
                )}
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <p className="text-gray-500 text-center py-4">No documents found</p>
          )}
        </div>
      </Card>
    </div>
  );
}