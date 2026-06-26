import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { getMedlexAiModel } from "./ai.server";

const DiseaseResultSchema = z.object({
  mode: z.literal("disease"),
  name: z.string(),
  type: z.enum(["disease", "condition", "syndrome", "disorder", "infection"]),
  summary: z.string(),
  symptoms: z.array(z.string()),
  severity: z.enum(["mild", "moderate", "severe", "variable"]),
  onset: z.string(),
  affectedPopulation: z.string(),
  relatedConditions: z.array(z.string()),
});

const SymptomMatchSchema = z.object({
  mode: z.literal("symptom"),
  query: z.string(),
  matches: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["disease", "condition", "syndrome", "disorder", "infection"]),
      likelihood: z.enum(["high", "moderate", "low"]),
      reasoning: z.string(),
      keySymptoms: z.array(z.string()),
      severity: z.enum(["mild", "moderate", "severe", "variable"]),
    }),
  ),
});

const Input = z.object({
  query: z.string().min(1).max(300),
  mode: z.enum(["disease", "symptom"]),
});

export const medlexSearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const model = getMedlexAiModel();

    if (data.mode === "disease") {
      const { object } = await generateObject({
        model,
        schema: DiseaseResultSchema,
        system:
          "You are a clinical medical reference. Given a disease, condition, or syndrome name, return concise, accurate clinical information. Use plain medical English. Never include disclaimers in fields; keep symptoms as short noun phrases (e.g. 'persistent cough', not full sentences). Always set mode to 'disease'.",
        prompt: `Disease or condition: "${data.query}". Provide a full clinical breakdown.`,
      });
      return object;
    } else {
      const { object } = await generateObject({
        model,
        schema: SymptomMatchSchema,
        system:
          "You are a clinical differential-diagnosis assistant. Given a symptom or set of symptoms, return the most likely matching diseases, ranked. For each match, explain in one sentence why the symptoms fit. Always include 3-6 matches. Always set mode to 'symptom'.",
        prompt: `Patient-reported symptoms: "${data.query}". List likely matching conditions.`,
      });
      return object;
    }
  });

export type DiseaseResult = z.infer<typeof DiseaseResultSchema>;
export type SymptomResult = z.infer<typeof SymptomMatchSchema>;
