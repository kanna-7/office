"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setSession, type StoredUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const policyText = [
  {
    title: "1. Privacy Policy",
    content:
      "We are committed to protecting the privacy of employees, clients, and users accessing this office portal. We collect information such as employee details, login credentials, contact information, and usage data. Data is used strictly for administrative, operational, and communication purposes. We do not sell personal data to third parties. Data may be shared with authorized internal departments or as required under Indian law. Users have the right to request access, correction, or deletion of their personal data.",
  },
  {
    title: "2. Terms of Use",
    content:
      "By accessing this office portal, you agree to the following: This portal is intended for authorized users only. Users must maintain confidentiality of login credentials. Unauthorized access, misuse, or data theft is strictly prohibited. The company reserves the right to monitor usage for security and compliance. Violations may result in disciplinary action or legal consequences.",
  },
  {
    title: "3. Data Protection & Compliance",
    content:
      "We follow applicable Indian data protection laws and IT regulations. Sensitive information is stored securely with restricted access. Regular audits and monitoring are conducted to ensure compliance.",
  },
  {
    title: "4. Acceptable Use Policy",
    content:
      "Users agree NOT to: Upload or share confidential data outside permitted channels. Use the portal for personal, illegal, or non-work-related activities. Introduce malware, viruses, or harmful content.",
  },
  {
    title: "5. Access & Account Policy",
    content:
      "Accounts are assigned by the organization. Users are responsible for all activities under their accounts. Access may be revoked upon resignation, termination, or policy violation.",
  },
  {
    title: "6. Security Policy",
    content:
      "Strong passwords and periodic updates are required. Multi-factor authentication may be implemented. Any security breach must be reported immediately to IT support.",
  },
  {
    title: "7. Leave & Internal Requests",
    content:
      "Employees may use the portal for leave applications, approvals, and internal requests. All submissions must be accurate and truthful.",
  },
  {
    title: "8. Contact & Support",
    content:
      "For any issues, contact the IT/Admin department via the internal support system.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 1300);
    return () => window.clearTimeout(timer);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!accepted) {
      setError("Please accept the company policies to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await api<{ token: string; user: StoredUser }>("/api/auth/login", {
        method: "POST",
        auth: false,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setSession(res.token, res.user);
      router.replace(res.user.role === "admin" ? "/admin" : "/employee");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-corp-900 text-white overflow-hidden relative">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-corp-300/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-400/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse"></div>
        </div>

        {/* Main content with enhanced animations */}
        <div className="text-center space-y-6 px-4 relative z-10">
          <div className="animate-fade-in-up">
            <div className="text-7xl md:text-8xl font-black tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-white via-corp-200 to-purple-200 drop-shadow-2xl animate-pulse-slow">
              CRM
            </div>
          </div>

          <div className="animate-fade-in-up animation-delay-300">
            <p className="text-lg md:text-xl uppercase text-corp-200 tracking-[0.35em] font-medium animate-slide-up">
              Customer Relationship Management Portal
            </p>
          </div>

          <div className="animate-fade-in-up animation-delay-600 mt-8">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-corp-400 to-transparent mx-auto animate-expand"></div>
          </div>

          <div className="animate-fade-in-up animation-delay-900 mt-6">
            <p className="text-sm text-corp-300 tracking-wide animate-fade-in">
              Loading your workspace...
            </p>
          </div>
        </div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-corp-50 px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-corp-200/20 to-purple-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-200/15 to-corp-300/15 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-corp-100/10 to-purple-100/10 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10 animate-fade-in-up">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-corp-600 via-corp-700 to-purple-600 text-2xl font-black text-white shadow-2xl transform hover:scale-105 transition-transform duration-300 animate-bounce-in">
            CRM
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-corp-900 bg-gradient-to-r from-corp-800 to-purple-700 bg-clip-text text-transparent animate-slide-down">
            Welcome Back
          </h1>
          <p className="mt-3 text-lg text-corp-600 animate-fade-in animation-delay-300">
            Secure access to your employee management portal
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0 ring-1 ring-corp-200/50 animate-scale-in animation-delay-500">
          <div className="space-y-8 p-8 md:p-10">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-corp-900 mb-2">Company Policies</h2>
                <p className="text-corp-600 leading-relaxed">
                  By signing in, you agree to our comprehensive privacy, security, and usage policies designed to protect our organization and your data.
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPolicies(!showPolicies)}
                  className="px-6 py-3 rounded-xl border-2 border-corp-300 hover:border-corp-500 hover:bg-corp-50 transition-all duration-300 transform hover:scale-105"
                >
                  {showPolicies ? "Hide Policies" : "Review Policies"}
                  <span className="ml-2 text-xs">({policyText.length} sections)</span>
                </Button>
              </div>

              {showPolicies && (
                <div className="animate-accordion-down">
                  <div className="space-y-4 rounded-2xl border-2 border-corp-200 bg-gradient-to-br from-slate-50 to-corp-50/30 p-6 text-sm text-corp-700 shadow-inner">
                    {policyText.map((section, index) => (
                      <div
                        key={section.title}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <h3 className="font-bold text-corp-900 mb-3 text-base">{section.title}</h3>
                        <p className="leading-relaxed text-corp-700">{section.content}</p>
                        {index < policyText.length - 1 && <hr className="mt-4 border-corp-200/50" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form className="space-y-6 animate-fade-in animation-delay-700" onSubmit={onSubmit}>
              <div className="space-y-5">
                <div className="group">
                  <Label className="text-corp-700 font-medium">Email Address</Label>
                  <Input
                    className="mt-2 h-12 rounded-xl border-2 border-corp-200 bg-white/50 backdrop-blur-sm focus:border-corp-500 focus:ring-4 focus:ring-corp-500/20 transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02]"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="group">
                  <Label className="text-corp-700 font-medium">Password</Label>
                  <Input
                    className="mt-2 h-12 rounded-xl border-2 border-corp-200 bg-white/50 backdrop-blur-sm focus:border-corp-500 focus:ring-4 focus:ring-corp-500/20 transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02]"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-corp-50 to-purple-50 border border-corp-200/50">
                <input
                  id="policyAccept"
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-2 border-corp-300 text-corp-600 focus:ring-corp-500 focus:ring-offset-0 transition-all duration-200 hover:scale-110"
                />
                <label htmlFor="policyAccept" className="text-sm text-corp-700 leading-relaxed cursor-pointer">
                  <span className="font-medium">I acknowledge and accept</span> the company policies outlined above. I understand the terms of use, privacy policy, and security requirements.
                </label>
              </div>

              {error && (
                <div className="animate-shake">
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-corp-600 to-purple-600 hover:from-corp-700 hover:to-purple-700 text-white font-semibold text-lg shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Continue to Portal"
                )}
              </Button>
            </form>
          </div>
        </Card>

        <p className="mt-8 text-center text-sm text-corp-500 animate-fade-in animation-delay-1000">
          New to the portal?{' '}
          <Link
            href="/setup"
            className="font-semibold text-corp-700 hover:text-purple-600 underline-offset-4 hover:underline transition-colors duration-300"
          >
            Create admin account
          </Link>
        </p>
      </div>
    </div>
  );
}
