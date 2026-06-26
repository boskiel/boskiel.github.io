import { getMedlexAiModel } from "@/lib/ai.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const model = getMedlexAiModel();

        const result = streamText({
          model,
          system:
            "You are MedLex Assistant, a friendly AI helper inside a medical dictionary and symptom-checker app called MedLex. Help users navigate the app, explain medical terms in plain language, and offer general health information. Always remind users that you provide reference information only and are not a substitute for professional medical advice, diagnosis, or treatment. Keep replies concise and use markdown when helpful.",
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
