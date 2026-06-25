import "@testing-library/jest-dom";

import { afterEach, beforeEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  process.env.OPENAI_BASE_URL = ORIGINAL_ENV.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  process.env.OPENAI_MODEL = ORIGINAL_ENV.OPENAI_MODEL ?? "gpt-4o-mini";

  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("Unexpected network call during unit tests.");
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();

  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key];
    }
  }

  Object.assign(process.env, ORIGINAL_ENV);
});
