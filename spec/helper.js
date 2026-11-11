const { transformSync } = require("@babel/core");
const vm = require("node:vm");

const preset = require("../dist/index.js");

const pulsarOptions = {
  // Taken directly from: https://github.com/pulsar-edit/pulsar/blob/master/src/babel.config.js
  keepModules: false,
  notStrictDirectiveTriggers: [ "use babel" ],
  notStrictCommentTriggers: [
    "@babel",
    "@flow",
    "* @babel",
    "* @flow"
  ]
};

function compile(source, options = {}) {
  const result = transformSync(source, {
    babelrc: false,
    configFile: false,
    filename: "fixture.js",
    presets: [[preset, {
      ...pulsarOptions,
      ...options
    }]]
  });

  if (!result?.code) {
    throw new Error("Babel produced no output");
  }

  return result.code;
}

function execute(source, options = {}) {
  const code = compile(source, options);

  const module = { exports: {} };

  const context = {
    module,
    exports: module.exports
  };

  vm.runInNewContext(code, context, {
    filename: "compiled-fixture.js",
    timeout: 1000
  });

  return module.exports;
}

module.exports = {
  compile: compile,
  execute: execute,
};
