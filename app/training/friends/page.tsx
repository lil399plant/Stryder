"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FriendsList } from "@/components/training/FriendsList";

export default function FriendsPage() {
  return (
    <div>
      <Link
        href="/training"
        className="mb-3 flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Training
      </Link>
      <h1 className="text-[22px] font-semibold leading-tight">Friends</h1>
      <p className="mb-4 mt-1 text-[13px] text-muted-foreground">
        Dogs Stryder has met, with owner contact info for next time.
      </p>
      <FriendsList />
    </div>
  );
}
