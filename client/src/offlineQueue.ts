import fs from "node:fs";
import path from "node:path";

const QUEUE_FILE = path.join(process.cwd(), "iperf-agent.queue.json");

export interface QueuedResult {
  id: string;
  payload: any;
}

function readQueue(): QueuedResult[] {
  try {
    const raw = fs.readFileSync(QUEUE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeQueueAtomic(items: QueuedResult[]) {
  const tmp = `${QUEUE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2), "utf8");
  fs.renameSync(tmp, QUEUE_FILE);
}

export function enqueueResult(payload: any) {
  const items = readQueue();
  items.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, payload });
  writeQueueAtomic(items);
}

export async function flushQueue(
  send: (payload: any) => Promise<void>,
): Promise<void> {
  const items = readQueue();
  if (items.length === 0) return;

  const remaining: QueuedResult[] = [];
  for (const item of items) {
    try {
      await send(item.payload);
    } catch (err) {
      remaining.push(item);
      remaining.push(...items.slice(items.indexOf(item) + 1));
      break;
    }
  }

  writeQueueAtomic(remaining);
}
