"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

interface ResignationData {
  reason: string;
  lastWorkingDay: string;
  status: string;
  feedback?: string;
  adminComment?: string;
}

export default function ResignationPage() {
  const [resignation, setResignation] = useState<ResignationData | null>(null);
  const [formData, setFormData] = useState({
    reason: '',
    lastWorkingDay: '',
    feedback: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResignation();
  }, []);

  const loadResignation = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/resignations/my');
      setResignation(response);
    } catch (error) {
      // No resignation found, that's ok
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/api/resignations', formData);
      await loadResignation();
      setFormData({ reason: '', lastWorkingDay: '', feedback: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit resignation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Resignation</h1>

      {resignation ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Resignation Request</h2>
          <div className="space-y-2">
            <p><strong>Reason:</strong> {resignation.reason}</p>
            <p><strong>Last Working Day:</strong> {new Date(resignation.lastWorkingDay).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm ${
              resignation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              resignation.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>{resignation.status}</span></p>
            {resignation.feedback && <p><strong>Feedback:</strong> {resignation.feedback}</p>}
            {resignation.adminComment && <p><strong>Admin Comment:</strong> {resignation.adminComment}</p>}
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Submit Resignation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reason for Resignation</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Last Working Day</label>
              <Input
                type="date"
                value={formData.lastWorkingDay}
                onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Feedback about Company (Optional)</label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Resignation'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
