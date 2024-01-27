-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "public"."RescueBuoy" (
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

    CONSTRAINT "RescueBuoy_pkey" PRIMARY KEY ("id")
);
