-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('BUILDING', 'FLOOR', 'SECTION', 'ROOM', 'DESK');

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "parentId" INTEGER,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    "area" DECIMAL(10,3),
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "z" DOUBLE PRECISION,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_code_key" ON "locations"("code");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
