UPDATE "SanPham" sp
SET "hamLuong" = 'BAC_925'
FROM "LoaiSanPham" lsp
WHERE sp."maLSP" = lsp."maLSP"
  AND lsp."tenLSP" ILIKE '%Bạc%';

UPDATE "SanPham" sp
SET "hamLuong" = 'KHONG_AP_DUNG'
FROM "LoaiSanPham" lsp
WHERE sp."maLSP" = lsp."maLSP"
  AND (
    lsp."tenLSP" ILIKE '%Kim Cương%'
    OR lsp."tenLSP" ILIKE '%Đá Quý%'
    OR lsp."tenLSP" ILIKE '%Ngọc Trai%'
    OR sp."tenSP" ILIKE '%Ngọc Trai%'
  );
