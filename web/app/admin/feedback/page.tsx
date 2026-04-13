"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

interface FeedbackAnalytics {
  company: {
    average: number;
    count: number;
    distribution: Record<string, number>;
  };
  exit: {
    average: number;
    count: number;
    distribution: Record<string, number>;
  };
}

export default function AdminFeedbackPage() {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await api.get("/feedback/analytics");
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!analytics) {
    return <div className="p-6">Failed to load analytics</div>;
  }

  const renderRatingDistribution = (distribution: Record<string, number>, total: number) => {
    return [5, 4, 3, 2, 1].map(rating => {
      const count = distribution[rating] || 0;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return (
        <div key={rating} className="flex items-center gap-2">
          <span className="w-8">{rating}★</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="w-8 text-sm">{count}</span>
        </div>
      );
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Feedback Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Company Feedback</h2>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {analytics.company.average.toFixed(1)}★
              </div>
              <div className="text-sm text-gray-600">
                Average Rating ({analytics.company.count} responses)
              </div>
            </div>
            <div className="space-y-2">
              {renderRatingDistribution(analytics.company.distribution, analytics.company.count)}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Exit Feedback</h2>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {analytics.exit.average.toFixed(1)}★
              </div>
              <div className="text-sm text-gray-600">
                Average Rating ({analytics.exit.count} responses)
              </div>
            </div>
            <div className="space-y-2">
              {renderRatingDistribution(analytics.exit.distribution, analytics.exit.count)}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}