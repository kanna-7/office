"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type EventItem = {
  _id: string;
  title: string;
  description: string;
  date: string;
  type: string;
};

function formatMonthName(date: Date) {
  return date.toLocaleDateString("default", { month: "long", year: "numeric" });
}

function getCalendarDays(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [];
  const startDay = start.getDay();
  for (let i = 0; i < startDay; i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= end.getDate(); day += 1) {
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  }
  return days;
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Extract YYYY-MM-DD from a UTC ISO string (avoids timezone shift) */
function utcDateKey(isoString: string) {
  return isoString.slice(0, 10);
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [form, setForm] = useState({ title: "", date: "", type: "meeting", description: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api<EventItem[]>('/api/events');
      setEvents(response);
    } catch (error) {
      console.error('Could not load events', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    try {
      setSubmitting(true);
      await api('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ title: '', date: '', type: 'meeting', description: '' });
      await loadEvents();
    } catch (error) {
      console.error('Could not create event', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api(`/api/events/${id}`, { method: 'DELETE' });
      await loadEvents();
    } catch (error) {
      console.error('Could not delete event', error);
    }
  };

  const monthEvents = useMemo(() => {
    const cm = currentMonth.getFullYear();
    const mm = currentMonth.getMonth() + 1;
    return events.filter((event) => {
      const key = utcDateKey(event.date);
      const [year, month] = key.split("-").map(Number);
      return year === cm && month === mm;
    });
  }, [events, currentMonth]);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Calendar</h1>
          <p className="text-sm text-muted">Manage holidays, meetings, and important dates.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
            Previous
          </Button>
          <Button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
            Next
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{formatMonthName(currentMonth)}</h2>
              <p className="text-sm text-muted">Click days to review event counts.</p>
            </div>
            <span className="rounded-full bg-corp-100 px-3 py-1 text-sm text-corp-800">{monthEvents.length} events</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-corp-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="font-semibold">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 mt-2">
            {calendarDays.map((day, index) => {
              const dateString = day ? localDateKey(day) : "";
              const count = day ? monthEvents.filter((event) => utcDateKey(event.date) === dateString).length : 0;
              return (
                <div
                  key={`${index}-${dateString}`}
                  className={`min-h-[80px] rounded-xl border p-2 text-left text-sm ${
                    day ? 'bg-white' : 'bg-corp-100/60'
                  }`}
                >
                  {day && (
                    <>
                      <div className="mb-2 font-semibold">{day.getDate()}</div>
                      {count > 0 && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-corp-100 px-2 py-1 text-[11px] font-medium text-corp-800">
                          {count} event{count > 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create a Calendar Event</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="holiday">Holiday</option>
                <option value="meeting">Meeting</option>
                <option value="important">Important</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Event'}</Button>
          </form>

          <div className="mt-8">
            <h3 className="text-base font-semibold mb-3">Upcoming Events</h3>
            <div className="space-y-3">
              {monthEvents.map((event) => (
                <div key={event._id} className="rounded-xl border bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-xs text-corp-500">{utcDateKey(event.date)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(event._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-corp-600">{event.description}</p>
                </div>
              ))}
              {!monthEvents.length && <p className="text-sm text-corp-500">No events for this month.</p>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
