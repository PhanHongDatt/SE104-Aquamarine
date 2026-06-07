"use client";

import { triggerBackup, triggerRestore } from "@/actions/backup.action";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Database, RotateCcw } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";

interface BackupFile {
  filename: string;
  size: string;
  modifiedAt: string;
}

export function BackupRestoreClient({ files }: { files: BackupFile[] }) {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("HT_BAK", "THEM");
  const canUpdate = hasPermission("HT_BAK", "SUA");
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<BackupFile | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const handleBackup = () => {
    startTransition(async () => {
      const result = await triggerBackup();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  const handleRestore = () => {
    if (!selectedFile || confirmText !== selectedFile.filename) return;

    startTransition(async () => {
      const result = await triggerRestore(selectedFile.filename);
      if (result.success) {
        toast.success(result.message);
        setSelectedFile(null);
        setConfirmText("");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Sao lưu dữ liệu</h2>
          <p className="text-sm text-zinc-500 mt-1">Tạo file `.sql` mới trong thư mục backups của ứng dụng.</p>
        </div>
        {canCreate && (
          <Button onClick={handleBackup} loading={isPending} className="w-full sm:w-auto">
            <Database className="w-4 h-4 mr-2" />
            Sao lưu ngay
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="text-base font-bold text-zinc-900">File sao lưu</h2>
        </div>
        {files.length === 0 ? (
          <div className="p-10 text-center text-sm text-zinc-400">Chưa có file sao lưu nào.</div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {files.map((file) => (
              <div key={file.filename} className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-zinc-900">{file.filename}</p>
                  <p className="text-xs text-zinc-500 mt-1">{file.size} - {file.modifiedAt}</p>
                </div>
                {canUpdate && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedFile(file)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Phục hồi
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedFile}
        onClose={() => {
          setSelectedFile(null);
          setConfirmText("");
        }}
        title="Xác nhận phục hồi dữ liệu"
      >
        {selectedFile && (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Phục hồi sẽ ghi dữ liệu từ file sao lưu vào database hiện tại. Nhập đúng tên file để xác nhận.
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-2">Tên file cần nhập</p>
              <p className="font-mono text-sm text-zinc-900 break-all">{selectedFile.filename}</p>
            </div>
            <input
              id="restore-confirm-filename"
              name="restoreConfirmFilename"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Nhập tên file để xác nhận"
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setConfirmText("");
                }}
              >
                Hủy
              </Button>
              <Button type="button" onClick={handleRestore} loading={isPending} disabled={confirmText !== selectedFile.filename}>
                Phục hồi dữ liệu
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
