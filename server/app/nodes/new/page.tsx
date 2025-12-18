import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NewNodeForm } from "./form";

const prisma = new PrismaClient();

async function createNode(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const secretKey = String(formData.get("secretKey") || "").trim();
  const pollIntervalSeconds = Number(formData.get("pollIntervalSeconds") || 300);

  if (!name || !secretKey) {
    // For now just redirect back; you could add validation UI later.
    redirect("/");
  }

  const node = await prisma.node.create({
    data: {
      name,
      description,
      secretKey,
      pollIntervalSeconds,
    },
  });

  redirect(`/nodes/${node.id}`);
}

export default function NewNodePage() {
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
        <h2 className="text-xl font-semibold mb-1">New node</h2>
        <p className="text-sm text-slate-400">
          Create a node manually. In normal operation nodes register themselves using a secret key.
        </p>
      </div>

      <NewNodeForm createNode={createNode} />
    </div>
  );
}
