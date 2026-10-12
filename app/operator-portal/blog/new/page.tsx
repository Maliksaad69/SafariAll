import BlogPostForm from '@/components/BlogPostForm';

export default function NewBlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <BlogPostForm operatorName="Your Agency" initial={undefined} />
    </div>
  );
}
