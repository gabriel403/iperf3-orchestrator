import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authenticateApiKey, getApiKeyFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

const ResultBodySchema = z.object({
  scheduleId: z.string().optional(),
  startedAt: z.string().transform((v) => new Date(v)),
  finishedAt: z.string().transform((v) => new Date(v)),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  iperfJson: z.any().optional(),
  throughputMbps: z.number().optional(),
  jitterMs: z.number().optional(),
  lossPercent: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate using API key
    const apiKey = getApiKeyFromRequest(req);
    const node = await authenticateApiKey(apiKey);
    
    if (!node) {
      return NextResponse.json(
        { error: "Unauthorized. Provide API key via Authorization: Bearer <key> or X-API-Key header." },
        { status: 401 }
      );
    }

    const json = await req.json();
    const body = ResultBodySchema.parse(json);

    const testRun = await prisma.testRun.create({
      data: {
        nodeId: node.id, // Use authenticated node's ID
        scheduleId: body.scheduleId,
        startedAt: body.startedAt,
        finishedAt: body.finishedAt,
        success: body.success,
        errorMessage: body.errorMessage,
        throughputMbps: body.throughputMbps,
        jitterMs: body.jitterMs,
        lossPercent: body.lossPercent,
        rawJson: body.iperfJson ? JSON.stringify(body.iperfJson) : undefined,
      },
    });

    return NextResponse.json({ id: testRun.id });
  } catch (err: any) {
    console.error("/api/results error", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
