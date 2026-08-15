const jobs = [
 ["Class 9 Mathematics + Physics","Dhanmondi","4 days/week","৳7,000–9,000","English Version"],
 ["Class 7 All Subjects","Mirpur","5 days/week","৳5,000–6,500","Bangla Medium"],
 ["HSC ICT + Math","Uttara","3 days/week","৳6,000–8,000","English Version"]
];
export default function Tuition() {
 return <main className="form-page"><div className="container"><h2>Find Tuition</h2><p className="muted">Browse tuition opportunities and apply.</p><div className="grid3">{jobs.map(j=><article className="card" key={j[0]}><span className="badge">New</span><h3>{j[0]}</h3><p>📍 {j[1]}</p><p>🗓 {j[2]}</p><p>💰 {j[3]}</p><p>📚 {j[4]}</p><button className="btn primary">Apply Now</button></article>)}</div></div></main>
}
