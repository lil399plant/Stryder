import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { BathroomPoint } from "@/lib/analytics";

// A one-dimensional strip plot / dot histogram: every logged pee, poop, and
// accident, positioned only by time-of-day (0–24h) — no date axis. Points
// that land in the same hour stack vertically, so dense hours read as tall
// columns, exactly like a histogram, while still showing each individual
// entry as its own mark rather than collapsing to a bare count.

const EMOJI: Record<BathroomPoint["type"], string> = {
  pee: "🍋",
  poop: "💩",
  accident: "❌",
};

const HOURS = 24;
const ROW_HEIGHT = 22;

export function BathroomTimingCard({ points }: { points: BathroomPoint[] }) {
  const hasData = points.length > 0;

  const bins: BathroomPoint[][] = Array.from({ length: HOURS }, () => []);
  for (const p of points) {
    const idx = Math.min(HOURS - 1, Math.max(0, Math.floor(p.hour)));
    bins[idx].push(p);
  }
  const maxStack = Math.max(1, ...bins.map((b) => b.length));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Bathroom timing</CardTitle>
        <CardDescription>
          Every logged pee, poop, and accident, by time of day — across everything logged so far.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">Not enough data logged yet.</p>
        ) : (
          <>
            <div
              className="flex items-end gap-px overflow-hidden rounded-xl bg-background px-1 pt-1"
              style={{ height: Math.min(260, Math.max(64, maxStack * ROW_HEIGHT + 8)) }}
            >
              {bins.map((bin, hour) => (
                <div key={hour} className="flex min-w-0 flex-1 flex-col-reverse items-center justify-start gap-px pb-1">
                  {bin.map((p, i) => (
                    <span key={i} className="text-[11px] leading-none" style={{ lineHeight: `${ROW_HEIGHT}px` }}>
                      {EMOJI[p.type]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-muted-foreground/70">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>12am</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <Legend emoji="🍋" label="Pee" />
              <Legend emoji="💩" label="Poop" />
              <Legend emoji="❌" label="Accident" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Legend({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-[12px] leading-none">{emoji}</span>
      {label}
    </span>
  );
}
