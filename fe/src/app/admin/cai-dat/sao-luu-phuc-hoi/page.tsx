import { BackupRestoreClient } from "@/components/forms/backup-restore-client";
import { Database, ArrowLeft } from "lucide-react";
import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import Link from "next/link";

export const metadata = { title: "Sao lưu & Phục hồi – Admin | Aquamarine Jewelry & Luxury" };

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function getBackupFiles() {
  const backupDir = resolve(process.cwd(), process.env.BACKUP_DIR || "backups");
  if (!existsSync(backupDir)) return [];

  return readdirSync(backupDir)
    .filter((filename) => filename.endsWith(".sql"))
    .map((filename) => {
      const stats = statSync(resolve(backupDir, filename));
      return {
        filename,
        size: formatFileSize(stats.size),
        modifiedAt: stats.mtime.toLocaleString("vi-VN"),
        modifiedTime: stats.mtime.getTime(),
      };
    })
    .sort((a, b) => b.modifiedTime - a.modifiedTime)
    .map(({ modifiedTime, ...file }) => file);
}

export default function BackupRestorePage() {
  const files = getBackupFiles();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/cai-dat" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            Sao lưu & Phục hồi
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý file sao lưu PostgreSQL của hệ thống Aquamarine</p>
        </div>
      </div>

      <BackupRestoreClient files={files} />
    </div>
  );
}
