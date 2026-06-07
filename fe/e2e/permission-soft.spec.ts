import { test, expect } from "@playwright/test";
import { ensureBaseData, login, prisma } from "./helpers";

test.beforeAll(async () => {
  await ensureBaseData();
});

test.afterAll(async () => {
  await prisma.bangPhanQuyen.deleteMany({ where: { maNhom: "NHANVI", maChucNang: "DM_DVT" } });
  await prisma.bangPhanQuyen.create({
    data: { maNhom: "NHANVI", maChucNang: "DM_DVT", hanhDong: "XEM" },
  });
  await prisma.bangPhanQuyen.upsert({
    where: {
      maNhom_maChucNang_hanhDong: {
        maNhom: "KETOAN",
        maChucNang: "BC_DTH",
        hanhDong: "XEM ",
      },
    },
    update: {},
    create: { maNhom: "KETOAN", maChucNang: "BC_DTH", hanhDong: "XEM" },
  });
  await prisma.$disconnect();
});

async function setStaffUnitPermissionViaUi(page: any, enabled: boolean) {
  await login(page, "admin", "Admin@123", /\/admin\/dashboard$/);
  await page.goto("/admin/cai-dat/phan-quyen");
  await page.locator("select").first().selectOption("NHANVI");
  const checkbox = page.getByRole("row", { name: /DM_DVT/ }).getByRole("checkbox").first();
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
  await expect(page.getByRole("heading", { name: /Quản Lý Đơn Vị Tính/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Thêm ĐVT|Thêm đơn vị/i })).toHaveCount(0);

  await prisma.bangPhanQuyen.deleteMany({ where: { maNhom: "NHANVI", maChucNang: "DM_DVT" } });

  await page.goto("/nhan-vien/danh-muc/don-vi-tinh");
  await expect(page).toHaveURL(/\/nhan-vien$/);
});

test("manager grants revenue report to accounting via UI and revocation affects the active session", async ({ browser }) => {
  await prisma.bangPhanQuyen.deleteMany({ where: { maNhom: "KETOAN", maChucNang: "BC_DTH" } });

  const adminContext = await browser.newContext();
  const accountantContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  const accountantPage = await accountantContext.newPage();

  await login(adminPage, "admin", "Admin@123", /\/admin\/dashboard$/);
  await adminPage.goto("/admin/cai-dat/phan-quyen");
  await adminPage.locator("#permission-group").selectOption("KETOAN");
  const revenueCheckbox = adminPage.getByRole("row", { name: /BC_DTH/ }).getByRole("checkbox").first();
  await revenueCheckbox.check();
  await adminPage.getByRole("button", { name: /Lưu phân quyền/ }).click();
  await expect(adminPage.getByText(/Cập nhật phân quyền thành công/i)).toBeVisible();

  await login(accountantPage, "ketoan", "Ketoan@1", /\/nhan-vien$/);
  await accountantPage.goto("/nhan-vien/bao-cao/doanh-thu");
  await expect(accountantPage).toHaveURL(/\/nhan-vien\/bao-cao\/doanh-thu$/);
  await expect(accountantPage.getByText(/Báo cáo doanh thu/i).first()).toBeVisible();

  await revenueCheckbox.uncheck();
  await adminPage.getByRole("button", { name: /Lưu phân quyền/ }).click();
  await expect(adminPage.getByText(/Cập nhật phân quyền thành công/i)).toBeVisible();

  await accountantPage.goto("/nhan-vien/bao-cao/doanh-thu");
  await expect(accountantPage).toHaveURL(/\/nhan-vien(?:\?error=unauthorized)?$/);

  await adminContext.close();
  await accountantContext.close();
});
