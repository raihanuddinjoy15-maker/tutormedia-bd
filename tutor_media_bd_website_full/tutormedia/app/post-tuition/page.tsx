"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PostTuition() {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState({
    class_name: "Class 5", medium: "Bangla Medium", subjects: "", city: "Dhaka",
    area: "", budget_min: "", budget_max: "", days_per_week: "4", schedule: "", requirements: "",
  });
  const [status, setStatus] = useState<"idle"|"saving"|"error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function publish() {
    setStatus("saving");
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus("error");
      setError("Please log in first to post a tuition request.");
      router.push("/login?next=/post-tuition");
      return;
    }

    const { error: insertError } = await supabase.from("tuition_posts").insert({
      guardian_id: user.id,
      class_name: form.class_name,
      subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
      medium: form.medium,
      city: form.city,
      area: form.area,
      budget_min: Number(form.budget_min) || null,
      budget_max: Number(form.budget_max) || null,
      days_per_week: Number(form.days_per_week) || null,
      schedule: form.schedule,
      requirements: form.requirements,
      status: "pending",
    });

    if (insertError) {
      setStatus("error");
      setError(insertError.message);
      return;
    }

    setStatus("idle");
    router.push("/dashboard");
  }

  return (
    <main className="form-page"><div className="container"><div className="card form-card">
      <h2>Post a Tuition</h2>
      <p className="muted">Tell us what kind of tutor you need.</p>
      <div className="form-grid">
        <div className="field"><label>Student class</label>
          <select value={form.class_name} onChange={(e) => set("class_name", e.target.value)}>
            {["Class 5","Class 6","Class 7","Class 8","Class 9","SSC","HSC"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field"><label>Medium</label>
          <select value={form.medium} onChange={(e) => set("medium", e.target.value)}>
            {["Bangla Medium","English Version","English Medium"].map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="field"><label>Subjects</label><input placeholder="e.g. Math, Physics" value={form.subjects} onChange={(e) => set("subjects", e.target.value)} /></div>
        <div className="field"><label>Location</label><input placeholder="e.g. Dhanmondi" value={form.area} onChange={(e) => set("area", e.target.value)} /></div>
        <div className="field"><label>Budget min (BDT)</label><input type="number" value={form.budget_min} onChange={(e) => set("budget_min", e.target.value)} /></div>
        <div className="field"><label>Budget max (BDT)</label><input type="number" value={form.budget_max} onChange={(e) => set("budget_max", e.target.value)} /></div>
        <div className="field"><label>Days per week</label><input type="number" value={form.days_per_week} onChange={(e) => set("days_per_week", e.target.value)} /></div>
        <div className="field full"><label>Preferred schedule</label><input placeholder="e.g. 6 PM – 8 PM" value={form.schedule} onChange={(e) => set("schedule", e.target.value)} /></div>
        <div className="field full"><label>Additional requirements</label><textarea rows={5} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} /></div>
        {error && <p className="field full" style={{color:"#c0392b"}}>{error}</p>}
        <div className="field full"><button className="btn primary" type="button" disabled={status==="saving"} onClick={publish}>{status==="saving" ? "Publishing..." : "Publish Tuition"}</button></div>
      </div>
    </div></div></main>
  );
}
