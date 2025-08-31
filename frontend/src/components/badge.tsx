import {  Tags } from "lucide-react";
import Chip from "./chip";

export default function Badge({ label }: { label?: string }) {
  if (!label) return null;
  const palette: Record<string, string> = {
    Important: "bg-red-100 text-red-800",
    Work: "bg-blue-100 text-blue-800",
    Personal: "bg-emerald-100 text-emerald-800",
    Promotions: "bg-amber-100 text-amber-800",
    Updates: "bg-purple-100 text-purple-800",
  };
  const style = palette[label] || "bg-slate-100 text-slate-800";
  return (
    <Chip className={style}>
      <Tags className="h-3 w-3 mr-1" /> {label}
    </Chip>
  );
}