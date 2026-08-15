"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type VerificationDoc = {
  id: string;
  profile_id: string;
  doc_type: string;
  file_path: string;
  status: string;
  created_at: string;
  profiles: { full_name: string } | null;
};

export default function AdminPage() {
  const supabase = createClient();
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("verification_documents")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });
    setDocs((data as any) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function review(doc: VerificationDoc, approve: boolean) {
    await supabase
      .from("verification_documents")
      .update({ status: approve ? "approved" : "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", doc.id);

    if (approve) {
      const column = doc.doc_type === "nid" ? "verified_identity" : "verified_phone";
      await supabase.from("profiles").update({ [column]: true }).eq("id", doc.profile_id);
    }

    await supabase.from("notifications").insert({
      profile_id: doc.profile_id,
      type: "verification",
      title: approve ? "Your document was approved" : "Your document was rejected",
      body: approve ? "Your verification badge is now live on your profile." : "Please upload a clearer document and try again.",
    });

    load();
  }

  async function viewFile(path: string) {
    const { data } = await supabase.storage.from("verification-docs").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <main className="form-page">
      <div className="container">
        <div className="section-title"><div><h2>Admin — Verification Queue</h2><p className="muted">Review uploaded NID / student ID / university documents.</p></div></div>
        <div className="card">
          {loading && <p className="muted">Loading...</p>}
          {!loading && docs.length === 0 && <p className="muted">No documents submitted yet.</p>}
          {docs.length > 0 && (
            <table className="table-simple">
              <thead><tr><th>User</th><th>Type</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td>{d.profiles?.full_name || d.profile_id}</td>
                    <td>{d.doc_type}</td>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
                    <td><span className={`status-pill status-${d.status}`}>{d.status}</span></td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button className="btn secondary" onClick={() => viewFile(d.file_path)}>View</button>
                      {d.status === "pending" && (
                        <>
                          <button className="btn primary" onClick={() => review(d, true)}>Approve</button>
                          <button className="btn secondary" onClick={() => review(d, false)}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
