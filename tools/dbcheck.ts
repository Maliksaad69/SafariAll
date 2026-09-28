import prisma from '@/lib/prisma';
async function main() {
  const users = await prisma.user.findMany({ select: { email: true, role: true, firstName: true, lastName: true, phone: true, country: true, _count: { select: { reservations: true, inquiries: true, reviews: true } } } });
  console.log('USERS:');
  users.forEach(u => console.log(' ', u.email, '|', u.role, '|', u.firstName, u.lastName, '| phone:', u.phone, '| country:', u.country, '| res:', u._count.reservations, 'inq:', u._count.inquiries));
  const ops = await prisma.operator.findMany({ select: { companyName: true, slug: true, isVerified: true, _count: { select: { tours: true, reservations: true, leads: true } } } });
  console.log('OPERATORS:');
  ops.forEach(o => console.log(' ', o.companyName, '| verified:', o.isVerified, '| tours:', o._count.tours, '| reservations:', o._count.reservations, '| leads:', o._count.leads));
  const res = await prisma.reservation.findMany({ select: { reference: true, status: true, adultsCount: true, childrenCount: true, startDate: true, estimatedTotalUsd: true, specialRequests: true, traveler: { select: { email: true } }, tour: { select: { title: true, durationDays: true } } } });
  console.log('RESERVATIONS:');
  res.forEach(r => console.log(' ', r.reference.slice(-8), r.status, `${r.adultsCount}A+${r.childrenCount}C`, r.startDate.toISOString().slice(0,10), '$' + r.estimatedTotalUsd, '|', r.traveler.email, '|', r.tour.durationDays + 'd', '| notes:', r.specialRequests?.slice(0,30)));
  const counts = await Promise.all([prisma.inquiry.count(), prisma.inquiryLead.count(), prisma.tour.count(), prisma.destination.count(), prisma.review.count()]);
  console.log('COUNTS: inquiries', counts[0], '| leads', counts[1], '| tours', counts[2], '| destinations', counts[3], '| reviews', counts[4]);
}
main().then(()=>process.exit(0)).catch(e=>{console.error('ERR', e); process.exit(1);});
