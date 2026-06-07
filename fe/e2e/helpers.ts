import { expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  { maChucNang: "DM_DVT", tenChucNang: "Quản lý đơn vị tính", tenManHinhDuocLoad: "/admin/danh-muc/don-vi-tinh" },
  { maChucNang: "DM_LSP", tenChucNang: "Quản lý loại sản phẩm", tenManHinhDuocLoad: "/admin/danh-muc/loai-san-pham" },
  { maChucNang: "DM_SP", tenChucNang: "Quản lý sản phẩm", tenManHinhDuocLoad: "/admin/danh-muc/san-pham" },
  { maChucNang: "DM_KH", tenChucNang: "Quản lý khách hàng", tenManHinhDuocLoad: "/admin/danh-muc/khach-hang" },
  { maChucNang: "DM_NCC", tenChucNang: "Quản lý nhà cung cấp", tenManHinhDuocLoad: "/admin/danh-muc/nha-cung-cap" },
  { maChucNang: "GD_BAN", tenChucNang: "Lập phiếu bán hàng", tenManHinhDuocLoad: "/admin/giao-dich/ban-hang" },
  { maChucNang: "GD_MUA", tenChucNang: "Lập phiếu mua hàng", tenManHinhDuocLoad: "/admin/giao-dich/mua-hang" },
  { maChucNang: "DV_LAP", tenChucNang: "Lập phiếu dịch vụ", tenManHinhDuocLoad: "/admin/dich-vu/phieu-dich-vu/tao-moi" },
  { maChucNang: "DV_LDV", tenChucNang: "Quản lý loại dịch vụ", tenManHinhDuocLoad: "/admin/dich-vu/loai-dich-vu" },
  { maChucNang: "DV_TRA", tenChucNang: "Tra cứu phiếu dịch vụ", tenManHinhDuocLoad: "/admin/dich-vu/phieu-dich-vu" },
  { maChucNang: "BC_TON", tenChucNang: "Báo cáo tồn kho", tenManHinhDuocLoad: "/admin/bao-cao/ton-kho" },
  { maChucNang: "BC_DTH", tenChucNang: "Báo cáo doanh thu", tenManHinhDuocLoad: "/admin/bao-cao/doanh-thu" },
  { maChucNang: "HT_USR", tenChucNang: "Quản lý tài khoản người dùng", tenManHinhDuocLoad: "/admin/tai-khoan" },
  { maChucNang: "HT_PHQ", tenChucNang: "Phân quyền người dùng", tenManHinhDuocLoad: "/admin/cai-dat/phan-quyen" },
  { maChucNang: "HT_QDI", tenChucNang: "Thay đổi quy định", tenManHinhDuocLoad: "/admin/cai-dat/quy-dinh" },
  { maChucNang: "HT_BAK", tenChucNang: "Sao lưu và phục hồi dữ liệu", tenManHinhDuocLoad: "/admin/cai-dat/sao-luu-phuc-hoi" },
];

const ACTION_MAP: Record<string, string[]> = {
  DM_DVT: ["XEM", "THEM", "SUA", "XOA"],
  DM_LSP: ["XEM", "THEM", "SUA", "XOA"],
  DM_SP: ["XEM", "THEM", "SUA", "XOA"],
  DM_KH: ["XEM", "THEM", "SUA", "XOA"],
  DM_NCC: ["XEM", "THEM", "SUA", "XOA"],
  GD_BAN: ["XEM", "THEM"],
  GD_MUA: ["XEM", "THEM"],
  DV_LAP: ["XEM", "THEM"],
  DV_LDV: ["XEM", "THEM", "SUA", "XOA"],
  DV_TRA: ["XEM", "SUA"],
  BC_TON: ["XEM"],
  BC_DTH: ["XEM"],
  HT_USR: ["XEM", "THEM", "SUA", "XOA"],
  HT_PHQ: ["XEM", "SUA"],
  HT_QDI: ["XEM", "SUA"],
  HT_BAK: ["XEM", "THEM", "SUA"],
};

const STAFF_ACTION_MAP: Record<string, string[]> = {
  DM_DVT: ["XEM"],
  DM_LSP: ["XEM"],
  DM_SP: ["XEM", "THEM", "SUA"],
  DM_KH: ["XEM", "THEM", "SUA"],
  DM_NCC: ["XEM"],
  GD_BAN: ["XEM", "THEM"],
  GD_MUA: ["XEM", "THEM"],
  DV_LAP: ["XEM", "THEM"],
  DV_TRA: ["XEM", "SUA"],
  BC_TON: ["XEM"],
};

export async function ensureBaseData() {
  await prisma.nhomNguoiDung.upsert({
    where: { maNhom: "QUANLY" },
    update: { tenNhom: "QUAN_LY" },
    create: { maNhom: "QUANLY", tenNhom: "QUAN_LY" },
  });
  await prisma.nhomNguoiDung.upsert({
    where: { maNhom: "NHANVI" },
    update: { tenNhom: "NHAN_VIEN" },
    create: { maNhom: "NHANVI", tenNhom: "NHAN_VIEN" },
  });
  await prisma.nhomNguoiDung.upsert({
    where: { maNhom: "KETOAN" },
    update: { tenNhom: "KE_TOAN" },
    create: { maNhom: "KETOAN", tenNhom: "KE_TOAN" },
  });

  await Promise.all(
    ALL_PERMISSIONS.map((permission) =>
      prisma.chucNang.upsert({
        where: { maChucNang: permission.maChucNang },
        update: permission,
        create: permission,
      })
    )
  );

  const [adminPassword, staffPassword, accountantPassword] = await Promise.all([
    bcrypt.hash("Admin@123", 10),
    bcrypt.hash("Nhanvien@1", 10),
    bcrypt.hash("Ketoan@1", 10),
  ]);

  await prisma.nguoiDung.upsert({
    where: { tenDangNhap: "admin" },
    update: { matKhau: adminPassword, maNhom: "QUANLY" },
    create: { maND: "ND0001", tenDangNhap: "admin", matKhau: adminPassword, hoTen: "Nguyễn Quản Lý", maNhom: "QUANLY" },
  });
  await prisma.nguoiDung.upsert({
    where: { tenDangNhap: "ketoan" },
    update: { matKhau: accountantPassword, maNhom: "KETOAN" },
    create: { maND: "ND0003", tenDangNhap: "ketoan", matKhau: accountantPassword, hoTen: "Đặng Kế Toán", maNhom: "KETOAN" },
  });
  await prisma.nguoiDung.upsert({
    where: { tenDangNhap: "nhanvien" },
    update: { matKhau: staffPassword, maNhom: "NHANVI" },
    create: { maND: "ND0002", tenDangNhap: "nhanvien", matKhau: staffPassword, hoTen: "Trần Nhân Viên", maNhom: "NHANVI" },
  });

  const permissionRows = [
    ...ALL_PERMISSIONS.flatMap((permission) =>
      (ACTION_MAP[permission.maChucNang] ?? ["XEM"]).map((hanhDong) => ({
        maNhom: "QUANLY",
        maChucNang: permission.maChucNang,
        hanhDong,
      }))
    ),
    ...Object.entries(STAFF_ACTION_MAP).flatMap(([maChucNang, actions]) =>
      actions.map((hanhDong) => ({ maNhom: "NHANVI", maChucNang, hanhDong }))
    ),
  ];

  await Promise.all(
    permissionRows.map((permission) =>
      prisma.bangPhanQuyen.upsert({
        where: {
          maNhom_maChucNang_hanhDong: {
            maNhom: permission.maNhom,
            maChucNang: permission.maChucNang,
            hanhDong: permission.hanhDong.padEnd(4),
          },
        },
        update: {},
        create: permission,
      })
    )
  );
}

export async function login(page: Page, username: string, password: string, expectedPath: RegExp) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const csrfResponse = await page.request.get("/api/auth/csrf", { timeout: 10_000 });
      if (csrfResponse.ok()) {
        const { csrfToken } = await csrfResponse.json();
        await page.request.post("/api/auth/signout", {
          form: { csrfToken, callbackUrl: "/dang-nhap", json: "true" },
          timeout: 10_000,
        });
      }
      break;
    } catch {
      await page.waitForTimeout(500);
    }
  }
  await page.context().clearCookies();
  await page.goto("/dang-nhap", { waitUntil: "domcontentloaded" });
  if ((await page.locator('input[name="username"]').count()) === 0) {
    await page.context().clearCookies();
    await page.goto("/dang-nhap", { waitUntil: "domcontentloaded" });
  }
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(expectedPath);
}

export async function ensureSalesProduct() {
  await prisma.donViTinh.upsert({
    where: { maDVT: "E2EDVT" },
    update: { tenDVT: "E2E Gram", dinhLuong: 1 },
    create: { maDVT: "E2EDVT", tenDVT: "E2E Gram", dinhLuong: 1 },
  });
  await prisma.loaiSanPham.upsert({
    where: { maLSP: "E2ELSP" },
    update: { tenLSP: "E2E Loại bán hàng", maDVT: "E2EDVT", phanTramLoiNhuan: 0 },
    create: { maLSP: "E2ELSP", tenLSP: "E2E Loại bán hàng", maDVT: "E2EDVT", phanTramLoiNhuan: 0 },
  });
  await prisma.sanPham.upsert({
    where: { maSP: "E2ESP" },
    update: {
      tenSP: "E2E Sản phẩm bán hàng",
      maLSP: "E2ELSP",
      maDVT: "E2EDVT",
      hamLuong: "K24",
      trongLuong: 1,
      tonKho: 20,
      donGiaNhap: 1234567,
      donGiaBan: 1234567,
      deletedAt: null,
    },
    create: {
      maSP: "E2ESP",
      tenSP: "E2E Sản phẩm bán hàng",
      maLSP: "E2ELSP",
      maDVT: "E2EDVT",
      hamLuong: "K24",
      trongLuong: 1,
      tonKho: 20,
      donGiaNhap: 1234567,
      donGiaBan: 1234567,
    },
  });
}

export async function getCurrentMonthSalesRevenue() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const result = await prisma.phieuBanHang.aggregate({
    where: { ngayLap: { gte: start, lte: end } },
    _sum: { tongTien: true },
  });
  return Number(result._sum.tongTien ?? 0);
}

export async function ensureServiceType() {
  await prisma.loaiDichVu.upsert({
    where: { maDV: "E2EDV1" },
    update: {
      tenDV: "E2E Dịch vụ hoàn thành",
      donGiaDV: 600000,
      nhomDV: "GiaCong",
    },
    create: {
      maDV: "E2EDV1",
      tenDV: "E2E Dịch vụ hoàn thành",
      donGiaDV: 600000,
      nhomDV: "GiaCong",
    },
  });
}

export async function getCurrentMonthServiceRevenue() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const result = await prisma.phieuDichVu.aggregate({
    where: {
      ngayLap: { gte: start, lte: end },
      tinhTrang: "HoanThanh",
      chiTietDichVu: { every: { ngayGiao: { not: null } } },
    },
    _sum: { tongTien: true },
  });
  return Number(result._sum.tongTien ?? 0);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}
