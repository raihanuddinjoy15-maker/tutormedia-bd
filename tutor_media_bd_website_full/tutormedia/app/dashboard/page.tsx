"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
    })();
  }, []);

  async function uploadDoc(docType: string) {
    if (!file) return;
    setUploadMsg("Uploading...");
    const form = new FormData();
    form.append("file", file);
    form.append("doc_type", docType);
    const res = await fetch("/api/verify/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploadMsg(data.message || data.error);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!profile) {
    return (
      <main className="form-page">
        <div className="container"><p className="muted">Please log in to view your dashboard.</p></div>
      </main>
    );
  }

  return (
    <main className="form-page">
      <div className="container">
        <div className="section-title">
          <div><h2>Welcome, {profile.full_name}</h2><p className="muted">Role: {profile.role}</p></div>
          <button className="btn secondary" onClick={logout}>Log out</button>
        </div>

        <div className="grid3">
          <div className="card">
            <h3>Verification</h3>
            <p className="muted">
              Phone: {profile.verified_phone ? <span className="status-pill status-approved">Verified</span> : <span className="status-pill status-pending">Not verified</span>}
            </p>
            <p className="muted">
              Identity: {profile.verified_identity ? <span className="status-pill status-approved">Verified</span> : <span className="status-pill status-pending">Not verified</span>}
            </p>
            <div className="field" style={{ marginTop: 12 }}>
              <label>Upload NID or Student ID photo</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <button className="btn primary" onClick={() => uploadDoc("nid")} style={{ marginTop: 8 }}>Submit for review</button>
            {uploadMsg && <p className="muted" style={{ marginTop: 8 }}>{uploadMsg}</p>}
          </div>

          <div className="card">
            <h3>Featured listing</h3>
            <p className="muted">Boost your profile to the top of search results for 30 days.</p>
            <p style={{ fontWeight: 800, fontSize: 22 }}>৳500</p>
            <button
              className="btn primary"
              onClick={async () => {
                const res = await fetch("/api/payment/init", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ purpose: "featured_listing", amount: 500 }),
                });
                const data = await res.json();
                if (data.redirectUrl) window.location.href = data.redirectUrl;
                else alert(data.error || "Payment could not be started.");
              }}
            >
              Pay with bKash / Nagad / Card
            </button>
          </div>

          <div className="card">
            <h3>Quick links</h3>
            <p><a href="/messages">💬 Messages</a></p>
            <p><a href="/post-tuition">📝 Post tuition</a></p>
            <p><a href="/become-tutor">👨‍🏫 Edit tutor profile</a></p>
          </div>
        </div>
      </div>
    </main>
  );
}
