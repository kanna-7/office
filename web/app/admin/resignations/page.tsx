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
}

export default function AdminResignationsPage() {
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResignation, setSelectedResignation] = useState<Resignation | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadResignations();
  }, []);

  const loadResignations = async () => {
    try {
      const response = await api.get("/resignations");
      setResignations(response.data.resignations);
    } catch (error) {
      console.error("Failed to load resignations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setActionLoading(true);
      await api.patch(`/resignations/${id}/status`, {
        status,
        adminComment: adminComment.trim(),
      });
      await loadResignations();
      setSelectedResignation(null);
      setAdminComment("");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Resignation Management</h1>

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

            <div className="space-y-2 mb-4">
              <p><strong>Reason:</strong> {resignation.reason}</p>
              <p><strong>Last Working Day:</strong> {new Date(resignation.lastWorkingDay).toLocaleDateString()}</p>
              {resignation.feedback && <p><strong>Feedback:</strong> {resignation.feedback}</p>}
              {resignation.adminComment && <p><strong>Admin Comment:</strong> {resignation.adminComment}</p>}
            </div>

            {resignation.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedResignation(resignation)}
                  variant="outline"
                >
                  Review
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

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