import Link from "next/link";

const tutors = [
  ["Sadia Rahman","University of Dhaka","Math, Physics","Dhanmondi","4.9","https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85"],
  ["Arif Hasan","BUET","Math, ICT","Mirpur","4.8","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85"],
  ["Nusrat Jahan","AUST","English, Biology","Uttara","4.9","https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=85"],
  ["Demo Tutor","North South University","English, ICT","Badda","4.7","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85"]
];

export default function Tutors() {
 return <main className="form-page"><div className="container">
   <div className="section-title"><div><h2>Find a Tutor</h2><p className="muted">Filter by subject, location, university, budget and availability.</p></div></div>
   <div className="card" style={{marginBottom:20}}>
    <div className="form-grid">
      <div className="field"><label>Subject</label><select><option>Any subject</option><option>Math</option><option>Physics</option><option>English</option><option>ICT</option></select></div>
      <div className="field"><label>Location</label><select><option>All Bangladesh</option><option>Dhaka</option><option>Dhanmondi</option><option>Mirpur</option><option>Uttara</option></select></div>
      <div className="field"><label>Medium</label><select><option>Any</option><option>Bangla Medium</option><option>English Version</option><option>English Medium</option></select></div>
      <div className="field"><label>Budget</label><select><option>Any budget</option><option>৳3,000–5,000</option><option>৳5,000–8,000</option><option>৳8,000+</option></select></div>
    </div>
   </div>
   <div className="grid3">{tutors.map(t=><article className="card tutor-card" key={t[0]}><img className="tutor-img" src={t[5]} alt={`${t[0]} tutor profile`}/><div className="tutor-body"><span className="badge">✓ Verification ready</span><h3>{t[0]}</h3><p className="muted">{t[1]}</p><p>{t[2]}</p><p className="muted">📍 {t[3]}</p><p className="rating">★ {t[4]}</p><Link className="btn primary" href="/post-tuition">Request Tutor</Link></div></article>)}</div>
 </div></main>
}
