export function Card({
  title,
  description,
  children,
  action,
  className = "",
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-corp-200/80 bg-white shadow-card ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-corp-100 px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-corp-900 tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-xs text-muted leading-relaxed">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}
