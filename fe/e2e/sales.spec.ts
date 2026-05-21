import { test, expect } from "@playwright/test";
import { ensureBaseData, ensureSalesProduct, formatCurrency, getCurrentMonthSalesRevenue, login, prisma } from "./helpers";

test.beforeAll(async () => {
  await ensureBaseData();
  await ensureSalesProduct();
});

test.afterAll(async () => {
  const invoices = await prisma.phieuBanHang.findMany({
    where: { tenKhachHang: "Khách E2E" },
    select: { soPhieu: true },
  });
  const invoiceIds = invoices.map((invoice) => invoice.soPhieu);
  await prisma.chiTietBanHang.deleteMany({ where: { soPhieu: { in: invoiceIds } } });
  await prisma.phieuBanHang.deleteMany({ where: { soPhieu: { in: invoiceIds } } });
  await prisma.baoCaoTonKho.deleteMany({ where: { maSP: "E2ESP" } });
  await prisma.sanPham.deleteMany({ where: { maSP: "E2ESP" } });
  await prisma.loaiSanPham.deleteMany({ where: { maLSP: "E2ELSP" } });
  await prisma.donViTinh.deleteMany({ where: { maDVT: "E2EDVT" } });
  await prisma.$disconnect();
});

test("admin creates sales invoice and revenue report increases", async ({ page }) => {
  const beforeRevenue = await getCurrentMonthSalesRevenue();

  await login(page, "admin", "Admin@123", /\/admin\/dashboard$/);
  await page.goto("/admin/giao-dich/ban-hang/tao-moi");
  await page.getByLabel("Tên khách hàng").fill("Khách E2E");
  await page.getByRole("button", { name: "Thêm sản phẩm" }).click();
  await page.getByRole("button", { name: /E2E Sản phẩm bán hàng/ }).click();
  await page.getByRole("button", { name: /Lưu & Xuất phiếu/ }).click();
  await expect(page).toHaveURL(/\/admin\/giao-dich\/ban-hang$/);

  const afterRevenue = await getCurrentMonthSalesRevenue();
  expect(afterRevenue).toBeGreaterThan(beforeRevenue);

  await page.goto("/admin/bao-cao/doanh-thu");
  await page.getByRole("button", { name: /Lập báo cáo/ }).click();
  await expect(page.getByText(formatCurrency(afterRevenue)).first()).toBeVisible();
});
