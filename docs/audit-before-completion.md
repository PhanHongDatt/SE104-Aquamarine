# AUDIT TRƯỚC KHI HOÀN THIỆN CHƯƠNG 7, 8, 9

## 1. Phạm vi đã đọc

Đã đọc toàn bộ báo cáo hiện có trong các file:

- `docs/chapter-7-ui-design.md`
- `docs/chapter-8-implementation.md`
- `docs/chapter-9-testing-maintenance.md`

Đã đối chiếu thêm với mã nguồn chính:

- Route màn hình trong `fe/src/app`
- Component trong `fe/src/components`
- Server actions trong `fe/src/actions`
- Validation schema trong `fe/src/schemas`
- Business rules trong `fe/src/lib/business-rules.ts`
- Database schema trong `fe/prisma/schema.prisma`
- Script chạy, kiểm thử, backup/restore trong `fe/package.json` và `fe/scripts`

## 2. Kết quả nhận diện các phần liên quan

| Nhóm nội dung | Đã có trong báo cáo cũ | Nhận xét trước khi hoàn thiện |
|---|---|---|
| Thiết kế giao diện | Có trong Chương 7 | Có stack, sơ đồ, danh sách màn hình và một số màn hình mẫu; thiếu mô tả control/biến cố cho nhiều màn hình bắt buộc |
| Cài đặt phần mềm | Có trong Chương 8 | Có stack, cấu trúc, hướng dẫn chạy; thiếu bảng thứ tự cài đặt module và mô tả cài đặt từng chức năng chính |
| Kiểm thử | Có trong Chương 9 | Tương đối đầy đủ; đã có test plan, test case, hộp đen, hộp trắng, tích hợp, hệ thống, chấp nhận, hồi quy |
| Bảo trì | Có trong Chương 9 | Đã có 4 loại bảo trì và kế hoạch bảo trì; cần nhấn mạnh backup/restore, phân quyền và kiểm thử hồi quy sau bảo trì |

## 3. Bảng audit thiếu/đủ

| STT | Hạng mục | Đã có chưa | Mức độ hoàn thiện trước khi bổ sung | Thiếu gì | Cần làm tiếp |
|---:|---|---|---|---|---|
| 1 | Sơ đồ liên kết màn hình | Có | Trung bình | Chưa bám đủ danh sách màn hình bắt buộc, thiếu sao lưu/phục hồi | Bổ sung sơ đồ cây đầy đủ và ghi rõ route/code hiện có |
| 2 | Danh sách màn hình | Có | Trung bình | Thiếu phân loại đầy đủ theo màn hình chính/nhập liệu/tra cứu/thông báo/báo biểu | Bổ sung bảng 16 màn hình |
| 3 | Mô tả chi tiết từng màn hình | Có một phần | Thấp | Mới mô tả một số màn hình, thiếu nhiều màn hình bắt buộc | Bổ sung mô tả cho DVT, LSP, SP, mua, bán, dịch vụ, tra cứu, báo cáo, phân quyền, quy định, backup |
| 4 | Mô tả control trên từng màn hình | Có một phần | Thấp | Thiếu bảng control cho hầu hết màn hình | Bổ sung bảng control theo từng màn hình chính |
| 5 | Danh sách biến cố và xử lý tương ứng | Có một phần | Thấp | Thiếu biến cố cho nhiều nghiệp vụ | Bổ sung bảng biến cố/xử lý |
| 6 | Thiết kế màn hình chính | Có | Khá | Cần nêu rõ dashboard theo vai trò | Bổ sung vào danh sách màn hình và sơ đồ điều hướng |
| 7 | Thiết kế màn hình nhập liệu | Có | Trung bình | Chưa gom đủ màn hình nhập liệu nghiệp vụ | Bổ sung form DVT, LSP, SP, mua, bán, dịch vụ, NCC, quy định |
| 8 | Thiết kế màn hình tra cứu | Có | Trung bình | Chưa mô tả rõ tiêu chuẩn tra cứu phiếu dịch vụ | Bổ sung control và biến cố tra cứu |
| 9 | Thiết kế màn hình thông báo | Có | Trung bình | Chưa tách mục riêng | Bổ sung màn hình thông báo/toast/modal |
| 10 | Thiết kế báo biểu | Có | Trung bình | Thiếu control chi tiết báo cáo tồn kho/doanh thu | Bổ sung hai màn hình báo cáo |
| 11 | Môi trường cài đặt | Có | Khá | Thiếu phiên bản cụ thể từ `package.json`/Docker | Bổ sung bảng công nghệ, phiên bản, vai trò |
| 12 | Phương pháp cài đặt | Có | Khá | Chưa so sánh rõ với từ dưới lên | Bổ sung so sánh và lý do chọn từ trên xuống tăng trưởng |
| 13 | Phong cách lập trình | Có | Trung bình | Thiếu quy ước đặt tên bảng, field, route, component, thông báo lỗi | Bổ sung quy ước cụ thể |
| 14 | Hướng dẫn chạy chương trình | Có | Khá | Cần gom đủ Docker, local, seed, test, build, backup/restore | Bổ sung hướng dẫn chi tiết |
| 15 | Test plan | Có | Khá | Cần đảm bảo đủ module bắt buộc | Giữ và rà lại trong Chương 9 |
| 16 | Test case | Có | Khá | Đã có nhiều test case; cần đảm bảo đủ A-M | Giữ đầy đủ danh sách test case |
| 17 | Kiểm thử hộp đen | Có | Khá | Cần bám dữ liệu biên nghiệp vụ vàng bạc đá quý | Giữ bảng và bổ sung nếu cần |
| 18 | Kiểm thử hộp trắng | Có | Khá | Cần gắn thuật toán thật | Giữ bảng theo thuật toán DVT, LSP, SP, phiếu, báo cáo |
| 19 | Kiểm thử đơn vị | Có | Khá | Cần nêu file test thật | Ghi `fe/scripts/business-rules.test.ts` |
| 20 | Kiểm thử tích hợp | Có | Khá | Cần nêu luồng liên kết module | Giữ/bổ sung luồng tích hợp |
| 21 | Kiểm thử hệ thống | Có | Khá | Cần nêu kịch bản end-to-end | Giữ/bổ sung 4 kịch bản |
| 22 | Kiểm thử chấp nhận | Có | Khá | Cần alpha/beta giả lập | Giữ kế hoạch alpha/beta |
| 23 | Bảo trì corrective/adaptive/perfective/preventive | Có | Khá | Cần ví dụ sát đồ án | Giữ và rà lại ví dụ |
| 24 | Sao lưu và phục hồi dữ liệu | Có một phần | Trung bình | Có script nhưng chưa có route UI riêng | Thiết kế màn hình trong Chương 7, hướng dẫn script trong Chương 8/9 |
| 25 | Phân quyền và bảo mật | Có | Trung bình | Middleware có bảo vệ route, một số action có kiểm quyền; mật khẩu demo chưa hash | Nêu rõ trạng thái hiện tại và khuyến nghị hash mật khẩu production |

## 4. Danh sách màn hình đã thiết kế

1. Đăng nhập.
2. Màn hình chính/Dashboard.
3. Quản lý đơn vị tính.
4. Quản lý loại sản phẩm.
5. Quản lý sản phẩm.
6. Lập phiếu bán hàng.
7. Lập phiếu mua hàng.
8. Lập phiếu dịch vụ.
9. Tra cứu phiếu dịch vụ.
10. Quản lý nhà cung cấp.
11. Báo cáo tồn kho.
12. Báo cáo doanh thu.
13. Phân quyền người dùng.
14. Thay đổi quy định.
15. Sao lưu và phục hồi dữ liệu.
16. Thông báo/Xác nhận.

## 5. Checklist bám sát yêu cầu

| Nội dung đối chiếu | Kết quả |
|---|---|
| Yêu cầu phần mềm | Đã bám các nghiệp vụ danh mục, sản phẩm, mua, bán, dịch vụ, tra cứu, báo cáo, phân quyền, quy định, backup |
| Biểu mẫu/quy định | Đã đưa vào phiếu mua, phiếu bán, phiếu dịch vụ, báo cáo tồn kho, báo cáo doanh thu, tỷ lệ trả trước, tồn tối thiểu, % lợi nhuận |
| Sơ đồ luồng dữ liệu | Đã thể hiện quan hệ điều hướng và luồng tích hợp module trong Chương 7/9 |
| Thiết kế dữ liệu | Đã đối chiếu với Prisma schema: `DonViTinh`, `LoaiSanPham`, `SanPham`, `PhieuBanHang`, `PhieuMuaHang`, `PhieuDichVu`, `BaoCaoTonKho`, `BaoCaoDoanhThu`, `NguoiDung`, `ThamSo` |
| Kiến thức Chương 7 | Đã áp dụng vào thiết kế màn hình, control, biến cố, thông báo, báo biểu |
| Kiến thức Chương 8 | Đã áp dụng vào phương pháp cài đặt, môi trường, cấu trúc, phong cách lập trình, hướng dẫn chạy |
| Kiến thức Chương 9 | Đã áp dụng vào test plan, test case, hộp đen, hộp trắng, tích hợp, hệ thống, chấp nhận, hồi quy và bảo trì |

## 6. Checklist tự kiểm tra cuối cùng

### Thiết kế giao diện

- [x] Đã có sơ đồ liên kết màn hình.
- [x] Đã có danh sách màn hình.
- [x] Đã phân loại màn hình theo màn hình chính/nhập liệu/tra cứu/thông báo/báo biểu.
- [x] Đã mô tả control cho màn hình chính và các màn hình nghiệp vụ chính.
- [x] Đã mô tả biến cố và xử lý.
- [x] Đã bám đúng nghiệp vụ vàng bạc đá quý.
- [x] Đã có màn hình cho các yêu cầu nghiệp vụ bắt buộc.

### Cài đặt

- [x] Đã nêu phương pháp cài đặt.
- [x] Đã nêu môi trường cài đặt.
- [x] Đã nêu thứ tự cài đặt module.
- [x] Đã nêu phong cách lập trình.
- [x] Đã có hướng dẫn chạy/cài đặt.

### Kiểm thử

- [x] Đã có mục tiêu kiểm thử.
- [x] Đã có phạm vi kiểm thử.
- [x] Đã có test case cho từng module.
- [x] Đã có kiểm thử hộp đen.
- [x] Đã có kiểm thử hộp trắng.
- [x] Đã có kiểm thử tích hợp.
- [x] Đã có kiểm thử hệ thống.
- [x] Đã có kiểm thử chấp nhận.
- [x] Đã có kiểm thử hồi quy.

### Bảo trì

- [x] Đã có 4 loại bảo trì.
- [x] Đã áp dụng 4 loại bảo trì vào đồ án.
- [x] Đã có kế hoạch sao lưu/phục hồi.
- [x] Đã có kế hoạch kiểm tra log/lỗi.
- [x] Đã có kế hoạch cập nhật quy định.
- [x] Đã có kế hoạch test lại sau bảo trì.
