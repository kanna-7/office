"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type TodayRes = {
  dateKey: string;
  attendance: {
    checkInAt?: string;
    checkOutAt?: string;
    isLate?: boolean;
    latePenaltyAmount?: number;
  } | null;
  settingsSummary: {
    workdayStartTime: string;
    lateGraceMinutes: number;
    companyTimeZone: string;
  };
};

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

export default function AttendancePage() {
  const [today, setToday] = useState<TodayRes | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setErr(null);
    api<TodayRes>("/api/attendance/today")
      .then(setToday)
      .catch(() => setErr("Could not load attendance"));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function doCheckIn() {
    setMsg(null);
    setErr(null);
    setBusy(true);
    try {
      const pos = await getPosition();
      const { latitude, longitude } = pos.coords;
      await api("/api/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({ latitude, longitude }),
      });
      setMsg("Checked in successfully.");
      refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function doCheckOut() {
    setMsg(null);
    setErr(null);
    setBusy(true);
    try {
      const pos = await getPosition();
      const { latitude, longitude } = pos.coords;
      await api("/api/attendance/check-out", {
        method: "POST",
        body: JSON.stringify({ latitude, longitude }),
      });
      setMsg("Checked out successfully.");
      refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const att = today?.attendance;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Attendance</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Location is validated on the server against office coordinates configured by Admin.
        </p>
      </div>

      <Card title="Today" description={today ? `Calendar key: ${today.dateKey}` : undefined}>
        {!today && <p className="text-sm text-muted">Loading…</p>}
        {today && (
          <div className="space-y-6 text-sm">
            <p className="text-muted">
              Expected start{" "}
              <span className="font-medium text-ink">{today.settingsSummary.workdayStartTime}</span>
              <span className="text-corp-400">
                {" "}
                · grace {today.settingsSummary.lateGraceMinutes} min · {today.settingsSummary.companyTimeZone}
              </span>
            </p>
            {att && (
              <dl className="space-y-3 border-t border-corp-100 pt-4">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Check-in</dt>
                  <dd className="font-medium text-ink">
                    {att.checkInAt ? new Date(att.checkInAt).toLocaleString() : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Check-out</dt>
                  <dd className="font-medium text-ink">
                    {att.checkOutAt ? new Date(att.checkOutAt).toLocaleString() : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Late</dt>
                  <dd className="font-medium text-ink">{att.isLate ? "Yes" : "No"}</dd>
                </div>
              </dl>
            )}
            {msg && <p className="text-sm text-success">{msg}</p>}
            {err && <p className="text-sm text-red-700">{err}</p>}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-stretch">
              <Button
                variant="primary"
                disabled={busy || Boolean(att?.checkInAt)}
                onClick={doCheckIn}
                className="min-h-[48px] flex-1 rounded-md px-6 text-base font-medium shadow-card transition-transform duration-200 hover:-translate-y-0.5"
              >
                Check in
              </Button>
              <Button
                variant="outline"
                disabled={busy || !att?.checkInAt || Boolean(att?.checkOutAt)}
                onClick={doCheckOut}
                className="min-h-[48px] flex-1 rounded-md px-6 text-base font-medium transition-transform duration-200 hover:-translate-y-0.5"
              >
                Check out
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
