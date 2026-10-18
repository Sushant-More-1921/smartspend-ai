"use client";

import { ArrowUpRight, ArrowDownRight, Trash2, Loader2, AlertTriangle } from "lucide-react";
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
      <Link href={`/account/${id}`} prefetch={true} className="block">
        <div
          className="relative 
                     p-6 rounded-2xl bg-black/20 backdrop-blur-sm border border-purple-500/20 transition-all duration-300 
                     hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] 
                     hover:scale-[1.02] group"
        >
          {/* Account Name + Default Switch & Delete Action */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">{name}</h3>
            <div className="flex items-center gap-2">
              <Switch
                checked={isDefault}
                onClick={handleDefaultChange}
                disabled={updateDefaultLoading}
                className="data-[state=checked]:bg-purple-600"
                title={isDefault ? "Default Account" : "Set as Default Account"}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={handleOpenDelete}
                title="Delete Account"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

        {/* Balance */}
        <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          ₹{parseFloat(balance).toFixed(2)}
        </div>
        <p className="mt-1 text-sm text-gray-400">
          {type.charAt(0) + type.slice(1).toLowerCase()} Account
        </p>

        {/* Footer */}
        <div className="flex justify-between mt-6 text-sm text-gray-400">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </div>
      </div>
    </Link>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-xl font-bold">Delete Account</DialogTitle>
            </div>
            <DialogDescription className="text-gray-300 pt-2 text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">&ldquo;{name}&rdquo;</span>?
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteOpen(false);
              }}
              disabled={deleteLoading}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
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
