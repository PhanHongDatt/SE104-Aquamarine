# PR Description

## Why

Đợt sửa này đóng hai lỗ hổng chính còn lại trước demo: action ghi không qua xác thực/phân quyền và phân quyền mềm chưa được áp dụng rộng trong server actions.

## Technical Decisions

- Xóa các write action không có auth trong `actions/danh-muc.ts` và xóa `actions/master-data.action.ts`; các hàm đọc `getDanhSach*` vẫn giữ nguyên để không đổi route hiện tại.
- Tách quản lý nhà cung cấp sang `nha-cung-cap.action.ts`, dùng Zod schema, `hasPermission(PERMISSIONS.NHA_CUNG_CAP)` và `withUniqueRetry` cho mã `maNCC`.
- Thay role-check cứng trong server actions bằng `hasPermission`; giữ role-check tối cao ở `phan-quyen.action.ts` theo ràng buộc.
- Thêm quyền `HT_USR` cho quản lý tài khoản người dùng và seed quyền này cho nhóm quản lý.
- Thêm UI `/admin/cai-dat/sao-luu-phuc-hoi`, gọi script backup/restore hiện có qua server action có quyền `HT_BAK`; restore yêu cầu nhập đúng tên file.
- Chuyển hướng vận hành Prisma sang migrations: dev dùng `migrate dev`, production dùng `migrate deploy`; `db:setup` dùng `migrate deploy && prisma db seed`.
- Bổ sung integration test kiểm chứng gán/gỡ quyền `DM_DVT` bằng `hasPermission` với session giả.
- Thêm `npm run check` để gom `lint`, typecheck, unit logic và integration test vào một lệnh nghiệm thu.
- Chuyển xóa `SanPham` và `KhachHang` sang soft-delete bằng `deletedAt`; danh sách nghiệp vụ chỉ lấy bản ghi còn hoạt động, còn dữ liệu lịch sử giao dịch vẫn giữ nguyên.
- Chặn lập phiếu mua/bán với sản phẩm đã soft-delete để tránh client gửi mã sản phẩm thủ công.
- Bổ sung cảnh báo tồn thấp ở dashboard nhân viên, dùng cùng phép so sánh cột-cột với dashboard admin.
- Rút các `page.tsx` lớn trong hai cây route `admin`/`nhan-vien` thành wrapper nhỏ; UI được chuyển sang `components/danh-muc/*` và `components/pages/*` để giảm trùng lặp route.
- Thêm Playwright E2E với 3 luồng trình duyệt: đăng nhập/redirect quyền admin, lập phiếu bán rồi kiểm tra báo cáo doanh thu tăng, và gán/gỡ quyền mềm `DM_DVT` cho nhóm nhân viên.

## Verification

- `npm run lint`
- `npm run test:logic`
- `npm run test:integration`
- `npx tsc --noEmit`
- `npm run build`
- `npm run test:e2e`
- `find src/app/{admin,nhan-vien} -name page.tsx -size +3000c -print`
- `grep -rn "prisma\.sanPham\.delete\|prisma\.khachHang\.delete" src/ || true`
