"use client";

import { useStore } from "@/lib/store";
import { BottomNav } from "@/components/nav/BottomNav";
import { SideNav } from "@/components/nav/SideNav";
import { ThemeController } from "@/components/theme/ThemeController";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready } = useStore();

  if (!ready) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background text-foreground">
        {/* eslint-disable-next-line @next/next/no-img-element -- small static local asset, next/image is overkill */}
        <img src="/icon.png" alt="" className="h-12 w-12 rounded-2xl object-cover" />
        <p className="text-[13px] text-muted-foreground">Loading Stryder…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <ThemeController />
      <SideNav />
      <div className="flex min-h-dvh flex-1 flex-col">
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-[calc(env(safe-area-inset-top)+1rem)] md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
