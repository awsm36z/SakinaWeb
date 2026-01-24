import { createClient } from "@/lib/supabase/client";

export type MediaUploadResult = {
  name: string;
  path: string;
  publicUrl: string;
};

function sanitizeFileName(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  const base =
    lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const ext = lastDot > 0 ? originalName.slice(lastDot) : "";
  const safeBase = base
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();
  const safeExt = ext
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9.]/g, "")
    .toLowerCase();
  const fallback = `media-${Date.now()}`;
  return `${safeBase || fallback}${safeExt}`;
}

export async function uploadMediaFiles(
  files: File[],
  folder: string = ""
): Promise<{ uploads: MediaUploadResult[]; error: string | null }> {
  const supabase = createClient();
  const uploads: MediaUploadResult[] = [];

  for (const file of files) {
    if (!file || file.size === 0) {
      continue;
    }

    const safeName = sanitizeFileName(file.name);
    const filePath = folder ? `${folder}/${safeName}` : safeName;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return { uploads, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("media")
      .getPublicUrl(filePath);

    uploads.push({
      name: file.name,
      path: filePath,
      publicUrl: publicUrlData.publicUrl,
    });
  }

  return { uploads, error: null };
}
