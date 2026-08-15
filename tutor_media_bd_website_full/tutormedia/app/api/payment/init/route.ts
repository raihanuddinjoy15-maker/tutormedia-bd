import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { initSSLCommerzPayment } from "@/lib/payment/sslcommerz";

// POST /api/payment/init
// body: { purpose: "featured_listing" | "tutor_subscription" | "unlock_contact",
//          amount: number, tuitionId?: string }
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const { purpose, amount, tuitionId } = await req.json();
  const { data: profile } = await supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).single();

  const tran_id = `TMBD_${Date.now()}_${randomUUID().slice(0, 8)}`;

  await supabase.from("payments").insert({
    profile_id: user.id,
    tuition_id: tuitionId || null,
    purpose,
    amount_bdt: amount,
    gateway_tran_id: tran_id,
    status: "initiated",
  });

  try {
    const session = await initSSLCommerzPayment({
      tran_id,
      amount,
      customerName: profile?.full_name || "TutorMedia User",
      customerEmail: profile?.email || user.email || "user@example.com",
      customerPhone: profile?.phone || "01700000000",
      productName: purpose,
    });
    return NextResponse.json({ redirectUrl: session.GatewayPageURL });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
