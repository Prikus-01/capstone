-- AlterTable
ALTER TABLE "products" ADD COLUMN     "format" VARCHAR(30) DEFAULT 'Paperback',
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
