// Tests that global transformations defined by the Pulsar Options work
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { execute } = require("./helper.js");

describe("Global Tests", () => {
  it("ES module exports become CommonJS", () => {
    const result = execute(`
      export default function answer() {
        return 42;
      }

      export const name = "Pulsar";
    `);

    assert.equal(result.default(), 42);
    assert.equal(result.name, "Pulsar");
  });
});
