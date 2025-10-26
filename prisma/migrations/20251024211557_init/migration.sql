/*
  Warnings:

  - You are about to drop the column `total` on the `Expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "total",
ADD COLUMN     "amount" DOUBLE PRECISION;
