import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getNodes() {
  return prisma.node.findMany({
    orderBy: { createdAt: "asc" }
  });
}

export default async function HomePage() {
  const nodes = await getNodes();

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Nodes</h2>
          <Link
            href="/nodes/new"
            className="text-sm text-sky-400 hover:text-sky-300 underline"
          >
            New node
          </Link>
        </div>
        {nodes.length === 0 ? (
          <div className="border border-slate-800 rounded-lg bg-slate-900/50 p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-4xl mb-2">📡</div>
              <h3 className="text-lg font-semibold text-slate-200">No nodes yet</h3>
              <p className="text-slate-400 text-sm">
                Get started by creating your first node. Nodes can register themselves automatically or be created manually.
              </p>
              <div className="pt-2">
                <Link
                  href="/nodes/new"
                  className="inline-flex items-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 transition-colors"
                >
                  Create your first node
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {nodes.map((node) => (
              <li
                key={node.id}
                className="border border-slate-800 rounded-md px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{node.name}</div>
                  <div className="text-xs text-slate-400 break-all">ID: {node.id}</div>
                  {node.description && (
                    <div className="text-xs text-slate-300">{node.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>
                    Last seen:{" "}
                    {node.lastSeenAt
                      ? new Date(node.lastSeenAt).toLocaleString()
                      : "never"}
                  </span>
                  <Link
                    href={`/nodes/${node.id}`}
                    className="text-sky-400 hover:text-sky-300 underline"
                  >
                    View
                  </Link>
                  <Link
                    href={`/nodes/${node.id}/edit`}
                    className="text-sky-400 hover:text-sky-300 underline"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
