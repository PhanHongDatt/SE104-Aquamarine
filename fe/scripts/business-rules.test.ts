import assert from "node:assert/strict";
import {
  assertDvtValidForLoaiSP,
  assertPurchaseQuantityMeetsMinimum,
  calculateEndingStock,
  calculateInvoiceTotal,
  calculateLineTotal,
  calculateRemainingAmount,
  calculateSellPrice,
  calculateServiceUnitPrice,
  canSellQuantity,
  isPrepaidEnough,
  isLowStock,
  isValidPhoneNumber,
  isDvtValidForLoaiSP,
  validateServiceDelivery,
} from "../src/lib/business-rules";
import { nextSequentialIdFromValidCodes } from "../src/lib/id-generation";

assert.equal(
  nextSequentialIdFromValidCodes(["LSP001", "LSPABC", "LSP009"], "LSP", 3),
  "LSP010",
  "Sinh mã LSP phải bỏ qua mã lệch chuẩn",
);
assert.equal(
  nextSequentialIdFromValidCodes(["DVT001", "DVTNaN", "E2EDVT"], "DVT", 3),
  "DVT002",
  "Sinh mã DVT phải bỏ qua mã lệch chuẩn",
);
assert.equal(
  nextSequentialIdFromValidCodes(["SP001", "SPABC", "SP099"], "SP", 3),
  "SP100",
  "Sinh mã SP phải bỏ qua mã lệch chuẩn",
);

assert.equal(isValidPhoneNumber("0901234567"), true, "Số điện thoại Việt Nam hợp lệ phải được chấp nhận");
assert.equal(isValidPhoneNumber("+84901234567"), true, "Số điện thoại +84 hợp lệ phải được chấp nhận");
assert.equal(isValidPhoneNumber("abc123"), false, "Số điện thoại chứa chữ phải bị từ chối");
assert.equal(isValidPhoneNumber("12345"), false, "Số điện thoại quá ngắn phải bị từ chối");

assert.equal(calculateSellPrice(1_000_000, 20), 1_200_000, "Giá bán phải bằng giá nhập cộng lợi nhuận");
assert.equal(calculateSellPrice(1_000_000, 0), 1_000_000, "Lợi nhuận 0% phải giữ nguyên giá nhập");
assert.equal(calculateSellPrice(1_000_000, 100), 2_000_000, "Lợi nhuận 100% phải nhân đôi giá nhập");
assert.throws(() => calculateSellPrice(0, 20), /Giá nhập phải lớn hơn 0/);
assert.throws(() => calculateSellPrice(-1, 20), /Giá nhập phải lớn hơn 0/);
assert.throws(() => calculateSellPrice(1_000_000, -5), /Tỷ lệ lợi nhuận phải từ 0 đến 100/);
assert.throws(() => calculateSellPrice(1_000_000, 101), /Tỷ lệ lợi nhuận phải từ 0 đến 100/);

assert.equal(isDvtValidForLoaiSP("Vàng miếng nguyên chất", "Lượng"), true, "Vàng miếng được dùng Lượng");
assert.equal(isDvtValidForLoaiSP("Vàng miếng nguyên chất", "Chỉ"), true, "Vàng miếng được dùng Chỉ");
assert.equal(isDvtValidForLoaiSP("Nữ trang cao cấp", "Gram"), true, "Nữ trang được dùng Gram");
assert.equal(isDvtValidForLoaiSP("Nữ trang cao cấp", "Chỉ"), true, "Nữ trang được dùng Chỉ");
assert.throws(
  () => assertDvtValidForLoaiSP("Vàng miếng nguyên chất", "Gram"),
  /Sản phẩm loại Vàng miếng chỉ được dùng đơn vị Lượng\/Chỉ/,
  "Vàng miếng dùng Gram phải bị từ chối",
);
assert.throws(
  () => assertDvtValidForLoaiSP("Nữ trang cao cấp", "Lượng"),
  /Sản phẩm loại Nữ trang chỉ được dùng đơn vị Gram\/Chỉ/,
  "Nữ trang dùng Lượng phải bị từ chối",
);

assert.equal(calculateLineTotal(3, 250_000), 750_000, "Thành tiền phải bằng số lượng nhân đơn giá");
assert.throws(() => calculateLineTotal(0, 250_000), /Số lượng/);
assert.throws(() => calculateLineTotal(1, 0), /Đơn giá phải lớn hơn 0/);
assert.throws(() => calculateLineTotal(1, -1), /Đơn giá phải lớn hơn 0/);
assert.equal(assertPurchaseQuantityMeetsMinimum("SP001", 5, 5), true, "Số lượng mua bằng ngưỡng phải được chấp nhận");
assert.throws(
  () => assertPurchaseQuantityMeetsMinimum("SP001", 3, 5),
  /Số lượng mua sản phẩm SP001 phải ≥ 5/,
  "Số lượng mua dưới ngưỡng phải bị từ chối",
);

assert.equal(
  calculateInvoiceTotal([
    { quantity: 2, unitPrice: 100_000 },
    { quantity: 1, unitPrice: 250_000 },
  ]),
  450_000,
  "Tổng hóa đơn phải bằng tổng các dòng chi tiết"
);

assert.equal(canSellQuantity(5, 5), true, "Được bán khi số lượng bằng tồn kho");
assert.equal(canSellQuantity(5, 6), false, "Không được bán vượt tồn kho");
assert.equal(canSellQuantity(5, 0), false, "Không được bán số lượng bằng 0");
assert.equal(canSellQuantity(-1, 1), false, "Tồn kho âm phải bị xem là không hợp lệ");

assert.equal(isLowStock(2, 3), true, "Tồn kho dưới ngưỡng tối thiểu phải cảnh báo");
assert.equal(isLowStock(3, 3), false, "Tồn kho bằng ngưỡng tối thiểu chưa bị xem là thấp theo quy định < tồn tối thiểu");
assert.equal(isLowStock(4, 3), false, "Tồn kho trên ngưỡng tối thiểu không cần cảnh báo");

assert.equal(calculateEndingStock(5, 10, 3), 12, "Tồn cuối phải bằng tồn đầu cộng mua vào trừ bán ra");
assert.throws(() => calculateEndingStock(1, 0, 2), /Tồn cuối không được âm/);
assert.throws(() => calculateEndingStock(1.5, 0, 0), /số nguyên không âm/);

assert.equal(calculateServiceUnitPrice(200_000, 50_000), 250_000, "Đơn giá dịch vụ được tính phải cộng chi phí phát sinh");
assert.equal(isPrepaidEnough(125_000, 250_000, 50), true, "Trả trước đúng 50% phải được chấp nhận");
assert.equal(isPrepaidEnough(124_000, 250_000, 50), false, "Trả trước dưới 50% phải bị từ chối");
assert.equal(calculateRemainingAmount(250_000, 125_000), 125_000, "Số tiền còn lại phải bằng tổng tiền trừ trả trước");
assert.throws(() => calculateRemainingAmount(250_000, 300_000), /không được lớn hơn tổng tiền/);

assert.equal(validateServiceDelivery("GiaCong", ""), true, "Dịch vụ gia công không bắt buộc kết quả kiểm định");
assert.equal(validateServiceDelivery("KiemDinh", "Đạt chuẩn"), true, "Dịch vụ kiểm định có kết quả phải được giao");
assert.throws(
  () => validateServiceDelivery("KiemDinh", ""),
  /Dịch vụ kiểm định phải có kết quả/,
  "Dịch vụ kiểm định thiếu kết quả phải bị từ chối"
);

console.log("Business rules tests passed.");
