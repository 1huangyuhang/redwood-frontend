-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN "categoryId" INTEGER,
ADD COLUMN "imageUrl" VARCHAR(2048);

-- Categories from existing product.category labels
INSERT INTO "Category" ("slug", "name", "sortOrder", "updatedAt")
SELECT
  'cat-' || LPAD(ROW_NUMBER() OVER (ORDER BY cname)::text, 4, '0'),
  cname,
  0,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT TRIM("category") AS cname
  FROM "Product"
  WHERE TRIM("category") <> ''
) AS d;

INSERT INTO "Category" ("slug", "name", "sortOrder", "updatedAt")
SELECT 'cat-default', '未分类', 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Category" LIMIT 1);

UPDATE "Product" AS p
SET "categoryId" = c.id
FROM "Category" AS c
WHERE TRIM(p."category") = c.name;

UPDATE "Product"
SET "categoryId" = (SELECT "id" FROM "Category" ORDER BY "id" ASC LIMIT 1)
WHERE "categoryId" IS NULL;

ALTER TABLE "Product" DROP COLUMN "category";
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable imageUrl
ALTER TABLE "Activity" ADD COLUMN "imageUrl" VARCHAR(2048);
ALTER TABLE "News" ADD COLUMN "imageUrl" VARCHAR(2048);
ALTER TABLE "SiteAsset" ADD COLUMN "imageUrl" VARCHAR(2048);
ALTER TABLE "Course" ADD COLUMN "imageUrl" VARCHAR(2048);
ALTER TABLE "PricingPlan" ADD COLUMN "imageUrl" VARCHAR(2048);

-- SupportTicket: varchar status -> TicketStatus
ALTER TABLE "SupportTicket" ADD COLUMN "status_new" "TicketStatus" NOT NULL DEFAULT 'OPEN';

UPDATE "SupportTicket" SET "status_new" = CASE
  WHEN LOWER(TRIM("status")) IN ('closed', 'close') THEN 'CLOSED'::"TicketStatus"
  WHEN LOWER(TRIM("status")) IN ('resolved') THEN 'RESOLVED'::"TicketStatus"
  WHEN LOWER(TRIM("status")) IN ('in_progress', 'in progress', 'processing') THEN 'IN_PROGRESS'::"TicketStatus"
  ELSE 'OPEN'::"TicketStatus"
END;

ALTER TABLE "SupportTicket" DROP COLUMN "status";
ALTER TABLE "SupportTicket" RENAME COLUMN "status_new" TO "status";
