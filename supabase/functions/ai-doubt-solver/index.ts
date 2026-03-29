import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();

    // AI service removed - Lovable integration disabled
    const dummyResponse = "I'm sorry, the AI doubt solving service is currently unavailable as the Lovable integration has been removed.";

    // Return as streaming response in expected format
    const stream = new ReadableStream({
      start(controller) {
        const data = `data: ${JSON.stringify({ choices: [{ delta: { content: dummyResponse } }] })}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("doubt-solver error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
