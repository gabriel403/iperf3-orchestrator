import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const ConfigSchema = z.object({
  serverUrl: z.string().url(),
  secretKey: z.string(),
  nodeName: z.string().default("Unnamed node"),
  nodeDescription: z.string().optional(),
  pollIntervalSeconds: z.number().int().positive().default(300),
  iperfPath: z.string().default("iperf3"),
});

export type AgentConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(configPath?: string): AgentConfig {
  const resolved = configPath
    ? path.resolve(configPath)
    : path.join(process.cwd(), "iperf-agent.config.json");

  if (!fs.existsSync(resolved)) {
    throw new Error(
      `Config file not found at ${resolved}. Create iperf-agent.config.json with serverUrl and secretKey.`,
    );
  }

  const raw = fs.readFileSync(resolved, "utf8");
  const json = JSON.parse(raw);

  if (process.env.IPERF_AGENT_SERVER_URL) {
    json.serverUrl = process.env.IPERF_AGENT_SERVER_URL;
  }
  if (process.env.IPERF_AGENT_SECRET_KEY) {
    json.secretKey = process.env.IPERF_AGENT_SECRET_KEY;
  }

  return ConfigSchema.parse(json);
}
