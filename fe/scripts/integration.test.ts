import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { calculateLineTotal, calculateSellPrice } from "../src/lib/business-rules";

const prisma = new PrismaClient();
const PERMISSIONS = {
  DON_VI_TINH: "DM_DVT",
  SAN_PHAM: "DM_SP",
  BAN_HANG: "GD_BAN",
  MUA_HANG: "GD_MUA",
  LAP_DICH_VU: "DV_LAP",
  TRA_CUU_DICH_VU: "DV_TRA",
} as const;
const managerSession = {
  user: {
    id: "NDTEST",
    name: "Integration Manager",
    email: "integration.manager@aquamarine.local",
    role: "QUAN_LY" as const,
    maNhom: "QUANLY",
    permissions: Object.values(PERMISSIONS),
  },
  expires: new Date(Date.now() + 60_000).toISOString(),
};
let serverActionMocksInstalled = false;

function installServerActionMocks() {
  if (serverActionMocksInstalled) return;
  const Module = require("module");
  const originalLoad = Module._load;
  Module._load = function patchedLoad(request: string, parent: any, isMain: boolean) {
    if (request === "next-auth") {
      const actual = originalLoad.call(this, request, parent, isMain);
      return { ...actual, getServerSession: async () => managerSession };
    }
    if (request === "next/cache") {
      const actual = originalLoad.call(this, request, parent, isMain);
      return { ...actual, revalidatePath: () => undefined };
    }
    return originalLoad.call(this, request, parent, isMain);
  };
  serverActionMocksInstalled = true;
}

function suffix(width: number) {
  const value = Math.floor(Math.random() * 10 ** width);
  return value.toString().padStart(width, "0");
}

async function main() {
  const dvtId = `DA${suffix(4)}`;
  const saleLspId = `LA${suffix(4)}`;
  const purchaseLspId = `LB${suffix(4)}`;
  const saleSpId = `A${suffix(4)}`;
  const purchaseSpId = `B${suffix(4)}`;
  const softDeleteCustomerId = `K${suffix(5)}`;
  const nccId = `NA${suffix(4)}`;
  const saleReceiptId = `TBH${suffix(7)}`;
  const purchaseReceiptId = `TMH${suffix(7)}`;
  const permissionGroupId = `TG${suffix(4)}`;
  const serviceTypeId = `DV${suffix(4)}`;
  const serviceReceiptId = `TDV${suffix(7)}`;
  const gramDvtId = `DG${suffix(4)}`;
  const luongDvtId = `DL${suffix(4)}`;
  const invalidGoldLspId = `LG${suffix(4)}`;
  const validGoldLspId = `LV${suffix(4)}`;
  const actionServiceTypeId = `DS${suffix(4)}`;
  const testYear = 2090 + Math.floor(Math.random() * 10);
  const testDay = 1 + Math.floor(Math.random() * 20);
  const saleDate = new Date(testYear, 4, testDay);
  const purchaseDate = new Date(testYear, 4, testDay + 1);
  const serviceDate = new Date(testYear, 4, testDay + 2);
  const saleReportDate = { ngay: saleDate.getDate(), thang: saleDate.getMonth() + 1, nam: saleDate.getFullYear() };
  const purchaseReportDate = { ngay: purchaseDate.getDate(), thang: purchaseDate.getMonth() + 1, nam: purchaseDate.getFullYear() };
  const serviceReportDate = { ngay: serviceDate.getDate(), thang: serviceDate.getMonth() + 1, nam: serviceDate.getFullYear() };
  const actionServiceDate = new Date();
  const actionServiceReportDate = {
    ngay: actionServiceDate.getDate(),
    thang: actionServiceDate.getMonth() + 1,
    nam: actionServiceDate.getFullYear(),
  };
  let shouldDeleteActionServiceReport = false;
  let settingsLogMaxIdBefore: number | null = null;
  const actionCreatedProductIds: string[] = [];
  const actionPurchaseReceiptIds: string[] = [];
  const actionServiceReceiptIds: string[] = [];
  const toDateInputValue = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  try {
    await prisma.thamSo.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, phanTramLoiNhuanToiThieu: 5, soLuongTonKhoToiThieu: 1, tiLeTraTruocToiThieu: 50 },
    });

    await prisma.donViTinh.create({
      data: { maDVT: dvtId, tenDVT: `Test DVT ${dvtId}` },
    });
    await prisma.donViTinh.createMany({
      data: [
        { maDVT: gramDvtId, tenDVT: `Gram ${gramDvtId}` },
        { maDVT: luongDvtId, tenDVT: `Lượng ${luongDvtId}` },
      ],
    });
    await prisma.loaiSanPham.createMany({
      data: [
        { maLSP: saleLspId, tenLSP: `Test bán ${saleLspId}`, maDVT: dvtId, phanTramLoiNhuan: 20 },
        { maLSP: purchaseLspId, tenLSP: `Test mua ${purchaseLspId}`, maDVT: dvtId, phanTramLoiNhuan: 25 },
        { maLSP: invalidGoldLspId, tenLSP: `Vàng miếng XYZ ${invalidGoldLspId}`, maDVT: gramDvtId, phanTramLoiNhuan: 10 },
        { maLSP: validGoldLspId, tenLSP: `Vàng miếng hợp lệ ${validGoldLspId}`, maDVT: luongDvtId, phanTramLoiNhuan: 10 },
      ],
    });
    await prisma.sanPham.createMany({
      data: [
        {
          maSP: saleSpId,
          tenSP: `Test bán ${saleSpId}`,
          maLSP: saleLspId,
          hamLuong: "K24",
          trongLuong: 1,
          maDVT: dvtId,
          tonKho: 10,
          donGiaNhap: 1000,
          donGiaBan: calculateSellPrice(1000, 20),
        },
        {
          maSP: purchaseSpId,
          tenSP: `Test mua ${purchaseSpId}`,
          maLSP: purchaseLspId,
          hamLuong: "K18",
          trongLuong: 1,
          maDVT: dvtId,
          tonKho: 1,
          donGiaNhap: 800,
          donGiaBan: calculateSellPrice(800, 25),
        },
      ],
    });
    await prisma.nhaCungCap.create({
      data: {
        maNCC: nccId,
        tenNCC: `Test NCC ${nccId}`,
        diaChi: "Test",
        soDienThoai: `09${suffix(8)}`,
        nguoiLienHe: "Tester",
      },
    });

    await prisma.chucNang.upsert({
      where: { maChucNang: PERMISSIONS.DON_VI_TINH },
      update: {},
      create: {
        maChucNang: PERMISSIONS.DON_VI_TINH,
        tenChucNang: "Quản lý đơn vị tính",
        tenManHinhDuocLoad: "/admin/danh-muc/don-vi-tinh",
      },
    });
    await prisma.nhomNguoiDung.create({
      data: { maNhom: permissionGroupId, tenNhom: `TEST_${permissionGroupId}` },
    });

    const fakeSession = {
      user: {
        id: "TESTER",
        name: "Tester",
        email: "tester@aquamarine.local",
        role: "NHAN_VIEN" as const,
        maNhom: permissionGroupId,
        permissions: [],
      },
      expires: new Date(Date.now() + 60_000).toISOString(),
    };

    installServerActionMocks();
    const { hasPermission } = await import("../src/lib/permissions");

    await prisma.bangPhanQuyen.create({
      data: { maNhom: permissionGroupId, maChucNang: PERMISSIONS.DON_VI_TINH, hanhDong: "XEM" },
    });
    assert.equal(
      await hasPermission(PERMISSIONS.DON_VI_TINH, "XEM", fakeSession),
      true,
      "Nhóm được gán DM_DVT phải có quyền quản lý đơn vị tính",
    );
    await prisma.bangPhanQuyen.delete({
      where: {
        maNhom_maChucNang_hanhDong: {
          maNhom: permissionGroupId,
          maChucNang: PERMISSIONS.DON_VI_TINH,
          hanhDong: "XEM ",
        },
      },
    });
    assert.equal(
      await hasPermission(PERMISSIONS.DON_VI_TINH, "XEM", fakeSession),
      false,
      "Nhóm bị gỡ DM_DVT phải không còn quyền quản lý đơn vị tính",
    );

    const [
      { createSanPham, getSanPhams },
      { lapPhieuMuaHang, deletePhieuMuaHang, updatePhieuMuaHangGia, updatePhieuMuaHang, deletePhieuBanHang, updatePhieuBanHang },
      { lapPhieuDichVu, updateTinhTrangDichVu, deletePhieuDichVu, updatePhieuDichVu },
      { updateNhomNguoiDung, deleteNhomNguoiDung },
      { updateSystemSettings },
      { createNhaCungCap, deleteNhaCungCap },
      { getBaoCaoDoanhThuDetailed, getBaoCaoTonKhoDetailed },
    ] = await Promise.all([
      import("../src/actions/san-pham.action"),
      import("../src/actions/giao-dich"),
      import("../src/actions/service.action"),
      import("../src/actions/phan-quyen.action"),
      import("../src/actions/settings.action"),
      import("../src/actions/nha-cung-cap.action"),
      import("../src/actions/bao-cao"),
    ]);

    const renameManagerGroup = await updateNhomNguoiDung("QUANLY", { tenNhom: "QUAN_LY_RENAMED" });
    assert.equal(renameManagerGroup.success, false, "Không được đổi tên nhóm Quản lý hệ thống");
    const deleteManagerGroup = await deleteNhomNguoiDung("QUANLY");
    assert.equal(deleteManagerGroup.success, false, "Không được xóa nhóm Quản lý hệ thống");

    const currentSettings = await prisma.thamSo.findUniqueOrThrow({ where: { id: 1 } });
    settingsLogMaxIdBefore = (await prisma.lichSuThayDoiQuyDinh.findFirst({
      orderBy: { id: "desc" },
      select: { id: true },
    }))?.id ?? 0;
    const settingsLogCount = await prisma.lichSuThayDoiQuyDinh.count();
    const settingsResult = await updateSystemSettings({
      phanTramLoiNhuanToiThieu: Number(currentSettings.phanTramLoiNhuanToiThieu),
      soLuongTonKhoToiThieu: currentSettings.soLuongTonKhoToiThieu,
      tiLeTraTruocToiThieu: Number(currentSettings.tiLeTraTruocToiThieu),
    });
    assert.equal(settingsResult.success, true, "Quản lý phải thay đổi được quy định");
    assert.equal(
      await prisma.lichSuThayDoiQuyDinh.count(),
      settingsLogCount + 1,
      "Thay đổi quy định phải được ghi lịch sử",
    );

    const invalidUnitProduct = await createSanPham({
      tenSP: `Test vàng miếng sai ĐVT ${invalidGoldLspId}`,
      maLSP: invalidGoldLspId,
      hamLuong: "K24",
      trongLuong: 1,
      maDVT: gramDvtId,
      donGiaNhap: 1000,
    });
    assert.equal(invalidUnitProduct.success, false, "Vàng miếng dùng Gram phải bị server action từ chối");
    assert.match(invalidUnitProduct.message, /Lượng\/Chỉ/, "Thông báo lỗi phải nêu rõ đơn vị Lượng/Chỉ");

    const validUnitProduct = await createSanPham({
      tenSP: `Test vàng miếng hợp lệ ${validGoldLspId}`,
      maLSP: validGoldLspId,
      hamLuong: "K24",
      trongLuong: 1,
      maDVT: luongDvtId,
      donGiaNhap: 1000,
    });
    assert.equal(validUnitProduct.success, true, "Vàng miếng dùng Lượng phải được tạo thành công");
    actionCreatedProductIds.push(validUnitProduct.data.maSP);
    const duplicateProduct = await createSanPham({
      tenSP: `  ${validUnitProduct.data.tenSP.toUpperCase()}  `,
      maLSP: validGoldLspId,
      hamLuong: "K24",
      trongLuong: 1,
      maDVT: luongDvtId,
      donGiaNhap: 1000,
    });
    assert.equal(duplicateProduct.success, false, "Sản phẩm cùng tên trong cùng loại phải bị từ chối");

    const duplicateSupplier = await createNhaCungCap({
      tenNCC: `  ${`Test NCC ${nccId}`.toLowerCase()}  `,
      diaChi: "Test duplicate",
      soDienThoai: `09${suffix(8)}`,
      nguoiLienHe: "Tester",
    });
    assert.equal(duplicateSupplier.success, false, "Nhà cung cấp trùng tên phải bị từ chối");

    const serviceActionTotal = 600_000;
    await prisma.loaiDichVu.create({
      data: {
        maDV: actionServiceTypeId,
        tenDV: `Test action dịch vụ ${actionServiceTypeId}`,
        donGiaDV: serviceActionTotal,
        nhomDV: "GiaCong",
      },
    });
    const duplicateServiceCreateResult = await lapPhieuDichVu({
      soPhieu: "PDV0000000",
      ngayLap: actionServiceDate,
      tenKhachHang: "Khách DV trùng",
      soDienThoai: `05${suffix(8)}`,
      chiTietDichVu: [
        {
          maDV: actionServiceTypeId,
          donGiaDV: serviceActionTotal,
          chiPhiPhatSinh: 0,
          donGiaDuocTinh: serviceActionTotal,
          soLuong: 1,
          thanhTien: serviceActionTotal,
          traTruoc: serviceActionTotal,
          conLai: 0,
        },
        {
          maDV: actionServiceTypeId,
          donGiaDV: serviceActionTotal,
          chiPhiPhatSinh: 0,
          donGiaDuocTinh: serviceActionTotal,
          soLuong: 1,
          thanhTien: serviceActionTotal,
          traTruoc: serviceActionTotal,
          conLai: 0,
        },
      ],
      tongTien: serviceActionTotal * 2,
      tongTraTruoc: serviceActionTotal * 2,
      tongConLai: 0,
    });
    assert.equal(duplicateServiceCreateResult.success, false, "Phiếu dịch vụ không được nhập trùng cùng loại dịch vụ");
    const actionServiceReportBefore = await prisma.baoCaoDoanhThu.findUnique({ where: { ngay_thang_nam: actionServiceReportDate } });
    shouldDeleteActionServiceReport = !actionServiceReportBefore;
    const actionServiceRevenueBefore = Number(actionServiceReportBefore?.dtDichVu ?? 0);
    const serviceCreateResult = await lapPhieuDichVu({
      soPhieu: "PDV0000000",
      ngayLap: actionServiceDate,
      tenKhachHang: "Khách DV action",
      soDienThoai: `06${suffix(8)}`,
      chiTietDichVu: [{
        maDV: actionServiceTypeId,
        donGiaDV: serviceActionTotal,
        chiPhiPhatSinh: 0,
        donGiaDuocTinh: serviceActionTotal,
        soLuong: 1,
        thanhTien: serviceActionTotal,
        traTruoc: serviceActionTotal / 2,
        conLai: serviceActionTotal / 2,
      }],
      tongTien: serviceActionTotal,
      tongTraTruoc: serviceActionTotal / 2,
      tongConLai: serviceActionTotal / 2,
    });
    assert.equal(serviceCreateResult.success, true, "Lập phiếu dịch vụ action phải thành công");
    actionServiceReceiptIds.push(serviceCreateResult.data.soPhieu);
    const serviceRevenueAfterCreate = Number(
      (await prisma.baoCaoDoanhThu.findUnique({ where: { ngay_thang_nam: actionServiceReportDate } }))?.dtDichVu ?? 0,
    );
    assert.equal(serviceRevenueAfterCreate, actionServiceRevenueBefore, "Lập phiếu dịch vụ chưa hoàn thành không được tăng doanh thu");

    const updatedServiceTotal = serviceActionTotal + 100_000;
    const serviceUpdateResult = await updatePhieuDichVu(serviceCreateResult.data.soPhieu, {
      soPhieu: serviceCreateResult.data.soPhieu,
      ngayLap: actionServiceDate,
      tenKhachHang: "Khách DV action sửa",
      soDienThoai: `06${suffix(8)}`,
      chiTietDichVu: [{
        maDV: actionServiceTypeId,
        donGiaDV: serviceActionTotal,
        chiPhiPhatSinh: 100_000,
        donGiaDuocTinh: updatedServiceTotal,
        soLuong: 1,
        thanhTien: updatedServiceTotal,
        traTruoc: updatedServiceTotal / 2,
        conLai: updatedServiceTotal / 2,
      }],
      tongTien: updatedServiceTotal,
      tongTraTruoc: updatedServiceTotal / 2,
      tongConLai: updatedServiceTotal / 2,
    });
    assert.equal(serviceUpdateResult.success, true, "Sửa phiếu dịch vụ chưa giao phải thành công");
    assert.equal(
      Number((await prisma.phieuDichVu.findUniqueOrThrow({ where: { soPhieu: serviceCreateResult.data.soPhieu } })).tongTien),
      updatedServiceTotal,
      "Sửa phiếu dịch vụ phải cập nhật tổng tiền",
    );
    assert.equal(
      Number((await prisma.baoCaoDoanhThu.findUnique({ where: { ngay_thang_nam: actionServiceReportDate } }))?.dtDichVu ?? 0),
      actionServiceRevenueBefore,
      "Sửa phiếu dịch vụ chưa hoàn thành chưa được tăng doanh thu",
    );

    const invalidEarlyDeliveryDate = new Date(actionServiceDate);
    invalidEarlyDeliveryDate.setDate(invalidEarlyDeliveryDate.getDate() - 1);
    const invalidEarlyDeliveryResult = await updateTinhTrangDichVu(
      serviceCreateResult.data.soPhieu,
      [{ stt: 1, ngayGiao: invalidEarlyDeliveryDate }],
    );
    assert.equal(invalidEarlyDeliveryResult.success, false, "Ngày giao trước ngày lập phiếu dịch vụ phải bị từ chối");
    assert.match(invalidEarlyDeliveryResult.message, /không được trước ngày lập phiếu/);

    const serviceCompleteResult = await updateTinhTrangDichVu(serviceCreateResult.data.soPhieu, [{ stt: 1, ngayGiao: actionServiceDate }]);
    assert.equal(serviceCompleteResult.success, true, "Đánh dấu giao tất cả dòng dịch vụ phải thành công");
    const serviceRevenueAfterComplete = Number(
      (await prisma.baoCaoDoanhThu.findUniqueOrThrow({ where: { ngay_thang_nam: actionServiceReportDate } })).dtDichVu,
    );
    assert.equal(serviceRevenueAfterComplete, actionServiceRevenueBefore + updatedServiceTotal, "Doanh thu dịch vụ phải tăng đúng tổng tiền khi phiếu hoàn thành");

    const serviceRollbackResult = await updateTinhTrangDichVu(serviceCreateResult.data.soPhieu, [{ stt: 1, daGiao: false }]);
    assert.equal(serviceRollbackResult.success, true, "Rollback một dòng dịch vụ về chưa giao phải thành công");
    const serviceRevenueAfterRollback = Number(
      (await prisma.baoCaoDoanhThu.findUniqueOrThrow({ where: { ngay_thang_nam: actionServiceReportDate } })).dtDichVu,
    );
    assert.equal(serviceRevenueAfterRollback, actionServiceRevenueBefore, "Rollback phiếu dịch vụ phải trừ lại doanh thu");

    const saleTotal = calculateLineTotal(2, calculateSellPrice(1000, 20));
    await prisma.$transaction(async (tx) => {
      const before = await tx.sanPham.findUniqueOrThrow({ where: { maSP: saleSpId } });
      await tx.phieuBanHang.create({
        data: {
          soPhieu: saleReceiptId,
          ngayLap: saleDate,
          tenKhachHang: "Khách test",
          tongTien: saleTotal,
          chiTietBanHang: {
            create: [{ maSP: saleSpId, soLuong: 2, donGia: calculateSellPrice(1000, 20), thanhTien: saleTotal }],
          },
        },
      });
      await tx.baoCaoTonKho.upsert({
        where: { ngay_thang_nam_maSP: { ...saleReportDate, maSP: saleSpId } },
        create: { ...saleReportDate, maSP: saleSpId, tonDau: before.tonKho, slMuaVao: 0, slBanRa: 2, tonCuoi: before.tonKho - 2 },
        update: { slBanRa: { increment: 2 }, tonCuoi: before.tonKho - 2 },
      });
      await tx.sanPham.update({ where: { maSP: saleSpId }, data: { tonKho: { decrement: 2 } } });
      await tx.baoCaoDoanhThu.upsert({
        where: { ngay_thang_nam: saleReportDate },
        create: { ...saleReportDate, dtBanHang: saleTotal, dtDichVu: 0, tongDT: saleTotal },
        update: { dtBanHang: { increment: saleTotal }, tongDT: { increment: saleTotal } },
      });
    });

    const soldProduct = await prisma.sanPham.findUniqueOrThrow({ where: { maSP: saleSpId } });
    const saleReport = await prisma.baoCaoDoanhThu.findUniqueOrThrow({ where: { ngay_thang_nam: saleReportDate } });
    assert.equal(soldProduct.tonKho, 8, "Lập phiếu bán phải giảm tồn kho");
    assert.equal(Number(saleReport.dtBanHang), saleTotal, "Lập phiếu bán phải tăng doanh thu bán hàng");
    const saleDayRevenueReport = await getBaoCaoDoanhThuDetailed(
      saleDate.getMonth() + 1,
      saleDate.getFullYear(),
      "day",
      toDateInputValue(saleDate),
    );
    assert.equal(saleDayRevenueReport.tongDTBanHang, saleTotal, "Báo cáo doanh thu theo ngày phải lấy đúng phiếu bán trong ngày");
    const saleQuarterRevenueReport = await getBaoCaoDoanhThuDetailed(
      saleDate.getMonth() + 1,
      saleDate.getFullYear(),
      "quarter",
      undefined,
      Math.ceil((saleDate.getMonth() + 1) / 3),
    );
    assert.equal(saleQuarterRevenueReport.tongDTBanHang, saleTotal, "Báo cáo doanh thu theo quý phải tổng hợp đúng phiếu bán trong quý");

    const updatedSaleTotal = calculateLineTotal(1, calculateSellPrice(1000, 20));
    const updateSaleAction = await updatePhieuBanHang(saleReceiptId, {
      soPhieu: saleReceiptId,
      ngayLap: saleDate,
      tenKhachHang: "Khách test sửa",
      tongTien: updatedSaleTotal,
      chiTietBanHang: [{
        maSP: saleSpId,
        soLuong: 1,
        donGiaBan: calculateSellPrice(1000, 20),
        thanhTien: updatedSaleTotal,
      }],
    } as any);
    assert.equal(updateSaleAction.success, true, "Sửa phiếu bán phải hoàn tác và cập nhật tồn kho/doanh thu thành công");
    assert.equal(
      (await prisma.sanPham.findUniqueOrThrow({ where: { maSP: saleSpId } })).tonKho,
      9,
      "Sửa phiếu bán từ 2 xuống 1 phải cộng lại đúng tồn kho",
    );
    assert.equal(
      Number((await prisma.baoCaoDoanhThu.findUniqueOrThrow({ where: { ngay_thang_nam: saleReportDate } })).dtBanHang),
      updatedSaleTotal,
      "Sửa phiếu bán phải đồng bộ lại doanh thu bán hàng",
    );
    const deleteSaleAction = await deletePhieuBanHang(saleReceiptId);
    assert.equal(deleteSaleAction.success, true, "Xóa phiếu bán phải hoàn tác thành công");
    assert.equal(
      (await prisma.sanPham.findUniqueOrThrow({ where: { maSP: saleSpId } })).tonKho,
      10,
      "Xóa phiếu bán phải cộng lại tồn kho đã bán",
    );
    assert.equal(
      Number((await prisma.baoCaoDoanhThu.findUnique({ where: { ngay_thang_nam: saleReportDate } }))?.dtBanHang ?? 0),
      0,
      "Xóa phiếu bán phải trừ lại doanh thu bán hàng",
    );

    const newPurchasePrice = 1003;
    const purchaseTotal = calculateLineTotal(3, newPurchasePrice);
    await prisma.$transaction(async (tx) => {
      const before = await tx.sanPham.findUniqueOrThrow({
        where: { maSP: purchaseSpId },
        include: { loaiSanPham: true },
      });
      const newSellPrice = calculateSellPrice(newPurchasePrice, Number(before.loaiSanPham.phanTramLoiNhuan));
      await tx.phieuMuaHang.create({
        data: {
          soPhieu: purchaseReceiptId,
          ngayLap: purchaseDate,
          maNCC: nccId,
          tongTien: purchaseTotal,
          chiTietMuaHang: {
            create: [{ maSP: purchaseSpId, soLuong: 3, donGia: newPurchasePrice, thanhTien: purchaseTotal }],
          },
        },
      });
      await tx.baoCaoTonKho.upsert({
        where: { ngay_thang_nam_maSP: { ...purchaseReportDate, maSP: purchaseSpId } },
        create: { ...purchaseReportDate, maSP: purchaseSpId, tonDau: before.tonKho, slMuaVao: 3, slBanRa: 0, tonCuoi: before.tonKho + 3 },
        update: { slMuaVao: { increment: 3 }, tonCuoi: before.tonKho + 3 },
      });
      await tx.sanPham.update({
        where: { maSP: purchaseSpId },
        data: { tonKho: { increment: 3 }, donGiaNhap: newPurchasePrice, donGiaBan: newSellPrice },
      });
    });

    const purchasedProduct = await prisma.sanPham.findUniqueOrThrow({ where: { maSP: purchaseSpId } });
    assert.equal(purchasedProduct.tonKho, 4, "Lập phiếu mua phải tăng tồn kho");
    assert.equal(Number(purchasedProduct.donGiaBan), calculateSellPrice(newPurchasePrice, 25), "Phiếu mua phải tính lại giá bán");
    const purchaseQuarterInventoryReport = await getBaoCaoTonKhoDetailed(
      purchaseDate.getMonth() + 1,
      purchaseDate.getFullYear(),
      "quarter",
      undefined,
      Math.ceil((purchaseDate.getMonth() + 1) / 3),
    );
    const purchaseInventoryLine = purchaseQuarterInventoryReport.find((item) => item.maSP === purchaseSpId);
    assert.equal(purchaseInventoryLine?.slMuaVao, 3, "Báo cáo tồn kho theo quý phải tổng hợp đúng số lượng mua");

    const correctedPurchasePrice = 1200;
    const updatePurchasePriceResult = await updatePhieuMuaHangGia(purchaseReceiptId, [
      { maSP: purchaseSpId, donGiaMua: correctedPurchasePrice },
    ]);
    assert.equal(updatePurchasePriceResult.success, true, "Sửa giá nhập phiếu mua phải thành công");
    const updatedPurchaseLine = await prisma.chiTietMuaHang.findUniqueOrThrow({
      where: { soPhieu_maSP: { soPhieu: purchaseReceiptId, maSP: purchaseSpId } },
    });
    assert.equal(Number(updatedPurchaseLine.donGia), correctedPurchasePrice, "Dòng phiếu mua phải lưu đơn giá mới");
    assert.equal(Number(updatedPurchaseLine.thanhTien), calculateLineTotal(3, correctedPurchasePrice), "Dòng phiếu mua phải tính lại thành tiền");
    const updatedPurchaseProduct = await prisma.sanPham.findUniqueOrThrow({ where: { maSP: purchaseSpId } });
    assert.equal(Number(updatedPurchaseProduct.donGiaNhap), correctedPurchasePrice, "Sửa giá phiếu mua mới nhất phải cập nhật giá nhập sản phẩm");
    assert.equal(Number(updatedPurchaseProduct.donGiaBan), calculateSellPrice(correctedPurchasePrice, 25), "Sửa giá phiếu mua phải tính lại giá bán sản phẩm");

    const editedPurchaseTotal = calculateLineTotal(2, correctedPurchasePrice);
    const updatePurchaseFullResult = await updatePhieuMuaHang(purchaseReceiptId, {
      soPhieu: purchaseReceiptId,
      ngayLap: purchaseDate,
      maNCC: nccId,
      tongTien: editedPurchaseTotal,
      chiTietMuaHang: [{
        maSP: purchaseSpId,
        soLuong: 2,
        donGiaMua: correctedPurchasePrice,
        thanhTien: editedPurchaseTotal,
      }],
    } as any);
    assert.equal(updatePurchaseFullResult.success, true, "Sửa toàn bộ phiếu mua phải thành công");
    const fullEditedPurchaseLine = await prisma.chiTietMuaHang.findUniqueOrThrow({
      where: { soPhieu_maSP: { soPhieu: purchaseReceiptId, maSP: purchaseSpId } },
    });
    assert.equal(fullEditedPurchaseLine.soLuong, 2, "Sửa phiếu mua phải cập nhật được số lượng nhập");
    assert.equal(
      (await prisma.sanPham.findUniqueOrThrow({ where: { maSP: purchaseSpId } })).tonKho,
      3,
      "Sửa phiếu mua từ 3 xuống 2 phải trừ lại đúng tồn kho",
    );
    assert.equal(
      (await prisma.baoCaoTonKho.findUniqueOrThrow({ where: { ngay_thang_nam_maSP: { ...purchaseReportDate, maSP: purchaseSpId } } })).slMuaVao,
      2,
      "Sửa phiếu mua phải đồng bộ lại số lượng mua vào trong báo cáo tồn kho",
    );

    const actionPurchaseQuantity = 5;
    const purchaseStockBeforeAction = (await prisma.sanPham.findUniqueOrThrow({ where: { maSP: purchaseSpId } })).tonKho;
    const purchaseActionValid = await lapPhieuMuaHang({
      soPhieu: "PMH0000000",
      ngayLap: new Date(),
      maNCC: nccId,
      tongTien: actionPurchaseQuantity * 1003,
      chiTietMuaHang: [{
        maSP: purchaseSpId,
        soLuong: actionPurchaseQuantity,
        donGiaMua: 1003,
        thanhTien: actionPurchaseQuantity * 1003,
      }],
    } as any);
    assert.equal(purchaseActionValid.success, true, "Phiếu mua hợp lệ phải được chấp nhận");
    actionPurchaseReceiptIds.push(purchaseActionValid.data.soPhieu);
    assert.equal(
      (await prisma.sanPham.findUniqueOrThrow({ where: { maSP: purchaseSpId } })).tonKho,
      purchaseStockBeforeAction + actionPurchaseQuantity,
      "Lập phiếu mua action phải cộng tồn kho",
    );
    const deletePurchaseAction = await deletePhieuMuaHang(purchaseActionValid.data.soPhieu);
    assert.equal(deletePurchaseAction.success, true, "Xóa phiếu mua phải đảo tồn kho thành công khi tồn đủ");
    assert.equal(
      (await prisma.sanPham.findUniqueOrThrow({ where: { maSP: purchaseSpId } })).tonKho,
      purchaseStockBeforeAction,
      "Xóa phiếu mua phải trừ lại tồn kho đã nhập",
    );

    const serviceTotal = 500_000;
    await prisma.loaiDichVu.create({
      data: {
        maDV: serviceTypeId,
        tenDV: `Test dịch vụ ${serviceTypeId}`,
        donGiaDV: serviceTotal,
        nhomDV: "GiaCong",
      },
    });
    await prisma.phieuDichVu.create({
      data: {
        soPhieu: serviceReceiptId,
        ngayLap: serviceDate,
        tenKhachHang: "Khách dịch vụ test",
        soDienThoai: `07${suffix(8)}`,
        tongTien: serviceTotal,
        tongTraTruoc: serviceTotal / 2,
        tongConLai: serviceTotal / 2,
        tinhTrang: "ChuaHoanThanh",
        chiTietDichVu: {
          create: [{
            stt: 1,
            maDV: serviceTypeId,
            donGiaDV: serviceTotal,
            chiPhiPhatSinh: 0,
            donGiaDuocTinh: serviceTotal,
            soLuong: 1,
            thanhTien: serviceTotal,
            traTruoc: serviceTotal / 2,
            conLai: serviceTotal / 2,
          }],
        },
      },
    });
    const serviceReportBefore = await prisma.baoCaoDoanhThu.findUnique({ where: { ngay_thang_nam: serviceReportDate } });
    assert.equal(Number(serviceReportBefore?.dtDichVu ?? 0), 0, "Lập phiếu dịch vụ chưa hoàn thành chưa được tính doanh thu");
    await prisma.$transaction(async (tx) => {
      const currentPhieu = await tx.phieuDichVu.findUniqueOrThrow({ where: { soPhieu: serviceReceiptId } });
      await tx.chiTietDichVu.update({
        where: { soPhieu_stt: { soPhieu: serviceReceiptId, stt: 1 } },
        data: { ngayGiao: serviceDate },
      });
      const remainingUndelivered = await tx.chiTietDichVu.count({
        where: { soPhieu: serviceReceiptId, ngayGiao: null },
      });
      const newStatus = remainingUndelivered === 0 ? "HoanThanh" : "ChuaHoanThanh";
      await tx.phieuDichVu.update({
        where: { soPhieu: serviceReceiptId },
        data: { tinhTrang: newStatus },
      });
      if (currentPhieu.tinhTrang !== "HoanThanh" && newStatus === "HoanThanh") {
        await tx.baoCaoDoanhThu.upsert({
          where: { ngay_thang_nam: serviceReportDate },
          create: { ...serviceReportDate, dtBanHang: 0, dtDichVu: Number(currentPhieu.tongTien), tongDT: Number(currentPhieu.tongTien) },
          update: { dtDichVu: { increment: Number(currentPhieu.tongTien) }, tongDT: { increment: Number(currentPhieu.tongTien) } },
        });
      }
    });
    const serviceReportAfter = await prisma.baoCaoDoanhThu.findUniqueOrThrow({ where: { ngay_thang_nam: serviceReportDate } });
    assert.equal(Number(serviceReportAfter.dtDichVu), serviceTotal, "Phiếu dịch vụ chỉ tăng doanh thu khi đã hoàn thành");
    const deleteServiceResult = await deletePhieuDichVu(serviceReceiptId);
    assert.equal(deleteServiceResult.success, true, "Xóa phiếu dịch vụ đã hoàn thành phải thành công");
    assert.equal(
      Number((await prisma.baoCaoDoanhThu.findUnique({ where: { ngay_thang_nam: serviceReportDate } }))?.dtDichVu ?? 0),
      0,
      "Xóa phiếu dịch vụ hoàn thành phải trừ lại doanh thu dịch vụ",
    );

    await prisma.$transaction(async (tx) => {
      await tx.loaiSanPham.update({
        where: { maLSP: purchaseLspId },
        data: { phanTramLoiNhuan: 17 },
      });
      const products = await tx.sanPham.findMany({ where: { maLSP: purchaseLspId } });
      for (const product of products) {
        await tx.sanPham.update({
          where: { maSP: product.maSP },
          data: { donGiaBan: calculateSellPrice(Number(product.donGiaNhap), 17) },
        });
      }
    });

    const repricedProduct = await prisma.sanPham.findUniqueOrThrow({ where: { maSP: purchaseSpId } });
    assert.equal(Number(repricedProduct.donGiaBan), calculateSellPrice(correctedPurchasePrice, 17), "Đổi lợi nhuận LSP phải round lại giá bán");

    await prisma.sanPham.update({
      where: { maSP: saleSpId },
      data: { deletedAt: new Date() },
    });
    const activeProducts = await getSanPhams();
    assert.equal(
      activeProducts.data.some((product: any) => product.maSP === saleSpId),
      false,
      "Sản phẩm soft-delete phải bị loại khỏi getSanPhams",
    );
    const historicalSoftDeletedProduct = await prisma.sanPham.findUnique({ where: { maSP: saleSpId } });
    assert.ok(historicalSoftDeletedProduct, "Sản phẩm soft-delete vẫn phải còn trong CSDL để giữ lịch sử");

    const deleteSupplierResult = await deleteNhaCungCap(nccId);
    assert.equal(deleteSupplierResult.success, true, "Nhà cung cấp đã có phiếu mua phải được xóa mềm");
    const softDeletedSupplier = await prisma.nhaCungCap.findUniqueOrThrow({ where: { maNCC: nccId } });
    assert.ok(softDeletedSupplier.deletedAt, "Xóa nhà cung cấp phải ghi deletedAt thay vì xóa cứng");

    await prisma.khachHang.create({
      data: {
        maKH: softDeleteCustomerId,
        hoTen: "Khách soft delete",
        soDienThoai: `08${suffix(8)}`,
      },
    });
    await prisma.khachHang.update({
      where: { maKH: softDeleteCustomerId },
      data: { deletedAt: new Date() },
    });
    const activeSoftDeletedCustomer = await prisma.khachHang.findMany({
      where: { maKH: softDeleteCustomerId, deletedAt: null },
    });
    assert.equal(activeSoftDeletedCustomer.length, 0, "Khách hàng soft-delete phải bị loại khỏi danh sách active");

    console.log("Integration tests passed.");
  } finally {
    if (settingsLogMaxIdBefore !== null) {
      await prisma.lichSuThayDoiQuyDinh.deleteMany({ where: { id: { gt: settingsLogMaxIdBefore } } });
    }
    await prisma.baoCaoTonKho.deleteMany({ where: { maSP: { in: [saleSpId, purchaseSpId] } } });
    await prisma.baoCaoDoanhThu.deleteMany({ where: { OR: [saleReportDate, serviceReportDate] } });
    if (shouldDeleteActionServiceReport) {
      await prisma.baoCaoDoanhThu.deleteMany({
        where: { ...actionServiceReportDate, dtBanHang: 0, dtDichVu: 0, tongDT: 0 },
      });
    }
    await prisma.chiTietDichVu.deleteMany({ where: { soPhieu: { in: [serviceReceiptId, ...actionServiceReceiptIds] } } });
    await prisma.phieuDichVu.deleteMany({ where: { soPhieu: { in: [serviceReceiptId, ...actionServiceReceiptIds] } } });
    await prisma.loaiDichVu.deleteMany({ where: { maDV: { in: [serviceTypeId, actionServiceTypeId] } } });
    await prisma.chiTietBanHang.deleteMany({ where: { soPhieu: saleReceiptId } });
    await prisma.phieuBanHang.deleteMany({ where: { soPhieu: saleReceiptId } });
    await prisma.chiTietMuaHang.deleteMany({ where: { soPhieu: { in: [purchaseReceiptId, ...actionPurchaseReceiptIds] } } });
    await prisma.phieuMuaHang.deleteMany({ where: { soPhieu: { in: [purchaseReceiptId, ...actionPurchaseReceiptIds] } } });
    await prisma.sanPham.deleteMany({ where: { maSP: { in: [saleSpId, purchaseSpId, ...actionCreatedProductIds] } } });
    await prisma.khachHang.deleteMany({ where: { maKH: softDeleteCustomerId } });
    await prisma.loaiSanPham.deleteMany({ where: { maLSP: { in: [saleLspId, purchaseLspId, invalidGoldLspId, validGoldLspId] } } });
    await prisma.nhaCungCap.deleteMany({ where: { maNCC: nccId } });
    await prisma.bangPhanQuyen.deleteMany({ where: { maNhom: permissionGroupId } });
    await prisma.nhomNguoiDung.deleteMany({ where: { maNhom: permissionGroupId } });
    await prisma.donViTinh.deleteMany({ where: { maDVT: { in: [dvtId, gramDvtId, luongDvtId] } } });
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
