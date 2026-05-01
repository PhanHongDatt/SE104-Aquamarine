'use server';

import { prisma } from '@/lib/prisma';

export interface BaoCaoDoanhThuItem {
  ngay: number;
  thang: number;
  nam: number;
  dtBanHang: number;
  dtDichVu: number;
  tongDT: number;
}

export interface BaoCaoTonKhoItem {
  ngay: number;
  thang: number;
  nam: number;
  maSP: string;
  tonDau: number;
  slMuaVao: number;
  slBanRa: number;
  tonCuoi: number;
}

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getBaoCaoDoanhThu(thang: number, nam: number): Promise<BaoCaoDoanhThuItem[]> {
  const data = await prisma.baoCaoDoanhThu.findMany({
    where: { thang, nam },
    orderBy: { ngay: 'asc' }
  });
  return serialize(data);
}

export async function getBaoCaoTonKho(thang: number, nam: number): Promise<BaoCaoTonKhoItem[]> {
  const data = await prisma.baoCaoTonKho.findMany({
    where: { thang, nam },
    orderBy: [{ ngay: 'asc' }, { maSP: 'asc' }]
  });
  return serialize(data);
}
