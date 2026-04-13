"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

interface Payslip {
  _id: string;
  month: number;
  year: number;
  basicSalary: number;
  hra: number;
  conveyance: number;
  medical: number;
  lta: number;
  otherAllowances: number;
  deductions: Array<{ name: string; amount: number }>;
  netSalary: number;
  createdAt: string;
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    try {
      const response = await api.get("/payslips/my");
      setPayslips(response.data);
    } catch (error) {
      console.error("Failed to load payslips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await api.get(`/payslips/${id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download payslip");
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
      <h1 className="text-2xl font-bold mb-6">My Payslips</h1>

      <div className="space-y-4">
        {payslips.map((payslip) => (
          <Card key={payslip._id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {getMonthName(payslip.month)} {payslip.year}
                </h3>
                <p className="text-sm text-gray-600">
                  Generated: {new Date(payslip.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button onClick={() => handleDownload(payslip._id)}>
                Download PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Earnings</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <span>₹{payslip.basicSalary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA:</span>
                    <span>₹{payslip.hra.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conveyance:</span>
                    <span>₹{payslip.conveyance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical:</span>
                    <span>₹{payslip.medical.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LTA:</span>
                    <span>₹{payslip.lta.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Allowances:</span>
                    <span>₹{payslip.otherAllowances.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Gross Salary:</span>
                    <span>₹{(payslip.basicSalary + payslip.hra + payslip.conveyance + payslip.medical + payslip.lta + payslip.otherAllowances).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Deductions</h4>
                <div className="space-y-1 text-sm">
                  {payslip.deductions.map((deduction, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{deduction.name}:</span>
                      <span>₹{deduction.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Deductions:</span>
                    <span>₹{payslip.deductions.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-1">
                    <span>Net Salary:</span>
                    <span>₹{payslip.netSalary.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {payslips.length === 0 && (
          <Card className="p-6">
            <p className="text-gray-500 text-center">No payslips available</p>
          </Card>
        )}
      </div>
    </div>
  );
}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-corp-900 sm:text-2xl">Payslips</h1>
        <p className="mt-1 text-sm text-muted">Monthly payroll records. Download PDF or open detail view.</p>
      </div>

      <Card title="Records">
        {rows.length === 0 && <p className="text-sm text-muted">No payroll records yet.</p>}
        <ul className="divide-y divide-corp-100">
          {rows.map((r) => (
            <li
              key={r._id}
              className={`flex flex-col gap-3 py-4 text-sm sm:flex-row sm:items-center sm:justify-between ${
                highlight === r._id ? "rounded-md bg-corp-50/80 -mx-2 px-2" : ""
              }`}
            >
              <div>
                <div className="font-medium text-ink">
                  {r.year}-{String(r.month).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted">
                  Net {r.netSalary.toFixed(2)} · Deductions {r.totalDeductions.toFixed(2)}
                  {r.finalized ? " · Finalized" : " · Draft"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => downloadPdf(r._id).catch(() => alert("PDF download failed"))}
                >
                  PDF
                </Button>
                <a
                  className="inline-flex items-center justify-center rounded-md border border-corp-200 bg-white px-3 py-1.5 text-xs font-medium text-corp-800 transition hover:bg-corp-50"
                  href={`/employee/payslips/${r._id}`}
                >
                  View
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default function PayslipsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <PayslipsInner />
    </Suspense>
  );
}
