-- CreateTable
CREATE TABLE "SiteAsset" (
    "id" SERIAL NOT NULL,
    "page" VARCHAR(64) NOT NULL,
    "groupKey" VARCHAR(64) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" VARCHAR(255),
    "alt" VARCHAR(255),
    "image" BYTEA,
    "videoUrl" VARCHAR(1024),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteAsset_page_groupKey_idx" ON "SiteAsset"("page", "groupKey");
