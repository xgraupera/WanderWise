/*
  Warnings:

  - A unique constraint covering the columns `[tripId,day]` on the table `Itinerary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_tripId_day_key" ON "Itinerary"("tripId", "day");
