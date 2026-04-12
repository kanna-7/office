export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-corp-200/80">
      <table className="min-w-full divide-y divide-corp-100 text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-corp-800 ${className}`}>{children}</td>;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-corp-100 last:border-0 transition-colors duration-200 hover:bg-corp-50/80">
      {children}
    </tr>
  );
}
