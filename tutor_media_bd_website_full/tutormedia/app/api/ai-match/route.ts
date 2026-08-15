import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// POST /api/ai-match
// body: { subject: string, classLevel: string, medium: string, city: string,
//          area: string, budgetMax: number }
// Pulls candidate tutors from Supabase, asks Claude to rank & explain the top
// matches, and returns a ranked list with reasons.
export async function POST(req: NextRequest) {
  const requirement = await req.json();
  const supabase = createServiceClient();

  const { data: candidates, error } = await supabase
    .from("tutor_profiles")
    .select(
      "id, profile_id, university, subjects, classes, medium, expected_fee_min, expected_fee_max, experience_years, rating, profiles!inner(full_name, city, area)"
    )
    .contains("subjects", [requirement.subject])
    .lte("expected_fee_min", requirement.budgetMax || 999999)
    .limit(25);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ matches: [], note: "No tutors matched yet in the database." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fall back to a simple deterministic ranking if AI isn't configured.
    return NextResponse.json({ matches: candidates.slice(0, 5), note: "Ranked without AI (ANTHROPIC_API_KEY not set)." });
  }

  const anthropic = new Anthropic({ apiKey });
  const prompt = `Guardian requirement: ${JSON.stringify(requirement)}
Candidate tutors (JSON array): ${JSON.stringify(candidates)}

Rank the top 5 best-fitting tutor "profile_id" values for this requirement, considering subject
match, budget fit, location, medium, and rating. Respond ONLY with JSON, no prose, no markdown
fences, in this exact shape:
{"ranked": [{"profile_id": "...", "reason": "one short sentence"}]}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const ranked = parsed.ranked
      .map((r: { profile_id: string; reason: string }) => {
        const tutor = candidates.find((c) => c.profile_id === r.profile_id);
        return tutor ? { ...tutor, reason: r.reason } : null;
      })
      .filter(Boolean);

    return NextResponse.json({ matches: ranked });
  } catch (err) {
    console.error("AI match error:", err);
    return NextResponse.json({ matches: candidates.slice(0, 5), note: "AI ranking failed, showing unranked matches." });
  }
}
