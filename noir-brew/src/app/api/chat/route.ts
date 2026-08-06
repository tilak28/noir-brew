import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Noir, the warm, concise café concierge for Noir-Brew, a dark, design-led café at 47 Mercer Street, New York, NY 10013. Hours: Monday–Thursday 7 AM–11 PM; Friday–Sunday 7 AM–midnight. Signature drinks: Midnight Cortado ($7, double ristretto, smoked vanilla, oat), Noir Cloud ($8, cold brew, black sesame, cream), Velvet Mocha ($8, 70% cacao, espresso, sea salt), After Hours ($7, espresso, tonic, charred orange). Oat, almond, and dairy milk are available. There are pastries and several vegan options. Wi-Fi is available; weekday afternoons are best for working. Reservations are not required and seating is first come, first served. Be hospitable and atmospheric but practical. Keep answers under 90 words. Never claim to place an order or reservation.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function offlineReply(messages: ChatMessage[]) {
  const question = messages.at(-1)?.content.toLowerCase() ?? "";
  if (/hour|open|close|when/.test(question)) return "We’re open Monday through Thursday from 7 AM to 11 PM, and Friday through Sunday from 7 AM until midnight. The room settles into its best mood after sunset.";
  if (/oat|almond|milk|dairy|vegan/.test(question)) return "Absolutely. We pour oat, almond, and dairy milk. Oat is especially lovely in our Midnight Cortado. We also keep a rotating selection of vegan pastries—ask the bar when you arrive for tonight’s choices.";
  if (/work|wifi|wi-fi|laptop/.test(question)) return "Yes—Wi-Fi is available, and laptops are welcome. Weekday afternoons are the calmest time to settle in; after 6 PM, we keep the room a little more social and screen-light.";
  if (/where|address|location|direction/.test(question)) return "You’ll find us at 47 Mercer Street in SoHo, New York. We’re tucked between the galleries—look for the small copper N glowing above the door.";
  if (/recommend|try|best|drink|coffee/.test(question)) return "For something smooth and quietly sweet, try the Midnight Cortado with smoked vanilla. If you’re after a bolder, colder cup, the Noir Cloud pairs cold brew with black sesame cream—it’s our signature after-dark pour.";
  if (/reserve|reservation|book|seat/.test(question)) return "No reservation needed—seating is first come, first served. For the easiest table, arrive before 7 PM on weekends. If it’s full, the bar is always a good place to land.";
  return "I’d be glad to help. Ask me about tonight’s drinks, dietary options, opening hours, working from the café, or finding us on Mercer Street.";
}

function streamText(text: string) {
  const encoder = new TextEncoder();
  const pieces = text.match(/\S+\s*/g) ?? [text];
  return new ReadableStream({
    async start(controller) {
      for (const piece of pieces) {
        controller.enqueue(encoder.encode(piece));
        await new Promise(resolve => setTimeout(resolve, 22));
      }
      controller.close();
    },
  });
}

export async function POST(request: NextRequest) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages)
    ? body.messages
        .filter((message): message is ChatMessage =>
          (message?.role === "user" || message?.role === "assistant") && typeof message.content === "string"
        )
        .slice(-12)
    : [];

  if (!messages.length || messages.at(-1)?.role !== "user") {
    return Response.json({ error: "A user message is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(streamText(offlineReply(messages)), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  }

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.7,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      console.error("Chat provider error", upstream.status, await upstream.text());
      return new Response(streamText(offlineReply(messages)), {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = upstream.body.getReader();
    let buffer = "";

    const stream = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const payload = line.trim().replace(/^data:\s*/, "");
            if (!payload || payload === "[DONE]") continue;
            try {
              const parsed = JSON.parse(payload);
              const token = parsed.choices?.[0]?.delta?.content;
              if (typeof token === "string" && token) controller.enqueue(encoder.encode(token));
            } catch {
              // Ignore provider keep-alives and malformed partial events.
            }
          }
          if (lines.length) return;
        }
      },
      cancel() { void reader.cancel(); },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
    });
  } catch (error) {
    console.error("Chat connection error", error);
    return new Response(streamText(offlineReply(messages)), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  }
}
