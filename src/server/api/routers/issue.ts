import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { IssueCategory, IssueStatus } from "@prisma/client";

export const issueRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(10),
        category: z.nativeEnum(IssueCategory),
        latitude: z.number(),
        longitude: z.number(),
        state: z.string(),
        city: z.string(),
        area: z.string().optional(),
        pincode: z.string().optional(),
        imageUrls: z.array(z.string()).optional().default([]),
        createdBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.issue.create({
        data: input,
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.issue.findUnique({
        where: { id: input.id },
        include: {
          communityNotes: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  listByBounds: publicProcedure
    .input(
      z.object({
        northEast: z.object({ lat: z.number(), lng: z.number() }),
        southWest: z.object({ lat: z.number(), lng: z.number() }),
        category: z.nativeEnum(IssueCategory).optional(),
        status: z.nativeEnum(IssueStatus).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.issue.findMany({
        where: {
          latitude: {
            gte: input.southWest.lat,
            lte: input.northEast.lat,
          },
          longitude: {
            gte: input.southWest.lng,
            lte: input.northEast.lng,
          },
          ...(input.category && { category: input.category }),
          ...(input.status && { status: input.status }),
        },
        include: {
          communityNotes: {
            take: 3, // Get first 3 notes
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  listByLocation: publicProcedure
    .input(
      z.object({
        state: z.string().optional(),
        city: z.string().optional(),
        category: z.nativeEnum(IssueCategory).optional(),
        status: z.nativeEnum(IssueStatus).optional(),
        skip: z.number().default(0),
        take: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.issue.findMany({
        where: {
          ...(input.state && { state: input.state }),
          ...(input.city && { city: input.city }),
          ...(input.category && { category: input.category }),
          ...(input.status && { status: input.status }),
        },
        skip: input.skip,
        take: input.take,
        orderBy: { createdAt: "desc" },
        include: {
          communityNotes: true,
        },
      });
    }),

  upvote: publicProcedure
    .input(z.object({ issueId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if already upvoted
      const existing = await ctx.db.issueUpvote.findUnique({
        where: { issueId_userId: { issueId: input.issueId, userId: input.userId } },
      });

      if (existing) {
        // Remove upvote
        await ctx.db.issueUpvote.delete({ where: { id: existing.id } });
        await ctx.db.issue.update({
          where: { id: input.issueId },
          data: { upvotes: { decrement: 1 } },
        });
      } else {
        // Add upvote
        await ctx.db.issueUpvote.create({
          data: input,
        });
        await ctx.db.issue.update({
          where: { id: input.issueId },
          data: { upvotes: { increment: 1 } },
        });
      }

      return ctx.db.issue.findUnique({
        where: { id: input.issueId },
      });
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(IssueStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.issue.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
