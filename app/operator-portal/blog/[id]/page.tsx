'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogPostForm from '@/components/BlogPostForm';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [initial, setInitial] = useState<{
    id: string;
    title: string;
    excerpt: string | null;
    content: string;
    tag: string | null;
    coverImageUrl: string | null;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(async ({ id }) => {
      try {
        const res = await fetch(`/api/blog/${id}`);
        const { post } = await res.json();
        if (post) setInitial({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          tag: post.tag,
          coverImageUrl: post.coverImageUrl,
          status: post.status,
        });
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-[var(--brand)]"/>
        </main>
        <Footer />
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[var(--ink-secondary)]">Story not found or you do not have access.</p>
          <Link href="/operator-portal/blog" className="btn btn-primary mt-4">Back to stories</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <BlogPostForm
        operatorName="Your Agency"
        initial={{
          id: initial.id,
          title: initial.title,
          excerpt: initial.excerpt,
          content: initial.content,
          tag: initial.tag,
          coverImageUrl: initial.coverImageUrl,
          status: initial.status,
        }}
      />
    </div>
  );
}
