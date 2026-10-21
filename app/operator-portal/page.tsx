import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import AgencyReservationsTable from '@/components/AgencyReservationsTable';
import { PlusCircle, ShieldCheck, Clock, MapPin, ArrowRight, CalendarDays, Users, Building2, Mail, TrendingUp, ImageIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OperatorPortalPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'TRAVELER') {
    redirect('/dashboard');
  }

  // Resolve the operator record for this account
  let operator = null;
  if (session.role === 'OPERATOR') {
    operator = await prisma.operator.findUnique({
      where: { userId: session.userId },
      include: {
        tours: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { reservations: true, media: true } } },
        },
      },
    });
  } else if (session.role === 'ADMIN') {
    operator = await prisma.operator.findFirst({
      include: {
        tours: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { reservations: true, media: true } } },
        },
      },
    });
  }

  const operatorId = operator?.id ?? '';
  const operatorName = operator?.companyName ?? session.companyName ?? session.name;

  // Load reservation requests and leads for this agency
  const reservations = operatorId
    ? await prisma.reservation.findMany({
        where: { operatorId },
        orderBy: { createdAt: 'desc' },
        include: {
          traveler: { select: { firstName: true, lastName: true, email: true, phone: true, country: true } },
          tour: { select: { title: true, slug: true, durationDays: true } },
        },
      })
    : [];

  const leads = operatorId
    ? await prisma.inquiryLead.findMany({
        where: { operatorId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          inquiry: {
            include: {
              traveler: { select: { firstName: true, lastName: true, email: true } },
              tour: { select: { title: true } },
            },
          },
        },
      })
    : [];

  // Unread chat messages from travellers (same count as the header chat button)
  const unreadChats = operatorId
    ? await prisma.reservationMessage.count({
        where: { reservation: { operatorId }, isRead: false, senderId: { not: session.userId } },
      })
    : 0;

  const todayStart = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');
  const [openByTour, fleetSize] = operator
    ? await Promise.all([
        prisma.tourSlot.groupBy({
          by: ['tourId'],
          where: { tour: { operatorId: operator.id }, startDate: { gte: todayStart }, status: 'OPEN' },
          _count: { _all: true },
        }),
        prisma.vehicle.count({ where: { operatorId: operator.id, isActive: true } }),
      ])
    : [[], 0];
  const needsDepartures = (operator?.tours ?? []).filter((t) => t.isPublished && !openByTour.some((o) => o.tourId === t.id));
  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length;
  const approvedRes = reservations.filter((r) => r.status === 'APPROVED');
  const approvedCount = approvedRes.length;
  const totalTravelers = approvedRes.reduce((sum, r) => sum + r.adultsCount + r.childrenCount, 0);
  const pipelineUsd = reservations
    .filter((r) => r.status === 'PENDING' || r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.estimatedTotalUsd, 0);
  const safariDays = approvedRes.reduce((sum, r) => sum + r.tour.durationDays, 0);

  const serializeReservation = (r: any) => ({
    id: r.id,
    reference: r.reference,
    startDate: r.startDate.toISOString(),
    adultsCount: r.adultsCount,
    childrenCount: r.childrenCount,
    specialRequests: r.specialRequests,
    estimatedTotalUsd: r.estimatedTotalUsd,
    status: r.status,
    operatorNote: r.operatorNote,
    decidedAt: r.decidedAt ? r.decidedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    traveler: r.traveler,
    tour: r.tour,
  });

  const statCards = [
    { label: 'Pending approvals', value: String(pendingCount), icon: Clock, tint: 'text-[var(--warning)] bg-[var(--warning-soft)]' },
    { label: 'Approved trips', value: String(approvedCount), icon: ShieldCheck, tint: 'text-[var(--success)] bg-[var(--success-soft)]' },
    { label: 'Travelers booked', value: String(totalTravelers), icon: Users, tint: 'text-[var(--info)] bg-[var(--info-soft)]' },
    { label: 'Safari days sold', value: String(safariDays), icon: CalendarDays, tint: 'text-[var(--gold)] bg-[var(--gold-soft)]' },
    { label: 'Pipeline value', value: `$${Math.round(pipelineUsd).toLocaleString()}`, icon: TrendingUp, tint: 'text-[var(--brand)] bg-[var(--brand-soft)]' },
    { label: 'Live packages', value: String(operator?.tours.length ?? 0), icon: MapPin, tint: 'text-[var(--ink-secondary)] bg-[var(--surface-sunk)]' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Header */}
        <div className="surface-dark p-7 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <span className="badge badge-on-dark mb-3">Agency Portal</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--dark-text)] font-display">
              {operatorName}
            </h1>
            <p className="mt-2 text-sm text-[var(--dark-text-soft)] max-w-xl">
              Review reservation requests, manage your safari packages, publish marketing stories, and respond to travelers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`badge ${operator?.isVerified ? 'badge-success' : 'badge-warning'}`}>
              {operator?.isVerified ? 'Verified Agency' : 'Verification Pending'}
            </span>
            <Link href="/operator-portal/messages" className="btn btn-secondary relative">
              <Mail className="h-4 w-4" />
              Inbox
              {unreadChats > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
                  {unreadChats}
                </span>
              )}
            </Link>
            <Link href="/operator-portal/slots" className="btn btn-secondary">
              <CalendarDays className="h-4 w-4" />
              Departures
            </Link>
            <Link href="/operator-portal/blog/new" className="btn btn-secondary">
              <Building2 className="h-4 w-4" />
              Write Story
            </Link>
            <Link href="/operator-portal/tours/new" className="btn btn-primary">
              <PlusCircle className="h-4 w-4" />
              Create Tour Package
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map(({ label, value, icon: Icon, tint }) => (
            <div key={label} className="surface-card p-5">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="text-xl font-bold text-[var(--ink)]">{value}</div>
              <div className="text-[11px] font-semibold text-[var(--ink-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Fleet / departure gaps: tours without open departures can't be booked */}
        {operator && fleetSize === 0 && needsDepartures.length === 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <strong>Add your vehicles to start selling seats.</strong> Bookings are taken per seat on scheduled departures, so each
            vehicle you add sets how many travellers a departure can carry.{' '}
            <Link href="/operator-portal/slots" className="font-semibold underline">Set up your fleet</Link>
          </div>
        )}
        {needsDepartures.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <strong>{needsDepartures.length} package{needsDepartures.length === 1 ? '' : 's'} cannot take bookings</strong> because there are no open
            upcoming departures: {needsDepartures.map((t) => t.title).join(', ')}.{' '}
            <Link href="/operator-portal/slots" className="font-semibold underline">Schedule departures</Link>
            {fleetSize === 0 ? ' (add your vehicles there first).' : '.'}
          </div>
        )}

        {/* Reservation requests */}
        <AgencyReservationsTable initialReservations={reservations.map(serializeReservation)} />

        {/* Published tours */}
        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--ink)] font-display">
              Your Safari Packages
            </h2>
            <Link href="/operator-portal/tours/new" className="link text-xs inline-flex items-center gap-1">
              Add new <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {operator && operator.tours.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="px-5 sm:px-6">Package</th>
                    <th className="px-4">Country</th>
                    <th className="px-4">Duration</th>
                    <th className="px-4">Price from</th>
                    <th className="px-4">Reservations</th>
                    <th className="px-4">Status</th>
                    <th className="px-4">Photos</th>
                  </tr>
                </thead>
                <tbody>
                  {operator.tours.map((tour) => (
                    <tr key={tour.id}>
                      <td className="px-5 sm:px-6 font-semibold text-[var(--ink)]">
                        <Link href={`/tours/${tour.slug}`} className="link">{tour.title}</Link>
                      </td>
                      <td className="px-4">{tour.primaryCountry}</td>
                      <td className="px-4 whitespace-nowrap">{tour.durationDays} days</td>
                      <td className="px-4 whitespace-nowrap font-semibold">${tour.minPriceUsd.toLocaleString()}</td>
                      <td className="px-4">{tour._count.reservations}</td>
                      <td className="px-4">
                        <span className={`badge ${tour.isPublished ? 'badge-success' : 'badge-neutral'}`}>
                          {tour.isPublished ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <Link
                          href={`/operator-portal/tours/${tour.id}/images`}
                          className="link inline-flex items-center gap-1.5 text-xs font-bold"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          {tour._count.media > 0 ? `Manage (${tour._count.media})` : 'Upload'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-semibold text-[var(--ink)]">No packages published yet</p>
              <p className="mt-1 text-xs text-[var(--ink-secondary)]">Create your first safari package to start receiving reservations.</p>
            </div>
          )}
        </section>

        {/* Inquiry leads */}
        <section className="surface-card overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--ink)] font-display">
              Quote Inquiry Leads
            </h2>
            <p className="text-xs text-[var(--ink-secondary)] mt-0.5">Travelers who requested a custom quote routed to your agency.</p>
          </div>
          {leads.length > 0 ? (
            <ul className="divide-y divide-[var(--border-soft)]">
              {leads.map((lead) => (
                <li key={lead.id} className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[var(--ink)]">
                        {lead.inquiry.traveler.firstName} {lead.inquiry.traveler.lastName}
                      </span>
                      <span className="badge badge-neutral">{lead.status}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--ink-secondary)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {lead.inquiry.traveler.email}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> {lead.inquiry.adultsCount} adult{lead.inquiry.adultsCount !== 1 ? 's' : ''}
                        {lead.inquiry.childrenCount > 0 ? `, ${lead.inquiry.childrenCount} children` : ''}
                      </span>
                      {lead.inquiry.tour && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {lead.inquiry.tour.title}</span>}
                      {lead.inquiry.preferredCountry && !lead.inquiry.tour && (
                        <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {lead.inquiry.preferredCountry}</span>
                      )}
                    </div>
                    {lead.inquiry.customNotes && (
                      <p className="mt-2 rounded-lg bg-[var(--surface-sunk)] px-3 py-1.5 text-xs text-[var(--ink-body)]">{lead.inquiry.customNotes}</p>
                    )}
                  </div>
                  <div className="text-xs text-[var(--ink-muted)] whitespace-nowrap shrink-0">
                    <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-semibold text-[var(--ink)]">No inquiry leads yet</p>
              <p className="mt-1 text-xs text-[var(--ink-secondary)]">When travelers request quotes in your destination, they arrive here.</p>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
