/*
  Warnings:

  - A unique constraint covering the columns `[tripId,category]` on the table `Budget` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Budget_tripId_category_key" ON "Budget"("tripId", "category");
