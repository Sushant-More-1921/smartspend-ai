"use client";

import { ArrowUpRight, ArrowDownRight, Trash2, Loader2, AlertTriangle, Wallet } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import Link from "next/link";
import { updateDefaultAccount, deleteAccount } from "@/actions/account";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }

    await updateDefaultFn(id);
  };

  const handleOpenDelete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteLoading(true);
    try {
      const res = await deleteAccount(id);
      if (res?.success) {
        toast.success(`Account "${name}" deleted successfully`);
        setDeleteOpen(false);
        router.refresh();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  return (
    <>
      <Link href={`/account/${id}`} prefetch={true} className="block group">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between min-h-[180px]">
          {/* Header: Name + Default Switch & Delete */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 truncate" title={name}>
                  {name}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600"
                  title={isDefault ? "Default Account" : "Toggle Default"}
                >
                  <span className="hidden sm:inline">Default</span>
                  <Switch
                    checked={isDefault}
                    onClick={handleDefaultChange}
                    disabled={updateDefaultLoading}
                    className="scale-75 data-[state=checked]:bg-blue-600"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  onClick={handleOpenDelete}
                  title="Delete Account"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Balance */}
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                ₹{parseFloat(balance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {type.charAt(0) + type.slice(1).toLowerCase()} Account
              </p>
            </div>
          </div>

          {/* Footer Indicators */}
          <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
              Incoming
            </span>
            <span className="flex items-center text-rose-500">
              <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
              Outgoing
            </span>
          </div>
        </div>
      </Link>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          className="sm:max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-xl"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-lg font-bold text-slate-900">Delete Account</DialogTitle>
            </div>
            <DialogDescription className="text-slate-600 pt-2 text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-900">&ldquo;{name}&rdquo;</span>?
              All associated transactions will be permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {isDefault && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
              ⚠️ This is currently your default account. If deleted, another account will automatically be designated as your default account.
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteOpen(false);
              }}
              disabled={deleteLoading}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl gap-1.5"
            >
              {deleteLoading ? (
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
    </>
  );
}
