"use client";

import { useRef, useState } from "react";

type Props = {
  name: string;
  accept?: string;
  className?: string;
  // Longest side of the output image, in pixels. Defaults to 1920.
  maxDimension?: number;
  // JPEG quality, 0–1. Defaults to 0.82.
  quality?: number;
};

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "ready"; originalKb: number; compressedKb: number }
  | { kind: "passthrough"; reason: string };

// Reads a File into an HTMLImageElement so we can draw it on a canvas.
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image decode failed"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

async function compressImage(
  file: File,
  maxDimension: number,
  quality: number
): Promise<File> {
  const img = await loadImage(file);
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Canvas toBlob returned null"));
      },
      "image/jpeg",
      quality
    );
  });

  // Rename to .jpg since we're re-encoding as JPEG.
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

export default function CompressingImageInput({
  name,
  accept = "image/jpeg,image/png,image/webp,image/avif,image/heic",
  className,
  maxDimension = 1920,
  quality = 0.82,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setStatus({ kind: "idle" });
      return;
    }

    // Only try to compress real raster images. For anything else, let the
    // browser send it as-is and the server can reject if needed.
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      setStatus({ kind: "passthrough", reason: "Non-raster image — uploaded as-is" });
      return;
    }

    setStatus({ kind: "working" });
    try {
      const compressed = await compressImage(file, maxDimension, quality);

      // Replace the file in the underlying <input> so the surrounding
      // <form> submits the compressed version without the parent needing to
      // know anything about this.
      const transfer = new DataTransfer();
      transfer.items.add(compressed);
      if (inputRef.current) {
        inputRef.current.files = transfer.files;
      }

      setStatus({
        kind: "ready",
        originalKb: Math.round(file.size / 1024),
        compressedKb: Math.round(compressed.size / 1024),
      });
    } catch {
      // If compression fails for any reason, fall back to the original file —
      // the server-action body limit might still reject large originals, but
      // we never want to block a successful upload on compression.
      setStatus({ kind: "passthrough", reason: "Compression failed — uploading original" });
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        onChange={handleChange}
        className={className ?? "block w-full text-sm text-gray-600"}
      />
      {status.kind === "working" ? (
        <p className="mt-2 text-xs text-gray-500">Preparing image…</p>
      ) : null}
      {status.kind === "ready" ? (
        <p className="mt-2 text-xs text-gray-500">
          Ready — compressed from {status.originalKb} KB to {status.compressedKb} KB.
        </p>
      ) : null}
      {status.kind === "passthrough" ? (
        <p className="mt-2 text-xs text-gray-500">{status.reason}</p>
      ) : null}
    </div>
  );
}
