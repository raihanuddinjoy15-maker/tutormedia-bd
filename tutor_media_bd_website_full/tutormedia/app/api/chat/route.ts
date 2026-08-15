import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// POST /api/chat
// body: { messages: {from: "user"|"bot", text: string}[], lang: "en" | "bn" }
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI is not configured yet. Add ANTHROPIC_API_KEY to your environment." },
      { status: 500 }
    );
  }

  const { messages, lang } = await req.json();
  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = `You are the TutorMedia BD assistant, helping guardians find tutors and
tutors find students in Bangladesh. Reply in ${lang === "bn" ? "Bangla" : "English"} unless the
user switches language. Be concise (2-4 sentences). Ask for missing details one at a time:
subject, class/grade, location (area in Dhaka or city), medium (Bangla/English medium/English
version), budget in BDT, and preferred schedule. Once you have enough details, tell the user you
will show matching tutors below, and summarize their requirement in one line starting with
"MATCH_SUMMARY:" so the app can parse it.`;

  const claudeMessages = (messages || []).map((m: { from: string; text: string }) => ({
    role: m.from === "user" ? "user" : "assistant",
    content: m.text,
  }));

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Chat AI error:", err);
    return NextResponse.json({ error: "AI request failed. Please try again." }, { status: 502 });
  }
}
