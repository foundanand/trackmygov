import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const communityNoteRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(10),
        issueId: z.string(),
        createdBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.communityNote.create({
        data: input,
      });
    }),

  getByIssue: publicProcedure
    .input(z.object({ issueId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.communityNote.findMany({
        where: { issueId: input.issueId },
        orderBy: [{ rating: "desc" }, { helpful: "desc" }],
      });
    }),

  rate: publicProcedure
    .input(
      z.object({
        id: z.string(),
        rating: z.enum(["HELPFUL", "PARTIALLY_HELPFUL", "NOT_HELPFUL"]),
        isHelpful: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.communityNote.update({
        where: { id: input.id },
        data: {
          rating: input.rating,
          helpful: input.isHelpful
            ? { increment: 1 }
            : undefined,
          notHelpful: !input.isHelpful
            ? { increment: 1 }
            : undefined,
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string(), createdBy: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db.communityNote.findUnique({
        where: { id: input.id },
      });

      if (note?.createdBy !== input.createdBy) {
        throw new Error("Unauthorized");
      }

      return ctx.db.communityNote.delete({
        where: { id: input.id },
      });
    }),
});
