// Google Gemini API integration for doubt solving
const GEMINI_API_KEY = "AIzaSyAujvmj0sBVNBW_UJaywMA5qtWfjQ_xA8g";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function askGrok(question: string): Promise<string> {
  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are an expert AI tutor. Answer student questions clearly and concisely. Explain concepts step by step when needed. Be encouraging and educational.\n\nStudent question: ${question}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`Gemini API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error("No response from Gemini API");
  }
  return content as string;
}
