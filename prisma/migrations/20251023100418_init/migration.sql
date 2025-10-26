/*
  Warnings:

  - You are about to drop the column `numTravelers` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Checklist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Itinerary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reservation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Budget" DROP CONSTRAINT "Budget_tripId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Checklist" DROP CONSTRAINT "Checklist_tripId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Expense" DROP CONSTRAINT "Expense_tripId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Itinerary" DROP CONSTRAINT "Itinerary_tripId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reservation" DROP CONSTRAINT "Reservation_tripId_fkey";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "numTravelers",
ADD COLUMN     "travelers" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "public"."Budget";

-- DropTable
DROP TABLE "public"."Checklist";

-- DropTable
DROP TABLE "public"."Expense";

-- DropTable
DROP TABLE "public"."Itinerary";

-- DropTable
DROP TABLE "public"."Reservation";
