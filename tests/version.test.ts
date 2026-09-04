import { describe, expect, it } from "vitest";

import pkg from "../package.json" with { type: "json" };
import { VERSION } from "../src/index.js";

describe("package version sites", () => {
  it("VERSION matches package.json", () => {
    expect(VERSION).toBe((pkg as { version: string }).version);
  });
});
