export const BUSINESS_TIME_ZONE = "Asia/Bangkok";

const BUSINESS_TIME_ZONE_OFFSET_MS = 7 * 60 * 60 * 1000;

export type BusinessDateParts = {
  ngay: number;
  thang: number;
  nam: number;
};

function assertValidDateParts(parts: BusinessDateParts) {
  const probe = new Date(Date.UTC(parts.nam, parts.thang - 1, parts.ngay));
  if (
    !Number.isInteger(parts.ngay) ||
    !Number.isInteger(parts.thang) ||
    !Number.isInteger(parts.nam) ||
    probe.getUTCFullYear() !== parts.nam ||
    probe.getUTCMonth() !== parts.thang - 1 ||
    probe.getUTCDate() !== parts.ngay
  ) {
    throw new Error("Ngày không hợp lệ");
  }
}

function daysInMonth(thang: number, nam: number) {
  return new Date(Date.UTC(nam, thang, 0)).getUTCDate();
}

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

export function getBusinessDateParts(value: Date | string): BusinessDateParts {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Ngày không hợp lệ");
  }

  const shiftedDate = new Date(date.getTime() + BUSINESS_TIME_ZONE_OFFSET_MS);
  return {
    ngay: shiftedDate.getUTCDate(),
    thang: shiftedDate.getUTCMonth() + 1,
    nam: shiftedDate.getUTCFullYear(),
  };
}

export function parseBusinessDateInput(value: string): BusinessDateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error("Ngày báo cáo không hợp lệ");
  }

  const parts = {
    nam: Number(match[1]),
    thang: Number(match[2]),
    ngay: Number(match[3]),
  };
  assertValidDateParts(parts);
  return parts;
}

export function getBusinessDateKey(value: Date | string) {
  const parts = getBusinessDateParts(value);
  return `${parts.nam}-${pad2(parts.thang)}-${pad2(parts.ngay)}`;
}

export function formatBusinessDateParts(parts: BusinessDateParts) {
  return `${pad2(parts.ngay)}/${pad2(parts.thang)}/${parts.nam}`;
}

export function formatBusinessDate(value: Date | string) {
  return formatBusinessDateParts(getBusinessDateParts(value));
}

export function getBusinessDayBounds(value: Date | string | BusinessDateParts) {
  const parts = value instanceof Date || typeof value === "string" ? getBusinessDateParts(value) : value;
  assertValidDateParts(parts);

  const startDate = new Date(Date.UTC(parts.nam, parts.thang - 1, parts.ngay) - BUSINESS_TIME_ZONE_OFFSET_MS);
  const endDate = new Date(Date.UTC(parts.nam, parts.thang - 1, parts.ngay + 1) - BUSINESS_TIME_ZONE_OFFSET_MS - 1);
  return { startDate, endDate };
}

export function getBusinessMonthBounds(thang: number, nam: number) {
  const lastDay = daysInMonth(thang, nam);
  return {
    startDate: getBusinessDayBounds({ ngay: 1, thang, nam }).startDate,
    endDate: getBusinessDayBounds({ ngay: lastDay, thang, nam }).endDate,
  };
}

export function getBusinessQuarterBounds(quarter: number, nam: number) {
  if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
    throw new Error("Quý báo cáo không hợp lệ");
  }

  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const lastDay = daysInMonth(endMonth, nam);
  return {
    startDate: getBusinessDayBounds({ ngay: 1, thang: startMonth, nam }).startDate,
    endDate: getBusinessDayBounds({ ngay: lastDay, thang: endMonth, nam }).endDate,
  };
}
