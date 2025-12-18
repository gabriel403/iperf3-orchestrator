import { spawn } from "node:child_process";

export interface IperfRunOptions {
  iperfPath: string;
  targetHost: string;
  targetPort: number;
  durationSeconds: number;
  parallelStreams: number;
}

export interface IperfRunResult {
  success: boolean;
  errorMessage?: string;
  rawJson?: any;
  throughputMbps?: number;
  jitterMs?: number;
  lossPercent?: number;
}

export async function runIperf3(options: IperfRunOptions): Promise<IperfRunResult> {
  const args = [
    "-c",
    options.targetHost,
    "-p",
    String(options.targetPort),
    "-t",
    String(options.durationSeconds),
    "-P",
    String(options.parallelStreams),
    "--json",
  ];

  return new Promise((resolve) => {
    const child = spawn(options.iperfPath, args);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (err) => {
      resolve({ success: false, errorMessage: err.message });
    });

    child.on("close", (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          errorMessage: `iperf3 exited with code ${code}: ${stderr}`,
        });
        return;
      }

      try {
        const json = JSON.parse(stdout);

        const end = json.end?.sum_received ?? json.end?.sum_sent ?? {};
        const bitsPerSecond = end.bits_per_second as number | undefined;
        const throughputMbps = bitsPerSecond ? bitsPerSecond / 1_000_000 : undefined;

        let jitterMs: number | undefined;
        let lossPercent: number | undefined;
        const udp = json.end?.sum ?? json.end?.sum_sent ?? json.end?.sum_received;
        if (udp) {
          jitterMs = typeof udp.jitter_ms === "number" ? udp.jitter_ms : undefined;
          lossPercent = typeof udp.lost_percent === "number" ? udp.lost_percent : undefined;
        }

        resolve({
          success: true,
          rawJson: json,
          throughputMbps,
          jitterMs,
          lossPercent,
        });
      } catch (err: any) {
        resolve({ success: false, errorMessage: `Failed to parse iperf3 JSON: ${err.message}` });
      }
    });
  });
}
