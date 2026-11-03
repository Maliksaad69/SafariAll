import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const d = await prisma.destination.findMany({
    select: {
      slug: true,
      name: true,
      country: true,
      type: true,
      _count: { select: { tours: true } },
    },
    orderBy: [{ country: 'asc' }, { name: 'asc' }],
  });

  console.log(`=== ALL 48 DESTINATIONS TOUR COUNT ===`);
  const zeroTours = d.filter((item) => item._count.tours === 0);
  console.log(`Destinations with 0 tours: ${zeroTours.length}`);

  d.forEach((item) => {
    console.log(
      `${item.country.padEnd(14)} | ${item.type.padEnd(15)} | tours: ${String(item._count.tours).padStart(2)} | ${item.slug.padEnd(35)} | ${item.name}`
    );
  });

  console.log('\n=== REVIEWS BREAKDOWN ===');
  const reviewCount = await prisma.review.count();
  const approvedReviewCount = await prisma.review.count({ where: { status: 'APPROVED' } });
  console.log(`Total Reviews: ${reviewCount} (Approved: ${approvedReviewCount})`);

  console.log('\n=== BLOG POSTS ===');
  const blogCount = await prisma.blogPost.count();
  console.log(`Total Blog Posts: ${blogCount}`);

  console.log('\n=== EXPERTS ===');
  const experts = await prisma.expert.findMany({ orderBy: { sortOrder: 'asc' } });
  experts.forEach((e) => console.log(`- ${e.name} (${e.country}): ${e.reviewCount} reviews`));

  console.log('\n=== RESERVATIONS ===');
  const reservations = await prisma.reservation.findMany({
    select: {
      reference: true,
      status: true,
      estimatedTotalUsd: true,
      tour: { select: { title: true } },
      operator: { select: { companyName: true } },
      traveler: { select: { firstName: true, lastName: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  reservations.forEach((r) =>
    console.log(
      `- [${r.status.padEnd(9)}] ${r.reference} | ${r.operator.companyName} | ${r.traveler.firstName} ${r.traveler.lastName} | $${r.estimatedTotalUsd} | ${r._count.messages} msgs | ${r.tour.title}`
    )
  );
}

main().finally(() => prisma.$disconnect());
