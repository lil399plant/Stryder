import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { BathroomDayRow } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const DOT_COLOR: Record<string, string> = {
  pee: "bg-blue",
  poop: "bg-tan",
  both: "bg-forest",
  accident: "bg-concern",
};

export function BathroomTimingCard({ rows }: { rows: BathroomDayRow[] }) {
  const hasData = rows.some((r) => r.points.length > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Bathroom timing by day</CardTitle>
        <CardDescription>Each dot is a logged trip, placed by time of day — last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">Not enough data logged yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {rows.map((row) => (
              <div key={row.day.date.toDateString()} className="flex items-center gap-2.5">
                <span className="w-8 shrink-0 text-[11px] text-muted-foreground">{row.day.label}</span>
                <div className="relative h-4 flex-1 rounded-full bg-background">
                  {row.points.map((p, idx) => (
                    <span
                      key={idx}
                      className={cn("absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full", DOT_COLOR[p.type])}
                      style={{ left: `calc(${(p.hour / 24) * 100}% - 5px)` }}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between px-[2.75rem] text-[10px] text-muted-foreground/70">
              <span>12am</span>
              <span>12pm</span>
              <span>12am</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <Legend color="bg-blue" label="Pee" />
              <Legend color="bg-tan" label="Poop" />
              <Legend color="bg-forest" label="Both" />
              <Legend color="bg-concern" label="Accident" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      {label}
    </span>
  );
}
