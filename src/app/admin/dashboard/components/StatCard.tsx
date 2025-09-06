import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  isOverdue?: boolean;
}

export default function StatCard({ title, value, isOverdue = false }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      <p className={`text-3xl font-bold mt-1 ${isOverdue ? "text-red-500" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}