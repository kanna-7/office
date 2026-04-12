"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OfficeMapEmbed } from "@/components/OfficeMapEmbed";
import { IconMap } from "@/components/icons";

type Settings = {
  officeLatitude: number;
  officeLongitude: number;
  officeRadiusMeters: number;
  workdayStartTime: string;
  lateGraceMinutes: number;
  latePenaltyEnabled: boolean;
  latePenaltyMode: "half_day" | "fixed_amount";
  latePenaltyFixedAmount: number;
  monthlyLeaveAllowanceDays: number;
  extraLeaveDeductionPerDay: number;
  salaryProrationDays: number;
  companyTimeZone: string;
};

export default function AdminSettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Settings>("/api/settings")
      .then(setS)
      .catch(() => setErr("Could not load settings"));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!s) return;
    setMsg(null);
    setErr(null);
    try {
      const updated = await api<Settings>("/api/settings", {
        method: "PUT",
        body: JSON.stringify(s),
      });
      setS(updated);
      setMsg("Settings saved to database.");
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Save failed");
    }
  }

  if (err && !s) return <p className="text-sm text-red-700">{err}</p>;
  if (!s) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">System settings</h1>
        <p className="mt-1 text-sm text-muted">Business rules are stored in MongoDB, not in environment files.</p>
      </div>

      <form className="space-y-8" onSubmit={save}>
        <Card
          title="Office location"
          description="Coordinates define the attendance geofence. Adjust the map by editing latitude and longitude."
          action={<IconMap className="h-5 w-5 text-corp-400" aria-hidden />}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Latitude</Label>
              <Input
                className="mt-1.5"
                type="number"
                step="any"
                value={s.officeLatitude}
                onChange={(e) => setS({ ...s, officeLatitude: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                className="mt-1.5"
                type="number"
                step="any"
                value={s.officeLongitude}
                onChange={(e) => setS({ ...s, officeLongitude: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Radius (meters)</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={1}
                value={s.officeRadiusMeters}
                onChange={(e) => setS({ ...s, officeRadiusMeters: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-5 overflow-hidden rounded-md border border-corp-200 bg-corp-50/50">
            <OfficeMapEmbed latitude={s.officeLatitude} longitude={s.officeLongitude} height={240} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-corp-500">
            Map preview (OpenStreetMap). Radius is enforced server-side when employees check in.
          </p>
        </Card>

        <Card title="Working hours & late policy">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Workday start (HH:mm)</Label>
              <Input className="mt-1.5" value={s.workdayStartTime} onChange={(e) => setS({ ...s, workdayStartTime: e.target.value })} />
            </div>
            <div>
              <Label>Late grace (minutes)</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                value={s.lateGraceMinutes}
                onChange={(e) => setS({ ...s, lateGraceMinutes: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="latePenaltyEnabled"
                type="checkbox"
                className="h-4 w-4 rounded border-corp-300 text-corp-800"
                checked={s.latePenaltyEnabled}
                onChange={(e) => setS({ ...s, latePenaltyEnabled: e.target.checked })}
              />
              <label htmlFor="latePenaltyEnabled" className="text-sm text-ink">
                Enable late penalties
              </label>
            </div>
            <div>
              <Label>Penalty mode</Label>
              <select
                className="mt-1.5 w-full rounded-md border border-corp-200 bg-white px-3 py-2 text-sm text-ink"
                value={s.latePenaltyMode}
                onChange={(e) => setS({ ...s, latePenaltyMode: e.target.value as Settings["latePenaltyMode"] })}
              >
                <option value="half_day">Half-day (from proration days)</option>
                <option value="fixed_amount">Fixed amount per late day</option>
              </select>
            </div>
            <div>
              <Label>Fixed amount (if selected)</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                step="0.01"
                value={s.latePenaltyFixedAmount}
                onChange={(e) => setS({ ...s, latePenaltyFixedAmount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Salary proration days / month</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={1}
                value={s.salaryProrationDays}
                onChange={(e) => setS({ ...s, salaryProrationDays: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Company timezone (IANA)</Label>
              <Input className="mt-1.5" value={s.companyTimeZone} onChange={(e) => setS({ ...s, companyTimeZone: e.target.value })} />
            </div>
          </div>
        </Card>

        <Card title="Leave & payroll linkage">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Paid leave allowance (days / month)</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                step="0.5"
                value={s.monthlyLeaveAllowanceDays}
                onChange={(e) => setS({ ...s, monthlyLeaveAllowanceDays: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Extra leave deduction / day</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                step="0.01"
                value={s.extraLeaveDeductionPerDay}
                onChange={(e) => setS({ ...s, extraLeaveDeductionPerDay: Number(e.target.value) })}
              />
            </div>
          </div>
        </Card>

        {msg && <p className="text-sm text-success">{msg}</p>}
        {err && <p className="text-sm text-red-700">{err}</p>}

        <Button variant="primary" type="submit" className="rounded-md px-6">
          Save all settings
        </Button>
      </form>
    </div>
  );
}
