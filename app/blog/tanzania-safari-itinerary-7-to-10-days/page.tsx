import { redirect } from 'next/navigation';

// Article content lives in the blog_posts table; /blogs/[slug] renders it.
export default function LegacyBlogRedirect() {
  redirect('/blogs/tanzania-safari-itinerary-7-to-10-days');
}
