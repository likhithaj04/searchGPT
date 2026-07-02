-- CreateTable
CREATE TABLE "Doccument" (
    "id" UUID NOT NULL,
    "chat_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "fileurl" TEXT NOT NULL,
    "extracted" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Doccument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Doccument" ADD CONSTRAINT "Doccument_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
