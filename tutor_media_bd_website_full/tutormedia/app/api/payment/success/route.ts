import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// SSLCommerz redirects the browser here (POST) after a successful payment.
// In production, ALSO verify the transaction server-to-server via SSLCommerz's
// "Order Validation API" using val_id before marking as paid, to prevent a
// forged redirect from faking a payment.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const tran_id = form.get("tran_id") as string;
  const val_id = form.get("val_id") as string;

  const supabase = createServiceClient();

  // TODO (production): call SSLCommerz validation API with val_id here and
  // only proceed if it confirms VALID / VALIDATED status.
  await supabase.from("payments").update({ status: "paid" }).eq("gateway_tran_id", tran_id);

  const { data: payment } = await supabase
    .from("payments")
    .select("profile_id, purpose, amount_bdt")
    .eq("gateway_tran_id", tran_id)
    .single();

  if (payment) {
    await supabase.from("notifications").insert({
      profile_id: payment.profile_id,
      type: "payment",
      title: "Payment successful",
      body: `Your payment of ৳${payment.amount_bdt} for ${payment.purpose} was received.`,
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${siteUrl}/dashboard?payment=success`, 303);
}
