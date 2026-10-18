"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wallet } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

export function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-white border-t border-slate-200 text-slate-900 rounded-t-2xl max-w-lg mx-auto">
        <DrawerHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </div>
            <DrawerTitle className="text-lg font-bold text-slate-900">Create New Account</DrawerTitle>
          </div>
        </DrawerHeader>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-semibold text-slate-700"
              >
                Account Name
              </label>
              <Input
                id="name"
                placeholder="e.g., Main Savings, Salary Account"
                {...register("name")}
                className="h-10 text-sm bg-white border-slate-300 text-slate-900 focus:border-blue-500 rounded-xl"
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="type"
                className="text-xs font-semibold text-slate-700"
              >
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type" className="h-10 text-sm bg-white border-slate-300 text-slate-900 rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-800 rounded-xl shadow-lg">
                  <SelectItem value="CURRENT" className="text-sm">Current</SelectItem>
                  <SelectItem value="SAVINGS" className="text-sm">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-rose-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="balance"
                className="text-xs font-semibold text-slate-700"
              >
                Initial Balance (₹)
              </label>
              <Input
                id="balance"
                type="number"
                step="any"
                placeholder="0.00"
                {...register("balance")}
                className="h-10 text-sm bg-white border-slate-300 text-slate-900 focus:border-blue-500 rounded-xl"
              />
              {errors.balance && (
                <p className="text-xs text-rose-500">{errors.balance.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-sm font-semibold text-slate-900 cursor-pointer"
                >
                  Set as Default Account
                </label>
                <p className="text-xs text-slate-500">
                  Pre-selected for new income and expense entries
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold h-10">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-10 shadow-xs transition-colors"
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
