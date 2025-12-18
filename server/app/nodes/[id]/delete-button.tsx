"use client";

export function DeleteNodeButton({
  nodeName,
  deleteNode,
}: {
  nodeName: string;
  deleteNode: () => Promise<void>;
}) {
  function handleDelete() {
    if (confirm(`Are you sure you want to delete "${nodeName}"? This action cannot be undone.`)) {
      deleteNode();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-md border border-red-700 bg-red-900/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/40"
    >
      Delete
    </button>
  );
}
