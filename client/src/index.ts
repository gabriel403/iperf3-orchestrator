#!/usr/bin/env node

import fetch from "node-fetch";
import { loadConfig } from "./config";
import { enqueueResult, flushQueue } from "./offlineQueue";
import { runIperf3 } from "./iperf";

interface PollResponse {
  nodeId: string;
  pollIntervalSeconds: number;
  action: null | {
    type: "iperf3";
    scheduleId: string;
    targetHost: string;
    targetPort: number;
    durationSeconds: number;
    parallelStreams: number;
  };
}

async function postResult(serverUrl: string, payload: any) {
  const res = await fetch(new URL("/api/results", serverUrl).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to post result: ${res.status} ${res.statusText}`);
  }
}

async function pollOnce(configPath?: string) {
  const config = loadConfig(configPath);

  const pollBody = {
    secretKey: config.secretKey,
    name: config.nodeName,
    description: config.nodeDescription,
  };

  const pollRes = await fetch(new URL("/api/poll", config.serverUrl).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pollBody),
  });

  if (!pollRes.ok) {
    throw new Error(`Poll failed: ${pollRes.status} ${pollRes.statusText}`);
  }

  const pollJson = (await pollRes.json()) as PollResponse;

  const effectivePollInterval = pollJson.pollIntervalSeconds || config.pollIntervalSeconds;

  await flushQueue(async (payload) => {
    await postResult(config.serverUrl, payload);
  });

  if (!pollJson.action) {
    return effectivePollInterval;
  }

  if (pollJson.action.type === "iperf3") {
    const startedAt = new Date();
    const iperfResult = await runIperf3({
      iperfPath: config.iperfPath,
      targetHost: pollJson.action.targetHost,
      targetPort: pollJson.action.targetPort,
      durationSeconds: pollJson.action.durationSeconds,
      parallelStreams: pollJson.action.parallelStreams,
    });
    const finishedAt = new Date();

    const payload = {
      nodeId: pollJson.nodeId,
      scheduleId: pollJson.action.scheduleId,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      success: iperfResult.success,
      errorMessage: iperfResult.errorMessage,
      iperfJson: iperfResult.rawJson,
      throughputMbps: iperfResult.throughputMbps,
      jitterMs: iperfResult.jitterMs,
      lossPercent: iperfResult.lossPercent,
    };

    try {
      await postResult(config.serverUrl, payload);
    } catch (err) {
      console.error("Failed to post result, queuing locally", err);
      enqueueResult(payload);
    }
  }

  return effectivePollInterval;
}

async function main() {
  const configPath = process.argv[2];

  while (true) {
    try {
      const waitSeconds = await pollOnce(configPath);
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
    } catch (err: any) {
      console.error("Poll cycle failed", err.message || err);
      await new Promise((resolve) => setTimeout(resolve, 60_000));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
