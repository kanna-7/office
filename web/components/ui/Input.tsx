import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border border-corp-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-corp-400 transition duration-200 hover:border-corp-300 ${className}`}
      {...props}
    />
  );
}

export function TextArea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-md border border-corp-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-corp-400 transition duration-200 hover:border-corp-300 ${className}`}
      {...props}
    />
  );
}

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-muted tracking-wide">
      {children}
    </label>
  );
}
