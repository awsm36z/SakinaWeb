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
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="text-center space-y-3">
          <p className="text-xs font-semibold tracking-[0.3em] text-green-700 uppercase">
            Media
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Add media
          </h1>
          <p className="text-gray-600">
            Upload new photos to the media gallery.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 space-y-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-100 disabled:opacity-60"
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
            <p className="text-sm text-green-700">
              Uploaded {successCount} file{successCount === 1 ? "" : "s"}.
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="text-center">
            <Link
              href="/media"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              Back to media
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
