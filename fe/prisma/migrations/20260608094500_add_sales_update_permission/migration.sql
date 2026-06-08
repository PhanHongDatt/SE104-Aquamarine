INSERT INTO "BangPhanQuyen" ("maNhom", "maChucNang", "hanhDong")
VALUES ('QUANLY', 'GD_BAN', 'SUA')
ON CONFLICT ("maNhom", "maChucNang", "hanhDong") DO NOTHING;
