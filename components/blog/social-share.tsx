"use client";

import { useState } from "react";
import { Share2, Check, Copy, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";

interface SocialShareProps {
  title: string;
  url?: string;
}

export function SocialShare({ title }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`"${title}" by @Analyticsliv`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out "${title}" on BlogBuilder!`,
          url,
        });
        toast.success("Shared successfully!");
        return;
      } catch {
        // User cancelled or share failed, fallback to copy link
      }
    }
    handleCopy();
  };

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-full border bg-card/80 backdrop-blur shadow-sm">
      <button
        type="button"
        onClick={handleNativeShare}
        className="text-[11px] font-semibold text-muted-foreground hover:text-primary px-2.5 py-1 rounded-full hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
        title="Share article"
      >
        <Share2 className="h-3 w-3" />
        Share
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Copy article link"
        aria-label="Copy article link"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>

      <button
        type="button"
        onClick={handleShareTwitter}
        className="p-1.5 rounded-full hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors"
        title="Share on X (Twitter)"
        aria-label="Share on X"
      >
        <Twitter className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={handleShareLinkedIn}
        className="p-1.5 rounded-full hover:bg-blue-600/10 text-muted-foreground hover:text-blue-600 transition-colors"
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
