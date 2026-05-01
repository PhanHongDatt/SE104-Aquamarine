export const CONVERSION_RATES: Record<string, number> = {
  "Chỉ": 3.75,
  "Lượng": 37.5,
  "Cây": 37.5,
  "Phân": 0.375,
  "Ly": 0.0375,
  "Gram": 1,
  "Karat": 0.2, // 1 karat (ct) = 200mg = 0.2g
  "Ounce": 31.1034768, // Ounce vàng (troy ounce)
  "Chỉ vàng": 3.75,
  "Lượng vàng": 37.5,
};

export const UNIT_SUGGESTIONS = Object.keys(CONVERSION_RATES);
