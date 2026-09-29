"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CoverImageUpload({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP, GIF)");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setLoading(false);
        return;
      }

      onChange(data.url);
    } catch (err) {
      setError("Network error uploading image");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Cover Image</label>

      {value ? (
        <div className="relative aspect-video max-h-64 w-full rounded-lg overflow-hidden border bg-muted group">
          <Image
            src={value}
            alt="Cover preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          {/* Action overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="bg-background/90 hover:bg-background text-foreground text-xs shadow-md"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
              Change Image
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={loading}
              className="text-xs shadow-md"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Remove
            </Button>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="md:hidden absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition"
            title="Remove image"
            aria-label="Remove cover image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            isDragging
              ? "border-primary bg-primary/10 ring-2 ring-primary/20 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            {loading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <UploadCloud className={`w-8 h-8 ${isDragging ? "text-primary scale-110" : "text-muted-foreground"} transition-transform`} />
            )}
            <div className="text-sm">
              <span className="font-semibold text-primary">
                {isDragging ? "Drop image to upload" : "Click or drag & drop to upload cover image"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP, or GIF up to 10MB</p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive font-medium mt-1">{error}</p>}
    </div>
  );
}
