/*
  Warnings:

  - Changed the type of `exchangeCode` on the `Investment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ExchangeCodeType" AS ENUM ('BZ', 'US', 'CRYPTO', 'FIXED');

-- DropIndex
DROP INDEX "User_phoneNumber_idx";

-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "exchangeCode",
ADD COLUMN     "exchangeCode" "ExchangeCodeType" NOT NULL;

-- CreateIndex
CREATE INDEX "Investment_ticker_exchangeCode_idx" ON "Investment"("ticker", "exchangeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Investment_ticker_exchangeCode_key" ON "Investment"("ticker", "exchangeCode");

-- CreateIndex
CREATE INDEX "UserInvestment_userId_idx" ON "UserInvestment"("userId");
