import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-corp-800 text-white shadow-sm hover:bg-corp-900 active:scale-[0.99] transition duration-200",
  secondary:
    "bg-corp-100 text-corp-800 border border-corp-200 hover:bg-corp-200/80 transition duration-200",
  outline:
    "border border-corp-200 bg-white text-corp-800 hover:bg-corp-50 transition duration-200",
  ghost: "text-corp-600 hover:bg-corp-100/80 transition duration-200",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
