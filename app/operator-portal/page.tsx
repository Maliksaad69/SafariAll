import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import AgencyReservationsTable from '@/components/AgencyReservationsTable';
import AgencyToursTable from '@/components/AgencyToursTable';
import AgencyFleetManager from '@/components/AgencyFleetManager';
import { parseTalaData } from '@/lib/tala-verification';
import { PlusCircle, ShieldCheck, Clock, MapPin, ArrowRight, CalendarDays, Users, Building2, Mail, TrendingUp, Bus, FileText, AlertTriangle, CheckCircle2, Settings } from 'lucide-react';

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
          vehicle: { select: { name: true, vehicleType: true, plateNumber: true } },
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
  const [openByTour, vehicles] = operatorId
    ? await Promise.all([
        prisma.tourSlot.groupBy({
          by: ['tourId'],
          where: { tour: { operatorId }, startDate: { gte: todayStart }, status: 'OPEN' },
          _count: { _all: true },
        }),
        prisma.vehicle.findMany({
          where: { operatorId },
          orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
          include: {
            _count: {
              select: {
                slots: {
                  where: { slot: { startDate: { gte: todayStart } } },
                },
              },
            },
          },
        }),
      ])
    : [[], []];

  const fleetSize = vehicles.filter((v) => v.isActive).length;
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
    vehicle: r.vehicle
      ? {
          name: r.vehicle.name,
          vehicleType: r.vehicle.vehicleType,
          plateNumber: r.vehicle.plateNumber,
        }
      : null,
  });

  const serializedVehicles = vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    vehicleType: v.vehicleType,
    seats: v.seats,
    plateNumber: v.plateNumber,
    isActive: v.isActive,
    upcomingDepartures: v._count.slots,
  }));

  const serializedTours = (operator?.tours ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    primaryCountry: t.primaryCountry,
    durationDays: t.durationDays,
    minPriceUsd: t.minPriceUsd,
    isPublished: t.isPublished,
    reservationCount: t._count.reservations,
    mediaCount: t._count.media,
  }));

  const statCards = [
    { label: 'Pending approvals', value: String(pendingCount), icon: Clock, tint: 'text-[var(--warning)] bg-[var(--warning-soft)]' },
    { label: 'Approved trips', value: String(approvedCount), icon: ShieldCheck, tint: 'text-[var(--success)] bg-[var(--success-soft)]' },
    { label: 'Travelers booked', value: String(totalTravelers), icon: Users, tint: 'text-[var(--info)] bg-[var(--info-soft)]' },
    { label: 'Safari days sold', value: String(safariDays), icon: CalendarDays, tint: 'text-[var(--gold)] bg-[var(--gold-soft)]' },
    { label: 'Pipeline value', value: `$${Math.round(pipelineUsd).toLocaleString()}`, icon: TrendingUp, tint: 'text-[var(--brand)] bg-[var(--brand-soft)]' },
    { label: 'Live packages', value: String(operator?.tours.length ?? 0), icon: MapPin, tint: 'text-[var(--ink-secondary)] bg-[var(--surface-sunk)]' },
  ];

  const talaData = parseTalaData(
    operator?.serviceSummary,
    operator?.registrationNumber,
    operator?.licenseDocumentUrl,
    operator?.isVerified
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Header */}
        <div className="surface-dark p-7 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <span className="badge badge-on-dark mb-3">Agency Portal</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-display">
              {operatorName}
            </h1>
            <p className="mt-2 text-sm text-white/90 max-w-xl font-medium">
              Review reservation requests, manage your safari packages, publish marketing stories, and respond to travelers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/operator-portal/verification"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm transition-all hover:scale-105 ${
                operator?.isVerified
                  ? 'bg-emerald-500/25 text-emerald-100 border-emerald-400/50'
                  : 'bg-amber-500/25 text-amber-100 border-amber-400/50'
              }`}
              title="Manage Agency TALA License & Verification"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{operator?.isVerified ? 'Verified Agency' : 'Verification Pending'}</span>
            </Link>
            <Link href="/operator-portal/verification" className="btn btn-secondary">
              <ShieldCheck className="h-4 w-4" />
              <span>TALA License</span>
            </Link>
            <Link href="/operator-portal/settings" className="btn btn-secondary" title="Edit agency profile and settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            <Link href="/operator-portal/messages" className="btn btn-secondary relative" aria-label="Open Agency Messages Inbox">
              <Mail className="h-4 w-4" />
              <span>Inbox</span>
              {unreadChats > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10.5px] font-extrabold text-white shadow-md">
                  {unreadChats}
                </span>
              )}
            </Link>
            <Link href="/operator-portal/slots" className="btn btn-secondary">
              <CalendarDays className="h-4 w-4" />
              <span>Departures</span>
            </Link>
            <Link href="/operator-portal/blog/new" className="btn btn-secondary">
              <Building2 className="h-4 w-4" />
              <span>Write Story</span>
            </Link>
            <Link href="/operator-portal/tours/new" className="btn btn-primary">
              <PlusCircle className="h-4 w-4" />
              <span>Create Tour Package</span>
            </Link>
          </div>
        </div>

        {/* Verification Status Alert Banner */}
        {!operator?.isVerified && (
          <div
            className={`rounded-2xl border p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              talaData.status === 'REJECTED'
                ? 'border-rose-300 bg-rose-50/95 text-rose-950'
                : talaData.status === 'PENDING'
                ? 'border-amber-300 bg-amber-50/95 text-amber-950'
                : 'border-[#193A38]/15 bg-[#F7F6F1] text-[#193A38]'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white shadow-xs ${
                  talaData.status === 'REJECTED'
                    ? 'bg-rose-600'
                    : talaData.status === 'PENDING'
                    ? 'bg-amber-500'
                    : 'bg-[#193A38]'
                }`}
              >
                {talaData.status === 'REJECTED' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : talaData.status === 'PENDING' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  {talaData.status === 'REJECTED'
                    ? 'TALA Verification Requires Revision'
                    : talaData.status === 'PENDING'
                    ? 'TALA Document Under Review by Platform Owner'
                    : 'Submit TALA License to Unlock "Verified Agency" Status'}
                </h4>
                <p className="text-xs mt-0.5 font-medium opacity-90 max-w-2xl">
                  {talaData.status === 'REJECTED'
                    ? `The website owner requested updates: "${talaData.reviewNotes || 'Document invalid or illegible'}". Please upload a revised certificate.`
                    : talaData.status === 'PENDING'
                    ? `Your TALA license (${talaData.talaNumber || 'Submitted'}) is awaiting manual verification by the platform owner.`
                    : 'International safari travelers prefer verified agencies. Upload your official Tourism Agency Licensing Authority document to obtain your verification badge.'}
                </p>
              </div>
            </div>

            <Link
              href="/operator-portal/verification"
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 ${
                talaData.status === 'REJECTED'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : talaData.status === 'PENDING'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-[#193A38] hover:bg-[#214446] text-white'
              }`}
            >
              <span>{talaData.status === 'REJECTED' ? 'Resubmit TALA License' : talaData.status === 'PENDING' ? 'View Submission' : 'Upload TALA License'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map(({ label, value, icon: Icon, tint }) => (
            <div key={label} className="surface-card p-5 border border-[var(--border)] shadow-xs">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="text-xl font-bold text-[#193A38]">{value}</div>
              <div className="text-xs font-bold text-[#344C49] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Fleet / departure gaps: tours without open departures can't be booked */}
        {operator && fleetSize === 0 && needsDepartures.length === 0 && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 font-medium shadow-xs">
            <strong className="text-amber-950 font-bold">Add your vehicles to start selling seats.</strong> Bookings are taken per seat on scheduled departures, so each
            vehicle you add sets how many travellers a departure can carry.{' '}
            <Link href="/operator-portal/slots" className="font-bold underline text-amber-950 hover:text-black">Set up your fleet</Link>
          </div>
        )}
        {needsDepartures.length > 0 && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 font-medium shadow-xs">
            <strong className="text-amber-950 font-bold">{needsDepartures.length} package{needsDepartures.length === 1 ? '' : 's'} cannot take bookings</strong> because there are no open
            upcoming departures: {needsDepartures.map((t) => t.title).join(', ')}.{' '}
            <Link href="/operator-portal/slots" className="font-bold underline text-amber-950 hover:text-black">Schedule departures</Link>
            {fleetSize === 0 ? ' (add your vehicles there first).' : '.'}
          </div>
        )}

        {/* Reservation requests */}
        <AgencyReservationsTable initialReservations={reservations.map(serializeReservation)} />

        {/* Fleet & Car Management Section */}
        <AgencyFleetManager initialVehicles={serializedVehicles} />

        {/* Published tours with Edit, Toggle Live/Draft, and Delete */}
        <AgencyToursTable initialTours={serializedTours} />

        {/* Inquiry leads */}
        <section className="surface-card overflow-hidden border border-[var(--border)]">
          <div className="px-5 sm:px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[#193A38] font-display">
              Quote Inquiry Leads
            </h2>
            <p className="text-xs text-[#344C49] font-medium mt-0.5">Travelers who requested a custom quote routed to your agency.</p>
          </div>
          {leads.length > 0 ? (
            <ul className="divide-y divide-[var(--border-soft)]">
              {leads.map((lead) => (
                <li key={lead.id} className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--canvas-base)]/40 transition-colors">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#193A38]">
                        {lead.inquiry.traveler.firstName} {lead.inquiry.traveler.lastName}
                      </span>
                      <span className="badge badge-neutral text-xs font-semibold">{lead.status}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#344C49] font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#214446]" /> {lead.inquiry.traveler.email}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#214446]" /> {lead.inquiry.adultsCount} adult{lead.inquiry.adultsCount !== 1 ? 's' : ''}
                        {lead.inquiry.childrenCount > 0 ? `, ${lead.inquiry.childrenCount} children` : ''}
                      </span>
                      {lead.inquiry.tour && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#193A38]">
                          <MapPin className="h-3.5 w-3.5 text-[#214446]" /> {lead.inquiry.tour.title}
                        </span>
                      )}
                      {lead.inquiry.preferredCountry && !lead.inquiry.tour && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#193A38]">
                          <MapPin className="h-3.5 w-3.5 text-[#214446]" /> {lead.inquiry.preferredCountry}
                        </span>
                      )}
                    </div>
                    {lead.inquiry.customNotes && (
                      <p className="mt-2 rounded-xl bg-[#F5F2E8] border border-[#E3DECF] px-3.5 py-2 text-xs text-[#193A38] font-medium">
                        <strong className="text-[#193A38] font-bold">Traveler note: </strong>
                        {lead.inquiry.customNotes}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-[#344C49] font-semibold whitespace-nowrap shrink-0">
                    <CalendarDays className="mr-1 inline h-3.5 w-3.5 text-[#214446]" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-semibold text-[#193A38]">No inquiry leads yet</p>
              <p className="mt-1 text-xs text-[#344C49]">When travelers request quotes in your destination, they arrive here.</p>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
