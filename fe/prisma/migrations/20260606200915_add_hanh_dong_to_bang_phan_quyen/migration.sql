/*
  Warnings:

  - The primary key for the `BangPhanQuyen` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `hanhDong` to the `BangPhanQuyen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BangPhanQuyen" DROP CONSTRAINT "BangPhanQuyen_pkey",
ADD COLUMN     "hanhDong" CHAR(4) NOT NULL,
ADD CONSTRAINT "BangPhanQuyen_pkey" PRIMARY KEY ("maNhom", "maChucNang", "hanhDong");
