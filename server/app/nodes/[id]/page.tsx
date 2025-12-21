import { PrismaClient } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import { DeleteNodeButton } from "./delete-button";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend);

const prisma = new PrismaClient();

async function getNode(id: string | undefined) {
  if (!id) return null;
  return prisma.node.findUnique({ where: { id } });
}

async function getRecentRuns(id: string | undefined) {
  if (!id) return [];
  return prisma.testRun.findMany({
    where: { nodeId: id, success: true },
    orderBy: { startedAt: "asc" },
    take: 200,
  });
}

export default async function NodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const node = await getNode(id);
  if (!node) return notFound();

  // Store node.id in a const to ensure TypeScript knows it's not null
  const nodeId = node.id;
  const runs = await getRecentRuns(nodeId);

  const labels = runs.map((r) => r.startedAt.toISOString());
  const throughput = runs.map((r) => r.throughputMbps ?? null);

  const data = {
    labels,
    datasets: [
      {
        label: "Throughput (Mbps)",
        data: throughput,
        borderColor: "rgb(56, 189, 248)",
        backgroundColor: "rgba(56, 189, 248, 0.2)",
        tension: 0.2,
      },
    ],
  };

  async function deleteNode() {
    "use server";
    await prisma.node.delete({
      where: { id: nodeId },
    });
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-300"
          >
            ← Back to list
          </Link>
        </div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold">{node.name}</h2>
          <DeleteNodeButton nodeName={node.name} deleteNode={deleteNode} />
        </div>
        <p className="text-xs text-slate-400 break-all">ID: {node.id}</p>
        {node.description && <p className="text-sm mt-1 text-slate-300">{node.description}</p>}
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-2">API Key</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-md p-4">
          <p className="text-xs text-slate-400 mb-2">
            Use this API key to authenticate requests. Send it via:
          </p>
          <ul className="text-xs text-slate-300 mb-3 list-disc list-inside space-y-1">
            <li><code className="bg-slate-800 px-1 rounded">Authorization: Bearer {node.secretKey}</code></li>
            <li><code className="bg-slate-800 px-1 rounded">X-API-Key: {node.secretKey}</code></li>
          </ul>
          <div className="bg-slate-800 rounded px-3 py-2 font-mono text-sm break-all select-all">
            {node.secretKey}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Throughput over time</h3>
        {runs.length === 0 ? (
          <p className="text-slate-400 text-sm">No successful test runs recorded yet.</p>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-md p-4">
            <Line
              data={data}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true, labels: { color: "#e5e7eb" } },
                },
                scales: {
                  x: {
                    ticks: { color: "#9ca3af" },
                  },
                  y: {
                    ticks: { color: "#9ca3af" },
                    title: { display: true, text: "Mbps", color: "#9ca3af" },
                  },
                },
              }}
            />
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Recent runs</h3>
        {runs.length === 0 ? (
          <p className="text-slate-400 text-sm">No runs yet.</p>
        ) : (
          <div className="border border-slate-800 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left">Started</th>
                  <th className="px-3 py-2 text-left">Finished</th>
                  <th className="px-3 py-2 text-right">Throughput (Mbps)</th>
                  <th className="px-3 py-2 text-right">Jitter (ms)</th>
                  <th className="px-3 py-2 text-right">Loss (%)</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="odd:bg-slate-900/40">
                    <td className="px-3 py-2 text-xs">
                      {new Date(run.startedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {new Date(run.finishedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {run.throughputMbps?.toFixed(2) ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {run.jitterMs?.toFixed(2) ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {run.lossPercent?.toFixed(2) ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
