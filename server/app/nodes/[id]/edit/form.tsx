"use client";

import { useRef } from "react";

function generateApiKey(): string {
  // Generate a random 32-character hex string (similar to what cuid() might produce)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function EditNodeForm({
  node,
  updateNode,
  deleteNode,
}: {
  node: { id: string; name: string; description: string | null; secretKey: string; pollIntervalSeconds: number };
  updateNode: (formData: FormData) => Promise<void>;
  deleteNode: () => Promise<void>;
}) {
  const secretKeyInputRef = useRef<HTMLInputElement>(null);

  function handleGenerateApiKey() {
    if (secretKeyInputRef.current) {
      secretKeyInputRef.current.value = generateApiKey();
    }
  }

  function handleDelete() {
    if (confirm(`Are you sure you want to delete "${node.name}"? This action cannot be undone.`)) {
      deleteNode();
    }
  }

  return (
    <form action={updateNode} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          defaultValue={node.name}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          rows={3}
          defaultValue={node.description ?? ""}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium" htmlFor="secretKey">
          API Key
        </label>
        <div className="flex gap-2">
          <input
            ref={secretKeyInputRef}
            id="secretKey"
            name="secretKey"
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-mono"
            defaultValue={node.secretKey}
            required
          />
          <button
            type="button"
            onClick={handleGenerateApiKey}
            className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
          >
            Generate
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium" htmlFor="pollIntervalSeconds">
          Poll interval (seconds)
        </label>
        <input
          id="pollIntervalSeconds"
          name="pollIntervalSeconds"
          type="number"
          min={10}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          defaultValue={node.pollIntervalSeconds}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          Save changes
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center rounded-md border border-red-700 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40"
        >
          Delete node
        </button>
      </div>
    </form>
  );
}
