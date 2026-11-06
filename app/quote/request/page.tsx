import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function QuoteRequestRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string') {
      sp.set(k, v);
    } else if (Array.isArray(v)) {
      v.forEach((val) => sp.append(k, val));
    }
  }
  const qs = sp.toString();
  redirect(qs ? `/custom-safari-quote?${qs}` : '/custom-safari-quote');
}
