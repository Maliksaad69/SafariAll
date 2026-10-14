'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Send, AlertCircle, ArrowLeft } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

interface BlogPostFormProps {
  operatorName: string;
  initial?: {
    id: string;
    title: string;
    excerpt: string | null;
    content: string;
    tag: string | null;
    coverImageUrl: string | null;
    status: string;
  };
}

const TAGS = ['Travel Guides', 'Parks & Wildlife', 'News & Insights', 'Trip Reports', 'Photography', 'Culture'];

export default function BlogPostForm({ operatorName, initial }: BlogPostFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [tag, setTag] = useState(initial?.tag ?? 'Travel Guides');
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const save = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!title.trim()) {
      setError('Give your story a title first.');
      return;
    }
    if (!content.trim() || content === '<p></p>') {
      setError('Write some content before saving.');
      return;
    }
    setLoading(status);
    setError('');
    try {
      const payload = { title, excerpt, tag, coverImageUrl, content, status };
      const res = isEdit
        ? await fetch(`/api/blog/${initial!.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save story.');
      router.push('/operator-portal/blog');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => router.push('/operator-portal/blog')} className="link inline-flex items-center gap-1 text-xs font-semibold">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to stories
        </button>
        <span className="text-xs text-[var(--ink-secondary)]">Publishing as <strong className="text-[var(--ink)]">{operatorName}</strong></span>
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-[rgba(185,28,28,0.25)] bg-[var(--danger-soft)] px-3 py-2 text-xs font-semibold text-[var(--danger)]">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <div className="surface-card p-5 space-y-4">
        <div>
          <label htmlFor="bp-title" className="form-label">Story title</label>
          <input
            id="bp-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 7 Days in the Serengeti: Our Guide's Route"
            className="form-control text-base font-semibold"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bp-tag" className="form-label">Category</label>
            <select id="bp-tag" value={tag} onChange={(e) => setTag(e.target.value)} className="form-control">
              {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="bp-cover" className="form-label">Cover image URL (optional)</label>
            <input
              id="bp-cover"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="form-control"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bp-excerpt" className="form-label">Short excerpt (shown in listings)</label>
          <textarea
            id="bp-excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="One or two sentences that make travelers want to read more..."
            className="form-control resize-none"
          />
        </div>

        <div>
          <span className="form-label">Story content</span>
          <RichTextEditor content={content} onChange={setContent} placeholder="Tell travelers about your routes, wildlife encounters, camps, tips..." />
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
          <button type="button" onClick={() => save('PUBLISHED')} disabled={loading !== null} className="btn btn-primary">
            {loading === 'PUBLISHED' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {initial?.status === 'PUBLISHED' ? 'Update & Keep Published' : 'Publish Story'}
          </button>
          <button type="button" onClick={() => save('DRAFT')} disabled={loading !== null} className="btn btn-secondary">
            {loading === 'DRAFT' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save as Draft
          </button>
          <p className="w-full text-[11px] text-[var(--ink-muted)]">
            Published stories appear instantly in the public Blog for travelers comparing providers.
          </p>
        </div>
      </div>
    </div>
  );
}
