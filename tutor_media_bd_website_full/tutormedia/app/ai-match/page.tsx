export default function AIMatch() {
 return <main className="form-page"><div className="container"><div className="card form-card"><h2>🤖 AI Tutor Match</h2><p className="muted">Answer a few questions. The production version will calculate matches from your database.</p><div className="form-grid">
  <div className="field"><label>Class</label><select><option>Class 9</option><option>SSC</option><option>HSC</option></select></div>
  <div className="field"><label>Subject</label><input placeholder="Mathematics"/></div>
  <div className="field"><label>Area</label><input placeholder="Dhanmondi"/></div>
  <div className="field"><label>Budget</label><input placeholder="৳7,000"/></div>
  <div className="field full"><label>Schedule</label><input placeholder="4 days/week, after 6 PM"/></div>
  <div className="field full"><button className="btn primary" type="button">Find My Best Tutors</button></div>
 </div></div></div></main>
}
