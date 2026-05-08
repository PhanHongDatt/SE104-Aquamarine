# CHƯƠNG Z. KIỂM THỬ VÀ BẢO TRÌ

Chương này mô tả kế hoạch kiểm thử và bảo trì cho hệ thống web quản lý cửa hàng vàng bạc đá quý Aquamarine. Nội dung được xây dựng dựa trên mã nguồn hiện tại của đồ án: Next.js, React, TypeScript, Prisma, PostgreSQL, NextAuth, Tailwind CSS.

## Z.0. Đánh giá mức độ chặt chẽ sau rà soát

Sau khi đối chiếu lại báo cáo với mã nguồn, phần kiểm thử đã đủ khung cho báo cáo đồ án nhưng cần phân biệt rõ giữa **test case đã có kế hoạch** và **test case đã thực thi có bằng chứng**. Vì vậy, chương này được rà soát theo hướng vận hành:

- Chỉ đánh dấu **Đạt** khi có bằng chứng kiểm thử tự động hoặc kết quả chạy thật.
- Các test case chưa thao tác trực tiếp trên giao diện hoặc chưa chạy tích hợp với database giữ trạng thái **Chưa thực hiện**.
- Các ràng buộc nghiệp vụ quan trọng được đưa về business rules để có thể kiểm thử đơn vị: tính giá bán, thành tiền, tồn cuối, tồn thấp, đơn giá dịch vụ, trả trước dịch vụ, kết quả kiểm định khi giao.
- Các điểm rủi ro được ghi rõ: test end-to-end bằng trình duyệt chưa được tự động hóa đầy đủ; UI sao lưu/phục hồi vẫn đang ở mức script CLI. Mật khẩu đã được chuyển sang `bcryptjs`, có cơ chế lazy migration cho tài khoản plaintext cũ.

Kết luận chuyên môn: phần kiểm thử hiện **ổn về cấu trúc và phạm vi**, đã có kiểm thử logic tự động, kiểm thử tích hợp database cho các luồng mua/bán/đổi lợi nhuận và build production đạt. Tuy nhiên để gọi là chặt chẽ ở mức vận hành production cần bổ sung thêm test end-to-end bằng trình duyệt, kiểm thử phục hồi dữ liệu định kỳ và cơ chế lưu log/chụp màn hình cho test thủ công.

## Z.1. Mục tiêu kiểm thử

Kiểm thử hệ thống nhằm đảm bảo các mục tiêu sau:

- **Tính chính xác:** dữ liệu tính toán đúng, lưu đúng và báo cáo đúng. Ví dụ: đơn giá bán được tính từ đơn giá nhập và phần trăm lợi nhuận; thành tiền bằng số lượng nhân đơn giá; tồn kho sau mua/bán được cập nhật đúng; báo cáo tồn kho và doanh thu khớp dữ liệu giao dịch.
- **Tính an toàn:** dữ liệu không bị mất hoặc sai lệch khi thao tác lỗi. Các nghiệp vụ cập nhật nhiều bảng như lập phiếu bán hàng và phiếu mua hàng phải dùng transaction; thao tác xóa phải có xác nhận; hệ thống có kế hoạch sao lưu và phục hồi dữ liệu.
- **Tính bảo mật:** người chưa đăng nhập hoặc người không có quyền không được truy cập chức năng. Ví dụ: route `/admin/*` chỉ dành cho tài khoản Quản lý.
- **Tính riêng tư:** phân quyền người dùng theo nhóm, giới hạn thao tác theo vai trò. Quản lý được thêm/sửa/xóa danh mục và phân quyền; Nhân viên chỉ thao tác các nghiệp vụ được phép.
- **Đáp ứng nghiệp vụ cửa hàng vàng bạc đá quý:** quản lý đơn vị tính, loại sản phẩm, sản phẩm, nhà cung cấp, phiếu mua hàng, phiếu bán hàng, dịch vụ gia công/kiểm định, tồn kho, doanh thu và quy định kinh doanh.

## Z.2. Phạm vi kiểm thử

Các module bắt buộc kiểm thử:

| STT | Module | Mục đích kiểm thử |
|---:|---|---|
| 1 | Đăng nhập và phân quyền | Đảm bảo xác thực đúng và giới hạn quyền theo vai trò |
| 2 | Đơn vị tính | Đảm bảo thêm/sửa/xóa đơn vị đúng ràng buộc |
| 3 | Loại sản phẩm | Đảm bảo loại sản phẩm, đơn vị tính và phần trăm lợi nhuận hợp lệ |
| 4 | Sản phẩm | Đảm bảo thông tin sản phẩm, giá bán, tồn kho và cảnh báo tồn thấp đúng |
| 5 | Nhà cung cấp | Đảm bảo dữ liệu nhà cung cấp đầy đủ, hợp lệ |
| 6 | Phiếu mua hàng | Đảm bảo nhập hàng làm tăng tồn kho và cập nhật giá |
| 7 | Phiếu bán hàng | Đảm bảo bán hàng không vượt tồn, tính tiền đúng và giảm tồn |
| 8 | Phiếu dịch vụ | Đảm bảo lập phiếu gia công/kiểm định đúng quy định trả trước và trạng thái |
| 9 | Tra cứu phiếu dịch vụ | Đảm bảo tìm kiếm và cập nhật trạng thái phiếu đúng |
| 10 | Báo cáo tồn kho | Đảm bảo tồn đầu, mua vào, bán ra, tồn cuối đúng |
| 11 | Báo cáo doanh thu | Đảm bảo doanh thu theo kỳ đúng dữ liệu phiếu bán/dịch vụ |
| 12 | Thay đổi quy định | Đảm bảo chỉ người có quyền được thay đổi tham số và tham số hợp lệ |
| 13 | Sao lưu và phục hồi dữ liệu | Đảm bảo có thể tạo bản sao lưu, phục hồi và kiểm soát quyền/thao tác xác nhận |

## Z.3. Phương pháp kiểm thử

| Phương pháp | Áp dụng trong hệ thống |
|---|---|
| Kiểm thử đơn vị | Kiểm tra hàm tính đơn giá bán, hàm tính thành tiền, hàm tính tổng hóa đơn, hàm kiểm tra tồn kho, hàm tính tồn cuối, hàm kiểm tra trả trước dịch vụ và số điện thoại. Mã kiểm thử nằm ở `fe/scripts/business-rules.test.ts`. |
| Kiểm thử tích hợp | Kiểm tra phiếu bán hàng liên kết với sản phẩm, tồn kho và doanh thu; phiếu mua hàng liên kết với nhà cung cấp, sản phẩm, tồn kho và giá bán; loại sản phẩm cập nhật phần trăm lợi nhuận làm round lại giá bán. Mã kiểm thử nằm ở `fe/scripts/integration.test.ts`, chạy bằng `npm run test:integration`. |
| Kiểm thử hệ thống | Kiểm tra toàn bộ luồng từ thêm đơn vị tính -> thêm loại sản phẩm -> thêm sản phẩm -> lập phiếu mua -> lập phiếu bán -> xem báo cáo tồn kho/doanh thu. |
| Kiểm thử chấp nhận | Người dùng đóng vai Quản lý, Nhân viên bán hàng, Nhân viên dịch vụ thao tác thử các chức năng chính trước khi nghiệm thu đồ án. |
| Kiểm thử hộp đen | Nhập dữ liệu vào form và quan sát kết quả. Ví dụ: nhập số lượng bán vượt tồn kho, hệ thống phải báo lỗi mà không cần xem mã nguồn. |
| Kiểm thử hộp trắng | Kiểm tra nhánh xử lý bên trong hàm nghiệp vụ. Ví dụ: nhánh tồn kho đủ cho lưu phiếu, nhánh tồn kho không đủ báo lỗi. |
| Kiểm thử hồi quy | Sau khi sửa lỗi tính giá bán, chạy lại test sản phẩm, bán hàng, báo cáo doanh thu và tồn kho để đảm bảo chức năng cũ không bị hỏng. |

### Tiêu chí bắt đầu và kết thúc kiểm thử

| Nhóm tiêu chí | Nội dung áp dụng |
|---|---|
| Điều kiện bắt đầu | Source code build được, database có schema và seed dữ liệu mẫu, tài khoản demo hoạt động, môi trường `.env` hợp lệ |
| Điều kiện kết thúc | Không còn lỗi nghiêm trọng ở đăng nhập, phân quyền, mua/bán hàng, tồn kho, báo cáo; các test tự động bắt buộc chạy đạt; lỗi còn lại được ghi nhận rõ mức độ |
| Mức độ lỗi nghiêm trọng | Critical: mất dữ liệu, sai tiền/tồn kho, bypass phân quyền; Major: lỗi nghiệp vụ có cách xử lý tạm; Minor: lỗi hiển thị, nội dung thông báo |
| Bằng chứng kiểm thử | Ghi lệnh đã chạy, thời điểm chạy, kết quả thực tế, ảnh chụp màn hình hoặc log nếu là test thủ công |

## Z.4. Bộ kiểm thử tổng quát

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-GEN-01 | Đăng nhập | Kiểm tra xác thực người dùng | `admin`/`Admin@123` | Mở màn hình đăng nhập, nhập tài khoản, bấm đăng nhập | Vào dashboard Quản lý | Đã hash mật khẩu bằng `bcryptjs`; cần thao tác UI để xác nhận luồng đăng nhập | Chưa thực hiện UI | `fe/src/lib/auth.ts` |
| TC-GEN-02 | Phân quyền | Kiểm tra tính riêng tư theo vai trò | Tài khoản `nhanvien` | Đăng nhập và truy cập `/admin/cai-dat/phan-quyen` | Bị chặn hoặc chuyển hướng | Đã có middleware đọc quyền từ JWT; chưa chạy UI thủ công | Chưa thực hiện UI | `fe/src/middleware.ts`, `fe/src/lib/permissions.ts` |
| TC-GEN-03 | Sản phẩm | Kiểm tra tính chính xác giá bán | Giá nhập 1.000.000, lợi nhuận 20% | Thêm/sửa sản phẩm | Giá bán = 1.200.000 | Đã kiểm bằng `npm run test:logic` | Đạt | `fe/scripts/business-rules.test.ts` |
| TC-GEN-04 | Phiếu bán hàng | Kiểm tra an toàn tồn kho | Sản phẩm tồn 5, bán 6 | Lập phiếu bán | Hệ thống báo lỗi, không lưu phiếu | Đã kiểm bằng unit test nhánh tồn | Đạt | `fe/scripts/business-rules.test.ts` |
| TC-GEN-05 | Phiếu mua hàng | Kiểm tra cập nhật tồn kho | Sản phẩm A, số lượng mua 3 | Lập phiếu mua | Tồn kho tăng thêm 3 và giá bán tính lại | Đã kiểm bằng `npm run test:integration` | Đạt | `fe/scripts/integration.test.ts` |
| TC-GEN-06 | Báo cáo tồn kho | Kiểm tra số liệu báo cáo | Tháng/năm có giao dịch | Lập phiếu mua/bán | Snapshot tồn kho được ghi trong transaction | Đã kiểm một phần bằng `npm run test:integration` | Đạt một phần | `fe/scripts/integration.test.ts`, `fe/src/actions/giao-dich.ts` |
| TC-GEN-07 | Sao lưu dữ liệu | Kiểm tra backup | `DATABASE_URL`, `BACKUP_DIR` | Chạy `npm run db:backup` | Sinh file `.sql` trong thư mục backup | Có script, chưa chạy lại trong đợt rà soát này | Chưa thực hiện | `fe/scripts/db-backup.js` |

## Z.5. Test case chi tiết

### A. Đăng nhập và phân quyền

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-AUTH-01 | Đăng nhập đúng tài khoản | Đảm bảo user hợp lệ vào được hệ thống | `admin`/`Admin@123` | Mở `/dang-nhap`, nhập dữ liệu, bấm Đăng nhập | Vào dashboard Quản lý | Chưa ghi nhận | Chưa thực hiện |
| TC-AUTH-02 | Đăng nhập sai mật khẩu | Đảm bảo hệ thống từ chối sai thông tin | `admin`/mật khẩu sai | Nhập và submit | Hiển thị lỗi đăng nhập | Chưa ghi nhận | Chưa thực hiện |
| TC-AUTH-03 | Bỏ trống tên đăng nhập/mật khẩu | Đảm bảo validation form | Rỗng | Submit form | Báo lỗi bắt buộc | Chưa ghi nhận | Chưa thực hiện |
| TC-AUTH-04 | Nhân viên không có quyền vào phân quyền | Kiểm tra phân quyền route | `nhanvien` | Đăng nhập, mở `/admin/cai-dat/phan-quyen` | Bị redirect/từ chối | Chưa ghi nhận | Chưa thực hiện |
| TC-AUTH-05 | Quản lý có quyền thêm/sửa danh mục | Kiểm tra quyền quản lý | `admin` | Mở danh mục, thêm/sửa bản ghi | Thao tác thành công | Chưa ghi nhận | Chưa thực hiện |
| TC-AUTH-06 | Người không đăng nhập không vào màn hình chính | Kiểm tra bảo mật route | Chưa đăng nhập | Mở `/admin/dashboard` hoặc `/nhan-vien` | Chuyển về đăng nhập | Chưa ghi nhận | Chưa thực hiện |

### B. Đơn vị tính

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-DVT-01 | Thêm đơn vị tính hợp lệ | Kiểm tra thêm mới | Tên `Lượng` | Admin thêm đơn vị tính | Lưu thành công | Chưa ghi nhận | Chưa thực hiện |
| TC-DVT-02 | Thêm đơn vị tính rỗng | Kiểm tra bắt buộc | Tên rỗng | Submit form | Báo lỗi tên không được trống | Chưa ghi nhận | Chưa thực hiện |
| TC-DVT-03 | Thêm đơn vị tính trùng tên | Kiểm tra unique | Tên đã tồn tại | Submit form | Báo lỗi trùng | Chưa ghi nhận | Chưa thực hiện |
| TC-DVT-04 | Xóa đơn vị tính chưa được dùng | Kiểm tra xóa hợp lệ | DVT chưa liên kết | Bấm Xóa, xác nhận | Xóa thành công | Chưa ghi nhận | Chưa thực hiện |
| TC-DVT-05 | Xóa đơn vị tính đang được sản phẩm sử dụng | Kiểm tra ràng buộc dữ liệu | DVT đang có SP | Bấm Xóa | Hệ thống chặn xóa | Chưa ghi nhận | Chưa thực hiện |
| TC-DVT-06 | Người không phải Quản lý thêm/sửa/xóa DVT | Kiểm tra phân quyền | Tài khoản nhân viên | Thực hiện thêm/sửa/xóa | Bị từ chối | Chưa ghi nhận | Chưa thực hiện |

### C. Loại sản phẩm

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-LSP-01 | Thêm loại sản phẩm hợp lệ | Kiểm tra thêm mới | Tên, DVT, % lợi nhuận hợp lệ | Submit form | Lưu thành công | Chưa ghi nhận | Chưa thực hiện |
| TC-LSP-02 | Tên loại sản phẩm rỗng | Kiểm tra bắt buộc | Tên rỗng | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-LSP-03 | Tên loại sản phẩm trùng | Kiểm tra unique | Tên đã tồn tại | Submit form | Báo lỗi trùng | Chưa ghi nhận | Chưa thực hiện |
| TC-LSP-04 | Chọn đơn vị tính không hợp lệ | Kiểm tra ràng buộc nghiệp vụ | Loại/DVT không phù hợp | Submit form | Báo lỗi hoặc không cho lưu | Chưa ghi nhận | Chưa thực hiện |
| TC-LSP-05 | % lợi nhuận < 0 | Kiểm tra biên dưới | `-1` | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-LSP-06 | % lợi nhuận > 100 | Kiểm tra biên trên | `101` | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-LSP-07 | Sửa % lợi nhuận | Kiểm tra tính lại giá bán | Đổi lợi nhuận loại sản phẩm | Lưu loại sản phẩm | Giá bán sản phẩm liên quan được tính lại và round nhất quán | Đã kiểm bằng `npm run test:integration` | Đạt | `fe/scripts/integration.test.ts` |
| TC-LSP-08 | Xóa loại sản phẩm đang chứa sản phẩm | Kiểm tra toàn vẹn dữ liệu | LSP có SP | Bấm Xóa | Hệ thống chặn xóa | Chưa ghi nhận | Chưa thực hiện |

### D. Sản phẩm

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-SP-01 | Thêm sản phẩm hợp lệ | Kiểm tra thêm sản phẩm | Tên, loại, hàm lượng, trọng lượng, giá nhập | Admin thêm sản phẩm | Lưu thành công, tự sinh mã | Chưa ghi nhận | Chưa thực hiện |
| TC-SP-02 | Tên sản phẩm rỗng | Kiểm tra bắt buộc | Tên rỗng | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-SP-03 | Hàm lượng không thuộc danh sách | Kiểm tra enum | `25K`, `abc`, rỗng | Submit form | Báo lỗi hàm lượng | Chưa ghi nhận | Chưa thực hiện |
| TC-SP-04 | Trọng lượng <= 0 | Kiểm tra biên | `0`, `-1` | Submit form | Báo lỗi trọng lượng | Chưa ghi nhận | Chưa thực hiện |
| TC-SP-05 | Đơn giá nhập <= 0 | Kiểm tra biên | `0`, `-1` | Submit form | Báo lỗi giá nhập | Chưa ghi nhận | Chưa thực hiện |
| TC-SP-06 | Đơn giá bán tự tính đúng | Kiểm tra công thức | Giá nhập 1.000.000, LN 20% | Lưu/xem preview | Giá bán 1.200.000 | Đã kiểm bằng `test:logic` | Đạt |
| TC-SP-07 | Đơn vị tính không phù hợp loại sản phẩm | Kiểm tra ràng buộc UI | Loại/DVT không phù hợp | Chọn loại sản phẩm | UI báo lỗi hoặc không gán DVT | Chưa ghi nhận | Chưa thực hiện |
| TC-SP-08 | Sửa đơn giá nhập | Kiểm tra tính lại giá bán | Đổi giá nhập | Lưu sản phẩm | Giá bán tính lại theo % lợi nhuận | Chưa ghi nhận | Chưa thực hiện |
| TC-SP-09 | Cảnh báo tồn thấp | Kiểm tra trạng thái tồn kho | Tồn kho < tồn tối thiểu | Xem danh sách/báo cáo | Hiển thị cảnh báo tồn thấp | Đã kiểm hàm `isLowStock` bằng `test:logic` | Đạt |

### E. Nhà cung cấp

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-NCC-01 | Thêm nhà cung cấp hợp lệ | Kiểm tra thêm mới | Tên, địa chỉ, SĐT, người liên hệ | Submit form | Lưu thành công | Chưa ghi nhận | Chưa thực hiện |
| TC-NCC-02 | Thiếu tên nhà cung cấp | Kiểm tra bắt buộc | Tên rỗng | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-NCC-03 | Thiếu địa chỉ | Kiểm tra bắt buộc | Địa chỉ rỗng | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-NCC-04 | Thiếu số điện thoại | Kiểm tra bắt buộc | SĐT rỗng | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-NCC-05 | Thiếu người liên hệ | Kiểm tra bắt buộc | Người liên hệ rỗng | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-NCC-06 | Người không phải Quản lý thêm/sửa nhà cung cấp | Kiểm tra phân quyền | Tài khoản nhân viên | Thêm/sửa NCC | Bị từ chối nếu action yêu cầu Quản lý | Chưa ghi nhận | Chưa thực hiện |

### F. Phiếu mua hàng

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-PMH-01 | Lập phiếu mua hàng hợp lệ | Kiểm tra nhập hàng | NCC, SP, số lượng, đơn giá | Lập phiếu mua | Lưu thành công | Chưa ghi nhận | Chưa thực hiện |
| TC-PMH-02 | Chưa chọn nhà cung cấp | Kiểm tra bắt buộc | Không chọn NCC | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-PMH-03 | Số lượng mua <= 0 | Kiểm tra biên | `0`, `-1` | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-PMH-04 | Đơn giá mua <= 0 | Kiểm tra biên | `0`, `-1` | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-PMH-05 | Số lượng mua nhỏ hơn tối thiểu nếu có quy định | Kiểm tra tham số | Số lượng nhỏ hơn quy định | Submit form | Báo lỗi theo quy định | Chưa ghi nhận | Chưa thực hiện |
| TC-PMH-06 | Sau khi lưu, tồn kho tăng đúng | Kiểm tra tích hợp | SP tồn 1, nhập 3 | Lưu phiếu | Tồn kho = 4 | Đã kiểm bằng `npm run test:integration` | Đạt | `fe/scripts/integration.test.ts` |
| TC-PMH-07 | Cập nhật đơn giá nhập mới nhất | Kiểm tra tích hợp | Đơn giá mua mới | Lưu phiếu | `donGiaNhap` sản phẩm đổi theo giá mới | Đã kiểm trong transaction test mua hàng | Đạt | `fe/scripts/integration.test.ts` |
| TC-PMH-08 | Cập nhật đơn giá bán | Kiểm tra công thức | Giá mua mới, % LN | Lưu phiếu | Giá bán tính lại đúng | Đã kiểm bằng `calculateSellPrice` trong integration test | Đạt | `fe/scripts/integration.test.ts` |

### G. Phiếu bán hàng

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-PBH-01 | Lập phiếu bán hàng hợp lệ | Kiểm tra bán hàng | Khách hàng, SP còn tồn, SL hợp lệ | Lập phiếu bán | Lưu thành công | Chưa ghi nhận | Chưa thực hiện |
| TC-PBH-02 | Chưa nhập khách hàng | Kiểm tra bắt buộc | Tên khách rỗng | Submit form | Báo lỗi khách hàng | Chưa ghi nhận | Chưa thực hiện |
| TC-PBH-03 | Chưa chọn sản phẩm | Kiểm tra bắt buộc | Không có dòng SP | Submit form | Báo lỗi phiếu phải có sản phẩm | Chưa ghi nhận | Chưa thực hiện |
| TC-PBH-04 | Số lượng bán <= 0 | Kiểm tra biên | `0`, `-1` | Nhập số lượng | Báo lỗi | Đã kiểm nhánh hàm | Đạt |
| TC-PBH-05 | Số lượng bán vượt tồn kho | Kiểm tra an toàn tồn | Tồn 5, bán 6 | Nhập/lưu phiếu | Báo lỗi, không lưu | Đã kiểm hàm `canSellQuantity` | Đạt |
| TC-PBH-06 | Thành tiền = số lượng x đơn giá | Kiểm tra công thức dòng | SL 3, đơn giá 250.000 | Đổi SL | Thành tiền 750.000 | Đã kiểm `calculateLineTotal` | Đạt |
| TC-PBH-07 | Tổng tiền = tổng thành tiền | Kiểm tra tổng hóa đơn | Nhiều dòng SP | Xem tổng tiền | Tổng đúng | Đã kiểm `calculateInvoiceTotal` | Đạt |
| TC-PBH-08 | Sau khi lưu, tồn kho giảm đúng | Kiểm tra transaction | SP tồn 10, bán 2 | Lưu phiếu | Tồn còn 8 và doanh thu bán hàng tăng | Đã kiểm bằng `npm run test:integration` | Đạt | `fe/scripts/integration.test.ts` |
| TC-PBH-09 | In/xuất phiếu bán hàng | Kiểm tra báo biểu | Phiếu đã lưu | Mở/in phiếu | Phiếu hiển thị đúng | Chưa ghi nhận | Chưa thực hiện |

### H. Phiếu dịch vụ

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-PDV-01 | Lập phiếu dịch vụ hợp lệ | Kiểm tra nghiệp vụ dịch vụ | Khách, SĐT, dịch vụ, trả trước hợp lệ | Lập phiếu | Lưu thành công | Chưa ghi nhận | Chưa thực hiện |
| TC-PDV-02 | Thiếu tên khách hàng | Kiểm tra bắt buộc | Tên rỗng | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-PDV-03 | Thiếu số điện thoại | Kiểm tra bắt buộc | SĐT rỗng | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-PDV-04 | Chưa chọn loại dịch vụ | Kiểm tra bắt buộc | Không chọn DV | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-PDV-05 | Số lượng <= 0 | Kiểm tra biên | `0`, `-1` | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |
| TC-PDV-06 | Đơn giá được tính | Kiểm tra công thức | Đơn giá DV + chi phí phát sinh | Nhập chi phí | Đơn giá được tính đúng | Đã kiểm hàm `calculateServiceUnitPrice` | Đạt |
| TC-PDV-07 | Thành tiền = số lượng x đơn giá được tính | Kiểm tra công thức | SL, đơn giá được tính | Xem thành tiền | Thành tiền đúng | Đã kiểm hàm `calculateLineTotal` | Đạt |
| TC-PDV-08 | Trả trước < 50% thành tiền | Kiểm tra quy định | Trả trước 40% | Submit form | Báo lỗi theo quy định | Đã kiểm hàm `isPrepaidEnough` | Đạt |
| TC-PDV-09 | Tình trạng mặc định là Chưa giao/Chưa hoàn thành | Kiểm tra mặc định | Phiếu mới | Lưu phiếu | Tình trạng mặc định đúng | Chưa ghi nhận | Chưa thực hiện |
| TC-PDV-10 | Dịch vụ kiểm định phải có kết quả khi giao | Kiểm tra nghiệp vụ | Dòng kiểm định không có kết quả | Cập nhật giao | Đã có rule tự động báo lỗi, cần chạy UI tích hợp để xác nhận toàn luồng | Đã kiểm rule bằng `test:logic`, chưa chạy UI tích hợp | Chưa thực hiện |

### I. Tra cứu phiếu dịch vụ

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-TC-PDV-01 | Tra cứu theo số phiếu | Kiểm tra tìm kiếm | Số phiếu tồn tại | Nhập số phiếu | Hiển thị đúng phiếu | Chưa ghi nhận | Chưa thực hiện |
| TC-TC-PDV-02 | Tra cứu theo tên khách hàng | Kiểm tra tìm kiếm | Tên khách | Nhập tên | Hiển thị phiếu phù hợp | Chưa ghi nhận | Chưa thực hiện |
| TC-TC-PDV-03 | Tra cứu theo tình trạng | Kiểm tra lọc | Chưa hoàn thành/Hoàn thành | Chọn tình trạng | Danh sách lọc đúng | Chưa ghi nhận | Chưa thực hiện |
| TC-TC-PDV-04 | Tra cứu theo khoảng ngày | Kiểm tra lọc thời gian | Từ ngày, đến ngày | Lọc | Chỉ hiển thị phiếu trong khoảng | Chưa ghi nhận | Chưa thực hiện |
| TC-TC-PDV-05 | Phiếu hoàn thành khi tất cả dòng đã giao | Kiểm tra trạng thái tổng | Tất cả dòng đã giao | Cập nhật | Phiếu Hoàn thành | Đã siết logic server, chưa chạy test tích hợp DB | Chưa thực hiện |
| TC-TC-PDV-06 | Phiếu chưa hoàn thành khi còn dòng chưa giao | Kiểm tra trạng thái tổng | Một dòng chưa giao | Cập nhật | Phiếu Chưa hoàn thành | Đã siết logic server, chưa chạy test tích hợp DB | Chưa thực hiện |

### J. Báo cáo tồn kho

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-BCTK-01 | Lập báo cáo tồn kho theo tháng | Kiểm tra báo biểu | Tháng/năm | Mở báo cáo tồn kho | Hiển thị số liệu theo tháng | Chưa ghi nhận | Chưa thực hiện |
| TC-BCTK-02 | Tính tồn cuối | Kiểm tra công thức | Tồn đầu, mua vào, bán ra | Đối chiếu báo cáo | Tồn cuối = tồn đầu + mua vào - bán ra | Chưa ghi nhận | Chưa thực hiện |
| TC-BCTK-03 | Tồn đầu lấy từ tồn cuối tháng trước | Kiểm tra liên kỳ | Hai tháng liên tiếp | Xem báo cáo | Tồn đầu tháng sau = tồn cuối tháng trước | Chưa ghi nhận | Chưa thực hiện |
| TC-BCTK-04 | Tháng đầu không có dữ liệu | Kiểm tra biên dữ liệu | Tháng chưa có giao dịch trước | Xem báo cáo | Tồn đầu = 0 | Chưa ghi nhận | Chưa thực hiện |
| TC-BCTK-05 | Cảnh báo tồn thấp | Kiểm tra cảnh báo | Tồn cuối < tồn tối thiểu | Xem báo cáo | Hiển thị cảnh báo | Chưa ghi nhận | Chưa thực hiện |
| TC-BCTK-06 | Xuất PDF/In báo cáo | Kiểm tra báo biểu | Báo cáo đã lập | Bấm In/Xuất | File/bản in đúng dữ liệu | Chưa ghi nhận | Chưa thực hiện |

### K. Báo cáo doanh thu

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-BCDT-01 | Lập báo cáo doanh thu theo tháng | Kiểm tra báo biểu | Tháng/năm | Mở báo cáo | Hiển thị doanh thu tháng | Chưa ghi nhận | Chưa thực hiện |
| TC-BCDT-02 | Doanh thu khớp phiếu bán trong kỳ | Kiểm tra chính xác | Phiếu trong kỳ | Đối chiếu báo cáo | Tổng khớp phiếu | Chưa ghi nhận | Chưa thực hiện |
| TC-BCDT-03 | Không tính phiếu ngoài kỳ | Kiểm tra lọc thời gian | Phiếu ngoài tháng | Xem báo cáo | Không cộng phiếu ngoài kỳ | Chưa ghi nhận | Chưa thực hiện |
| TC-BCDT-04 | Tổng doanh thu tính đúng | Kiểm tra công thức | Doanh thu bán + dịch vụ | Xem tổng | Tổng đúng | Chưa ghi nhận | Chưa thực hiện |
| TC-BCDT-05 | Xuất PDF/In báo cáo | Kiểm tra báo biểu | Báo cáo đã lập | Bấm In/Xuất | File/bản in đúng dữ liệu | Chưa ghi nhận | Chưa thực hiện |

### L. Thay đổi quy định

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-QD-01 | Quản lý thay đổi tồn tối thiểu | Kiểm tra cập nhật tham số | Tồn tối thiểu mới | Admin lưu quy định | Lưu thành công | Chưa ghi nhận | Chưa thực hiện |
| TC-QD-02 | Quản lý thay đổi số lượng nhập tối thiểu | Kiểm tra cập nhật tham số | Số lượng nhập tối thiểu | Admin lưu | Lưu thành công | Chưa ghi nhận | Chưa thực hiện |
| TC-QD-03 | Người không có quyền thay đổi quy định | Kiểm tra phân quyền | Tài khoản nhân viên | Mở/lưu quy định | Bị từ chối | Chưa ghi nhận | Chưa thực hiện |
| TC-QD-04 | Tham số không hợp lệ | Kiểm tra validation | Số âm, tỷ lệ sai | Submit form | Báo lỗi | Chưa ghi nhận | Chưa thực hiện |

### M. Sao lưu và phục hồi dữ liệu

| Mã TC | Chức năng | Mục tiêu kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|---|
| TC-BACKUP-01 | Sao lưu dữ liệu | Kiểm tra tạo backup | `DATABASE_URL`, `BACKUP_DIR` | Chạy `npm run db:backup` | Sinh file `.sql` | Có script, chưa chạy lại trong đợt rà soát này | Chưa thực hiện |
| TC-BACKUP-02 | Phục hồi từ file hợp lệ | Kiểm tra restore | `BACKUP_FILE`, `RESTORE_CONFIRM=YES` | Chạy `npm run db:restore` | Dữ liệu được phục hồi | Chưa ghi nhận | Chưa thực hiện |
| TC-BACKUP-03 | Phục hồi từ file không hợp lệ | Kiểm tra lỗi | File sai/không tồn tại | Chạy restore | Báo lỗi, không phục hồi | Có xử lý trong script, cần chạy lại để lấy log bằng chứng | Chưa thực hiện |
| TC-BACKUP-04 | Người không có quyền không được sao lưu/phục hồi | Kiểm tra quy trình vận hành | Người không phụ trách | Yêu cầu backup/restore | Bị từ chối theo quy trình | Chưa ghi nhận | Chưa thực hiện |
| TC-BACKUP-05 | Phục hồi phải có xác nhận | Kiểm tra an toàn | Thiếu `RESTORE_CONFIRM=YES` | Chạy restore | Script dừng và báo cần xác nhận | Có xử lý trong script, cần chạy lại để lấy log bằng chứng | Chưa thực hiện |

## Z.6. Kiểm thử hộp đen

| Chức năng | Lớp dữ liệu hợp lệ | Lớp dữ liệu không hợp lệ | Giá trị biên | Kết quả mong đợi |
|---|---|---|---|---|
| % lợi nhuận loại sản phẩm | 0 đến 100 | < 0 hoặc > 100 | 0, 100, -1, 101 | Hợp lệ thì lưu; không hợp lệ thì báo lỗi |
| Hàm lượng sản phẩm | 24K, 22K, 18K, 14K, 10K tương ứng K24/K22/K18/K14/K10 trong code | 25K, abc, rỗng | K24, K10, rỗng | Hợp lệ thì cho lưu; không hợp lệ thì báo lỗi |
| Số lượng bán | 1 đến tồn kho | 0, âm, lớn hơn tồn kho | 1, tồn kho, tồn kho + 1, 0 | Không cho bán vượt tồn hoặc số lượng không hợp lệ |
| Trả trước dịch vụ | >= 50% thành tiền theo quy định | < 50% thành tiền | 50%, 49%, 0% | Hợp lệ thì cho lưu; không hợp lệ thì báo lỗi |
| Tồn cuối báo cáo | Tồn cuối >= tồn tối thiểu | Tồn cuối < tồn tối thiểu | Tồn tối thiểu - 1, tồn tối thiểu, tồn tối thiểu + 1 | Chỉ tồn dưới ngưỡng mới cảnh báo |
| Số điện thoại khách hàng | Đầu 0 hoặc +84, độ dài hợp lệ | Chữ, ký tự đặc biệt, quá ngắn, quá dài | `0901234567`, `12345`, `abc123` | Hợp lệ thì cho lưu; không hợp lệ thì báo lỗi |

## Z.7. Kiểm thử hộp trắng

| Thuật toán | Nhánh kiểm thử | Kết quả mong đợi |
|---|---|---|
| Thêm đơn vị tính | Tên hợp lệ và chưa trùng | Tạo đơn vị thành công |
| Thêm đơn vị tính | Tên rỗng | Trả lỗi validation |
| Thêm đơn vị tính | Tên trùng | Trả lỗi unique |
| Thêm loại sản phẩm | Dữ liệu hợp lệ | Tạo loại sản phẩm |
| Thêm loại sản phẩm | % lợi nhuận < 0 hoặc > 100 | Trả lỗi validation |
| Thêm/sửa sản phẩm | Giá nhập hợp lệ, loại sản phẩm tồn tại | Tính giá bán và lưu |
| Thêm/sửa sản phẩm | Loại sản phẩm không tồn tại | Trả lỗi loại sản phẩm không hợp lệ |
| Thêm/sửa sản phẩm | Trọng lượng hoặc giá nhập không hợp lệ | Trả lỗi validation |
| Lập phiếu bán hàng | Tồn kho đủ | Cho lưu phiếu và giảm tồn |
| Lập phiếu bán hàng | Tồn kho không đủ | Báo lỗi, không lưu phiếu |
| Lập phiếu bán hàng | Số lượng không hợp lệ | Báo lỗi validation |
| Lập phiếu bán hàng | Lưu thành công | Cập nhật tồn kho trong transaction |
| Lập phiếu mua hàng | Sản phẩm tồn tại | Lưu chi tiết, tăng tồn, cập nhật giá nhập/giá bán |
| Lập phiếu mua hàng | Sản phẩm không tồn tại | Báo lỗi và rollback transaction |
| Lập phiếu dịch vụ | Trả trước đạt tỷ lệ tối thiểu | Cho lưu phiếu |
| Lập phiếu dịch vụ | Trả trước dưới tỷ lệ tối thiểu | Báo lỗi |
| Cập nhật phiếu dịch vụ kiểm định | Dòng kiểm định có kết quả | Cho cập nhật ngày giao |
| Cập nhật phiếu dịch vụ kiểm định | Dòng kiểm định thiếu kết quả | Báo lỗi, không giao dòng kiểm định |
| Cập nhật trạng thái phiếu dịch vụ | Tất cả dòng có ngày giao | Phiếu chuyển Hoàn thành |
| Cập nhật trạng thái phiếu dịch vụ | Còn dòng chưa có ngày giao | Phiếu vẫn Chưa hoàn thành |
| Lập báo cáo tồn kho | Có dữ liệu tháng trước | Tồn đầu lấy từ tồn cuối tháng trước |
| Lập báo cáo tồn kho | Không có dữ liệu tháng trước | Tồn đầu = 0 |

## Z.8. Kiểm thử tích hợp

| Luồng tích hợp | Nội dung kiểm thử | Kết quả mong đợi |
|---|---|---|
| Loại sản phẩm -> Sản phẩm | Loại sản phẩm cung cấp đơn vị tính và % lợi nhuận cho sản phẩm | Khi chọn loại, sản phẩm có đơn vị tính đúng và giá bán tính theo % lợi nhuận |
| Sản phẩm -> Phiếu bán hàng -> Tồn kho | Khi bán hàng, hệ thống kiểm tra tồn và giảm tồn | Không bán vượt tồn; lưu phiếu thành công thì tồn giảm |
| Sản phẩm -> Phiếu mua hàng -> Tồn kho | Khi mua hàng, hệ thống tăng tồn và cập nhật giá nhập | Tồn tăng, giá nhập mới nhất và giá bán được cập nhật |
| Phiếu dịch vụ -> Tra cứu phiếu dịch vụ | Cập nhật tình trạng giao và tra cứu lại | Trạng thái hiển thị đúng |
| Phiếu bán/Phiếu mua -> Báo cáo tồn kho | Báo cáo tổng hợp mua vào và bán ra | Số liệu báo cáo khớp giao dịch |
| Phiếu bán hàng -> Báo cáo doanh thu | Báo cáo lấy dữ liệu từ phiếu bán | Doanh thu trong kỳ khớp tổng phiếu bán |

## Z.9. Kiểm thử hệ thống

| Kịch bản | Các bước | Kết quả mong đợi |
|---|---|---|
| Kịch bản 1 | Quản lý đăng nhập -> thêm đơn vị tính -> thêm loại sản phẩm -> thêm sản phẩm -> lập phiếu mua hàng -> kiểm tra tồn kho | Dữ liệu được tạo đúng, tồn kho tăng sau phiếu mua |
| Kịch bản 2 | Nhân viên đăng nhập -> lập phiếu bán hàng -> hệ thống kiểm tra tồn -> lưu phiếu -> tồn kho giảm -> báo cáo tồn kho cập nhật | Phiếu bán lưu thành công, tồn kho giảm đúng, báo cáo phản ánh giao dịch |
| Kịch bản 3 | Nhân viên lập phiếu dịch vụ -> khách trả trước đủ 50% -> cập nhật trạng thái giao -> tra cứu phiếu dịch vụ | Phiếu được tạo, trạng thái cập nhật đúng, tra cứu hiển thị Hoàn thành |
| Kịch bản 4 | Quản lý lập báo cáo doanh thu tháng -> đối chiếu với phiếu bán hàng trong tháng | Doanh thu tháng khớp tổng phiếu trong kỳ |

## Z.10. Kiểm thử chấp nhận

### Alpha testing

- Nhóm phát triển tự kiểm tra các chức năng chính trước khi trình bày.
- Thành viên trong nhóm đóng vai Quản lý, Nhân viên bán hàng, Nhân viên dịch vụ.
- Chạy các lệnh kiểm tra kỹ thuật: `npm run test:logic`, `npm run lint`, `npm run build`.
- Ghi nhận lỗi, phân loại mức độ nghiêm trọng và sửa trước khi nghiệm thu.

### Beta testing giả lập

- Nhờ người ngoài nhóm hoặc người dùng giả định thao tác thử.
- Tập trung vào tính dễ dùng, tính rõ ràng của giao diện, khả năng nhập liệu và tra cứu.
- Kịch bản beta gồm: tra cứu sản phẩm, lập phiếu bán, lập phiếu dịch vụ, tra cứu phiếu, xem báo cáo tồn kho/doanh thu.
- Thu thập phản hồi để cải thiện tên nút, bố cục form, thông báo lỗi và cách trình bày báo cáo.

## Z.11. Bảo trì phần mềm

| Loại bảo trì | Áp dụng vào đồ án |
|---|---|
| Sửa lại cho đúng - Corrective maintenance | Sửa lỗi phát sinh trong quá trình sử dụng. Ví dụ: sai công thức tồn kho, sai tổng tiền phiếu bán, lỗi phân quyền, lỗi không cập nhật giá bán khi đổi giá nhập. |
| Thích ứng - Adaptive maintenance | Điều chỉnh khi môi trường thay đổi. Ví dụ: đổi phiên bản PostgreSQL, nâng Next.js/Prisma, thay đổi môi trường triển khai Docker/server. |
| Hoàn thiện - Perfective maintenance | Bổ sung yêu cầu mới. Ví dụ: xuất Excel, biểu đồ doanh thu nâng cao, tích điểm khách hàng, quản lý giá vàng theo ngày, quản lý thuộc tính kim cương chi tiết. |
| Bảo vệ/phòng ngừa - Preventive maintenance | Làm hệ thống dễ bảo trì hơn. Ví dụ: refactor code, chuẩn hóa validation, thêm test, sao lưu định kỳ, hash mật khẩu, viết tài liệu kỹ thuật. |

## Z.12. Kế hoạch bảo trì

| STT | Hạng mục bảo trì | Tần suất | Người phụ trách | Cách thực hiện | Ghi chú |
|---:|---|---|---|---|---|
| 1 | Sao lưu CSDL định kỳ | Hằng ngày hoặc trước khi deploy | Quản trị hệ thống | Chạy `npm run db:backup` trong thư mục `fe` hoặc dùng backup của hosting | File backup lưu trong `BACKUP_DIR`, không commit lên Git |
| 2 | Phục hồi CSDL | Khi có sự cố hoặc cần khôi phục môi trường | Quản trị hệ thống | Chạy `BACKUP_FILE=... RESTORE_CONFIRM=YES npm run db:restore` | Phải xác nhận trước khi restore |
| 3 | Kiểm tra log lỗi | Hằng tuần và sau deploy | Nhóm phát triển | Xem log server, Docker log, lỗi Prisma/NextAuth | Ưu tiên lỗi ảnh hưởng bán hàng/tồn kho |
| 4 | Kiểm tra dữ liệu tồn kho bất thường | Hằng tuần | Quản lý + kỹ thuật | Đối chiếu tồn kho, phiếu mua, phiếu bán, báo cáo tồn | Tập trung sản phẩm tồn âm hoặc thấp bất thường |
| 5 | Kiểm tra tài khoản và phân quyền | Hằng tháng | Quản lý | Rà tài khoản, nhóm quyền, route admin | Thu hồi tài khoản không dùng |
| 6 | Cập nhật quy định kinh doanh | Khi có thay đổi quy định | Quản lý | Cập nhật trong màn hình Thay đổi quy định | Sau cập nhật phải test lại bán hàng/dịch vụ |
| 7 | Kiểm thử hồi quy sau sửa lỗi | Mỗi lần sửa lỗi | Nhóm phát triển | Chạy test liên quan và test tích hợp | Không chỉ test đúng lỗi vừa sửa |
| 8 | Cập nhật tài liệu hướng dẫn sử dụng | Khi thêm/sửa module | Nhóm phát triển | Cập nhật README và tài liệu trong `docs/` | Đảm bảo người mới chạy được |
| 9 | Kiểm tra khả năng phục hồi dữ liệu | Hằng tháng | Quản trị hệ thống | Restore thử trên môi trường test | Không restore thử trực tiếp production |

## Z.13. Kiểm thử hồi quy sau bảo trì

Sau khi sửa lỗi hoặc cập nhật tính năng, cần chạy lại các nhóm test sau:

- **Sản phẩm:** thêm/sửa sản phẩm, tính giá bán, cảnh báo tồn thấp.
- **Phiếu mua hàng:** lập phiếu mua, tăng tồn kho, cập nhật giá nhập và giá bán.
- **Phiếu bán hàng:** lập phiếu bán, kiểm tra tồn kho, tính tổng tiền, giảm tồn.
- **Tồn kho:** báo cáo tồn kho sau mua/bán, cảnh báo tồn thấp.
- **Báo cáo doanh thu:** doanh thu trong kỳ, tổng doanh thu, loại trừ phiếu ngoài kỳ.
- **Phân quyền:** route admin, quyền nhân viên, quyền thay đổi quy định.
- **Sao lưu/phục hồi:** backup thành công, restore có xác nhận, file không hợp lệ bị từ chối.

## Z.14. Kiểm tra code thật đã thực hiện

| Hạng mục kiểm tra | Kết quả |
|---|---|
| Đọc project và xác định stack | Đã xác định: Next.js 14, React 18, TypeScript, Prisma, PostgreSQL, NextAuth |
| Đối chiếu module với báo cáo | Đã đối chiếu các module route/app hiện có |
| Kiểm tra validation | Đã có Zod/React Hook Form cho nhiều form; bổ sung schema khách hàng |
| Kiểm tra phân quyền | Middleware bảo vệ route admin; có bảng phân quyền mềm `BangPhanQuyen`, action quản lý phân quyền và kiểm tra quyền cho các action nghiệp vụ bán/mua/dịch vụ chính; cần bổ sung E2E để ghi nhận bằng chứng từ trình duyệt |
| Kiểm tra luồng nghiệp vụ | Phiếu bán và phiếu mua dùng transaction cập nhật tồn kho; đã bổ sung kiểm tra thành tiền phiếu mua ở server action |
| Kiểm tra business rules | Đã siết rule giá nhập/đơn giá > 0, % lợi nhuận 0-100, tồn thấp theo `< tồn tối thiểu`, tính tồn cuối, trả trước dịch vụ, kết quả kiểm định khi giao |
| Kiểm tra phiếu dịch vụ | Đã bổ sung kiểm tra kết quả kiểm định trước khi giao và cập nhật trạng thái phiếu theo số dòng đã giao |
| Sao lưu/phục hồi | Đã có script `db-backup.js`, `db-restore.js` và npm scripts; chưa có route giao diện riêng cho màn hình Sao lưu/phục hồi |
| Bảo mật mật khẩu | Mật khẩu tạo mới và seed đã hash bằng `bcryptjs`; tài khoản plaintext cũ được lazy migration sang hash sau lần đăng nhập thành công đầu tiên |
| Sửa code thiếu | Đã bổ sung/siết business rules, test logic, validation schema giao dịch/dịch vụ và logic cập nhật phiếu dịch vụ |
| Không đổi framework | Giữ nguyên Next.js/React/Prisma/PostgreSQL |
| Không phá chức năng đang chạy | Đã chạy lại `npm run lint`, `npm run test:logic`, `npm run test:integration`, `npm run build` sau khi chỉnh kiểm thử/validation |

## Z.16. Bằng chứng kiểm thử kỹ thuật sau rà soát

| Lệnh kiểm tra | Mục tiêu | Kết quả |
|---|---|---|
| `npm run test:logic` | Kiểm thử các hàm nghiệp vụ lõi: tính giá bán, thành tiền, tồn cuối, trả trước dịch vụ, kết quả kiểm định | Đạt |
| `npm run test:integration` | Kiểm thử tích hợp DB cho 3 luồng chí mạng: phiếu bán cập nhật `BaoCaoDoanhThu` & tồn kho; phiếu mua tăng tồn + tự tính `donGiaBan`; đổi % lợi nhuận LSP áp dụng round nhất quán cho mọi sản phẩm | Đạt |
| `npm run lint` | Kiểm tra lỗi lint và cảnh báo code | Đạt |
| `npm run build` | Build production, kiểm tra type, route và khả năng dựng ứng dụng | Đạt |

Bằng chứng tự động hiện cover đủ logic đơn vị + 3 luồng tích hợp nghiệp vụ chí mạng. Test E2E giao diện và phục hồi dữ liệu vẫn cần chạy thủ công định kỳ.

## Z.15. Checklist tự kiểm tra cuối cùng

### Checklist thiết kế giao diện

- [x] Đã có sơ đồ liên kết màn hình.
- [x] Đã có danh sách màn hình.
- [x] Đã phân loại màn hình theo màn hình chính/nhập liệu/tra cứu/thông báo/báo biểu.
- [x] Đã mô tả control cho màn hình chính.
- [x] Đã mô tả biến cố và xử lý.
- [x] Đã bám đúng nghiệp vụ vàng bạc đá quý.
- [x] Đã có màn hình cho các module nghiệp vụ chính trong phạm vi đồ án.

### Checklist cài đặt

- [x] Đã nêu phương pháp cài đặt.
- [x] Đã nêu môi trường cài đặt.
- [x] Đã nêu thứ tự cài đặt module.
- [x] Đã nêu phong cách lập trình.
- [x] Đã có hướng dẫn chạy/cài đặt.

### Checklist kiểm thử

- [x] Đã có mục tiêu kiểm thử.
- [x] Đã có phạm vi kiểm thử.
- [x] Đã có test case cho từng module bắt buộc.
- [x] Đã có kiểm thử hộp đen.
- [x] Đã có kiểm thử hộp trắng.
- [x] Đã có kiểm thử tích hợp.
- [x] Đã có kiểm thử hệ thống.
- [x] Đã có kiểm thử chấp nhận.
- [x] Đã có kiểm thử hồi quy.

### Checklist bảo trì

- [x] Đã có 4 loại bảo trì.
- [x] Đã áp dụng 4 loại bảo trì vào đồ án.
- [x] Đã có kế hoạch sao lưu/phục hồi.
- [x] Đã có kế hoạch kiểm tra log/lỗi.
- [x] Đã có kế hoạch cập nhật quy định.
- [x] Đã có kế hoạch test lại sau bảo trì.
