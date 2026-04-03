import type { Prisma } from "@/generated/prisma/client";

type JsonValue = Prisma.JsonValue;

/**
 * Strip React flight protocol proxies so Prisma receives plain JSON.
 * Used for all JSON field writes in server actions.
 */
export function plainJson(value: JsonValue | undefined): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
