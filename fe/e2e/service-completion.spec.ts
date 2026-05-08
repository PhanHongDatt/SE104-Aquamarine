import { test, expect } from "@playwright/test";
import {
  ensureBaseData,
  ensureServiceType,
  getCurrentMonthServiceRevenue,
  login,
  prisma,
} from "./helpers";

test.beforeAll(async () => {
  await ensureBaseData();
  await ensureServiceType();
});

test.afterAll(async () => {
  const receipts = await prisma.phieuDichVu.findMany({
    where: { tenKhachHang: "Khách DV E2E" },
    select: { soPhieu: true },
  });
  const receiptIds = receipts.map((receipt) => receipt.soPhieu);
  await prisma.chiTietDichVu.deleteMany({ where: { soPhieu: { in: receiptIds } } });
  await prisma.phieuDichVu.deleteMany({ where: { soPhieu: { in: receiptIds } } });
  await prisma.loaiDichVu.deleteMany({ where: { maDV: "E2EDV1" } });
  await prisma.$disconnect();
});

test("service revenue increases only after all service lines are delivered", async ({ page }) => {
  const beforeRevenue = await getCurrentMonthServiceRevenue();

  await login(page, "admin", "Admin@123", /\/admin\/dashboard$/);
  await page.goto("/admin/dich-vu/phieu-dich-vu/tao-moi");
  await page.getByLabel("Tên khách hàng").fill("Khách DV E2E");
  await page.getByLabel("Số điện thoại").fill("0901234567");
  await page.getByRole("button", { name: "+ Thêm dịch vụ" }).click();
  await page.getByRole("button", { name: /E2E Dịch vụ hoàn thành/ }).click();
  await page.getByRole("button", { name: /Lưu Phiếu Dịch Vụ/ }).click();
  await expect(page).toHaveURL(/\/admin\/dich-vu\/phieu-dich-vu$/);

  await expect.poll(() => getCurrentMonthServiceRevenue()).toBe(beforeRevenue);

  await page.getByRole("row", { name: /Khách DV E2E/ }).first().getByRole("link", { name: /Chi tiết/ }).click();
  await page.getByRole("button", { name: /Cập nhật & Giao hàng/ }).click();
  await expect(page.getByText(/Cập nhật trạng thái thành công/)).toBeVisible();

  await expect.poll(() => getCurrentMonthServiceRevenue()).toBe(beforeRevenue + 600000);
});
