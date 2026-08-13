import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VBarChart } from "./Bars";
import { formatDuration } from "@/lib/time";
import type { PottyGapStat, NapDurationStats, DayCount, CorrelationCard } from "@/lib/analytics";
import { Lightbulb, ShieldCheck } from "lucide-react";

export function PottyGapCard({ pee, poop }: { pee: PottyGapStat; poop: PottyGapStat }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Time between potty trips</CardTitle>
        <CardDescription>
          Average gap between consecutive trips of each type — a &ldquo;pee &amp; poop&rdquo; entry counts
          toward both.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 pt-0">
        <GapStat emoji="🍋" label="Between pees" stat={pee} />
        <GapStat emoji="💩" label="Between poops" stat={poop} />
      </CardContent>
    </Card>
  );
}

function GapStat({ emoji, label, stat }: { emoji: string; label: string; stat: PottyGapStat }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
        <span className="text-[13px] leading-none">{emoji}</span>
        {label}
      </p>
      {stat.avgMinutes === null ? (
        <p className="mt-1.5 text-[12.5px] text-muted-foreground">Not enough data yet.</p>
      ) : (
        <>
          <p className="mt-1 text-[22px] font-semibold leading-none">{formatDuration(stat.avgMinutes)}</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{stat.count} gaps</p>
        </>
      )}
    </div>
  );
}

export function NapCard({ stats }: { stats: NapDurationStats }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Nap duration</CardTitle>
        <CardDescription>
          {stats.count > 0 && stats.avgMinutes !== null
            ? `${stats.count} naps, avg ${formatDuration(stats.avgMinutes)} — `
            : ""}
          overnight sleep (4h+) isn&apos;t counted as a nap here.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {stats.count === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">No completed naps logged yet.</p>
        ) : (
          <VBarChart data={stats.buckets.map((b) => ({ label: b.label, value: b.count }))} colorClass="bg-forest" fullLabel />
        )}
      </CardContent>
    </Card>
  );
}

export function DaysWithoutAccidentCard({ days }: { days: number | null }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Days without accident</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {days === null ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">No accidents logged yet.</p>
        ) : (
          <>
            <p className="text-[26px] font-semibold leading-none">{days}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Full calendar days since the last logged accident.
            </p>
          </>
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
