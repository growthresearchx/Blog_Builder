"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function CodeCopyHandler() {
  useEffect(() => {
    const preBlocks = document.querySelectorAll(".prose pre");

    preBlocks.forEach((pre) => {
      // Check if button already injected
      if (pre.querySelector(".code-copy-btn")) return;

      // Position relative on pre
      (pre as HTMLElement).style.position = "relative";

      const button = document.createElement("button");
      button.className =
        "code-copy-btn absolute top-2 right-2 px-2.5 py-1 text-[11px] font-mono rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border shadow-xs backdrop-blur transition-all duration-150 flex items-center gap-1 cursor-pointer select-none";
      button.innerHTML = `<span>Copy</span>`;
      button.title = "Copy snippet to clipboard";

      button.addEventListener("click", async () => {
        const codeElement = pre.querySelector("code");
        const textToCopy = codeElement
          ? (codeElement as HTMLElement).innerText || codeElement.textContent || ""
          : (pre as HTMLElement).innerText || pre.textContent || "";

        try {
          await navigator.clipboard.writeText(textToCopy);
          button.innerHTML = `<span class="text-emerald-500 font-semibold">Copied!</span>`;
          toast.success("Code copied to clipboard");
          setTimeout(() => {
            button.innerHTML = `<span>Copy</span>`;
          }, 2000);
        } catch {
          toast.error("Failed to copy code");
        }
      });

      pre.appendChild(button);
    });
  }, []);

  return null;
}
