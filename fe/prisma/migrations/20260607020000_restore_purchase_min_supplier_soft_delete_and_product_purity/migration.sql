ALTER TYPE "HamLuong" ADD VALUE IF NOT EXISTS 'BAC_925';
ALTER TYPE "HamLuong" ADD VALUE IF NOT EXISTS 'KHONG_AP_DUNG';

ALTER TABLE "NhaCungCap" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "ThamSo" ADD COLUMN IF NOT EXISTS "soLuongNhapToiThieu" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ThamSo" DROP CONSTRAINT IF EXISTS chk_ts_nhaptoithieu;
ALTER TABLE "ThamSo" ADD CONSTRAINT chk_ts_nhaptoithieu
  CHECK ("soLuongNhapToiThieu" >= 1 AND "soLuongNhapToiThieu" <= 1000);

INSERT INTO "BangPhanQuyen" ("maNhom", "maChucNang", "hanhDong")
VALUES ('QUANLY', 'GD_MUA', 'XOA')
ON CONFLICT ("maNhom", "maChucNang", "hanhDong") DO NOTHING;
