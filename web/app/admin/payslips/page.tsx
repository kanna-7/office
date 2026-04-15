"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  baseSalary: number;
  role: string;
}

interface Payslip {
  _id: string;
  userId: { name: string; email: string };
  month: number;
  year: number;
  netSalary: number;
  createdAt: string;
}

export default function AdminPayslipsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 0,
    hra: 0,
    conveyance: 0,
    medical: 0,
    lta: 0,
    otherAllowances: 0,
    deductions: [{ name: "", amount: 0 }],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, payslipsRes] = await Promise.all([
        api.get("/users"),
        api.get("/payslips"),
      ]);
      setUsers(usersRes.data.users.filter((u: User) => u.role === "employee"));
      setPayslips(payslipsRes.data.payslips);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setSelectedUser(userId);
      setFormData(prev => ({
        ...prev,
        basicSalary: user.baseSalary,
      }));
    }
  };

  const addDeduction = () => {
    setFormData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { name: "", amount: 0 }],
    }));
  };

  const updateDeduction = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.map((ded, i) =>
        i === index ? { ...ded, [field]: value } : ded
      ),
    }));
  };

  const removeDeduction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index),
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const grossSalary = formData.basicSalary + formData.hra + formData.conveyance +
                       formData.medical + formData.lta + formData.otherAllowances;
    const totalDeductions = formData.deductions.reduce((sum, d) => sum + d.amount, 0);
    const netSalary = grossSalary - totalDeductions;

    try {
      setGenerating(true);
      await api.post("/payslips/generate", {
        userId: selectedUser,
        month: formData.month,
        year: formData.year,
        basicSalary: formData.basicSalary,
        hra: formData.hra,
        conveyance: formData.conveyance,
        medical: formData.medical,
        lta: formData.lta,
        otherAllowances: formData.otherAllowances,
        deductions: formData.deductions.filter(d => d.name && d.amount > 0),
        netSalary,
      });

      await loadData();
      alert("Payslip generated successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to generate payslip");
    } finally {
      setGenerating(false);
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1, 1).toLocaleString("default", { month: "long" });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payslip Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generate Payslip</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee</label>
              <select
                value={selectedUser}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select employee</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email}) - ₹{user.baseSalary}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  min="2020"
                  max="2030"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Earnings</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Basic Salary"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="HRA"
                  value={formData.hra}
                  onChange={(e) => setFormData({ ...formData, hra: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Conveyance"
                  value={formData.conveyance}
                  onChange={(e) => setFormData({ ...formData, conveyance: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Medical"
                  value={formData.medical}
                  onChange={(e) => setFormData({ ...formData, medical: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="LTA"
                  value={formData.lta}
                  onChange={(e) => setFormData({ ...formData, lta: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Other Allowances"
                  value={formData.otherAllowances}
                  onChange={(e) => setFormData({ ...formData, otherAllowances: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Deductions</h3>
                <Button type="button" onClick={addDeduction} variant="outline" size="sm">
                  Add Deduction
                </Button>
              </div>
              {formData.deductions.map((deduction, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Deduction name"
                    value={deduction.name}
                    onChange={(e) => updateDeduction(index, "name", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={deduction.amount}
                    onChange={(e) => updateDeduction(index, "amount", parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                  {formData.deductions.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeDeduction(index)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button type="submit" disabled={generating}>
              {generating ? "Generating..." : "Generate Payslip"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Payslips</h2>
          <div className="space-y-3">
            {payslips.slice(0, 10).map((payslip) => (
              <div key={payslip._id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{payslip.userId.name}</p>
                  <p className="text-sm text-gray-600">
                    {getMonthName(payslip.month)} {payslip.year}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{payslip.netSalary.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(payslip.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {payslips.length === 0 && (
              <p className="text-gray-500 text-center py-4">No payslips generated yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}