import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HBar, VBarChart } from "./Bars";
import { formatDuration } from "@/lib/time";
import type {
  NapLocationStat,
  AppetiteStat,
  TagStat,
  DayCount,
  CorrelationCard,
} from "@/lib/analytics";
import { NAP_LOCATION_LABEL } from "@/lib/timeline";
import { Lightbulb } from "lucide-react";

export function PottyGapCard({ avgMinutes, count }: { avgMinutes: number | null; count: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Time between potty trips</CardTitle>
        <CardDescription>Average gap between consecutive logged trips.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {avgMinutes === null ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">Not enough data logged yet.</p>
        ) : (
          <div>
            <p className="text-[26px] font-semibold leading-none">{formatDuration(avgMinutes)}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Based on {count} gaps between trips — a general pattern, not a rule to hit.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function NapCard({ stats }: { stats: NapLocationStat[] }) {
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Nap duration &amp; location</CardTitle>
        <CardDescription>Average length of completed naps by spot.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {stats.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">No completed naps logged yet.</p>
        ) : (
          stats.map((s) => (
            <HBar
              key={s.location}
              label={NAP_LOCATION_LABEL[s.location]}
              value={`${s.avgMinutes ? formatDuration(s.avgMinutes) : "—"} avg · ${s.count}×`}
              fraction={total ? s.count / total : 0}
              colorClass="bg-forest"
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

const APPETITE_COLOR: Record<string, string> = {
  finished: "bg-forest",
  most: "bg-blue",
  some: "bg-tan",
  refused: "bg-concern",
};

export function AppetiteCard({ stats }: { stats: AppetiteStat[] }) {
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Meal &amp; appetite history</CardTitle>
        <CardDescription>How meals have gone, across all logged meals.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {total === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">No meals logged yet.</p>
        ) : (
          stats.map((s) => (
            <HBar
              key={s.appetite}
              label={s.appetite}
              value={`${s.count}`}
              fraction={total ? s.count / total : 0}
              colorClass={APPETITE_COLOR[s.appetite]}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function AccidentsCard({ total, tags }: { total: number; tags: TagStat[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Accidents &amp; associated tags</CardTitle>
        <CardDescription>Normal for a young puppy — shown here for pattern awareness only.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <p className="text-[26px] font-semibold leading-none">{total}</p>
        <p className="-mt-2 text-[12px] text-muted-foreground">total logged</p>
        {tags.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {tags.slice(0, 5).map((t) => (
              <HBar
                key={t.tag}
                label={t.tag.replace(/-/g, " ")}
                value={`${t.count}`}
                fraction={total ? t.count / total : 0}
                colorClass="bg-tan"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TrainingOverTimeCard({ data }: { data: DayCount[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Training sessions over time</CardTitle>
        <CardDescription>Sessions logged per day, last 14 days.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <VBarChart data={data.map((d) => ({ label: d.day.label, value: d.count }))} colorClass="bg-blue" />
      </CardContent>
    </Card>
  );
}

export function CorrelationCards({ cards }: { cards: CorrelationCard[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>What seems to help</CardTitle>
        <CardDescription>Careful observations from your own logs — not medical claims.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 pt-0">
        {cards.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">
            Not enough patterns yet — keep logging and these will fill in.
          </p>
        ) : (
          cards.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5 rounded-xl bg-blue-soft px-3.5 py-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-soft-foreground/70" />
              <p className="text-[13px] leading-snug text-blue-soft-foreground">{c.text}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
