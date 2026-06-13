import { revalidatePath } from "next/cache";
import type { z } from "zod";
import {
  type ActionResult,
  fail,
  runDb,
  zodErrorMessage,
} from "@/lib/action-result";

/** The subset of a Prisma model delegate the factory needs for the
 *  soft-delete lifecycle. */
interface SoftDeleteDelegate {
  update(args: {
    where: { id: string };
    data: { deletedAt: Date | null };
  }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
}

interface EntityActionsConfig<
  TCreateSchema extends z.ZodType,
  TUpdateSchema extends z.ZodType,
  TEntity,
> {
  /** Human label used in error messages, e.g. "NPC". */
  label: string;
  /** Route base used for revalidation, e.g. "/npcs". */
  basePath: string;
  delegate: SoftDeleteDelegate;
  createSchema: TCreateSchema;
  updateSchema: TUpdateSchema;
  /** Entity-specific create query (field mapping, junction creates, plainJson). */
  performCreate: (data: z.output<TCreateSchema>) => Promise<TEntity>;
  /** Entity-specific update query. */
  performUpdate: (id: string, data: z.output<TUpdateSchema>) => Promise<TEntity>;
}

/**
 * Builds the shared mutation lifecycle for an entity: Zod validation,
 * friendly error results, revalidation, and soft delete/restore/purge.
 * Reads stay bespoke in each entity's action file.
 */
export function createEntityActions<
  TCreateSchema extends z.ZodType,
  TUpdateSchema extends z.ZodType,
  TEntity,
>(config: EntityActionsConfig<TCreateSchema, TUpdateSchema, TEntity>) {
  const { label, basePath, delegate } = config;

  async function create(
    input: z.input<TCreateSchema>
  ): Promise<ActionResult<TEntity>> {
    const parsed = config.createSchema.safeParse(input);
    if (!parsed.success) return fail(zodErrorMessage(parsed.error));

    const result = await runDb(`save the ${label}`, () =>
      config.performCreate(parsed.data)
    );
    if (result.ok) revalidatePath(basePath);
    return result;
  }

  async function update(
    id: string,
    input: z.input<TUpdateSchema>
  ): Promise<ActionResult<TEntity>> {
    const parsed = config.updateSchema.safeParse(input);
    if (!parsed.success) return fail(zodErrorMessage(parsed.error));

    const result = await runDb(`save the ${label}`, () =>
      config.performUpdate(id, parsed.data)
    );
    if (result.ok) {
      revalidatePath(basePath);
      revalidatePath(`${basePath}/${id}`);
    }
    return result;
  }

  async function softDelete(id: string): Promise<ActionResult<null>> {
    const result = await runDb(`delete the ${label}`, async () => {
      await delegate.update({ where: { id }, data: { deletedAt: new Date() } });
      return null;
    });
    if (result.ok) {
      revalidatePath(basePath);
      revalidatePath(`${basePath}/${id}`);
    }
    return result;
  }

  async function restore(id: string): Promise<ActionResult<null>> {
    const result = await runDb(`restore the ${label}`, async () => {
      await delegate.update({ where: { id }, data: { deletedAt: null } });
      return null;
    });
    if (result.ok) revalidatePath(basePath);
    return result;
  }

  async function purge(id: string): Promise<ActionResult<null>> {
    return runDb(`permanently delete the ${label}`, async () => {
      await delegate.delete({ where: { id } });
      return null;
    });
  }

  return { create, update, softDelete, restore, purge };
}
