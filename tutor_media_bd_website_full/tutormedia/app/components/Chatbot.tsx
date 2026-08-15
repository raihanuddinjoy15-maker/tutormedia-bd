"use client";
import { useState } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";

export default function Chatbot() {
  const [open,setOpen] = useState(false);
  const [lang,setLang] = useState<"en"|"bn">("en");
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [messages,setMessages] = useState<{from:"bot"|"user",text:string}[]>([
    {from:"bot", text:"Hello! I can help you find a tutor or post tuition. You can write in English or বাংলা."}
  ]);

  async function send() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    const next = [...messages, {from:"user" as const, text}];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lang }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || (lang === "bn" ? "দুঃখিত, একটি সমস্যা হয়েছে।" : "Sorry, something went wrong.");
      setMessages(m => [...m, {from:"bot", text: reply}]);
    } catch {
      setMessages(m => [...m, {from:"bot", text: lang==="bn" ? "সংযোগে সমস্যা হয়েছে।" : "Connection error. Please try again."}]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return <button className="btn primary" style={{position:"fixed",right:18,bottom:18,zIndex:50,borderRadius:999}} onClick={()=>setOpen(true)}><Bot size={18}/> AI Assistant</button>;

  return <div className="chat">
    <div className="chat-head"><strong>🤖 TutorMedia AI</strong><div><button onClick={()=>setLang(lang==="en"?"bn":"en")} style={{background:"transparent",color:"white",border:0,cursor:"pointer"}}>{lang==="en"?"বাংলা":"EN"}</button><button onClick={()=>setOpen(false)} style={{background:"transparent",color:"white",border:0,cursor:"pointer"}}><X size={18}/></button></div></div>
    <div className="chat-body">{messages.map((m,i)=><div key={i} className={`msg ${m.from}`}>{m.text}</div>)}{loading && <div className="msg bot"><Loader2 size={14} className="spin"/> ...</div>}</div>
    <div className="chat-form"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={lang==="bn"?"আপনার প্রশ্ন লিখুন...":"Ask me anything..."}/><button className="btn primary" onClick={send} disabled={loading}><Send size={16}/></button></div>
  </div>
}
