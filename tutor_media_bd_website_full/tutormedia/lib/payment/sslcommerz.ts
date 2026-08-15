// SSLCommerz is the most widely used payment gateway in Bangladesh (supports
// bKash, Nagad, Rocket, cards, and bank transfer through one integration).
// Sign up for a merchant account at https://sslcommerz.com (sandbox is free
// and instant at https://developer.sslcommerz.com for testing).
//
// Required env vars:
//   SSLCOMMERZ_STORE_ID
//   SSLCOMMERZ_STORE_PASSWORD
//   SSLCOMMERZ_IS_LIVE   ("true" in production, unset/"false" for sandbox)
//   NEXT_PUBLIC_SITE_URL (used to build success/fail/cancel redirect URLs)

type InitPaymentArgs = {
  tran_id: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
};

const BASE_URL = (isLive: boolean) =>
  isLive
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

export async function initSSLCommerzPayment(args: InitPaymentArgs) {
  const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!storeId || !storePassword) {
    throw new Error("SSLCommerz is not configured. Add SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD.");
  }

  const payload = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: String(args.amount),
    currency: "BDT",
    tran_id: args.tran_id,
    success_url: `${siteUrl}/api/payment/success`,
    fail_url: `${siteUrl}/api/payment/fail`,
    cancel_url: `${siteUrl}/api/payment/cancel`,
    cus_name: args.customerName,
    cus_email: args.customerEmail,
    cus_phone: args.customerPhone,
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    product_name: args.productName,
    product_category: "Service",
    product_profile: "general",
  });

  const res = await fetch(BASE_URL(isLive), { method: "POST", body: payload });
  const data = await res.json();

  if (data.status !== "SUCCESS") {
    throw new Error(data.failedreason || "Failed to initiate SSLCommerz session.");
  }

  return data as { GatewayPageURL: string; sessionkey: string };
}
