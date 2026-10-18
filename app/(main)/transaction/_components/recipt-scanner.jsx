"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleReceiptScan = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Analyzing receipt with AI...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const scannedData = await scanReceipt(formData);

      if (scannedData) {
        toast.success("Receipt scanned successfully", { id: toastId });
        onScanComplete(scannedData);
      } else {
        toast.error("Could not detect receipt details from image", { id: toastId });
      }
    } catch (err) {
      toast.error(err.message || "Failed to scan receipt", { id: toastId });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Scanning Receipt with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-blue-600" />
            <Camera className="h-4 w-4 text-blue-600" />
            <span>Scan Receipt with AI (Auto-Fill)</span>
          </>
        )}
      </Button>
    </div>
  );
}
