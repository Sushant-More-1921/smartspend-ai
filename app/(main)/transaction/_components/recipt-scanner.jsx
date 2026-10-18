"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
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
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 animate-spin h-4 w-4" />
            <span>Scanning Receipt with AI...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
}
