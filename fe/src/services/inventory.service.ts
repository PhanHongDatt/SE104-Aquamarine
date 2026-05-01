import { prisma } from "@/lib/prisma";

export class InventoryService {
  static async checkStock(maSp: string, quantity: number): Promise<boolean> {
    const product = await prisma.sanPham.findUnique({
      where: { maSP: maSp }
    });

    if (!product || product.tonKho < quantity) {
      throw new Error("Sản phẩm không đủ tồn kho");
    }
    return true;
  }

  static async updateStock(maSp: string, quantityChange: number): Promise<void> {
    await prisma.sanPham.update({
      where: { maSP: maSp },
      data: {
        tonKho: { increment: quantityChange }
      }
    });
  }
}
