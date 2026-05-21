# 💎 Quản Lý Cửa Hàng Vàng Bạc Đá Quý

Hệ thống quản lý cửa hàng kinh doanh Vàng Bạc Đá Quý, hỗ trợ quản lý danh mục sản phẩm, dịch vụ, bán hàng, mua hàng và báo cáo tồn kho.

---

## ⚡ Hướng dẫn khởi chạy nhanh (SIÊU TỐC)

Để tối giản hóa việc cài đặt cho thành viên mới, bạn chỉ cần thực hiện 2 bước duy nhất:

### 1. Chuẩn bị
- Đã cài đặt [Node.js](https://nodejs.org/) & [Docker Desktop](https://www.docker.com/).
- Mở Docker Desktop lên trước khi chạy setup.

### 2. Một câu lệnh duy nhất
Mở terminal tại thư mục dự án và chạy:
```bash
npm run setup
```
*Lệnh này sẽ tự động: Cài đặt library, tạo file .env, bật Docker DB, và nạp dữ liệu mẫu.*

### 3. Chạy dự án
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Tài khoản đăng nhập (Mặc định)

| Vai trò | Tên đăng nhập | Mật khẩu |
|:---|:---|:---|
| **Quản lý** | `admin` | `Admin@123` |
| **Nhân viên** | `nhanvien` | `Nhanvien@1` |

---

## 🛠 Các lệnh thủ công (Nếu cần)

Nếu không muốn dùng script tự động, bạn có thể chạy từng bước:
- `npm install`: Cài đặt thư viện.
- `npm run env:init`: Tạo file `.env` từ mẫu.
- `npm run db:up`: Khởi chạy database bằng Docker.
- `npm run db:setup`: Áp dụng Prisma migrations và nạp dữ liệu mẫu (seed).
- `npm run db:studio`: Mở giao diện xem dữ liệu database.
- `npm run test:logic`: Kiểm thử các hàm nghiệp vụ lõi như tính giá bán, tổng hóa đơn, kiểm tồn kho.
- `npm run build`: Kiểm tra build production.
- `npm run start`: Chạy bản production standalone sau khi build.
- `npm run db:backup`: Sao lưu PostgreSQL ra file `.sql` trong `BACKUP_DIR`.
- `BACKUP_FILE=./backups/file.sql RESTORE_CONFIRM=YES npm run db:restore`: Phục hồi database từ file sao lưu.

Sau khi thay đổi `prisma/schema.prisma`, chạy:

```bash
npx prisma migrate dev --name ten-thay-doi
npx prisma generate
```

Khi deploy production, dùng `npx prisma migrate deploy` thay cho `db push`.

---

## 📚 Tài liệu đồ án liên quan Chương 7-8-9

- `../docs/chapter-7-ui-design.md`: thiết kế giao diện, sơ đồ màn hình, danh sách màn hình và mô tả control.
- `../docs/chapter-8-implementation.md`: phương pháp cài đặt, môi trường, stack và phong cách lập trình.
- `../docs/chapter-9-testing-maintenance.md`: test plan, test case, kiểm thử hộp đen/hộp trắng và kế hoạch bảo trì.

---

## ❓ Xử lý sự cố (Troubleshooting)

- **Lỗi Docker:** Đảm bảo Docker Desktop đang chạy. Nếu lệnh `db:up` thất bại, hãy thử khởi động lại Docker.
- **Lỗi Database chưa sẵn sàng:** Script setup sẽ đợi 10 giây. Nếu mạng chậm hoặc máy yếu, database có thể cần thêm thời gian. Hãy thử chạy lại `npm run db:setup` sau đó.
- **Lỗi Port 3000:** Nếu port 3000 bị chiếm, hãy tắt ứng dụng đó hoặc đổi port trong cấu hình Next.js.

---

## 📁 Cấu trúc thư mục chính

- `src/app/`: Định nghĩa các trang và layout.
- `src/actions/`: Logic xử lý nghiệp vụ phía Server.
- `src/components/`: Các UI components dùng chung.
- `prisma/`: Schema và script nạp dữ liệu ban đầu.
- `scripts/`: Chứa script setup tự động.
