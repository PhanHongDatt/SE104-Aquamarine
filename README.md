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

1. **Yêu cầu môi trường:**
   - Node.js 20+.
   - npm.
   - Docker Desktop nếu dùng PostgreSQL bằng Docker.
   - Trình duyệt Chrome hoặc Edge bản mới.

2. **Cài đặt thư viện:**
   ```bash
   cd fe
   npm run setup
   ```
   *(Lệnh này tự động cài node_modules, tạo .env và bật Docker DB)*

3. **Cấu hình thủ công nếu cần:**
   ```bash
   cd fe
   cp .env.example .env.local
   npm install
   npm run db:up
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. **Chạy dự án:**
   ```bash
   cd fe
   npm run dev
   ```

5. **Kiểm tra logic nghiệp vụ:**
   ```bash
   cd fe
   npm run test:logic
   ```

6. **Sao lưu dữ liệu nếu cần:**
   ```bash
   cd fe
   npm run db:backup
   ```

7. **Phục hồi dữ liệu nếu cần:**
   ```bash
   cd fe
   BACKUP_FILE=./backups/aquamarine-file.sql RESTORE_CONFIRM=YES npm run db:restore
   ```

8. **Build production:**
   ```bash
   cd fe
   npm run build
   npm run start
   ```

---

## 🛠 Các lệnh quản trị Database

Nếu cần can thiệp trực tiếp vào dữ liệu (trong khi Docker đang chạy):
- **Xem dữ liệu giao diện Web:** `docker exec -it quan_ly_vang_bac_app npx prisma studio`
- **Nạp lại dữ liệu mẫu:** `docker exec -it quan_ly_vang_bac_app npx prisma db seed`
- **Cập nhật cấu trúc bảng:** `docker exec -it quan_ly_vang_bac_app npx prisma migrate deploy`

---

## 📁 Cấu trúc thư mục

- `src/app/`: Định nghĩa các trang và giao diện.
- `src/actions/`: Logic xử lý nghiệp vụ Server Actions.
- `prisma/`: Cấu trúc Database và dữ liệu mẫu.
- `fe/`: Thư mục chứa mã nguồn Frontend & Dockerfile.
- `docs/`: Tài liệu thiết kế giao diện, cài đặt, kiểm thử và bảo trì áp dụng trực tiếp vào đồ án.

---

## 📚 Tài liệu đồ án giai đoạn thiết kế/cài đặt/kiểm thử

- `docs/chapter-7-ui-design.md`: sơ đồ liên kết màn hình, danh sách màn hình, mô tả control/biến cố và nguyên tắc UI đã áp dụng.
- `docs/chapter-8-implementation.md`: phương pháp cài đặt tăng trưởng, môi trường cài đặt, stack, quy ước code và lỗi thường gặp.
- `docs/chapter-9-testing-maintenance.md`: test plan, test case, kiểm thử hộp đen/hộp trắng, Alpha/Beta plan và maintenance checklist.

---

## ⚠️ Lỗi thường gặp

- **Không kết nối được DB:** kiểm tra `DATABASE_URL`, chạy `docker-compose up -d` hoặc `cd fe && npm run db:up`.
- **Thiếu bảng sau khi thêm schema:** chạy `cd fe && npx prisma migrate dev` ở môi trường dev hoặc `npx prisma migrate deploy` khi production.
- **Prisma Client chưa nhận model mới:** chạy `cd fe && npx prisma generate`.
- **Không đăng nhập được tài khoản demo:** chạy `cd fe && npx prisma db seed`.
- **Port 3000 bị chiếm:** dừng tiến trình cũ hoặc đổi port khi chạy Next.js.
