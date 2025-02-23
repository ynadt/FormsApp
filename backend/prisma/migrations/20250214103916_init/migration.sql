/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateFile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_userId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateFile" DROP CONSTRAINT "TemplateFile_fileId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateFile" DROP CONSTRAINT "TemplateFile_templateId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "File";

-- DropTable
DROP TABLE "TemplateFile";
