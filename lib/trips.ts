import prisma from '@/lib/prisma';

const DAY_MS = 86_400_000;

/**
 * Auto-conclude trips whose final day has passed.
 *
 * A reservation is APPROVED while the trip is upcoming or in progress. Once
 * `startDate + tour.durationDays` is in the past the trip is over, so we flip it
 * to COMPLETED, stamp `completedAt`, and fan out travel notifications:
 *   · traveller  → "your trip concluded" + a review invitation
 *   · agency     → "trip concluded" so the dashboard reflects delivered work
 *
 * Idempotent and safe to call on every read (the eligibility query is indexed
 * and the WHERE clause only matches APPROVED rows, so a completed trip is never
 * processed twice).
 */
export async function completeElapsedTrips(): Promise<number> {
  const now = new Date();

  const candidates = await prisma.reservation.findMany({
    where: { status: 'APPROVED', startDate: { lt: now } },
    select: {
      id: true,
      reference: true,
      travelerId: true,
      operatorId: true,
      startDate: true,
      tour: { select: { title: true, slug: true, durationDays: true } },
      operator: { select: { companyName: true, user: { select: { id: true } } } },
    },
  });

  const elapsed = candidates.filter(
    (r) => new Date(r.startDate.getTime() + r.tour.durationDays * DAY_MS) < now
  );
  if (elapsed.length === 0) return 0;

  for (const r of elapsed) {
    await prisma.reservation.update({
      where: { id: r.id },
      data: { status: 'COMPLETED', completedAt: now },
    });

    // Traveller: trip concluded + review invitation
    await prisma.notification.createMany({
      data: [
        {
          userId: r.travelerId,
          type: 'TRIP_COMPLETED',
          title: `Your safari has concluded — ${r.tour.title}`,
          body: `We hope ${r.operator.companyName} delivered an unforgettable trip. Your booking (${r.reference}) is now marked as completed.`,
          link: '/my-trips',
        },
        {
          userId: r.travelerId,
          type: 'REVIEW_INVITE',
          title: 'How was your safari?',
          body: `Share a review of ${r.operator.companyName} to help the next traveller choose with confidence.`,
          link: `/tours/${r.tour.slug}`,
        },
      ],
    });

    // Agency: works delivered, counted on their dashboard
    await prisma.notification.create({
      data: {
        userId: r.operator.user.id,
        type: 'TRIP_COMPLETED',
        title: `Trip concluded — ${r.tour.title}`,
        body: `Booking ${r.reference} has finished. The traveller has been invited to leave a review.`,
        link: '/operator-portal',
      },
    });
  }

  return elapsed.length;
}
