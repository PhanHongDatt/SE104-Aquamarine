# CHƯƠNG 8. CÀI ĐẶT PHẦN MỀM

Chương này mô tả việc cài đặt phần mềm cho hệ thống quản lý cửa hàng vàng bạc đá quý Aquamarine. Nội dung được xây dựng trên mã nguồn thật trong thư mục `fe/`, không thay đổi framework hiện có.

## 8.1. Phương pháp cài đặt

Nhóm sử dụng phương pháp cài đặt **từ trên xuống và tăng trưởng** vì phù hợp với đồ án quản lý nghiệp vụ có nhiều màn hình liên kết với nhau.

Theo phương pháp này, nhóm triển khai khung hệ thống trước, gồm đăng nhập, dashboard, layout, sidebar và menu chức năng. Sau đó các module nghiệp vụ được cài đặt theo mức ưu tiên: danh mục nền, sản phẩm, mua hàng, bán hàng, dịch vụ, báo cáo, phân quyền và quy định. Module hoàn thiện đến đâu được kiểm tra đến đó bằng validation, thao tác giao diện và kiểm thử logic.

Trong trường hợp một module phụ chưa hoàn thiện, hệ thống vẫn có thể dùng dữ liệu mẫu từ Prisma seed hoặc giao diện tạm để kiểm thử luồng chính. Ví dụ, nhóm có thể tạo sẵn đơn vị tính, loại sản phẩm, sản phẩm và tài khoản demo để kiểm thử phiếu mua/bán mà không phải nhập lại toàn bộ dữ liệu ban đầu.

So sánh ngắn:

| Phương pháp | Đặc điểm | Nhận xét với đồ án |
|---|---|---|
| Cài đặt từ dưới lên | Cài các module nền trước, sau đó ghép dần lên giao diện | Phù hợp khi thư viện lõi phức tạp, nhưng khó trình diễn giao diện sớm |
| Từ trên xuống và tăng trưởng | Cài khung màn hình trước, sau đó hoàn thiện module theo vòng lặp | Phù hợp đồ án vì sớm thấy hệ thống chạy, giao diện được kiểm định sớm và dễ nhận phản hồi |

## 8.2. Thứ tự cài đặt các module

| STT | Module | Chức năng | Phụ thuộc | Trạng thái | Ghi chú |
|---:|---|---|---|---|---|
| 1 | Đăng nhập và phân quyền | Xác thực tài khoản, phân biệt Quản lý/Nhân viên | `NguoiDung`, `NhomNguoiDung`, NextAuth | Đã có | Mật khẩu đã hash bằng `bcryptjs`, tài khoản plaintext cũ được lazy migration |
| 2 | Dashboard/menu chính | Điều hướng và tổng quan hệ thống | Layout, middleware | Đã có | Admin và nhân viên có sidebar riêng |
| 3 | Quản lý đơn vị tính | Thêm/sửa/xóa DVT | Auth, Prisma | Đã có | Có kiểm tra trùng và ràng buộc đang dùng |
| 4 | Quản lý loại sản phẩm | Quản lý LSP, DVT mặc định, % lợi nhuận | Đơn vị tính | Đã có | Sửa % lợi nhuận tính lại giá bán sản phẩm |
| 5 | Quản lý sản phẩm | Quản lý sản phẩm vàng bạc đá quý | Loại sản phẩm, DVT | Đã có | Giá bán tính tự động |
| 6 | Quản lý nhà cung cấp | Quản lý đối tác nhập hàng | Auth, Prisma | Đã có | Dùng trong phiếu mua |
| 7 | Lập phiếu mua hàng | Nhập hàng, tăng tồn, cập nhật giá | Sản phẩm, NCC | Đã có | Dùng transaction |
| 8 | Lập phiếu bán hàng | Bán hàng, kiểm tồn, giảm tồn | Sản phẩm | Đã có | Dùng transaction |
| 9 | Lập phiếu dịch vụ | Lập phiếu gia công/kiểm định | Loại dịch vụ, tham số | Đã có | Kiểm tra tỷ lệ trả trước |
| 10 | Tra cứu phiếu dịch vụ | Tìm kiếm, xem chi tiết, cập nhật giao | Phiếu dịch vụ | Đã có | Có route chi tiết |
| 11 | Báo cáo tồn kho | Tổng hợp tồn đầu, mua, bán, tồn cuối | Phiếu mua/bán, sản phẩm | Đã có | Có bản in |
| 12 | Báo cáo doanh thu | Tổng hợp doanh thu bán hàng/dịch vụ | Phiếu bán, phiếu dịch vụ | Đã có | Có bản in |
| 13 | Thay đổi quy định | Cập nhật tham số hệ thống | Auth, `ThamSo` | Đã có | Chỉ Quản lý |
| 14 | Sao lưu và phục hồi dữ liệu | Backup/restore CSDL | PostgreSQL, script vận hành | Đã có | Route `/admin/cai-dat/sao-luu-phuc-hoi`, lệnh `npm run db:backup`, `npm run db:restore` |

## 8.3. Môi trường cài đặt

| Thành phần | Công nghệ sử dụng | Phiên bản | Vai trò |
|---|---|---|---|
| Runtime | Node.js | 20+ khuyến nghị | Chạy Next.js, script Prisma và script kiểm thử |
| Frontend | Next.js App Router, React, TypeScript | Next.js 14.2.35, React 18.3.1, TypeScript 5.9.3 | Giao diện, routing, server actions |
| Styling | Tailwind CSS | 3.4.1 | Xây dựng giao diện responsive |
| Backend | Next.js Server Actions, middleware | Theo Next.js 14 | Xử lý nghiệp vụ phía server |
| Auth | NextAuth Credentials Provider | 4.24.11 | Đăng nhập, session, phân quyền route |
| ORM | Prisma | Prisma 5.21.1, Client 5.22.0 | Mô hình hóa và truy vấn CSDL |
| Database | PostgreSQL | 15-alpine trong Docker | Lưu dữ liệu nghiệp vụ |
| Validation | Zod, React Hook Form | Zod 3.24.1, RHF 7.54.2 | Kiểm tra dữ liệu form |
| Báo cáo/biểu đồ | Recharts, react-to-print | Recharts 2.15.0, react-to-print 3.3.0 | Hiển thị biểu đồ và in báo cáo |
| Công cụ mã nguồn | Git/GitHub | Theo môi trường nhóm | Quản lý phiên bản |
| IDE | VS Code | Khuyến nghị | Lập trình và kiểm tra code |
| Trình duyệt kiểm thử | Chrome/Edge | Bản mới | Kiểm thử giao diện |
| Container | Docker Compose | Compose file version 3.8 | Chạy PostgreSQL và app production |

## 8.4. Cấu trúc thư mục/mã nguồn

| Thư mục/file | Vai trò |
|---|---|
| `fe/src/app/` | Định nghĩa route, layout và page cho Admin/Nhân viên |
| `fe/src/app/(auth)/dang-nhap/` | Màn hình đăng nhập |
| `fe/src/app/admin/` | Nhóm màn hình dành cho Quản lý |
| `fe/src/app/nhan-vien/` | Nhóm màn hình dành cho Nhân viên |
| `fe/src/components/` | Component giao diện dùng lại |
| `fe/src/components/forms/` | Form đăng nhập, quy định, tài khoản, loại dịch vụ |
| `fe/src/components/giao-dich/` | Form/list/in phiếu mua, bán, dịch vụ |
| `fe/src/components/dashboard/` | Dashboard, báo cáo tồn kho/doanh thu, bản in |
| `fe/src/components/layout/` | Sidebar, header, layout điều hướng |
| `fe/src/actions/` | Server Actions xử lý nghiệp vụ |
| `fe/src/schemas/` | Zod schema validate dữ liệu nhập |
| `fe/src/services/` | Dịch vụ tính toán/tổng hợp báo cáo, tồn kho, giá |
| `fe/src/lib/` | Auth, Prisma client, business rules, constants, utils |
| `fe/prisma/schema.prisma` | Thiết kế dữ liệu Prisma |
| `fe/prisma/seed.ts` | Dữ liệu mẫu và tài khoản demo |
| `fe/scripts/` | Script setup, kiểm thử logic, backup, restore |
| `fe/.env.example` | Mẫu cấu hình môi trường |
| `docker-compose.yml` | Chạy PostgreSQL và ứng dụng bằng Docker ở root project |
| `docs/` | Tài liệu Chương 7, 8, 9 và audit |

## 8.5. Cài đặt các chức năng chính

| Module | Mục tiêu | Input | Xử lý | Output | Ràng buộc | Bảng dữ liệu liên quan | File/code liên quan |
|---|---|---|---|---|---|---|---|
| Quản lý đơn vị tính | Quản lý đơn vị chỉ, lượng, gram, cái, viên | Tên DVT, định lượng | Validate, kiểm trùng, tự sinh mã DVT, lưu/xóa/cập nhật | Danh sách DVT | Không rỗng, không trùng, không xóa nếu đang dùng | `DonViTinh`, `LoaiSanPham`, `SanPham` | `don-vi-tinh.action.ts`, `don-vi-tinh.schema.ts` |
| Quản lý loại sản phẩm | Quản lý nhóm sản phẩm và tỷ lệ lợi nhuận | Tên LSP, DVT, % lợi nhuận | Validate, tự sinh mã LSP, cập nhật trong transaction | Danh sách LSP | % lợi nhuận 0-100, không xóa nếu có SP | `LoaiSanPham`, `DonViTinh`, `SanPham` | `loai-san-pham.action.ts`, `loai-san-pham.schema.ts` |
| Quản lý sản phẩm | Quản lý sản phẩm vàng bạc đá quý | Tên, loại, hàm lượng, trọng lượng, giá nhập, tồn tối thiểu | Validate, lấy % lợi nhuận từ LSP, tính giá bán, tự sinh mã SP | Danh sách sản phẩm | Hàm lượng K24/K22/K18/K14/K10, giá nhập > 0, trọng lượng > 0 | `SanPham`, `LoaiSanPham`, `DonViTinh` | `san-pham.action.ts`, `san-pham.schema.ts`, `business-rules.ts` |
| Lập phiếu bán hàng | Bán hàng và giảm tồn kho | Khách hàng, sản phẩm, số lượng, đơn giá | Tạo phiếu trong transaction, kiểm tồn, kiểm thành tiền, giảm tồn | Phiếu bán, tồn kho mới | Không bán vượt tồn, số lượng > 0 | `PhieuBanHang`, `ChiTietBanHang`, `SanPham` | `giao-dich.ts`, `sales-invoice-form.tsx` |
| Lập phiếu mua hàng | Nhập hàng và tăng tồn kho | NCC, sản phẩm, số lượng, đơn giá mua | Tạo phiếu trong transaction, tăng tồn, cập nhật giá nhập và giá bán | Phiếu mua, tồn kho mới | NCC bắt buộc, số lượng > 0, đơn giá > 0 | `PhieuMuaHang`, `ChiTietMuaHang`, `SanPham`, `NhaCungCap` | `giao-dich.ts`, `purchase-invoice-form.tsx` |
| Lập phiếu dịch vụ | Ghi nhận gia công/kiểm định/sửa chữa | Khách, SĐT, loại dịch vụ, số lượng, chi phí, trả trước | Tính đơn giá được tính, thành tiền, còn lại; kiểm trả trước; lưu phiếu | Phiếu dịch vụ | Trả trước >= tỷ lệ quy định, số lượng > 0 | `PhieuDichVu`, `ChiTietDichVu`, `LoaiDichVu`, `ThamSo` | `service.action.ts`, `service-receipt-form.tsx` |
| Tra cứu phiếu dịch vụ | Tìm và cập nhật trạng thái phiếu | Số phiếu, khách hàng, tình trạng, khoảng ngày | Lọc danh sách, mở chi tiết, cập nhật ngày giao/kết quả | Danh sách/chi tiết phiếu | Phiếu hoàn thành khi các dòng đã giao | `PhieuDichVu`, `ChiTietDichVu` | `service.action.ts`, `service-search-list.tsx`, `service-receipt-detail.tsx` |
| Báo cáo tồn kho | Tổng hợp tồn theo kỳ | Tháng, năm | Tính tồn đầu, mua vào, bán ra, tồn cuối | Bảng báo cáo tồn kho | Tồn cuối = tồn đầu + mua vào - bán ra | `BaoCaoTonKho`, `SanPham`, phiếu mua/bán | `bao-cao.ts`, `inventory-report-view.tsx`, `report.service.ts` |
| Quản lý nhà cung cấp | Quản lý đối tác nhập hàng | Tên, địa chỉ, SĐT, người liên hệ | Validate, kiểm quyền mềm, tự sinh mã, thêm/sửa/xóa NCC | Danh sách NCC | Dữ liệu bắt buộc đầy đủ, không xóa NCC đã có phiếu mua | `NhaCungCap`, `PhieuMuaHang` | `nha-cung-cap.action.ts`, `nha-cung-cap.schema.ts`, `supplier-client.tsx` |
| Báo cáo doanh thu | Tổng hợp doanh thu bán hàng/dịch vụ | Tháng, năm | Lấy dữ liệu phiếu trong kỳ, cộng doanh thu | Bảng báo cáo doanh thu | Không tính phiếu ngoài kỳ | `BaoCaoDoanhThu`, `PhieuBanHang`, `PhieuDichVu` | `bao-cao.ts`, `revenue-report-view.tsx`, `report.service.ts` |
| Phân quyền người dùng | Quản lý tài khoản/nhóm quyền | Tài khoản, mật khẩu, nhóm | Kiểm tra Quản lý, tạo/sửa/xóa người dùng | Danh sách tài khoản | Tên đăng nhập duy nhất, không tự xóa tài khoản | `NguoiDung`, `NhomNguoiDung`, `BangPhanQuyen`, `ChucNang` | `user.action.ts`, `user-form.tsx`, `middleware.ts` |
| Thay đổi quy định | Cập nhật tham số nghiệp vụ | % lợi nhuận, tồn tối thiểu, tỷ lệ trả trước | Validate, kiểm quyền, cập nhật `ThamSo` | Quy định mới | Giá trị hợp lệ, chỉ Quản lý | `ThamSo` | `settings.action.ts`, `system-settings-form.tsx`, `system-settings.schema.ts` |
| Sao lưu và phục hồi dữ liệu | Bảo vệ dữ liệu CSDL | `DATABASE_URL`, file `.sql`, xác nhận restore | Server action kiểm quyền `HT_BAK`, chạy backup/restore PostgreSQL qua script | File backup hoặc CSDL phục hồi | Restore phải có xác nhận 2 bước, file hợp lệ | PostgreSQL database | `backup.action.ts`, `db-backup.js`, `db-restore.js`, `package.json` scripts |

## 8.6. Phong cách lập trình

Các quy ước lập trình được áp dụng để mã nguồn dễ đọc, dễ kiểm thử và dễ bảo trì:

- Tên biến, tên hàm, tên class/component rõ nghĩa, phản ánh nghiệp vụ. Ví dụ: `lapPhieuBanHang`, `calculateSellPrice`, `SalesInvoiceForm`.
- Component React dùng PascalCase, ví dụ `CustomerClient`, `PurchaseInvoiceForm`, `RevenueReportView`.
- Server Action dùng động từ hoặc cụm động từ rõ nghĩa: `createDonViTinh`, `updateLoaiSanPham`, `deleteSanPham`, `lapPhieuMuaHang`.
- Validation tập trung trong `fe/src/schemas/*.schema.ts`, dùng Zod để kiểm tra dữ liệu trước khi lưu.
- Logic nghiệp vụ thuần như tính giá bán, tính thành tiền, kiểm tồn kho được tách vào `fe/src/lib/business-rules.ts` để có thể kiểm thử đơn vị.
- Các nghiệp vụ cập nhật nhiều bảng như phiếu mua, phiếu bán, phiếu dịch vụ dùng transaction để đảm bảo dữ liệu nhất quán.
- UI không tự tin tưởng dữ liệu client; server action vẫn validate lại, kiểm tra quyền và kiểm tra nghiệp vụ.
- Comment chỉ dùng cho đoạn xử lý nghiệp vụ quan trọng hoặc transaction cần giải thích.
- Không log mật khẩu/token ra console; dữ liệu thật như file backup không được commit vào Git.

Quy ước cụ thể:

| Nhóm quy ước | Quy ước |
|---|---|
| Tên bảng/model | Dùng PascalCase tiếng Việt không dấu hoặc có dấu theo Prisma hiện tại: `SanPham`, `PhieuBanHang`, `DonViTinh` |
| Tên field | Dùng camelCase, bám nghiệp vụ: `maSP`, `tenSP`, `donGiaNhap`, `donGiaBan`, `tonKho` |
| Mã khóa chính | Dùng tiền tố nghiệp vụ: `DVT001`, `LSP001`, `SP001`, `ND0001` |
| Route | Dùng kebab-case tiếng Việt không dấu: `/admin/danh-muc/san-pham`, `/admin/giao-dich/ban-hang` |
| Component/màn hình | Dùng PascalCase: `SalesInvoiceForm`, `SystemSettingsForm` |
| Schema validate | Đặt theo module: `sanPhamSchema`, `loaiSanPhamSchema`, `systemSettingsSchema` |
| Thông báo lỗi | Ngắn gọn, nêu nguyên nhân và hướng xử lý: "Tên đơn vị tính đã tồn tại", "Sản phẩm không đủ tồn kho" |
| Nút giao diện | Dùng tên thống nhất: Thêm, Sửa, Xóa, Lưu, Hủy, Tìm kiếm, In, Xuất PDF |

## 8.7. Hướng dẫn cài đặt và chạy chương trình

### 8.7.1. Chạy bằng Docker ở thư mục gốc

Yêu cầu: Docker Desktop hoặc Docker Engine.

```bash
docker-compose up -d --build
```

Sau khi chạy, truy cập:

```text
http://localhost:3000
```

Docker Compose ở thư mục gốc sẽ tạo PostgreSQL 15 và container ứng dụng Next.js.

### 8.7.2. Chạy phát triển cục bộ trong thư mục `fe`

Yêu cầu: Node.js 20+, npm, Docker nếu dùng PostgreSQL bằng container.

```bash
cd fe
npm install
cp .env.example .env.local
npm run db:up
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Ứng dụng chạy tại:

```text
http://localhost:3000
```

Tài khoản demo:

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Quản lý | `admin` | `Admin@123` |
| Nhân viên | `nhanvien` | `Nhanvien@1` |

### 8.7.3. Kiểm thử và build

```bash
cd fe
npm run test:logic
npm run lint
npm run build
```

### 8.7.4. Chạy production

```bash
cd fe
npx prisma migrate deploy
npm run build
npm run start
```

Do cấu hình Next.js dùng output standalone, lệnh `npm run start` chạy:

```bash
node .next/standalone/server.js
```

### 8.7.5. Sao lưu và phục hồi dữ liệu

Sao lưu CSDL:

```bash
cd fe
npm run db:backup
```

Phục hồi CSDL từ file sao lưu:

```bash
cd fe
BACKUP_FILE=./backups/aquamarine-yyyy-mm-dd.sql RESTORE_CONFIRM=YES npm run db:restore
```

Lưu ý vận hành:

- `db:backup` ưu tiên `pg_dump` cục bộ; nếu máy chưa có PostgreSQL client tools thì fallback sang container trong `DB_CONTAINER`.
- `db:restore` ưu tiên `psql` cục bộ; nếu máy chưa có thì fallback sang container trong `DB_CONTAINER`.
- `RESTORE_CONFIRM=YES` là bắt buộc vì phục hồi dữ liệu là thao tác có rủi ro cao.
- File backup nằm trong `BACKUP_DIR`, mặc định là `./backups`.
- Thư mục backup được ignore khỏi Git để tránh đưa dữ liệu thật lên repository.

## 8.8. Lỗi thường gặp và cách xử lý

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| Không kết nối được DB | Sai `DATABASE_URL` hoặc PostgreSQL chưa chạy | Kiểm tra `.env.local`, chạy `npm run db:up` hoặc `docker-compose up -d` |
| Prisma Client thiếu model mới | Chưa generate sau khi sửa schema | Chạy `npx prisma generate` |
| Bảng mới chưa tồn tại | Chưa áp dụng migration vào DB | Dev chạy `npx prisma migrate dev`, production chạy `npx prisma migrate deploy` |
| Seed lỗi unique | Dữ liệu mẫu đã tồn tại hoặc schema lệch | Kiểm tra seed, reset môi trường test nếu cần |
| Port 3000 bị chiếm | App khác đang chạy | Dừng app cũ hoặc chạy Next.js ở port khác |
| Không đăng nhập được | Chưa seed tài khoản hoặc DB sai | Chạy `npx prisma db seed` |
| Route admin bị redirect | Tài khoản không có vai trò `QUAN_LY` | Dùng tài khoản admin hoặc kiểm tra nhóm người dùng |
| Không backup/restore được | Thiếu `DATABASE_URL`, PostgreSQL/Docker chưa chạy, tên container sai | Kiểm tra `.env`, `DB_CONTAINER`, `docker ps`, `npm run db:up` |
