"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Table, Th, Tr, Td } from "@/components/ui/Table";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Emp = {
  id: string;
  email: string;
  name: string;
  baseSalary: number;
  isActive: boolean;
  responsibilityCount?: number;
};

export default function AdminEmployeesPage() {
  const [rows, setRows] = useState<Emp[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [baseSalary, setBaseSalary] = useState("0");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function load() {
    api<Emp[]>("/api/users").then(setRows);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    try {
      await api("/api/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name,
          baseSalary: Number(baseSalary),
        }),
      });
      setMsg("Employee created.");
      setEmail("");
      setPassword("");
      setName("");
      setBaseSalary("0");
      load();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Employees</h1>
        <p className="mt-1 text-sm text-muted">Create accounts, set base salary, and manage HR profile from each row.</p>
      </div>

      <Card title="Create employee">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={create}>
          <div className="md:col-span-2">
            <Label>Name</Label>
            <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Temporary password</Label>
            <Input className="mt-1.5" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <Label>Base salary</Label>
            <Input className="mt-1.5" type="number" min={0} step="0.01" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            {msg && <p className="text-sm text-success">{msg}</p>}
            {err && <p className="text-sm text-red-700">{err}</p>}
            <Button variant="primary" type="submit" className="rounded-md">
              Create
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Directory" description="Hover rows for quick scan. Open profile for responsibilities & performance.">
        <Table>
          <thead>
            <tr className="border-b border-corp-100">
              <Th>Name</Th>
              <Th>Email</Th>
              <Th className="text-right">Base salary</Th>
              <Th>Status</Th>
              <Th className="text-right">Profile</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r.id}>
                <Td className="font-medium text-ink">{r.name}</Td>
                <Td className="text-muted">{r.email}</Td>
                <Td className="text-right tabular-nums">{r.baseSalary.toFixed(2)}</Td>
                <Td>{r.isActive ? "Active" : "Disabled"}</Td>
                <Td className="text-right">
                  <Link
                    href={`/admin/employees/${r.id}`}
                    className="text-sm font-medium text-corp-800 underline-offset-4 transition hover:text-accent hover:underline"
                  >
                    Edit
                  </Link>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
