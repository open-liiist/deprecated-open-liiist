/*
  Warnings:

  - Added the required column `document_id` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Product_name_id_key";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "document_id" TEXT NOT NULL;
