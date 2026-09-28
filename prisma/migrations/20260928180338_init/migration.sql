-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TRAVELER', 'OPERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ComfortLevel" AS ENUM ('CAMPING', 'BUDGET', 'MID_RANGE', 'LUXURY', 'SUPER_LUXURY');

-- CreateEnum
CREATE TYPE "TourType" AS ENUM ('PRIVATE', 'SHARED_GROUP', 'FLY_IN', 'SELF_DRIVE');

-- CreateEnum
CREATE TYPE "DestinationType" AS ENUM ('NATIONAL_PARK', 'GAME_RESERVE', 'CONSERVANCY', 'COUNTRY');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'ROUTED', 'RESPONDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('DISPATCHED', 'VIEWED', 'PROPOSAL_SENT', 'DECLINED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING_MODERATION', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TRAVELER',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operators" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "banner_url" TEXT,
    "country_of_origin" TEXT NOT NULL,
    "headquarters_address" TEXT,
    "registration_number" TEXT,
    "license_document_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_date" TIMESTAMP(3),
    "overview_text" TEXT,
    "year_established" INTEGER,
    "price_tier" "ComfortLevel" DEFAULT 'MID_RANGE',
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "type" "DestinationType" NOT NULL,
    "description" TEXT,
    "featured_image_url" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "best_time_to_visit" JSONB,
    "wildlife_present" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_sections" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bullet_items" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destination_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tours" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "duration_nights" INTEGER NOT NULL,
    "min_price_usd" DOUBLE PRECISION NOT NULL,
    "max_price_usd" DOUBLE PRECISION,
    "comfort_level" "ComfortLevel" NOT NULL,
    "tour_type" "TourType" NOT NULL,
    "primary_country" TEXT NOT NULL,
    "start_location" TEXT,
    "end_location" TEXT,
    "inclusions" TEXT[],
    "exclusions" TEXT[],
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_destinations" (
    "tour_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,

    CONSTRAINT "tour_destinations_pkey" PRIMARY KEY ("tour_id","destination_id")
);

-- CreateTable
CREATE TABLE "tour_itineraries" (
    "id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "accommodation_name" TEXT,
    "accommodation_type" "ComfortLevel",
    "meals_included" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "traveler_id" TEXT NOT NULL,
    "tour_id" TEXT,
    "preferred_country" TEXT,
    "travel_date_start" TIMESTAMP(3),
    "travel_date_end" TIMESTAMP(3),
    "is_flexible_dates" BOOLEAN NOT NULL DEFAULT true,
    "adults_count" INTEGER NOT NULL DEFAULT 1,
    "children_count" INTEGER NOT NULL DEFAULT 0,
    "budget_per_person_usd" DOUBLE PRECISION,
    "comfort_preference" "ComfortLevel",
    "custom_notes" TEXT,
    "is_broadcast" BOOLEAN NOT NULL DEFAULT false,
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_leads" (
    "id" TEXT NOT NULL,
    "inquiry_id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'DISPATCHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "inquiry_lead_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachment_urls" TEXT[],
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "tour_id" TEXT,
    "traveler_id" TEXT NOT NULL,
    "overall_rating" DOUBLE PRECISION NOT NULL,
    "guide_rating" DOUBLE PRECISION,
    "vehicle_rating" DOUBLE PRECISION,
    "value_rating" DOUBLE PRECISION,
    "itinerary_accuracy_rating" DOUBLE PRECISION,
    "review_title" TEXT NOT NULL,
    "review_body" TEXT NOT NULL,
    "travel_date" TIMESTAMP(3),
    "is_verified_booking" BOOLEAN NOT NULL DEFAULT true,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
    "operator_reply" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "traveler_id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "adults_count" INTEGER NOT NULL,
    "children_count" INTEGER NOT NULL DEFAULT 0,
    "special_requests" TEXT,
    "estimated_total_usd" DOUBLE PRECISION NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "operator_note" TEXT,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "operators_user_id_key" ON "operators"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "operators_slug_key" ON "operators"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "destination_sections_destination_id_key_key" ON "destination_sections"("destination_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "tours_slug_key" ON "tours"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_reference_key" ON "reservations"("reference");

-- AddForeignKey
ALTER TABLE "operators" ADD CONSTRAINT "operators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_sections" ADD CONSTRAINT "destination_sections_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_destinations" ADD CONSTRAINT "tour_destinations_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_destinations" ADD CONSTRAINT "tour_destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_itineraries" ADD CONSTRAINT "tour_itineraries_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_leads" ADD CONSTRAINT "inquiry_leads_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_leads" ADD CONSTRAINT "inquiry_leads_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_inquiry_lead_id_fkey" FOREIGN KEY ("inquiry_lead_id") REFERENCES "inquiry_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
