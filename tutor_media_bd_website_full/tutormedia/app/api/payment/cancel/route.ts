import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const tran_id = form.get("tran_id") as string;
  const supabase = createServiceClient();
  await supabase.from("payments").update({ status: "cancelled" }).eq("gateway_tran_id", tran_id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${siteUrl}/dashboard?payment=cancelled`, 303);
}
