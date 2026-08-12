"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateHeader, isToday } from "@/lib/time";
import { Button } from "@/components/ui/button";

interface DateHeaderProps {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function DateHeader({ date, onPrev, onNext, onToday }: DateHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <p className="text-[22px] font-semibold leading-tight">{formatDateHeader(date)}</p>
        <p className="text-[13px] text-muted-foreground">
          {date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {!isToday(date) && (
          <Button variant="ghost" size="sm" onClick={onToday} className="mr-1">
            Today
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={onPrev} aria-label="Previous day">
          <ChevronLeft className="h-4.5 w-4.5" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNext} aria-label="Next day">
          <ChevronRight className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  );
}
