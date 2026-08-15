"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="form-page">
      <div className="container" style={{ maxWidth: 440 }}>
        <div className="card">
          <h2>Log in</h2>
          <p className="muted">Access your TutorMedia BD account.</p>
          <form onSubmit={handleLogin} className="field-col">
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p style={{ color: "#c0392b" }}>{error}</p>}
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
          <p className="muted" style={{ marginTop: 16 }}>
            No account? <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
