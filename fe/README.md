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
- `npm run db:setup`: Đồng bộ database schema và nạp dữ liệu mẫu (seed).
- `npm run db:studio`: Mở giao diện xem dữ liệu database.

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
