const LONGCAT_API_URL =
  process.env.LONGCAT_API_URL ||
  "https://api.longcat.chat/openai/v1/chat/completions";
const LONGCAT_MODEL = process.env.LONGCAT_MODEL || "LongCat-Flash-Chat";

// ── Resume context ─────────────────────────────────────────────────────────
// Fill this in with your real CV summary. Keep it terse and factual; the
// model uses it as authoritative grounding for visitor questions. Anything
// you do not write here, the model should not invent.
const OWNER_NAME = "Replace With Your Name";

const RESUME_SUMMARY = `
Role: Replace with your current role / title.
Years of experience: e.g. 5+ years
Core skills: TypeScript, React, Node.js, ... (replace)
Notable projects:
  - Chill CV — interactive resume site (React 19, Vite, Tailwind v4, LongCat).
  - Project Two — replace with a real project + 1-line summary.
  - Project Three — replace with a real project + 1-line summary.
Education: Replace with your education.
Languages: Replace (e.g. English, 中文).
Interests: Replace with technical interests, side projects, or what you read.
Contact: Replace with email or links.
`.trim();

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function GET() {
  return jsonResponse({error: "Method not allowed"}, 405);
}

export async function POST(request) {
  const apiKey = process.env.LONGCAT_API_KEY;

  if (!apiKey) {
    return jsonResponse({error: "LongCat API key is not configured."}, 500);
  }

  const body = await request.json().catch(() => ({}));
  const question = cleanText(body?.question, 1000);
  const language = cleanText(body?.language, 40) || "English";
  const topic = cleanText(body?.topic, 80);

  if (!question) {
    return jsonResponse({error: "Question is required."}, 400);
  }

  const topicLine = topic ? `Topic hint: ${topic}.\n` : "";

  const prompt = `You are the resume archivist for ${OWNER_NAME}.
A visitor is browsing an interactive CV called "Chill CV" and asks a question.
Use the resume summary below as the authoritative ground truth. Do not invent facts that are not in the summary; if the answer is not present, say so briefly and suggest what is documented instead.

${topicLine}Visitor question: "${question}"

IMPORTANT: Reply in ${language}. Keep the response under 180 words. Tone: archivist — concise, factual, slightly literary, no marketing fluff.

--- RESUME SUMMARY ---
${RESUME_SUMMARY}
--- END SUMMARY ---`;

  try {
    const response = await fetch(LONGCAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: LONGCAT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are Chill CV's resume archivist assistant. Give concise, accurate, archive-style responses grounded only in the provided resume summary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 260,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        "LongCat API Error:",
        data?.error?.message || response.statusText,
      );
      return jsonResponse({error: "Error connecting to the archive."}, 502);
    }

    const answer = data?.choices?.[0]?.message?.content?.trim();

    return jsonResponse({
      answer:
        answer ||
        "The archive is currently unresponsive. Please try again later.",
    });
  } catch (error) {
    console.error("LongCat API Error:", error);
    return jsonResponse({error: "Error connecting to the archive."}, 502);
  }
}
