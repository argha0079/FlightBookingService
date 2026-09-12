/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Booking";

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "flightId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "noOfSeats" INTEGER NOT NULL DEFAULT 1,
    "totalCost" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'in process',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_flightId_idx" ON "bookings"("flightId");

-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");
