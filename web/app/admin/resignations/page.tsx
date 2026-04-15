"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

interface Resignation {
  _id: string;
  userId: { name: string; email: string };
  reason: string;
  lastWorkingDay: string;
  feedback: string;
  status: string;
  adminComment: string;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: { name: string };
}

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminResignationsPage() {
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedResignation, setSelectedResignation] = useState<Resignation | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadResignations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadResignations = async () => {
    try {
      setLoading(true);
      const query = filter ? `?status=${encodeURIComponent(filter)}` : "";
      const response = await api.get(`/api/resignations${query}`);
      setResignations(response.resignations);
    } catch (error) {
      console.error("Failed to load resignations:", error);
      setResignations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setActionLoading(true);
      await api.patch(`/api/resignations/${id}/status`, {
        status,
        adminComment: adminComment.trim(),
      });
      await loadResignations();
      setSelectedResignation(null);
      setAdminComment("");
    } catch (error: any) {
      alert(error.response?.message || error.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const openReviewModal = (resignation: Resignation) => {
    setSelectedResignation(resignation);
    setAdminComment(resignation.adminComment || "");
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resignation Management</h1>
          <p className="text-sm text-gray-600 mt-1">Review resignation requests and update approval status.</p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Filter:
          </label>
          <select
            id="status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {resignations.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-gray-600">No resignation requests found for the selected filter.</p>
        </Card>
      ) : (
        <div className="space-y-4">
        {resignations.map((resignation) => (
          <Card key={resignation._id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{resignation.userId.name}</h3>
                <p className="text-gray-600">{resignation.userId.email}</p>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(resignation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                resignation.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                resignation.status === "approved" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>
                {resignation.status}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mb-4 text-sm text-gray-700">
              <div>
                <p className="font-medium">Last Working Day</p>
                <p>{new Date(resignation.lastWorkingDay).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium">Reason</p>
                <p>{resignation.reason}</p>
              </div>
            </div>

            {resignation.feedback && (
              <p className="mb-2 text-sm">
                <strong>Feedback:</strong> {resignation.feedback}
              </p>
            )}
            {resignation.adminComment && (
              <p className="mb-2 text-sm">
                <strong>Admin Comment:</strong> {resignation.adminComment}
              </p>
            )}
            {resignation.decidedBy?.name && resignation.decidedAt && (
              <p className="mb-2 text-sm text-gray-500">
                Decided by {resignation.decidedBy.name} on {new Date(resignation.decidedAt).toLocaleDateString()}
              </p>
            )}

            {resignation.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => openReviewModal(resignation)}
                  variant="outline"
                >
                  Review
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      )}

      {selectedResignation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Review Resignation</h2>
            <p className="mb-4">Review the resignation request from {selectedResignation.userId.name}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Admin Comment (Optional)</label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Add a comment..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleStatusUpdate(selectedResignation._id, "approved")}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleStatusUpdate(selectedResignation._id, "rejected")}
                disabled={actionLoading}
                variant="destructive"
              >
                Reject
              </Button>
              <Button
                onClick={() => setSelectedResignation(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}