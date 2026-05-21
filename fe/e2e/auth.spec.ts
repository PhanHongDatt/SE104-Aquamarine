import { test, expect } from "@playwright/test";
import { ensureBaseData, login, prisma } from "./helpers";

test.beforeAll(async () => {
  await ensureBaseData();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("admin login opens dashboard", async ({ page }) => {
  await login(page, "admin", "Admin@123", /\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();
});

test("staff is redirected away from admin permission page", async ({ page }) => {
  await login(page, "nhanvien", "Nhanvien@1", /\/nhan-vien$/);
  await page.goto("/admin/cai-dat/phan-quyen");
  await expect(page).toHaveURL(/\/nhan-vien$/);
});
