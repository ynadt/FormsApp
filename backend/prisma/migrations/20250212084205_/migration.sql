/*
  Warnings:

  - You are about to drop the column `answer_checkbox1` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_checkbox2` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_checkbox3` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_checkbox4` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_int1` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_int2` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_int3` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_int4` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_multi1` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_multi2` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_multi3` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_multi4` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_string1` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_string2` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_string3` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `answer_string4` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `custom_checkbox1_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_checkbox1_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_checkbox2_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_checkbox2_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_checkbox3_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_checkbox3_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_checkbox4_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_checkbox4_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_int1_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_int1_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_int2_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_int2_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_int3_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_int3_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_int4_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_int4_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_multi1_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_multi1_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_multi2_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_multi2_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_multi3_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_multi3_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_multi4_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_multi4_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_string1_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_string1_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_string2_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_string2_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_string3_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_string3_state` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_string4_question` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `custom_string4_state` on the `Template` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_LINE', 'MULTI_LINE', 'INTEGER', 'CHECKBOX');

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "answer_checkbox1",
DROP COLUMN "answer_checkbox2",
DROP COLUMN "answer_checkbox3",
DROP COLUMN "answer_checkbox4",
DROP COLUMN "answer_int1",
DROP COLUMN "answer_int2",
DROP COLUMN "answer_int3",
DROP COLUMN "answer_int4",
DROP COLUMN "answer_multi1",
DROP COLUMN "answer_multi2",
DROP COLUMN "answer_multi3",
DROP COLUMN "answer_multi4",
DROP COLUMN "answer_string1",
DROP COLUMN "answer_string2",
DROP COLUMN "answer_string3",
DROP COLUMN "answer_string4";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "custom_checkbox1_question",
DROP COLUMN "custom_checkbox1_state",
DROP COLUMN "custom_checkbox2_question",
DROP COLUMN "custom_checkbox2_state",
DROP COLUMN "custom_checkbox3_question",
DROP COLUMN "custom_checkbox3_state",
DROP COLUMN "custom_checkbox4_question",
DROP COLUMN "custom_checkbox4_state",
DROP COLUMN "custom_int1_question",
DROP COLUMN "custom_int1_state",
DROP COLUMN "custom_int2_question",
DROP COLUMN "custom_int2_state",
DROP COLUMN "custom_int3_question",
DROP COLUMN "custom_int3_state",
DROP COLUMN "custom_int4_question",
DROP COLUMN "custom_int4_state",
DROP COLUMN "custom_multi1_question",
DROP COLUMN "custom_multi1_state",
DROP COLUMN "custom_multi2_question",
DROP COLUMN "custom_multi2_state",
DROP COLUMN "custom_multi3_question",
DROP COLUMN "custom_multi3_state",
DROP COLUMN "custom_multi4_question",
DROP COLUMN "custom_multi4_state",
DROP COLUMN "custom_string1_question",
DROP COLUMN "custom_string1_state",
DROP COLUMN "custom_string2_question",
DROP COLUMN "custom_string2_state",
DROP COLUMN "custom_string3_question",
DROP COLUMN "custom_string3_state",
DROP COLUMN "custom_string4_question",
DROP COLUMN "custom_string4_state";

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "showInResults" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
