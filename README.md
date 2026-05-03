# 💎 Quản Lý Cửa Hàng Vàng Bạc Đá Quý

Hệ thống quản lý cửa hàng kinh doanh Vàng Bạc Đá Quý, hỗ trợ quản lý danh mục sản phẩm, dịch vụ, bán hàng, mua hàng và báo cáo tồn kho.

---

## ⚡ Khởi chạy SIÊU TỐC (Ưu tiên)

Dự án đã được cấu hình **Zero-Config**. Bạn không cần tạo file `.env` hay cài đặt Database thủ công.

### 1. Yêu cầu duy nhất
- Đã cài đặt [Docker Desktop](https://www.docker.com/).

### 2. Chạy bằng một lệnh duy nhất
Mở terminal tại thư mục dự án và chạy:
```bash
docker-compose up -d --build
```

**Hệ thống sẽ tự động:**
1. Khởi tạo file `.env` từ mẫu.
2. Thiết lập Database PostgreSQL.
3. Đồng bộ Schema (Bảng biểu).
4. Nạp dữ liệu mẫu (Seed data).
5. Khởi chạy ứng dụng tại: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Tài khoản đăng nhập (Mặc định)

| Vai trò | Tên đăng nhập | Mật khẩu |
|:---|:---|:---|
| **Quản lý** | `admin` | `Admin@123` |
| **Nhân viên** | `nhanvien` | `Nhanvien@1` |

---

## 💻 Phát triển cục bộ (Local Development)

Nếu bạn muốn chạy không dùng Docker cho phần Frontend:

1. **Cài đặt thư viện:**
   ```bash
   npm run setup
   ```
   *(Lệnh này tự động cài node_modules, tạo .env và bật Docker DB)*

2. **Chạy dự án:**
   ```bash
   npm run dev
   ```

---

## 🛠 Các lệnh quản trị Database

Nếu cần can thiệp trực tiếp vào dữ liệu (trong khi Docker đang chạy):
- **Xem dữ liệu giao diện Web:** `docker exec -it quan_ly_vang_bac_app npx prisma studio`
- **Nạp lại dữ liệu mẫu:** `docker exec -it quan_ly_vang_bac_app npx prisma db seed`
- **Cập nhật cấu trúc bảng:** `docker exec -it quan_ly_vang_bac_app npx prisma db push`

---

## 📁 Cấu trúc thư mục

- `src/app/`: Định nghĩa các trang và giao diện.
- `src/actions/`: Logic xử lý nghiệp vụ Server Actions.
- `prisma/`: Cấu trúc Database và dữ liệu mẫu.
- `fe/`: Thư mục chứa mã nguồn Frontend & Dockerfile.
