import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className = "", onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#151B2C] rounded-2xl border border-slate-800/60 p-4 ${
        hover ? "hover:bg-[#1E2538] cursor-pointer transition" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
