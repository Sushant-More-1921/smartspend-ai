"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }

    await updateDefaultFn(id);
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
    <Link href={`/account/${id}`} className="block">
      <div
        className="relative 
                   p-6 rounded-2xl bg-black/20 backdrop-blur-sm border border-purple-500/20 transition-all duration-300 
                   hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] 
                   hover:scale-[1.02] group"
      >
        {/* Account Name + Default Switch */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">{name}</h3>
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={updateDefaultLoading}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        {/* Balance */}
        <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          ${parseFloat(balance).toFixed(2)}
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
  );
}
