"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { DogFriend } from "@/lib/types";

function FriendCard({ friend }: { friend: DogFriend }) {
  const { updateFriend, deleteFriend } = useStore();
  const [local, setLocal] = useSyncedState(friend);
  // New (still-unnamed) friends open ready to fill in; existing ones start
  // collapsed so a long list doesn't turn into a wall of scrolling.
  const [expanded, setExpanded] = useState(() => !friend.name.trim());

  const set = <K extends keyof DogFriend>(key: K, val: DogFriend[K]) =>
    setLocal((v) => ({ ...v, [key]: val }));
  const commit = <K extends keyof DogFriend>(key: K) => {
    if (local[key] !== friend[key]) updateFriend(friend.id, { [key]: local[key] } as Partial<DogFriend>);
  };

  const subtitle = local.breedAndColor.trim() || local.meetingOccasion.trim();

  return (
    <Card>
      <CardContent className="flex flex-col gap-0 p-0">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center gap-3 p-3.5 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight">
              {local.name.trim() || "New friend"}
            </p>
            {subtitle && <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{subtitle}</p>}
          </div>
          <ChevronDown
            className={cn(
              "h-4.5 w-4.5 shrink-0 text-muted-foreground/60 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>

        {expanded && (
          <div className="flex flex-col gap-3 border-t border-border p-3.5 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input
                  value={local.name}
                  onChange={(e) => set("name", e.target.value)}
                  onBlur={() => commit("name")}
                  placeholder="Friend's name"
                  className="font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Age</Label>
                <Input
                  value={local.age}
                  onChange={(e) => set("age", e.target.value)}
                  onBlur={() => commit("age")}
                  placeholder="e.g. 2 years"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Breed &amp; color</Label>
              <Textarea
                value={local.breedAndColor}
                onChange={(e) => set("breedAndColor", e.target.value)}
                onBlur={() => commit("breedAndColor")}
                rows={2}
                placeholder="e.g. Golden retriever, cream coat"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Personality</Label>
              <Textarea
                value={local.personality}
                onChange={(e) => set("personality", e.target.value)}
                onBlur={() => commit("personality")}
                rows={2}
                placeholder="How they play, energy level, anything to know…"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Occasion of meeting</Label>
              <Input
                value={local.meetingOccasion}
                onChange={(e) => set("meetingOccasion", e.target.value)}
                onBlur={() => commit("meetingOccasion")}
                placeholder="e.g. Riverside Dog Park, morning walk"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label>Owner name</Label>
                <Input
                  value={local.ownerName}
                  onChange={(e) => set("ownerName", e.target.value)}
                  onBlur={() => commit("ownerName")}
                  placeholder="Owner's name"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Owner phone</Label>
                <Input
                  type="tel"
                  value={local.ownerPhone}
                  onChange={(e) => set("ownerPhone", e.target.value)}
                  onBlur={() => commit("ownerPhone")}
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            <button
              onClick={() => deleteFriend(friend.id)}
              aria-label="Delete friend"
              className="flex items-center gap-1.5 self-end rounded-full px-2 py-1.5 text-[12.5px] font-medium text-muted-foreground/60 hover:bg-concern-soft hover:text-concern"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FriendsList() {
  const { data, addFriend } = useStore();
  if (!data) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[13px] leading-snug text-muted-foreground">
        Dogs Stryder has met — so both caregivers can recognize a familiar face and reach the
        owner if needed.
      </p>
      {data.friends.map((friend) => (
        <FriendCard key={friend.id} friend={friend} />
      ))}
      <Button
        variant="outline"
        className="gap-1.5"
        onClick={() =>
          addFriend({
            name: "",
            age: "",
            breedAndColor: "",
            personality: "",
            meetingOccasion: "",
            ownerName: "",
            ownerPhone: "",
          })
        }
      >
        <Plus className="h-4 w-4" />
        Add friend
      </Button>
    </div>
  );
}
