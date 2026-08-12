import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Strips `id`/`kind` off a logged entry — the shape every `add*` store
 * action expects when re-creating one (e.g. for an undo-after-delete). */
export function withoutIdAndKind<T extends { id: string; kind: string }>(
  entry: T
): Omit<T, "id" | "kind"> {
  const clone: Partial<T> = { ...entry };
  delete clone.id;
  delete clone.kind;
  return clone as Omit<T, "id" | "kind">;
}
