"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { PawPrint } from "lucide-react";

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-surface px-3 py-6 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-forest-foreground">
          <PawPrint className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[15px] font-semibold leading-tight">Stryder</p>
          <p className="text-[11.5px] text-muted-foreground leading-tight">Shared puppy log</p>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                  active
                    ? "bg-forest-soft text-forest-soft-foreground"
                    : "text-muted-foreground hover:bg-tan-soft/40 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
