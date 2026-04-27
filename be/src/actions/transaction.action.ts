"use server";

import { prisma } from "@/lib/prisma";

export async function lapPhieuBanHang(data: any) {
  // Complex logic wrapping multiple operations in transaction
  return await prisma.$transaction(async (tx) => {
    // Logic implementation
  });
}
