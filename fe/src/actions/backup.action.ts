"use server";

import { authOptions } from "@/lib/auth";
import { hasPermission, PERMISSIONS, ACTIONS } from "@/lib/permissions";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

async function requireBackupPermission(hanhDong: string = ACTIONS.VIEW) {
  const session = await getServerSession(authOptions);
  if (!(await hasPermission(PERMISSIONS.BACKUP_RESTORE, hanhDong, session))) {
    return { allowed: false, message: "Bạn không có quyền sao lưu hoặc phục hồi dữ liệu" };
  }
  return { allowed: true, message: "" };
}

function runScript(scriptPath: string, env: Partial<NodeJS.ProcessEnv> = {}) {
  return new Promise<{ stdout: string; stderr: string }>((resolvePromise, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
      } else {
        reject(new Error(stderr || stdout || `Script exited with code ${code}`));
      }
    });
  });
}

export async function triggerBackup() {
  try {
    const auth = await requireBackupPermission(ACTIONS.CREATE);
    if (!auth.allowed) return { success: false, message: auth.message };

    const result = await runScript("scripts/db-backup.js");
    revalidatePath("/admin/cai-dat/sao-luu-phuc-hoi");
    return { success: true, message: result.stdout.trim() || "Sao lưu dữ liệu thành công" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Sao lưu dữ liệu thất bại" };
  }
}

export async function triggerRestore(filename: string) {
  try {
    const auth = await requireBackupPermission(ACTIONS.UPDATE);
    if (!auth.allowed) return { success: false, message: auth.message };
    if (!/^[\w.-]+\.sql$/.test(filename)) {
      return { success: false, message: "Tên file phục hồi không hợp lệ" };
    }

    const backupDir = process.env.BACKUP_DIR || "backups";
    const baseDir = resolve(process.cwd(), backupDir);
    const backupFile = resolve(baseDir, filename);
    if (!backupFile.startsWith(baseDir) || !existsSync(backupFile)) {
      return { success: false, message: "Không tìm thấy file sao lưu" };
    }

    const result = await runScript("scripts/db-restore.js", {
      BACKUP_FILE: join(backupDir, filename),
      RESTORE_CONFIRM: "YES",
    });
    revalidatePath("/admin/cai-dat/sao-luu-phuc-hoi");
    return { success: true, message: result.stdout.trim() || "Phục hồi dữ liệu thành công" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Phục hồi dữ liệu thất bại" };
  }
}
