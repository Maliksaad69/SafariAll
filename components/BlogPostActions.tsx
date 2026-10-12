'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

export default function BlogPostActions({ postId, title }: { postId: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const doDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/blog/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-[var(--danger)]">Delete “{title.slice(0, 18)}{title.length > 18 ? '…' : ''}”?</span>
        <button type="button" onClick={doDelete} disabled={deleting} className="btn btn-sm btn-danger">
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Yes
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="btn btn-sm btn-secondary">No</button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} className="btn btn-sm btn-secondary" aria-label={`Delete ${title}`}>
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
