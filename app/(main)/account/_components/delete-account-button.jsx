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
          className="border-slate-300 text-slate-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all gap-1.5 rounded-xl text-xs font-semibold px-3 py-1.5 h-8 shadow-2xs"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Account</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle className="text-lg font-bold text-slate-900">Delete Account</DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 pt-2 text-sm leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-slate-900">&ldquo;{accountName}&rdquo;</span>?
            All associated transactions will be permanently removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {isDefault && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
            ⚠️ This is currently your default account. If deleted, another account will automatically be designated as default.
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl gap-1.5"
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
