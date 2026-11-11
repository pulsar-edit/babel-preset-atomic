// Tests the behavior of code after being transformed by babel
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { execute } = require("./helper.js");

describe("Behavior Tests", () => {
  it("@babel/plugin-proposal-nullish-coalescing-operator", () => {
    const result = execute(`
      const obj = {};
      obj.foo = null;
      module.exports = obj.foo ?? "default";
    `);

    assert.deepEqual(result, "default");
  });
  it("@babel/plugin-proposal-logical-assignment-operators", () => {
    const result = execute(`
      const a = { duration: 50, title: "" };
      a.duration ||= 10;
      a.title ||= "title is empty";
      module.exports = a;
    `);

    assert.strictEqual(result.duration, 50);
    assert.strictEqual(result.title, "title is empty");
  });
  it("@babel/plugin-proposal-numeric-separator", () => {
    const result = execute(`
      const budget = 1_000_000_000_000;
      const isEqual = budget === 10 ** 12;
      module.exports = isEqual;
    `);

    assert.strictEqual(result, true);
  });
  it("@babel/plugin-proposal-optional-chaining", () => {
    const result = execute(`
      const obj = {
        foo: {
          bar: {
            baz: 42
          }
        }
      };

      module.exports = {
        baz: obj?.foo?.bar?.baz,
        safe: obj?.qux?.baz,
        mix: obj?.foo.bar?.baz,
        bracket: obj?.["foo"]?.bar?.baz
      };
    `);

    assert.strictEqual(result.baz, 42);
    assert.strictEqual(result.safe, undefined);
    assert.strictEqual(result.mix, 42);
    assert.strictEqual(result.bracket, 42);
  });
  it("@babel/plugin-proposal-class-properties", () => {
    const result = execute(`
      class Bork {
        instanceProperty = "bork";
        boundFunction = () => {
          return this.instanceProperty;
        };
        static staticProperty = "babelIsCool";
        static staticFunction = function() {
          return Bork.staticProperty;
        };
      }
      module.exports = Bork;
    `);
    let myBork = new result();
    assert.strictEqual(myBork.__proto__.boundFunction, undefined);
    assert.strictEqual(myBork.boundFunction.call(undefined), "bork");
    assert.strictEqual(result.staticFunction(), "babelIsCool");
  });
  it("@babel/plugin-proposal-decorators", () => {
    // We use `legacy` mode on this plugin, so we should test specifically for that

    const mutateExistingConstructor = execute(`
      function dec(cls) {
        cls.staticProp = "prop";
      }

      @dec
      class Parent {
        parent() {};
      }

      module.exports = Parent;
    `);

    assert.strictEqual(mutateExistingConstructor.staticProp, "prop");

    const returnNewConstructor = execute(`
      function dec(cls) {
        return class Child extends cls {
          child(){}
        };
      }

      @dec
      class Parent {
        parent(){}
      }

      module.exports = Parent;
    `);

    assert.strictEqual(typeof returnNewConstructor.prototype.parent, "function");
    assert.strictEqual(typeof returnNewConstructor.prototype.child, "function");
  });
  it("@babel/plugin-proposal-do-expressions", () => {
    const result = execute(`
      let x = 5;
      let a = do {
        if (x > 10) {
          ("big");
        } else {
          ("small");
        }
      };
      module.exports = a;
    `);

    assert.strictEqual(result, "small");
  });
  it("@babel/plugin-proposal-export-default-from", () => {
    const result = execute(`
      export os from "node:os";
    `);

    const os = require("node:os");

    assert.strictEqual(result.os.EOL, os.EOL);
  });
  it("@babel/plugin-proposal-export-namespace-from", () => {
    const result = execute(`
      export * as os from "node:os";
    `);

    const os = require("node:os");

    assert.strictEqual(result.os.EOL, os.EOL);
  });
  it("@babel/plugin-proposal-function-bind", () => {
    const result = execute(`
      const box = {
        weight: 2,
        getWeight() {
          return this.weight;
        }
      };
      const { getWeight } = box;
      const bigBox = { weight: 10 };
      function add(val) {
        return this + val;
      }

      module.exports = {
        simple: box.getWeight(),
        bind: bigBox::getWeight(),
        chained: bigBox::getWeight()::add(5)
      };
    `);

    assert.strictEqual(result.simple, 2);
    assert.strictEqual(result.bind, 10);
    assert.strictEqual(result.chained, 15);
  });
});
