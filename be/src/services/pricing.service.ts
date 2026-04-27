import { prisma } from "@/lib/prisma";

export class PricingService {
  static async calculateSellingPrice(giaMua: number, loaiSpId: string): Promise<number> {
    const category = await prisma.loaiSanPham.findUnique({
      where: { id: loaiSpId }
    });

    if (!category) {
      throw new Error("Loại sản phẩm không tồn tại");
    }

    const margin = category.phanTramLoiNhuan / 100;
    return giaMua * (1 + margin);
  }
}
