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
});
