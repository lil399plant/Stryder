import { cn } from "@/lib/utils";

export function HBar({
  label,
  value,
  fraction,
  colorClass = "bg-forest",
}: {
  label: string;
  value: string;
  fraction: number;
  colorClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="font-medium">{label.charAt(0).toUpperCase() + label.slice(1)}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-background">
        <div
          className={cn("h-full rounded-full", colorClass)}
          style={{ width: `${Math.max(4, Math.min(100, fraction * 100))}%` }}
        />
      </div>
    </div>
  );
}

export function VBarChart({
  data,
  colorClass = "bg-forest",
}: {
  data: { label: string; value: number }[];
  colorClass?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5" style={{ height: 72 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end">
            <div
              className={cn("w-full rounded-t-md", d.value > 0 ? colorClass : "bg-background")}
              style={{ height: `${Math.max(d.value > 0 ? 8 : 2, (d.value / max) * 100)}%` }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-[9.5px] text-muted-foreground">{d.label[0]}</span>
        </div>
      ))}
    </div>
  );
}
