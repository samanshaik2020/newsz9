import assert from "node:assert/strict";
import test from "node:test";
import { articleSaveFailure } from "../src/lib/editorial.ts";

test("only missing-column failures report an incomplete storage update", () => {
  for (const code of ["PGRST204", "42703"]) {
    const failure = articleSaveFailure({ code });
    assert.equal(failure.status, 503);
    assert.match(failure.error, /storage update is incomplete/);
  }
});

test("permission and foreign-key errors give different recovery messages", () => {
  const permission = articleSaveFailure({ code: "42501" });
  assert.equal(permission.status, 403);
  assert.match(permission.error, /did not allow/);
  const reference = articleSaveFailure({ code: "23503" });
  assert.equal(reference.status, 422);
  assert.match(reference.error, /selected author, category, or reviewer/);
});

test("duplicates remain conflicts and invalid details remain validation failures", () => {
  assert.equal(articleSaveFailure({ code: "23505" }).status, 409);
  for (const code of ["23502", "23514", "22P02", "P0001"]) {
    const failure = articleSaveFailure({ code });
    assert.equal(failure.status, 422);
    assert.doesNotMatch(failure.error, /migration|storage update/);
  }
});

test("unexpected database failures do not incorrectly request a migration", () => {
  const failure = articleSaveFailure({ code: "XX000" });
  assert.equal(failure.status, 500);
  assert.doesNotMatch(failure.error, /migration|storage update/);
});
