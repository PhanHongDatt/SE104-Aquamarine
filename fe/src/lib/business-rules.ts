export function isValidPhoneNumber(phone: string) {
  return /^(0|\+84)[0-9]{8,10}$/.test(phone.trim());
}

export function calculateSellPrice(importPrice: number, profitPercent: number) {
  if (!Number.isFinite(importPrice) || importPrice <= 0) {
    throw new Error("Giá nhập phải lớn hơn 0");
  }
  if (!Number.isFinite(profitPercent) || profitPercent < 0 || profitPercent > 100) {
    throw new Error("Tỷ lệ lợi nhuận phải từ 0 đến 100");
  }
  return Math.round(importPrice * (1 + profitPercent / 100));
}

function normalizeVietnameseText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function getAllowedDvtNamesForLoaiSP(tenLSP: string) {
  const normalized = normalizeVietnameseText(tenLSP);

  if (normalized.includes("vang mieng")) {
    return ["Lượng", "Chỉ"];
  }

  if (normalized.includes("nu trang")) {
    return ["Gram", "Chỉ"];
  }

  return null;
}

export function isDvtValidForLoaiSP(tenLSP: string, tenDVT: string) {
  const allowed = getAllowedDvtNamesForLoaiSP(tenLSP);
  if (!allowed) return true;

  const normalizedUnit = normalizeVietnameseText(tenDVT);
  return allowed.some((unit) => normalizedUnit.includes(normalizeVietnameseText(unit)));
}

export function assertDvtValidForLoaiSP(tenLSP: string, tenDVT: string) {
  if (isDvtValidForLoaiSP(tenLSP, tenDVT)) return true;

  const allowed = getAllowedDvtNamesForLoaiSP(tenLSP) || [];
  const normalized = normalizeVietnameseText(tenLSP);
  const loaiLabel = normalized.includes("vang mieng")
    ? "Vàng miếng"
    : normalized.includes("nu trang")
      ? "Nữ trang"
      : tenLSP;

  throw new Error(`Sản phẩm loại ${loaiLabel} chỉ được dùng đơn vị ${allowed.join("/")}`);
}

export function calculateLineTotal(quantity: number, unitPrice: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Số lượng phải là số nguyên lớn hơn 0");
  }
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    throw new Error("Đơn giá phải lớn hơn 0");
  }
  return quantity * unitPrice;
}

export function assertPurchaseQuantityMeetsMinimum(
  productLabel: string,
  quantity: number,
  minimumQuantity: number,
) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Số lượng mua phải là số nguyên lớn hơn 0");
  }
  if (!Number.isInteger(minimumQuantity) || minimumQuantity <= 0) {
    throw new Error("Số lượng nhập tối thiểu phải là số nguyên lớn hơn 0");
  }
  if (quantity < minimumQuantity) {
    throw new Error(`Số lượng mua sản phẩm ${productLabel} phải ≥ ${minimumQuantity}`);
  }
  return true;
}

export function calculateInvoiceTotal(items: Array<{ quantity: number; unitPrice: number }>) {
  return items.reduce((total, item) => total + calculateLineTotal(item.quantity, item.unitPrice), 0);
}

export function canSellQuantity(stockQuantity: number, requestedQuantity: number) {
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    return false;
  }
  if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
    return false;
  }
  return stockQuantity >= requestedQuantity;
}

export function isLowStock(stockQuantity: number, minimumStock: number) {
  return stockQuantity < minimumStock;
}

export function calculateEndingStock(openingStock: number, purchasedQuantity: number, soldQuantity: number) {
  for (const value of [openingStock, purchasedQuantity, soldQuantity]) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("Số lượng tồn, mua vào và bán ra phải là số nguyên không âm");
    }
  }
  const endingStock = openingStock + purchasedQuantity - soldQuantity;
  if (endingStock < 0) {
    throw new Error("Tồn cuối không được âm");
  }
  return endingStock;
}

export function calculateServiceUnitPrice(servicePrice: number, extraCost: number) {
  if (!Number.isFinite(servicePrice) || servicePrice <= 0) {
    throw new Error("Đơn giá dịch vụ phải lớn hơn 0");
  }
  if (!Number.isFinite(extraCost) || extraCost < 0) {
    throw new Error("Chi phí phát sinh không được âm");
  }
  return servicePrice + extraCost;
}

export function isPrepaidEnough(prepaidAmount: number, totalAmount: number, minimumPercent: number) {
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error("Thành tiền phải lớn hơn 0");
  }
  if (!Number.isFinite(prepaidAmount) || prepaidAmount < 0) {
    throw new Error("Tiền trả trước không được âm");
  }
  if (!Number.isFinite(minimumPercent) || minimumPercent < 0 || minimumPercent > 100) {
    throw new Error("Tỷ lệ trả trước phải từ 0 đến 100");
  }
  return prepaidAmount >= totalAmount * (minimumPercent / 100);
}

export function calculateRemainingAmount(totalAmount: number, prepaidAmount: number) {
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error("Tổng tiền phải lớn hơn 0");
  }
  if (!Number.isFinite(prepaidAmount) || prepaidAmount < 0) {
    throw new Error("Tiền trả trước không được âm");
  }
  if (prepaidAmount > totalAmount) {
    throw new Error("Tiền trả trước không được lớn hơn tổng tiền");
  }
  return totalAmount - prepaidAmount;
}

export function validateServiceDelivery(serviceGroup: string, appraisalResult?: string | null) {
  if (serviceGroup === "KiemDinh" && !String(appraisalResult || "").trim()) {
    throw new Error("Dịch vụ kiểm định phải có kết quả trước khi giao");
  }
  return true;
}
