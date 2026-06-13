import { Prisma } from "@/generated/prisma/client";
import type { ZodError } from "zod";

/**
 * Standard return shape for mutating server actions. Forms check `ok` and
 * surface `error` in a toast instead of a generic "Failed to save".
 */
export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

/** First validation issue, phrased for a toast. */
export function zodErrorMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid input.";
  const field = issue.path.join(".");
  return field ? `${field}: ${issue.message}` : issue.message;
}

/** Translate known Prisma errors into something a user can act on. */
export function dbErrorMessage(e: unknown, what: string): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case "P2002":
        return `Could not ${what}: a record with the same unique value already exists.`;
      case "P2025":
        return `Could not ${what}: the record was not found — it may have been deleted.`;
      case "P2003":
        return `Could not ${what}: a linked record no longer exists.`;
    }
  }
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return `Could not ${what}: the database is unreachable.`;
  }
  return `Could not ${what}: an unexpected error occurred (see server logs).`;
}

/** Run a DB operation, logging the raw error and returning a friendly result. */
export async function runDb<T>(
  what: string,
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error(`[action] Failed to ${what}:`, e);
    return fail(dbErrorMessage(e, what));
  }
}
