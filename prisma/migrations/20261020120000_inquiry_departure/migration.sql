-- AlterTable
ALTER TABLE "inquiries" ADD COLUMN     "slot_id" TEXT;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "tour_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

