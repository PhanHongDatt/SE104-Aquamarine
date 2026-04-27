import { prisma } from "@/lib/prisma";
import { OutOfStockError } from "@/lib/errors";

export class InventoryService {
  static async checkStock(maSp: string, quantity: number): Promise<boolean> {
    const product = await prisma.sanPham.findUnique({
      where: { maSp }
    });

    if (!product || product.tonKho < quantity) {
      throw new OutOfStockError();
    }
    return true;
  }

  static async updateStock(maSp: string, quantityChange: number): Promise<void> {
    await prisma.sanPham.update({
      where: { maSp },
      data: {
        tonKho: { increment: quantityChange }
      }
    });
  }
}
