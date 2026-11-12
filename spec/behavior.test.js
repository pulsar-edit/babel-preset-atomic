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
  it("@babel/plugin-proposal-function-sent", () => {
    const result = execute(`
      function* generator() {
        const first = function.sent;
        const yielded = yield first;
        const second = function.sent;
        return {
          first,
          yielded,
          second
        };
      }

      const iterator = generator();

      const firstResult = iterator.next(10);
      const secondResult = iterator.next(20);

      module.exports = {
        firstResult: firstResult.value,
        secondResult: secondResult.value,
        done: secondResult.done
      };
    `);

    assert.strictEqual(result.firstResult, 10);
    assert.strictEqual(result.secondResult.first, 10);
    assert.strictEqual(result.secondResult.yielded, 20);
    assert.strictEqual(result.secondResult.second, 20);
    assert.strictEqual(result.done, true);
  });
  it("@babel/plugin-proposal-json-strings", () => {
    const result = execute(`
      module.exports = "before after";
      //                      ^ There's a U+2028 char between 'before' and 'after'
    `);
    assert.strictEqual(result, "before after");
    //                                ^ There's a U+2028 char between 'before' and 'after'
  });
  it("@babel/plugin-proposal-pipeline-operator", () => {
    // We use the proposal mode of 'minimal' for this plugin, which is removed in Babel 8
    // Test for this version: https://github.com/liuxingbaoyu/babel/blob/d102298815b7e104c94b826a5dd46b015ef03c08/packages/babel-plugin-proposal-pipeline-operator/test/fixtures/minimal-babel-7/arrow-functions-parenless/input.js
    const result = execute(`
      const y = 2;
      const f = (x) => x
        |> (y => y + 1)
        |> (z => z * y)

      const g = (x) => x
        |> (y =>
          y + 1
          |> (z => z * y)
        )

      const h = (x) => x
        |> (y => (
          y + 1
          |> (z => z * y)
        ))

      module.exports = {
        f: f,
        g: g,
        h: h
      };
    `);

    assert.strictEqual(result.f(1), 4);
    assert.strictEqual(result.g(1), 2);
    assert.strictEqual(result.h(1), 2);
  });
  it("@babel/plugin-proposal-private-methods", () => {
    const result = execute(`
      class Counter {
        #count = 0;

        #increment(amount) {
          this.#count += amount;
          return this.#count;
        }

        increment(amount) {
          return this.#increment(amount);
        }

        get value() {
          return this.#count;
        }
      }

      const first = new Counter();
      const second = new Counter();

      module.exports = {
        firstIncrement: first.increment(2),
        secondIncrement: first.increment(3),
        firstValue: first.value,
        independentInstance: second.increment(1),
        secondValue: second.value
      };
    `);

    assert.strictEqual(result.firstIncrement, 2);
    assert.strictEqual(result.secondIncrement, 5);
    assert.strictEqual(result.firstValue, 5);
    assert.strictEqual(result.independentInstance, 1);
    assert.strictEqual(result.secondValue, 1);
  });
  it("@babel/plugin-proposal-private-property-in-object", () => {
    const result = execute(`
      class Example {
        #value = 42;
        static hasPrivateField(obj) {
          return #value in obj;
        }
      }

      const instance = new Example();
      const otherInstance = new Example();
      const plainObject = { value: 42 };

      module.exports = {
        ownInstance: Example.hasPrivateField(instance),
        otherInstance: Example.hasPrivateField(otherInstance),
        plainObject: Example.hasPrivateField(plainObject),
        unrelatedObject: Example.hasPrivateField({})
      };
    `);

    assert.strictEqual(result.ownInstance, true);
    assert.strictEqual(result.otherInstance, true);
    assert.strictEqual(result.plainObject, false);
    assert.strictEqual(result.unrelatedObject, false);
  });
  it("@babel/plugin-proposal-throw-expressions", () => {
    const result = execute(`
      function test(param = throw new Error("required!")) {
        const test = param === true || throw new Error("Falsy!");
      }

      module.exports = test;
    `);

    assert.throws(() => result(), /required!/);
    assert.throws(() => result(false), /Falsy!/);
    assert.doesNotThrow(() => result(true));
  });
  it("@babel/plugin-syntax-dynamic-import", () => {
    const result = execute(`
      async function loadModule() {
        return await import("node:os");
      }
    `);

    assert.ok(result);
    // We really just test that this compiled, since it isn't obvious to test more thouroughly
  });
  it("@babel/plugin-syntax-import-meta", () => {
    // While we obviously want a behavior test here, the plugin allows Babel to
    // parse `import.meta` but then we define `keepModules: false`, which converts
    // ES modules to CommonJS. So I'm not sure if there's any valid behavior test
    // Refer to transformation tests for this
  });
  it("@babel/plugin-transform-modules-commonjs", () => {
    const result = execute(`
      export default 42;
    `);

    assert.strictEqual(result, 42);
  });
  it("@babel/plugin-transform-reserved-words", () => {
    const result = execute(`
      const abstract = 1;
      const x = abstract + 1;
      module.exports = x
    `);

    // The real test is that we are able to use a reserved word functionally
    assert.strictEqual(result, 2);
  });
});
