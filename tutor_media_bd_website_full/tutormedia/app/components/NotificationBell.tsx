"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Notification = { id: string; title: string; body: string | null; link: string | null; read: boolean; created_at: string };

export default function NotificationBell() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setItems(data || []);

      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `profile_id=eq.${user.id}` },
          (payload) => setItems((prev) => [payload.new as Notification, ...prev])
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    })();
  }, []);

  if (!userId) return null;

  const unread = items.filter((i) => !i.read).length;

  async function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    await supabase.from("notifications").update({ read: true }).eq("profile_id", userId).eq("read", false);
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }}
        style={{ position: "relative", background: "transparent", border: 0, cursor: "pointer" }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && <span className="bell-dot" />}
      </button>
      {open && (
        <div className="card" style={{ position: "absolute", right: 0, top: 34, width: 300, maxHeight: 360, overflowY: "auto", zIndex: 40 }}>
          {items.length === 0 && <p className="muted">No notifications yet.</p>}
          {items.map((n) => (
            <div key={n.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <strong style={{ fontSize: 13 }}>{n.title}</strong>
              {n.body && <p className="muted" style={{ fontSize: 12, margin: "4px 0 0" }}>{n.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
