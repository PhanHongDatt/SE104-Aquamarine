import { Prisma } from "@prisma/client";

export function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function withUniqueRetry<T>(operation: (attempt: number) => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (!isUniqueConstraintError(error) || attempt === maxAttempts) break;
    }
  }

  throw lastError;
}

export function nextSequentialId(lastId: string | null | undefined, prefix: string, width: number) {
  const nextNumber = lastId ? Number(lastId.replace(prefix, "")) + 1 : 1;
  return `${prefix}${nextNumber.toString().padStart(width, "0")}`;
}

export function nextSequentialIdFromValidCodes(ids: string[], prefix: string, width: number) {
  const pattern = new RegExp(`^${prefix}(\\d{${width}})$`);
  const maxNumber = ids.reduce((max, id) => {
    const match = pattern.exec(id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${(maxNumber + 1).toString().padStart(width, "0")}`;
}
