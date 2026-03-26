 "use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { uploadMediaFiles } from "@/lib/media";

export default function AddMediaPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);
    setSuccessCount(0);

    const { uploads, error: uploadError } = await uploadMediaFiles(
      Array.from(files)
    );

    if (uploadError) {
      setError(uploadError);
      setIsUploading(false);
      return;
    }

    setSuccessCount(uploads.length);
    setIsUploading(false);
  };

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="text-center space-y-3">
          <p className="brand-kicker">
            Media
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Add media
          </h1>
          <p className="text-gray-600">
            Upload new photos to the media gallery.
          </p>
        </header>

        <div className="brand-panel rounded-[1.75rem] p-6 md:p-8 space-y-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full rounded-xl border border-dashed border-[var(--border-soft)] bg-[rgba(255,250,241,0.72)] px-4 py-6 text-sm font-semibold text-gray-700 transition hover:bg-white/70 disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Click to upload photos"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />

          {successCount > 0 ? (
            <p className="text-sm text-[var(--brand-moss)]">
              Uploaded {successCount} file{successCount === 1 ? "" : "s"}.
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="text-center">
            <Link
              href="/media"
              className="brand-link text-sm"
            >
              Back to media
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
