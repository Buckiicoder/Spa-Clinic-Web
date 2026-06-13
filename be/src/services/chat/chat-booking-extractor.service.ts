import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ChatBookingExtractorService {
  static async extract(message: string) {
    try {
      const completion =
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0,

          response_format: {
            type: "json_object",
          },

          messages: [
            {
  role: "system",
  content: `
You are a booking information extractor.

Return ONLY valid JSON.

JSON schema:

{
  "name": null,
  "phone": null,
  "booking_date": null,
  "booking_time": null
}

IMPORTANT:

- Extract ONLY information explicitly written by the user.
- NEVER guess.
- NEVER infer.
- NEVER create default values.
- NEVER use example values.
DO NOT extract date.
DO NOT extract time.

booking_date = null
booking_time = null

- If information is missing return null.

Output JSON only.
`,
},
            {
              role: "user",
              content: message,
            },
          ],
        });

      const content =
        completion.choices[0].message.content;

      if (!content) {
        return {};
      }

      return JSON.parse(content);
    } catch (error) {
      console.error(
        "Booking extractor error:",
        error,
      );

      return {};
    }
  }
}