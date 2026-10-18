"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAccount } from "@/actions/account";

export function DeleteAccountButton({ accountId, accountName, isDefault }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteAccount(accountId);
      if (res?.success) {
        toast.success(`Account "${accountName}" deleted successfully`);
        setOpen(false);
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500 hover:text-red-300 transition-all gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Account</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle className="text-xl font-bold">Delete Account</DialogTitle>
          </div>
          <DialogDescription className="text-gray-300 pt-2 text-sm leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-white">&ldquo;{accountName}&rdquo;</span>?
            All associated transactions will be permanently deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {isDefault && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs">
            ⚠️ This is currently your default account. If deleted, another account will automatically be designated as your default account.
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Confirm Delete</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
