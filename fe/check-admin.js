const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.nguoiDung.findUnique({
      where: { tenDangNhap: 'admin' }
    });
    
    if (admin) {
      console.log('✓ Tài khoản admin tìm thấy:');
      console.log(`  - Mã ND: ${admin.maND}`);
      console.log(`  - Tên đăng nhập: ${admin.tenDangNhap}`);
      console.log(`  - Mật khẩu: ${admin.matKhau}`);
      console.log(`  - Kiểm tra: ${admin.matKhau === 'Admin@123' ? 'Đúng là "Admin@123"' : 'Không phải "Admin@123"'}`);
      console.log(`  - Họ tên: ${admin.hoTen}`);
      console.log(`  - Mã nhóm: ${admin.maNhom}`);
    } else {
      console.log('✗ Không tìm thấy tài khoản admin');
    }
  } catch (error) {
    console.error('Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
