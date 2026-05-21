import { test, expect } from "@playwright/test";
import { ensureBaseData, login, prisma } from "./helpers";

test.beforeAll(async () => {
  await ensureBaseData();
});

test.afterAll(async () => {
  await prisma.bangPhanQuyen.deleteMany({ where: { maNhom: "NHANVI", maChucNang: "DM_DVT" } });
  await prisma.$disconnect();
});

async function setStaffUnitPermissionViaUi(page: any, enabled: boolean) {
  await login(page, "admin", "Admin@123", /\/admin\/dashboard$/);
  await page.goto("/admin/cai-dat/phan-quyen");
  await page.locator("select").first().selectOption("NHANVI");
  const checkbox = page.getByRole("row", { name: /DM_DVT/ }).getByRole("checkbox");
  if (enabled) {
    await checkbox.check();
  } else {
    await checkbox.uncheck();
  }
  await page.getByRole("button", { name: /Lưu phân quyền/ }).click();
  await expect(page.getByText(/Cập nhật phân quyền thành công/i)).toBeVisible();
}

test("staff can view unit list with DM_DVT but cannot add units", async ({ page }) => {
  await setStaffUnitPermissionViaUi(page, true);

  await login(page, "nhanvien", "Nhanvien@1", /\/nhan-vien$/);
  await page.goto("/nhan-vien/danh-muc/don-vi-tinh");
  await expect(page).toHaveURL(/\/nhan-vien\/danh-muc\/don-vi-tinh$/);
  await expect(page.getByRole("heading", { name: /Danh Mục Đơn Vị Tính/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Thêm ĐVT|Thêm đơn vị/i })).toHaveCount(0);

  await prisma.bangPhanQuyen.deleteMany({ where: { maNhom: "NHANVI", maChucNang: "DM_DVT" } });

  await login(page, "nhanvien", "Nhanvien@1", /\/nhan-vien$/);
  await page.goto("/nhan-vien/danh-muc/don-vi-tinh");
  await expect(page).toHaveURL(/\/nhan-vien$/);
});
