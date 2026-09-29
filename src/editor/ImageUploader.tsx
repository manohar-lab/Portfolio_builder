"use client";

import React, { useState } from "react";
import { Upload, X, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  maxSizeMB?: number;
}

/**
 * ImageUploader Component
 * Validates file type, file size (default 5MB), generates preview, and provides URL integration.
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = "",
  onChange,
  label = "Upload Image",
  maxSizeMB = 5,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMsg(null);

    if (!file) return;

    // 1. File Type Validation
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    // 2. File Size Validation
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);

    // Read image as Data URL preview (Supabase Storage upload abstraction ready)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange(result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read image file.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-slate-300">{label}</label>}

      {value ? (
        <div className="relative group w-full max-w-sm rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
          <img src={value} alt="Preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <X className="w-4 h-4" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all p-4 text-center">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-300">
            {isUploading ? "Processing Image..." : "Click to Upload Image"}
          </span>
          <span className="text-[11px] text-slate-500 pt-0.5">JPEG, PNG, WebP up to {maxSizeMB}MB</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {errorMsg && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
        </p>
      )}
    </div>
  );
};
