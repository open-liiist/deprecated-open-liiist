-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "current_price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "localizationId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "price_for_kg" DOUBLE PRECISION,
    "image_url" TEXT,
    "quantity" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductHistory" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Localization" (
    "id" SERIAL NOT NULL,
    "grocery" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "zip_code" TEXT,
    "working_hours" TEXT,
    "picks_up_in_store" BOOLEAN,

    CONSTRAINT "Localization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_id_key" ON "Product"("name_id");

-- CreateIndex
CREATE UNIQUE INDEX "Localization_grocery_lat_lng_key" ON "Localization"("grocery", "lat", "lng");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_localizationId_fkey" FOREIGN KEY ("localizationId") REFERENCES "Localization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductHistory" ADD CONSTRAINT "ProductHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
