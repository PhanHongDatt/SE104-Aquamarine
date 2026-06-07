ALTER TABLE "SanPham" ADD COLUMN IF NOT EXISTS "tonToiThieu" INTEGER NOT NULL DEFAULT 1;

UPDATE "SanPham" sp
SET "maDVT" = lsp."maDVT"
FROM "LoaiSanPham" lsp
WHERE sp."maLSP" = lsp."maLSP"
  AND sp."maDVT" <> lsp."maDVT";

ALTER TABLE "SanPham" DROP CONSTRAINT IF EXISTS chk_sp_tontoithieu;
ALTER TABLE "SanPham" ADD CONSTRAINT chk_sp_tontoithieu
  CHECK ("tonToiThieu" >= 0 AND "tonToiThieu" <= 1000);

CREATE TABLE IF NOT EXISTS "LichSuThayDoiQuyDinh" (
  "id" SERIAL NOT NULL,
  "maND" CHAR(6),
  "giaTriCu" JSONB NOT NULL,
  "giaTriMoi" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LichSuThayDoiQuyDinh_pkey" PRIMARY KEY ("id")
);
