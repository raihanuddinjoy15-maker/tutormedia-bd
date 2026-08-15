import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import NotificationBell from "./components/NotificationBell";

export const metadata: Metadata = {
  title: "Tutor Media BD — Find the Right Tutor",
  description: "Bangladesh tutor and tuition marketplace with AI matching.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="nav">
        <div className="container" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link className="logo" href="/">Tutor<span>Media</span> BD</Link>
          <div className="navlinks">
            <Link href="/tutors">Find Tutor</Link>
            <Link href="/tuition">Find Tuition</Link>
            <Link href="/post-tuition">Post Tuition</Link>
            <Link href="/become-tutor">Become a Tutor</Link>
            <Link href="/messages">Messages</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <NotificationBell/>
            <Link className="btn secondary" href="/login" style={{padding:"8px 14px"}}>Log in</Link>
            <button className="lang">বাংলা / EN</button>
          </div>
        </div>
      </nav>
      {children}
      <footer className="footer">
        <div className="container">
          <h3>TutorMedia BD</h3>
          <p className="muted">AI-powered tutor ↔ student marketplace for Bangladesh.</p>
          <p className="muted">Demo starter — connect authentication, database, verification and payments before production.</p>
        </div>
      </footer>
    </>
  );
}
