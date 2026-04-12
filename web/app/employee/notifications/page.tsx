"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type N = {
  _id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const [rows, setRows] = useState<N[]>([]);

  function load() {
    api<N[]>("/api/notifications/").then(setRows);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    await api(`/api/notifications/${id}/read`, { method: "PATCH" });
    load();
  }

  async function markAll() {
    await api("/api/notifications/read-all", { method: "POST" });
    load();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted">Leave decisions and system messages.</p>
        </div>
        <Button variant="outline" className="shrink-0 text-xs" onClick={markAll}>
          Mark all read
        </Button>
      </div>

      <Card title="Inbox">
        {rows.length === 0 && <p className="text-sm text-muted">No notifications.</p>}
        <ul className="divide-y divide-corp-100">
          {rows.map((n) => (
            <li key={n._id} className="py-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-ink">{n.title}</div>
                  {n.body && <p className="mt-1 leading-relaxed text-muted">{n.body}</p>}
                  <p className="mt-2 text-[11px] text-corp-400">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.readAt && (
                  <Button variant="ghost" className="shrink-0 text-xs" onClick={() => markRead(n._id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
