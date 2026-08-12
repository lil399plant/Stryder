import { DAY_HEIGHT, HOUR_HEIGHT } from "@/lib/calendar-grid";

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function HourLabels() {
  return (
    <div className="relative w-12 shrink-0 sm:w-14" style={{ height: DAY_HEIGHT }}>
      {Array.from({ length: 24 }, (_, h) => (
        <div
          key={h}
          className="absolute right-2 -translate-y-1/2 text-[10.5px] text-muted-foreground"
          style={{ top: h * HOUR_HEIGHT }}
        >
          {formatHour(h)}
        </div>
      ))}
    </div>
  );
}
