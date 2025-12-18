import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getApiKeyFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

const PollBodySchema = z.object({
  nodeId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  secretKey: z.string().optional(), // Optional if provided via header
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = PollBodySchema.parse(json);

    // Support API key in header or body (header takes precedence)
    const apiKey = getApiKeyFromRequest(req) || body.secretKey;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required via Authorization: Bearer <key>, X-API-Key header, or secretKey in body" },
        { status: 401 }
      );
    }

    let node = await prisma.node.findFirst({ where: { secretKey: apiKey } });

    if (!node) {
      node = await prisma.node.create({
        data: {
          name: body.name ?? "Unnamed node",
          description: body.description,
          secretKey: body.secretKey,
        },
      });
    }

    node = await prisma.node.update({
      where: { id: node.id },
      data: { lastSeenAt: new Date() },
    });

    const now = new Date();
    const dueSchedules = await prisma.schedule.findMany({
      where: {
        nodeId: node.id,
        enabled: true,
        nextRunAt: { lte: now },
      },
    });

    const schedule = dueSchedules[0] ?? null;

    if (schedule) {
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: now,
          nextRunAt: new Date(now.getTime() + schedule.intervalSeconds * 1000),
        },
      });
    }

    return NextResponse.json({
      nodeId: node.id,
      pollIntervalSeconds: node.pollIntervalSeconds,
      action: schedule
        ? {
            type: "iperf3" as const,
            scheduleId: schedule.id,
            targetHost: schedule.targetHost,
            targetPort: schedule.targetPort,
            durationSeconds: schedule.durationSeconds,
            parallelStreams: schedule.parallelStreams,
          }
        : null,
    });
  } catch (err: any) {
    console.error("/api/poll error", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
