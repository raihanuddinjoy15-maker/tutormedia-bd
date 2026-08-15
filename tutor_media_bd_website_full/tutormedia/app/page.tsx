import Link from "next/link";
import { BookOpen, MapPin, Brain, ShieldCheck, ArrowRight } from "lucide-react";
import Chatbot from "./components/Chatbot";

const tutors = [
  {name:"Sadia Rahman", university:"University of Dhaka", subjects:"Math · Physics", location:"Dhanmondi", rating:"4.9", image:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85"},
  {name:"Arif Hasan", university:"BUET", subjects:"Math · ICT", location:"Mirpur", rating:"4.8", image:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85"},
  {name:"Nusrat Jahan", university:"AUST", subjects:"English · Biology", location:"Uttara", rating:"4.9", image:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=85"}
];

export default function Home() {
  return (
    <>
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <div className="eyebrow">Bangladesh's smarter tutor marketplace</div>
              <h1>Find the right tutor. Learn better.</h1>
              <p>Search verified tutors, post tuition jobs, and use AI to find the best match in Bangla or English.</p>
              <div className="actions">
                <Link className="btn primary" href="/tutors">Find a Tutor <ArrowRight size={16} style={{verticalAlign:"middle"}}/></Link>
                <Link className="btn secondary" href="/post-tuition">Post Tuition</Link>
                <Link className="btn secondary" href="/become-tutor">Become a Tutor</Link>
              </div>
            </div>
            <div className="hero-image" aria-label="Students learning together" />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-title">
              <div><h2>Why TutorMedia?</h2><p className="muted">Designed for Bangladesh, mobile first.</p></div>
            </div>
            <div className="grid4">
              <Feature icon={<Brain/>} title="AI Matching" text="Get tutor recommendations based on subject, class, location, budget and schedule."/>
              <Feature icon={<ShieldCheck/>} title="Verification" text="Show phone, education and identity verification levels clearly."/>
              <Feature icon={<MapPin/>} title="Local Search" text="Find tutors and tuition around Dhaka and other Bangladesh cities."/>
              <Feature icon={<BookOpen/>} title="Bangla + English" text="Use the platform and chatbot in either language."/>
            </div>
          </div>
        </section>

        <section className="section" style={{background:"white"}}>
          <div className="container">
            <div className="section-title"><div><h2>Featured Tutors</h2><p className="muted">Demo profiles — replace with real verified users.</p></div><Link href="/tutors">View all →</Link></div>
            <div className="grid3">
              {tutors.map(t => <TutorCard key={t.name} {...t}/>)}
            </div>
          </div>
        </section>
      </main>
      <Chatbot/>
    </>
  );
}

function Feature({icon,title,text}:{icon:React.ReactNode,title:string,text:string}) {
  return <div className="card"><div className="iconbox">{icon}</div><h3>{title}</h3><p className="muted">{text}</p></div>
}

function TutorCard(t:any) {
  return <article className="card tutor-card">
    <img className="tutor-img" src={t.image} alt={`${t.name} tutor profile`} />
    <div className="tutor-body">
      <span className="badge">✓ Demo Verified</span>
      <h3>{t.name}</h3><p className="muted">{t.university}</p>
      <p>{t.subjects}</p><p className="muted">{t.location}</p><p className="rating">★ {t.rating}</p>
      <Link className="btn primary" href="/tutors">View Profile</Link>
    </div>
  </article>
}
