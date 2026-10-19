-- AlterTable
ALTER TABLE "reservation_messages" ADD COLUMN     "read_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_presence" (
    "reservation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typing_until" TIMESTAMP(3),

    CONSTRAINT "chat_presence_pkey" PRIMARY KEY ("reservation_id","user_id")
);

-- CreateIndex
CREATE INDEX "message_attachments_message_id_idx" ON "message_attachments"("message_id");

-- CreateIndex
CREATE INDEX "reservation_messages_reservation_id_created_at_idx" ON "reservation_messages"("reservation_id", "created_at");

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "reservation_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Attachments are limited to 8 MB each.
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_size_check" CHECK ("size_bytes" > 0 AND "size_bytes" <= 8388608);
-- Messages already marked read get a read time.
UPDATE "reservation_messages" SET "read_at" = "created_at" WHERE "is_read" = true AND "read_at" IS NULL;
