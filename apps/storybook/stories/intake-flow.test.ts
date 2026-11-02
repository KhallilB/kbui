import { expect, test } from "bun:test";
import { recipeDefinitions } from "../catalog/content";
import { flowContractFor, renderBlock } from "../catalog/recipe-docs";

const recipe = recipeDefinitions.find((entry) => entry.name === "RequestIntake");
if (!recipe) throw new Error("Missing RequestIntake recipe");

test("RequestIntake declares its own executable flow family", () => {
  expect(recipe.flow).toBe("intake");
  const contract = flowContractFor(recipe);
  expect(Object.keys(contract.rules).sort()).toEqual([
    "application-validation",
    "assignment",
    "edit",
    "empty-directory",
    "prepare",
    "reset",
    "validation",
  ]);
  expect(contract.factsFor("RequestIntake")).toEqual({ async: false, gaps: {} });
  expect(() => contract.factsFor("UnverifiedIntake")).toThrow();
});

test("intake guides describe local preparation rather than list-detail policy", () => {
  const policy = renderBlock(recipe, "policy");
  expect(policy).toContain("Local summary");
  expect(policy).toContain("In-memory");
  expect(policy).not.toContain("List and detail share the row");
  const guarantees = renderBlock(recipe, "flow-guarantees");
  expect(guarantees).toContain("retains the draft");
  expect(guarantees).toContain("Starting another request clears");
  expect(guarantees).not.toContain("Browser Back and Forward");
});
