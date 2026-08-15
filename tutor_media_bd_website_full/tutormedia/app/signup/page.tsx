"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Signup() {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<"guardian" | "tutor">("guardian");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Create the auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message || "Could not create account.");
      return;
    }

    // 2. Create the matching profile row.
    // Note: in production, do this from a Postgres trigger (on auth.users insert)
    // instead of client code — see supabase/schema.sql `handle_new_user` trigger.
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      role,
      full_name: fullName,
      email,
      phone,
    });

    setLoading(false);
    if (profileError) {
      setError(profileError.message);
      return;
    }

    router.push(role === "tutor" ? "/become-tutor" : "/dashboard");
    router.refresh();
  }

  return (
    <main className="form-page">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="card">
          <h2>Create your account</h2>
          <p className="muted">Join as a guardian looking for tutors, or as a tutor.</p>
          <div className="actions" style={{ margin: "14px 0" }}>
            <button
              type="button"
              className={role === "guardian" ? "btn primary" : "btn secondary"}
              onClick={() => setRole("guardian")}
            >
              I need a tutor
            </button>
            <button
              type="button"
              className={role === "tutor" ? "btn primary" : "btn secondary"}
              onClick={() => setRole("tutor")}
            >
              I am a tutor
            </button>
          </div>
          <form onSubmit={handleSignup} className="field-col">
            <div className="field">
              <label>Full name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Phone (Bangladesh)</label>
              <input placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p style={{ color: "#c0392b" }}>{error}</p>}
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="muted" style={{ marginTop: 16 }}>
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
