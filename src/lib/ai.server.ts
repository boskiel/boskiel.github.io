import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MISSING_KEY_MESSAGE =
  "Add GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY to .env.local, then restart the dev server. " +
  "Free Gemini key: https://aistudio.google.com/apikey · OpenAI key: https://platform.openai.com/api-keys";

let cachedFileEnv: Record<string, string> | null = null;

function parseEnvFile(contents: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function loadFileEnv(): Record<string, string> {
  if (cachedFileEnv) return cachedFileEnv;
  const root = process.cwd();
  const files = [".env.local", ".env"];
  const merged: Record<string, string> = {};
  for (const file of files) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    Object.assign(merged, parseEnvFile(readFileSync(path, "utf8")));
  }
  cachedFileEnv = merged;
  return merged;
}

function readEnv(name: string): string | undefined {
  const fromProcess = process.env[name]?.trim();
  if (fromProcess) return fromProcess;
  return loadFileEnv()[name]?.trim();
}

export function getMedlexAiModel(): LanguageModel {
  const googleKey = readEnv("GOOGLE_GENERATIVE_AI_API_KEY");
  if (googleKey) {
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    return google(readEnv("GOOGLE_MODEL") || "gemini-2.5-flash");
  }

  const openaiKey = readEnv("OPENAI_API_KEY");
  if (openaiKey) {
    const provider = createOpenAICompatible({
      name: "openai",
      baseURL: "https://api.openai.com/v1",
      apiKey: openaiKey,
    });
    return provider(readEnv("OPENAI_MODEL") || "gpt-4o-mini");
  }

  throw new Error(MISSING_KEY_MESSAGE);
}
