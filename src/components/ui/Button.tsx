import type { ReactNode } from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  title?: string;
}

export default function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  const base = "font-bold rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400",
    danger: "bg-red-600 hover:bg-red-500 text-white",
  };
  const sizes: Record<string, string> = {
    sm: "text-[10px] px-2.5 py-1.5",
    md: "text-xs px-4 py-2.5",
    lg: "text-sm px-6 py-3",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
