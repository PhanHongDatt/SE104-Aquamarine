import { prisma } from "@/lib/prisma";

export class PricingService {
  static async calculateSellingPrice(giaMua: number, maLSP: string): Promise<number> {
    const category = await prisma.loaiSanPham.findUnique({
      where: { maLSP: maLSP }
    });

    if (!category) {
      throw new Error("Loại sản phẩm không tồn tại");
    }

    const margin = Number(category.phanTramLoiNhuan) / 100;
    return giaMua * (1 + margin);
  }
}
