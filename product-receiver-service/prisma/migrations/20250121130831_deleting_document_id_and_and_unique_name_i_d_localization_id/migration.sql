/*
  Warnings:

  - You are about to drop the column `document_id` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name_id,localizationId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_document_id_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "document_id";

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_id_localizationId_key" ON "Product"("name_id", "localizationId");
