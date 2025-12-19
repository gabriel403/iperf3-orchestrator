import { PrismaClient } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { EditNodeForm } from "./form";

const prisma = new PrismaClient();

async function updateNode(id: string, formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const secretKey = String(formData.get("secretKey") || "").trim();
  const pollIntervalSeconds = Number(formData.get("pollIntervalSeconds") || 300);

  if (!name || !secretKey) {
    redirect(`/nodes/${id}`);
  }

  await prisma.node.update({
    where: { id },
    data: {
      name,
      description,
      secretKey,
      pollIntervalSeconds,
    },
  });

  redirect(`/nodes/${id}`);
}

async function deleteNode(id: string) {
  "use server";

  await prisma.node.delete({
    where: { id },
  });

  redirect("/");
}

export default async function EditNodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const node = await prisma.node.findUnique({ where: { id } });
  if (!node) return notFound();

  // Store node.id in a const to ensure TypeScript knows it's not null
  const nodeId = node.id;

  async function action(formData: FormData) {
    "use server";
    await updateNode(nodeId, formData);
  }

  async function deleteAction() {
    "use server";
    await deleteNode(nodeId);
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-300"
          >
            ← Back to list
          </Link>
        </div>
        <h2 className="text-xl font-semibold mb-1">Edit node</h2>
        <p className="text-sm text-slate-400">Update the node metadata.</p>
      </div>

      <EditNodeForm node={node} updateNode={action} deleteNode={deleteAction} />
    </div>
  );
}
