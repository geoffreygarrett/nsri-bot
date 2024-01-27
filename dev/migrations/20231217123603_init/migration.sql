/*
  Warnings:

  - You are about to drop the `RescueBuoy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."RescueBuoy";

-- CreateTable
CREATE TABLE "public"."rescue_buoy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "lng" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "old_id" TEXT,
    "status" TEXT NOT NULL,
    "formatted_address" TEXT NOT NULL,
    "address_components" TEXT[],
    "town" TEXT NOT NULL,
    "town_code" TEXT NOT NULL,

    CONSTRAINT "rescue_buoy_pkey" PRIMARY KEY ("id")
);
