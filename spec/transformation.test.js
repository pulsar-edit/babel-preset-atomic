// Tests the transformed code matches how we expect
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { compile } = require("./helper.js");

describe("Transformation Tests", () => {
  it("@babel/plugin-proposal-nullish-coalescing-operator", () => {
    // SOURCE: https://babeljs.io/docs/babel-plugin-transform-nullish-coalescing-operator
    const result = compile(`var foo = object.foo ?? "default"`);

    assert.deepEqual(result,
`"use strict";

var _object$foo;
var foo = (_object$foo = object.foo) !== null && _object$foo !== void 0 ? _object$foo : "default";`
    );
  });
  it("@babel/plugin-proposal-logical-assignment-operators", () => {
    // SOURCE: https://babeljs.io/docs/babel-plugin-transform-logical-assignment-operators
    const result = compile(
`a ||= b;
obj.a.b ||= c;

a &&= b;
obj.a.b &&= c;`
    );

    assert.deepEqual(result,
`"use strict";

var _obj$a, _obj$a2;
a || (a = b);
(_obj$a = obj.a).b || (_obj$a.b = c);
a && (a = b);
(_obj$a2 = obj.a).b && (_obj$a2.b = c);`
    );
  });
  it("@babel/plugin-proposal-numeric-separator", () => {
    // SOURCE: https://babeljs.io/docs/babel-plugin-transform-numeric-separator
    const result = compile(
`let budget = 1_000_000_000_000;

console.log(budget === 10 ** 12);`
    );

    assert.deepEqual(result,
`"use strict";

let budget = 1000000000000;
console.log(budget === 10 ** 12);`
    );
  });
  it("@babel/plugin-proposal-optional-chaining", () => {
    // SOURCE: https://babeljs.io/docs/babel-plugin-transform-optional-chaining
    const result = compile(
`const obj = {
  foo: {
    bar: {
      baz: 42,
    },
  },
};

const baz = obj?.foo?.bar?.baz; // 42
const safe = obj?.qux?.baz; // undefined
// Optional chaining and normal chaning can be intermixed
obj?.foo.bar?.baz;
// Bracket notation is supported
obj?.["foo"]?.bar?.baz; // 42`
    );

    assert.deepEqual(result,
`"use strict";

var _obj$foo, _obj$foo$bar, _obj$qux, _obj$foo$bar2, _obj$foo2, _obj$foo2$bar;
const obj = {
  foo: {
    bar: {
      baz: 42
    }
  }
};
const baz = obj === null || obj === void 0 ? void 0 : (_obj$foo = obj.foo) === null || _obj$foo === void 0 ? void 0 : (_obj$foo$bar = _obj$foo.bar) === null || _obj$foo$bar === void 0 ? void 0 : _obj$foo$bar.baz; // 42
const safe = obj === null || obj === void 0 ? void 0 : (_obj$qux = obj.qux) === null || _obj$qux === void 0 ? void 0 : _obj$qux.baz; // undefined
// Optional chaining and normal chaning can be intermixed
obj === null || obj === void 0 ? void 0 : (_obj$foo$bar2 = obj.foo.bar) === null || _obj$foo$bar2 === void 0 ? void 0 : _obj$foo$bar2.baz;
// Bracket notation is supported
obj === null || obj === void 0 ? void 0 : (_obj$foo2 = obj["foo"]) === null || _obj$foo2 === void 0 ? void 0 : (_obj$foo2$bar = _obj$foo2.bar) === null || _obj$foo2$bar === void 0 ? void 0 : _obj$foo2$bar.baz; // 42`
    );
  });
});
