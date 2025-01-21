/*
  Warnings:

  - A unique constraint covering the columns `[grocery,lat,lng,street]` on the table `Localization` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Localization_grocery_lat_lng_key";

-- CreateIndex
CREATE UNIQUE INDEX "Localization_grocery_lat_lng_street_key" ON "Localization"("grocery", "lat", "lng", "street");
