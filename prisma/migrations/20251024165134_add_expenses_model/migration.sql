/*
  Warnings:

  - You are about to drop the column `city` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Expense` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "city",
DROP COLUMN "totalAmount",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "place" TEXT,
ADD COLUMN     "total" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "paidBy" DROP NOT NULL,
ALTER COLUMN "amountPerTraveler" DROP NOT NULL;
