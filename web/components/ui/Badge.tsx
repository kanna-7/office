export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "info" | "success" | "warning";
}) {
  const tones = {
    neutral: "bg-corp-100 text-corp-700 border-corp-200/80",
    info: "bg-accentsoft text-corp-800 border-corp-200/60",
    success: "bg-corp-100 text-success border-corp-200/80",
    warning: "bg-corp-50 text-corp-700 border-amber-200/60",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
