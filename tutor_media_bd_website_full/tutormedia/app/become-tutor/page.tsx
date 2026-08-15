"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BecomeTutor() {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState({
    university: "", department: "", subjects: "", areas: "",
    fee: "", experience: "", bio: "",
  });
  const [status, setStatus] = useState<"idle"|"saving"|"error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function saveProfile() {
    setStatus("saving");
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus("error");
      setError("Please log in first.");
      router.push("/login?next=/become-tutor");
      return;
    }

    // Make sure the profile role is set to tutor
    await supabase.from("profiles").update({ role: "tutor" }).eq("id", user.id);

    const { error: upsertError } = await supabase.from("tutor_profiles").upsert({
      profile_id: user.id,
      university: form.university,
      department: form.department,
      subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
      medium: [],
      experience_years: Number(form.experience) || 0,
      expected_fee_min: Number(form.fee) || null,
      expected_fee_max: Number(form.fee) || null,
      bio: form.bio,
    }, { onConflict: "profile_id" });

    if (upsertError) {
      setStatus("error");
      setError(upsertError.message);
      return;
    }

    setStatus("idle");
    router.push("/dashboard");
  }

  return (
    <main className="form-page"><div className="container"><div className="card form-card">
      <h2>Become a Tutor</h2>
      <p className="muted">Create your tutor profile. Use a real photo and truthful education information — you'll be asked to upload a student ID or NID for verification from your dashboard.</p>
      <div className="form-grid">
        <div className="field"><label>University</label><input value={form.university} onChange={(e) => set("university", e.target.value)} /></div>
        <div className="field"><label>Department</label><input value={form.department} onChange={(e) => set("department", e.target.value)} /></div>
        <div className="field"><label>Subjects</label><input placeholder="Math, Physics" value={form.subjects} onChange={(e) => set("subjects", e.target.value)} /></div>
        <div className="field"><label>Preferred areas</label><input placeholder="Mirpur, Uttara..." value={form.areas} onChange={(e) => set("areas", e.target.value)} /></div>
        <div className="field"><label>Expected fee (BDT/month)</label><input type="number" value={form.fee} onChange={(e) => set("fee", e.target.value)} /></div>
        <div className="field"><label>Experience (years)</label><input type="number" value={form.experience} onChange={(e) => set("experience", e.target.value)} /></div>
        <div className="field full"><label>About you</label><textarea rows={5} value={form.bio} onChange={(e) => set("bio", e.target.value)} /></div>
        {error && <p className="field full" style={{color:"#c0392b"}}>{error}</p>}
        <div className="field full"><button className="btn primary" type="button" disabled={status==="saving"} onClick={saveProfile}>{status==="saving" ? "Saving..." : "Create Tutor Profile"}</button></div>
      </div>
    </div></div></main>
  );
}
