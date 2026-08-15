import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/verify/upload  (multipart/form-data: file, doc_type)
// Stores the file in the private `verification-docs` bucket and creates a
// pending review row. An admin approves/rejects it from /admin.
//
// Note on Bangladesh NID verification: there is no public API for verifying
// a National ID against the Election Commission database — it requires a
// direct institutional agreement (banks, telcos, and a handful of licensed
// fintechs have this). Realistic path for a marketplace startup is exactly
// this flow: the user uploads a photo of their NID/student ID, and a human
// admin reviews and approves it. If you later obtain NID API access, swap
// the manual review step in `approveVerification` (in /admin) for an
// automated API call.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const docType = (form.get("doc_type") as string) || "nid";
  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

  const path = `${user.id}/${docType}_${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("verification-docs")
    .upload(path, file, { upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { error: insertError } = await supabase.from("verification_documents").insert({
    profile_id: user.id,
    doc_type: docType,
    file_path: path,
    status: "pending",
  });

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ ok: true, message: "Uploaded. An admin will review it shortly." });
}
