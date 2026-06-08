INSERT INTO "BangPhanQuyen" ("maNhom", "maChucNang", "hanhDong")
VALUES
  ('QUANLY', 'GD_BAN', 'XOA'),
  ('QUANLY', 'GD_MUA', 'SUA'),
  ('QUANLY', 'DV_TRA', 'XOA')
ON CONFLICT ("maNhom", "maChucNang", "hanhDong") DO NOTHING;
