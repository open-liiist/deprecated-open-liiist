/*
  Warnings:

  - Made the column `street` on table `Localization` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Localization" ALTER COLUMN "street" SET NOT NULL;
