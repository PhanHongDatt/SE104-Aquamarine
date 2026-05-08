# CHƯƠNG 7. THIẾT KẾ GIAO DIỆN

Chương này trình bày thiết kế giao diện cho hệ thống quản lý cửa hàng vàng bạc đá quý Aquamarine. Nội dung được đối chiếu với mã nguồn hiện tại trong thư mục `fe/`, sử dụng Next.js 14, React 18, TypeScript, Tailwind CSS, NextAuth, Server Actions và Prisma/PostgreSQL.

## 7.1. Mục tiêu thiết kế giao diện

Giao diện của hệ thống được thiết kế nhằm hỗ trợ người dùng thao tác trực tiếp với các nghiệp vụ quản lý cửa hàng vàng bạc đá quý. Người dùng chính gồm Quản lý và Nhân viên; mỗi vai trò nhìn thấy nhóm chức năng phù hợp với quyền hạn.

Các mục tiêu cụ thể:

- Giao diện dễ học, dễ nhớ, dễ thao tác, hạn chế sai sót khi nhập liệu sản phẩm, phiếu mua hàng, phiếu bán hàng và phiếu dịch vụ.
- Giao diện hỗ trợ đầy đủ các nghiệp vụ chính: danh mục, sản phẩm, mua hàng, bán hàng, dịch vụ, tra cứu, báo cáo, phân quyền, thay đổi quy định, sao lưu và phục hồi dữ liệu.
- Bố cục màn hình nhất quán giữa các module: tiêu đề ở đầu trang, vùng nhập liệu/tra cứu ở phần chính, bảng dữ liệu ở dưới hoặc bên cạnh, nút xử lý đặt gần vùng dữ liệu liên quan.
- Nút xử lý, màu sắc, thông báo và cảnh báo được dùng thống nhất. Các thao tác quan trọng như xóa, phục hồi dữ liệu, cập nhật quy định phải có xác nhận hoặc thông báo kết quả.
- Các màn hình nhập liệu kiểm tra ràng buộc tự nhiên và ràng buộc nghiệp vụ, ví dụ không bán vượt tồn kho, không cho tỷ lệ lợi nhuận ngoài khoảng 0-100, không cho trả trước dịch vụ dưới tỷ lệ quy định.

## 7.2. Sơ đồ liên kết các màn hình

Sơ đồ liên kết màn hình được thiết kế theo luồng đăng nhập trước, sau đó điều hướng đến dashboard theo vai trò. Báo cáo hiện tại chưa có hình vẽ riêng; khi đưa vào bản Word/PDF có thể chèn hình sơ đồ navigation dựa trên cây sau.

```text
Đăng nhập
  -> Màn hình chính/Dashboard
      -> Quản lý đơn vị tính
      -> Quản lý loại sản phẩm
      -> Quản lý sản phẩm
      -> Quản lý khách hàng
      -> Quản lý nhà cung cấp
      -> Lập phiếu bán hàng
          -> Danh sách phiếu bán hàng
          -> In phiếu bán hàng
      -> Lập phiếu mua hàng
          -> Danh sách phiếu mua hàng
          -> In phiếu mua hàng
      -> Lập phiếu dịch vụ
          -> Tra cứu phiếu dịch vụ
          -> Chi tiết phiếu dịch vụ
          -> Cập nhật tình trạng giao/trả
      -> Báo cáo tồn kho
          -> In/Xuất báo cáo tồn kho
      -> Báo cáo doanh thu
          -> In/Xuất báo cáo doanh thu
      -> Phân quyền người dùng
      -> Thay đổi quy định
      -> Sao lưu và phục hồi dữ liệu
      -> Tài khoản người dùng
```

Đối chiếu code hiện tại:

- Các màn hình đăng nhập, dashboard, danh mục, giao dịch, dịch vụ, báo cáo, phân quyền, thay đổi quy định và sao lưu/phục hồi đã có route trong `fe/src/app`.
- Chức năng sao lưu/phục hồi có UI tại `/admin/cai-dat/sao-luu-phuc-hoi`, dùng lại script vận hành `fe/scripts/db-backup.js`, `fe/scripts/db-restore.js` và có kiểm tra quyền `HT_BAK`.

## 7.3. Danh sách các màn hình

| STT | Tên màn hình | Loại màn hình | Chức năng | Người dùng chính | Ghi chú |
|---:|---|---|---|---|---|
| 1 | Đăng nhập | Nhập liệu/xác thực | Cho phép người dùng đăng nhập vào hệ thống | Quản lý, Nhân viên | Route `/(auth)/dang-nhap` |
| 2 | Màn hình chính/Dashboard | Màn hình chính | Hiển thị menu chức năng, thống kê nhanh, cảnh báo tồn thấp | Quản lý, Nhân viên | Admin và nhân viên có dashboard riêng |
| 3 | Quản lý đơn vị tính | Nhập liệu + tra cứu | Thêm/sửa/xóa đơn vị tính theo quy định DVT | Quản lý | Nhân viên được xem |
| 4 | Quản lý loại sản phẩm | Nhập liệu + tra cứu | Quản lý LSP, đơn vị tính mặc định, phần trăm lợi nhuận | Quản lý | Nhân viên được xem |
| 5 | Quản lý sản phẩm | Nhập liệu + tra cứu | Quản lý sản phẩm, hàm lượng, trọng lượng, giá nhập, giá bán, tồn tối thiểu | Quản lý | Nhân viên được xem |
| 6 | Lập phiếu bán hàng | Nhập liệu nghiệp vụ | Lập phiếu bán, tính thành tiền, kiểm tra tồn kho, cập nhật tồn kho | Quản lý, Nhân viên bán hàng | Có danh sách phiếu và in phiếu |
| 7 | Lập phiếu mua hàng | Nhập liệu nghiệp vụ | Lập phiếu mua, cập nhật tồn kho, cập nhật đơn giá nhập và đơn giá bán | Quản lý, Nhân viên được phân công | Có danh sách phiếu và in phiếu |
| 8 | Lập phiếu dịch vụ | Nhập liệu nghiệp vụ | Lập phiếu dịch vụ, tính tiền, kiểm tra trả trước tối thiểu | Quản lý, Nhân viên dịch vụ | Có loại dịch vụ Gia công/Kiểm định |
| 9 | Tra cứu phiếu dịch vụ | Tra cứu | Tìm kiếm phiếu theo số phiếu, khách hàng, ngày, tình trạng | Quản lý, Nhân viên dịch vụ | Có màn hình chi tiết |
| 10 | Quản lý nhà cung cấp | Nhập liệu + tra cứu | Thêm/sửa nhà cung cấp | Quản lý | Dùng khi lập phiếu mua |
| 11 | Báo cáo tồn kho | Báo biểu | Lập báo cáo tồn kho theo tháng, cảnh báo tồn thấp | Quản lý, Nhân viên được phép | Có bản in |
| 12 | Báo cáo doanh thu | Báo biểu | Tổng hợp doanh thu theo thời gian | Quản lý | Nhân viên bị giới hạn quyền |
| 13 | Phân quyền người dùng | Nhập liệu hệ thống | Quản lý nhóm người dùng, chức năng, bảng phân quyền/tài khoản | Quản lý/Admin | Route `/admin/cai-dat/phan-quyen` |
| 14 | Thay đổi quy định | Nhập liệu cấu hình | Thay đổi tham số như tồn tối thiểu, tỷ lệ trả trước, tỷ lệ lợi nhuận | Quản lý/Admin | Route `/admin/cai-dat/quy-dinh` |
| 15 | Sao lưu và phục hồi dữ liệu | Màn hình hệ thống | Sao lưu CSDL, phục hồi dữ liệu | Quản lý/Admin | Route `/admin/cai-dat/sao-luu-phuc-hoi` |
| 16 | Thông báo/Xác nhận | Thông báo | Hiển thị thành công, thất bại, xác nhận xóa, cảnh báo lỗi | Tất cả người dùng | Dùng toast/modal |

## 7.4. Mô tả chi tiết các màn hình

### 7.4.1. Màn hình Quản lý đơn vị tính

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `txtTenDonViTinh` | TextBox | Không rỗng, không trùng | Nhập tên đơn vị tính như chỉ, lượng, gram, cái, viên |
| 2 | `numDinhLuong` | NumberBox | Có thể rỗng, nếu nhập phải > 0 | Ghi nhận định lượng quy đổi nếu cần |
| 3 | `btnThem` | Button | Chỉ Quản lý | Thêm đơn vị tính |
| 4 | `btnSua` | Button | Chỉ Quản lý | Sửa đơn vị tính đang chọn |
| 5 | `btnXoa` | Button | Chỉ Quản lý, không xóa nếu đang được sản phẩm/loại sản phẩm sử dụng | Xóa đơn vị tính |
| 6 | `tblDonViTinh` | Table | Hiển thị dữ liệu hiện có | Danh sách đơn vị tính |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Chọn Thêm | Kiểm tra quyền, kiểm tra rỗng, kiểm tra trùng tên, tự sinh mã DVT, lưu CSDL |
| 2 | Chọn Sửa | Kiểm tra quyền, validate dữ liệu, kiểm tra trùng tên ngoài bản ghi hiện tại, cập nhật CSDL |
| 3 | Chọn Xóa | Kiểm tra quyền, kiểm tra DVT đang được dùng bởi loại sản phẩm/sản phẩm; nếu có thì báo lỗi |
| 4 | Chọn một dòng bảng | Nạp dữ liệu lên form để xem hoặc chỉnh sửa |

### 7.4.2. Màn hình Quản lý loại sản phẩm

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `txtTenLoaiSanPham` | TextBox | Không rỗng, không trùng | Nhập tên loại như Nhẫn vàng, Dây chuyền, Kim cương |
| 2 | `cboDonViTinhMacDinh` | ComboBox | Đơn vị tính phải tồn tại | Chọn đơn vị tính mặc định |
| 3 | `numPhanTramLoiNhuan` | NumberBox | 0 đến 100 | Nhập phần trăm lợi nhuận |
| 4 | `btnThem`/`btnSua`/`btnXoa` | Button | Chỉ Quản lý | Thêm, sửa, xóa loại sản phẩm |
| 5 | `tblLoaiSanPham` | Table | Hiển thị danh sách LSP | Tra cứu và chọn loại sản phẩm |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Thêm loại sản phẩm | Validate tên, DVT, phần trăm lợi nhuận; tự sinh mã LSP; lưu CSDL |
| 2 | Sửa phần trăm lợi nhuận | Cập nhật LSP trong transaction; tính lại giá bán của các sản phẩm thuộc loại |
| 3 | Xóa loại sản phẩm | Nếu loại đang có sản phẩm thì chặn xóa và thông báo |
| 4 | Chọn DVT | Chỉ cho chọn DVT có trong danh mục đơn vị tính |

### 7.4.3. Màn hình Quản lý sản phẩm

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `txtTenSanPham` | TextBox | Không rỗng, tối đa 200 ký tự | Nhập tên sản phẩm |
| 2 | `cboLoaiSanPham` | ComboBox | Loại sản phẩm phải tồn tại | Chọn loại sản phẩm |
| 3 | `cboHamLuong` | ComboBox | 24K, 22K, 18K, 14K, 10K tương ứng code K24, K22, K18, K14, K10 | Chọn hàm lượng |
| 4 | `numTrongLuong` | NumberBox | > 0 | Nhập trọng lượng |
| 5 | `txtDonViTinh` | Readonly | Tự gán theo loại sản phẩm | Hiển thị đơn vị tính |
| 6 | `numTonToiThieu` | NumberBox | >= 0 | Nhập tồn tối thiểu |
| 7 | `numDonGiaNhap` | NumberBox | > 0 | Nhập đơn giá nhập |
| 8 | `txtDonGiaBan` | Readonly/Calculated | Tự tính theo phần trăm lợi nhuận | Hiển thị đơn giá bán |
| 9 | `txtLoiNhuan` | Readonly | Lấy từ loại sản phẩm | Hiển thị tỷ lệ lợi nhuận |
| 10 | `btnThem`/`btnSua`/`btnXoa`/`btnLamMoi` | Button | Chỉ Quản lý với thêm/sửa/xóa | Xử lý dữ liệu sản phẩm |
| 11 | `tblSanPham` | Table | Hiển thị danh sách và tồn kho | Tra cứu sản phẩm |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Chọn loại sản phẩm | Tự động gán đơn vị tính và phần trăm lợi nhuận |
| 2 | Nhập đơn giá nhập | Tự tính đơn giá bán = đơn giá nhập x (1 + % lợi nhuận/100) |
| 3 | Chọn Lưu | Validate tên, hàm lượng, trọng lượng, giá nhập, tồn tối thiểu; tự sinh mã SP; lưu CSDL |
| 4 | Chọn Xóa | Chặn xóa nếu sản phẩm đã có chi tiết mua/bán |
| 5 | Xem danh sách | Nếu tồn kho < tồn tối thiểu thì hiển thị cảnh báo tồn thấp |

### 7.4.4. Màn hình Lập phiếu bán hàng

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `txtSoPhieu` | TextBox readonly | Tự sinh | Hiển thị số phiếu bán |
| 2 | `dtpNgayLap` | DatePicker readonly | Mặc định ngày hiện tại | Hiển thị ngày lập |
| 3 | `txtKhachHang` | TextBox | Không rỗng theo thiết kế nghiệp vụ | Nhập tên khách hàng |
| 4 | `cboSanPham` | ComboBox/Search | Sản phẩm phải tồn tại và còn tồn | Chọn sản phẩm bán |
| 5 | `numSoLuong` | NumberBox | > 0 và <= tồn kho | Nhập số lượng bán |
| 6 | `txtDonViTinh` | Readonly | Theo sản phẩm | Hiển thị đơn vị tính |
| 7 | `txtDonGia` | Readonly | Lấy đơn giá bán | Hiển thị đơn giá |
| 8 | `txtThanhTien` | Readonly | Số lượng x đơn giá | Thành tiền dòng |
| 9 | `tblChiTietBanHang` | Table | Phải có ít nhất một dòng | Danh sách sản phẩm trong phiếu |
| 10 | `txtTongTien` | Readonly | Tổng thành tiền | Hiển thị tổng tiền |
| 11 | `btnThemDong`/`btnXoaDong` | Button | Dòng hợp lệ | Thêm/xóa dòng sản phẩm |
| 12 | `btnLuuPhieu`/`btnInPhieu` | Button | Phiếu hợp lệ mới được lưu/in | Lưu và in phiếu |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Chọn sản phẩm | Hiển thị đơn vị tính, đơn giá bán, tồn kho hiện tại |
| 2 | Nhập số lượng | Kiểm tra số lượng > 0 và không vượt tồn kho; tính thành tiền |
| 3 | Thêm dòng | Kiểm tra sản phẩm chưa bị trùng dòng hoặc gộp số lượng; cập nhật tổng tiền |
| 4 | Lưu phiếu | Tạo phiếu và chi tiết trong transaction; kiểm tồn lần cuối; giảm tồn kho |
| 5 | In phiếu | Xuất mẫu phiếu bán hàng có số phiếu, khách hàng, chi tiết, tổng tiền |

### 7.4.5. Màn hình Lập phiếu mua hàng

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `txtSoPhieu` | TextBox readonly | Tự sinh | Hiển thị số phiếu mua |
| 2 | `dtpNgayLap` | DatePicker readonly | Mặc định ngày hiện tại | Hiển thị ngày lập |
| 3 | `cboNhaCungCap` | ComboBox | Bắt buộc, NCC phải tồn tại | Chọn nhà cung cấp |
| 4 | `txtDiaChi`/`txtSoDienThoai` | Readonly | Lấy từ NCC | Hiển thị thông tin NCC |
| 5 | `cboSanPham` | ComboBox/Search | Sản phẩm phải tồn tại | Chọn sản phẩm nhập |
| 6 | `numSoLuong` | NumberBox | > 0, thỏa số lượng nhập tối thiểu nếu có | Nhập số lượng mua |
| 7 | `numDonGiaMua` | NumberBox | > 0 | Nhập đơn giá mua |
| 8 | `txtThanhTien` | Readonly | Số lượng x đơn giá mua | Thành tiền dòng |
| 9 | `tblChiTietMuaHang` | Table | Có ít nhất một dòng | Danh sách hàng nhập |
| 10 | `txtTongTien` | Readonly | Tổng thành tiền | Tổng tiền phiếu mua |
| 11 | `btnLuuPhieu`/`btnInPhieu` | Button | Phiếu hợp lệ | Lưu và in phiếu mua |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Chọn nhà cung cấp | Hiển thị địa chỉ và số điện thoại |
| 2 | Nhập số lượng/đơn giá | Validate > 0, tính thành tiền |
| 3 | Lưu phiếu | Tạo phiếu mua và chi tiết; tăng tồn kho; cập nhật đơn giá nhập mới nhất |
| 4 | Cập nhật giá nhập | Tính lại đơn giá bán theo phần trăm lợi nhuận của loại sản phẩm |
| 5 | In phiếu | Xuất phiếu mua hàng phục vụ lưu trữ |

### 7.4.6. Màn hình Lập phiếu dịch vụ

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `txtSoPhieu` | TextBox readonly | Tự sinh | Hiển thị số phiếu dịch vụ |
| 2 | `dtpNgayLap` | DatePicker readonly | Mặc định ngày hiện tại | Ngày lập phiếu |
| 3 | `txtKhachHang` | TextBox | Không rỗng | Nhập tên khách |
| 4 | `txtSoDienThoai` | TextBox | Đúng định dạng nếu nhập | Nhập số điện thoại |
| 5 | `cboLoaiDichVu` | ComboBox | Phải tồn tại | Chọn Gia công/Kiểm định/Sửa chữa |
| 6 | `numDonGiaDichVu` | NumberBox readonly | Lấy từ loại dịch vụ | Đơn giá dịch vụ |
| 7 | `numChiPhiPhatSinh` | NumberBox | >= 0 | Nhập chi phí phát sinh |
| 8 | `numSoLuong` | NumberBox | > 0 | Nhập số lượng |
| 9 | `txtDonGiaDuocTinh` | Readonly | Đơn giá DV + chi phí phát sinh | Hiển thị đơn giá tính tiền |
| 10 | `txtThanhTien` | Readonly | Số lượng x đơn giá được tính | Thành tiền |
| 11 | `numTraTruoc` | NumberBox | >= 50% thành tiền hoặc theo tham số hệ thống | Nhập tiền trả trước |
| 12 | `txtConLai` | Readonly | Thành tiền - trả trước | Tiền còn lại |
| 13 | `dtpNgayGiao` | DatePicker | Không bắt buộc khi lập | Ngày giao dự kiến/thực tế |
| 14 | `cboTinhTrang` | ComboBox | Mặc định Chưa giao/Chưa hoàn thành | Tình trạng dịch vụ |
| 15 | `tblChiTietDichVu` | Table | Có ít nhất một dòng | Danh sách dịch vụ |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Chọn loại dịch vụ | Hiển thị đơn giá dịch vụ và nhóm dịch vụ |
| 2 | Nhập chi phí/số lượng | Tính đơn giá được tính, thành tiền, còn lại |
| 3 | Nhập trả trước | Kiểm tra tỷ lệ trả trước tối thiểu theo tham số hệ thống |
| 4 | Lưu phiếu | Lưu phiếu và chi tiết; tình trạng mặc định Chưa hoàn thành |
| 5 | Giao dịch vụ kiểm định | Khi cập nhật giao phải nhập kết quả Đạt chuẩn/Không đạt chuẩn và số chứng thư nếu có |

### 7.4.7. Màn hình Tra cứu phiếu dịch vụ

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `txtSoPhieu` | TextBox | Không bắt buộc | Tìm theo số phiếu |
| 2 | `txtTenKhachHang` | TextBox | Không bắt buộc | Tìm theo tên khách |
| 3 | `cboTinhTrang` | ComboBox | Chưa hoàn thành/Hoàn thành | Lọc theo tình trạng |
| 4 | `dtpTuNgay`/`dtpDenNgay` | DatePicker | Từ ngày <= đến ngày | Lọc theo khoảng ngày |
| 5 | `btnTimKiem` | Button | Có thể tìm theo một hoặc nhiều tiêu chuẩn | Thực hiện tra cứu |
| 6 | `tblPhieuDichVu` | Table | Hiển thị kết quả phù hợp | Danh sách phiếu |
| 7 | `btnXemChiTiet` | Button | Chọn một phiếu | Mở chi tiết |
| 8 | `btnCapNhatTinhTrang` | Button | Phiếu tồn tại | Cập nhật giao/trả |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Tìm kiếm | Lọc theo số phiếu, khách hàng, tình trạng, khoảng ngày |
| 2 | Xem chi tiết | Mở màn hình chi tiết phiếu dịch vụ |
| 3 | Cập nhật tình trạng | Cập nhật ngày giao/kết quả; nếu tất cả dòng đã giao thì phiếu Hoàn thành |
| 4 | Còn dòng chưa giao | Phiếu vẫn ở trạng thái Chưa hoàn thành |

### 7.4.8. Màn hình Báo cáo tồn kho

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `cboThang` | ComboBox | 1 đến 12 | Chọn tháng báo cáo |
| 2 | `cboNam` | ComboBox | Năm hợp lệ | Chọn năm báo cáo |
| 3 | `btnLapBaoCao` | Button | Kỳ báo cáo hợp lệ | Lập báo cáo |
| 4 | `btnIn` | Button | Có dữ liệu báo cáo | In báo cáo |
| 5 | `btnXuatPDF` | Button | Có dữ liệu báo cáo | Xuất PDF nếu triển khai thư viện xuất file |
| 6 | `tblBaoCaoTonKho` | Table | Hiển thị theo sản phẩm | Tồn đầu, mua vào, bán ra, tồn cuối, cảnh báo |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Lập báo cáo | Tính tồn cuối = tồn đầu + SL mua vào - SL bán ra |
| 2 | Kiểm tra tháng đầu | Nếu không có dữ liệu trước đó thì tồn đầu = 0 |
| 3 | Cảnh báo tồn thấp | Nếu tồn cuối < tồn tối thiểu thì hiển thị cảnh báo |
| 4 | In/Xuất | Xuất mẫu báo cáo tồn kho đúng kỳ đã chọn |

### 7.4.9. Màn hình Báo cáo doanh thu

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `cboThang` | ComboBox | 1 đến 12 | Chọn tháng |
| 2 | `cboNam` | ComboBox | Năm hợp lệ | Chọn năm |
| 3 | `btnLapBaoCao` | Button | Kỳ báo cáo hợp lệ | Tổng hợp doanh thu |
| 4 | `btnIn` | Button | Có dữ liệu | In báo cáo |
| 5 | `btnXuatPDF` | Button | Có dữ liệu | Xuất PDF nếu triển khai |
| 6 | `tblBaoCaoDoanhThu` | Table | Dữ liệu theo ngày/kỳ | Hiển thị doanh thu bán hàng, dịch vụ, tổng doanh thu |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Lập báo cáo | Lấy doanh thu từ phiếu bán hàng và phiếu dịch vụ theo kỳ |
| 2 | Đổi tháng/năm | Tải lại dữ liệu tương ứng |
| 3 | In/Xuất | In hoặc xuất báo cáo doanh thu đúng dữ liệu đang hiển thị |

### 7.4.10. Màn hình Phân quyền người dùng

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `cboNhomNguoiDung` | ComboBox | Nhóm phải tồn tại | Chọn nhóm Quản lý/Nhân viên |
| 2 | `tblChucNang` | Table | Danh sách chức năng hệ thống | Hiển thị chức năng có thể phân quyền |
| 3 | `chkDuocPhep` | Checkbox | Chỉ Quản lý/Admin thao tác | Cho phép/không cho phép truy cập |
| 4 | `btnLuuPhanQuyen` | Button | Chỉ Quản lý/Admin | Lưu phân quyền |
| 5 | `frmTaiKhoan` | Form | Tên đăng nhập duy nhất | Thêm/sửa/xóa tài khoản |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Chọn nhóm | Hiển thị quyền hiện có của nhóm |
| 2 | Tick/bỏ tick quyền | Cập nhật trạng thái quyền trên giao diện |
| 3 | Lưu phân quyền | Kiểm tra quyền Quản lý/Admin rồi lưu |
| 4 | Người không có quyền truy cập | Middleware hoặc server action từ chối và chuyển hướng |

### 7.4.11. Màn hình Thay đổi quy định

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `txtTenThamSo` | Label/Text | Theo danh sách tham số | Hiển thị tên quy định |
| 2 | `txtGiaTri` | NumberBox | Giá trị hợp lệ theo từng tham số | Nhập giá trị mới |
| 3 | `numPhanTramLoiNhuanToiThieu` | NumberBox | 0 đến 100 | Cấu hình tỷ lệ lợi nhuận |
| 4 | `numSoLuongTonKhoToiThieu` | NumberBox | >= 0 | Cấu hình tồn tối thiểu |
| 5 | `numTiLeTraTruocToiThieu` | NumberBox | 0 đến 100 | Cấu hình tỷ lệ trả trước |
| 6 | `btnCapNhat` | Button | Chỉ Quản lý/Admin | Cập nhật quy định |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Lưu thay đổi | Kiểm tra quyền, validate giá trị, cập nhật bảng `ThamSo` |
| 2 | Giá trị không hợp lệ | Hiển thị lỗi và không lưu |
| 3 | Cập nhật thành công | Thông báo thành công; quy định mới ảnh hưởng nghiệp vụ liên quan |

### 7.4.12. Màn hình Sao lưu và phục hồi dữ liệu

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `btnSaoLuu` | Button | Chỉ Quản lý/Admin | Tạo file sao lưu CSDL |
| 2 | `tblLichSuSaoLuu` | Table | Chỉ liệt kê file `.sql` trong thư mục backup | Chọn file phục hồi |
| 3 | `btnPhucHoi` | Button | Chỉ Quản lý/Admin, phải xác nhận 2 bước | Phục hồi dữ liệu |
| 4 | `lblTrangThai` | Label/Alert | Hiển thị trạng thái mới nhất | Thông báo thành công/thất bại |
| 5 | `modalXacNhan` | Modal | Người dùng nhập đúng tên file | Chặn thao tác phục hồi nhầm |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Chọn Sao lưu | Kiểm tra quyền, chạy quy trình backup, hiển thị đường dẫn file `.sql` |
| 2 | Chọn Phục hồi | Kiểm tra file, yêu cầu xác nhận, chạy restore, thông báo kết quả |
| 3 | File không hợp lệ | Từ chối phục hồi và hiển thị lỗi |
| 4 | Người không có quyền | Chặn thao tác và thông báo không đủ quyền |

Ghi chú triển khai: UI hiện gọi server action có `hasPermission(PERMISSIONS.BACKUP_RESTORE)`, liệt kê file `.sql` trong `BACKUP_DIR` và yêu cầu nhập đúng tên file trước khi phục hồi.

### 7.4.13. Màn hình Thông báo/Xác nhận

| STT | Tên control | Kiểu control | Ràng buộc | Chức năng |
|---:|---|---|---|---|
| 1 | `toastSuccess` | Toast | Sau thao tác thành công | Thông báo lưu/xóa/cập nhật thành công |
| 2 | `toastError` | Toast | Sau lỗi validation, quyền, nghiệp vụ | Thông báo lỗi ngắn gọn |
| 3 | `modalConfirm` | Modal | Dùng trước thao tác nguy hiểm | Xác nhận xóa, phục hồi dữ liệu |
| 4 | `btnDongY`/`btnHuy` | Button | Người dùng chọn rõ ràng | Xác nhận hoặc hủy thao tác |

| STT | Biến cố | Xử lý tương ứng |
|---:|---|---|
| 1 | Thao tác thành công | Hiển thị toast thành công, làm mới dữ liệu |
| 2 | Thao tác thất bại | Hiển thị lỗi cụ thể, giữ dữ liệu người dùng đã nhập nếu phù hợp |
| 3 | Xác nhận xóa/phục hồi | Chỉ thực hiện khi người dùng chọn Đồng ý |

## 7.5. Nguyên tắc thiết kế giao diện đã áp dụng

- Tất cả màn hình có tên rõ ràng, thể hiện đúng nghiệp vụ đang xử lý.
- Chức năng chính đi từ dashboard/sidebar không quá 3 bước.
- Các nút xử lý đặt tên ngắn, gợi nhớ và nhất quán: Thêm, Sửa, Xóa, Lưu, Hủy, Tìm kiếm, In, Xuất PDF.
- Form nhập liệu kiểm tra ràng buộc tự nhiên và ràng buộc nghiệp vụ bằng schema validation và kiểm tra ở server action.
- Màn hình tra cứu hỗ trợ nhiều tiêu chuẩn như số phiếu, tên khách hàng, tình trạng, khoảng ngày.
- Màn hình thông báo cô đọng, dễ hiểu, phản hồi ngay sau thao tác.
- Báo biểu chỉ hiển thị thông tin cần thiết: kỳ báo cáo, số liệu chính, tổng hợp và cảnh báo.
- Màu sắc hài hòa, dùng màu cảnh báo cho tồn thấp hoặc thao tác nguy hiểm.
- Font chữ rõ, dễ đọc; bố cục form và bảng nhất quán giữa các module.
- Control được bố trí cân đối theo nhóm thông tin chung, chi tiết nghiệp vụ và tổng hợp.
- Có thông báo lỗi/thành công sau khi lưu, xóa, cập nhật, đăng nhập hoặc thao tác không đủ quyền.
- Có cảnh báo dữ liệu quan trọng như tồn kho thấp, bán vượt tồn, tỷ lệ trả trước không đạt.
