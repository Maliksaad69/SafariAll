-- AlterTable
ALTER TABLE "destinations" ADD COLUMN     "best_time_summary" TEXT,
ADD COLUMN     "daily_rates" TEXT,
ADD COLUMN     "high_season" TEXT,
ADD COLUMN     "popularity_rank" INTEGER,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "operators" ADD COLUMN     "offices_in" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "service_summary" TEXT;

-- CreateTable
CREATE TABLE "experts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "biography" TEXT NOT NULL,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "experts_slug_key" ON "experts"("slug");

