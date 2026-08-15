"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Conversation = { id: string; other_name: string };
type Message = { id: string; conversation_id: string; sender_id: string; message: string; created_at: string };

export default function Messages() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load current user + their conversations
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: memberships } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("profile_id", user.id);

      const convoIds = (memberships || []).map((m) => m.conversation_id);
      if (convoIds.length === 0) return;

      const { data: others } = await supabase
        .from("conversation_members")
        .select("conversation_id, profiles(full_name)")
        .in("conversation_id", convoIds)
        .neq("profile_id", user.id);

      const list: Conversation[] = (others || []).map((o: any) => ({
        id: o.conversation_id,
        other_name: o.profiles?.full_name || "Conversation",
      }));
      setConversations(list);
      if (list.length) setActiveId(list[0].id);
    })();
  }, []);

  // Load thread + subscribe to realtime updates for the active conversation
  useEffect(() => {
    if (!activeId) return;
    let ignore = false;

    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });
      if (!ignore) setThread(data || []);
    })();

    const channel = supabase
      .channel(`messages:${activeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        (payload) => setThread((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function sendMessage() {
    if (!input.trim() || !activeId || !userId) return;
    const text = input.trim();
    setInput("");
    await supabase.from("messages").insert({
      conversation_id: activeId,
      sender_id: userId,
      message: text,
      language: "en",
    });
  }

  return (
    <main className="form-page">
      <div className="container">
        <div className="section-title"><div><h2>Messages</h2><p className="muted">Real-time chat between guardians and tutors.</p></div></div>
        <div className="card" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 0, overflow: "hidden", padding: 0 }}>
          <div style={{ borderRight: "1px solid var(--border)", padding: 14 }}>
            {conversations.length === 0 && <p className="muted">No conversations yet.</p>}
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                style={{ padding: "10px 8px", borderRadius: 8, cursor: "pointer", background: activeId === c.id ? "var(--bg)" : "transparent", fontWeight: 600 }}
              >
                {c.other_name}
              </div>
            ))}
          </div>
          <div style={{ padding: 14, display: "flex", flexDirection: "column" }}>
            <div className="chat-thread">
              {thread.map((m) => (
                <div key={m.id} className={`chat-bubble ${m.sender_id === userId ? "me" : "them"}`}>{m.message}</div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="chat-form" style={{ marginTop: 10 }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message..." />
              <button className="btn primary" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
