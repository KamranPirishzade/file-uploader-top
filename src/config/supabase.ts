import { createClient } from "@supabase/supabase-js";

if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_SECRET_KEY ||
  !process.env.SUPABASE_BUCKET
) {
  throw new Error(
    "SUPABASE_URL, SUPABASE_SECRET_KEY, and SUPABASE_BUCKET must be set in the environment variables.",
  );
}

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SECRET_KEY as string,
);

export async function getDownloadUrl(
  storagePath: string,
  originalName: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET as string)
    .createSignedUrl(storagePath, 60);

  if (error) throw error;

  return `${data.signedUrl}&download=${encodeURIComponent(originalName)}`;
}

export default supabase;
