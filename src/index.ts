import type { ConfigAPI, PluginItem, TransformOptions } from "@babel/core"

let keepModulesEnv = false // false by default

if (process.env.BABEL_KEEP_MODULES === "true") {
  keepModulesEnv = true
}

export type Options = {
  targets?: typeof import("babel__preset-env")
  keepModules?: boolean
  addModuleExports?: boolean
  addModuleExportsDefaultProperty?: boolean
  react?: boolean | Record<string, any>
  flow?: boolean | Record<string, any>
  typescript?: boolean | Record<string, any>
  removeAllUseStrict?: boolean
  notStrictDirectiveTriggers?: string[]
  notStrictCommentTriggers?: string[]
}

function handleOptions(options: Options) {
  let {
    targets,
    keepModules,
    addModuleExports,
    addModuleExportsDefaultProperty,
    react,
    flow,
    typescript,
    removeAllUseStrict,
    notStrictDirectiveTriggers,
    notStrictCommentTriggers,
  } = options

  // use Electron 11 targets by default
  if (targets === undefined) {
    targets = {
      electron: 11,
    }
  }

  // if not provided in the options, use the environment variable
  if (keepModules === undefined) {
    keepModules = keepModulesEnv
  }

  // add module exports by default
  if (addModuleExports === undefined) {
    addModuleExports = true
  }

  // do not add default property by default
  if (addModuleExportsDefaultProperty === undefined) {
    addModuleExportsDefaultProperty = false
  }

  if (react === undefined) {
    react = true
  }

  if (flow === undefined) {
    flow = true
  }

  if (typescript === undefined) {
    typescript = true
  }

  if (removeAllUseStrict === undefined) {
    removeAllUseStrict = false
  }
  if (notStrictDirectiveTriggers === undefined) {
    notStrictDirectiveTriggers = ["use babel"]
  }
  if (notStrictCommentTriggers === undefined) {
    notStrictCommentTriggers = ["@babel", "@flow", "* @babel", "* @flow"]
  }

  return {
    targets,
    keepModules,
    addModuleExports,
    addModuleExportsDefaultProperty,
    react,
    flow,
    typescript,
    removeAllUseStrict,
    notStrictDirectiveTriggers,
    notStrictCommentTriggers,
  }
}

// eslint-disable-next-line no-unused-vars
module.exports = (_api: ConfigAPI, options: Options, _dirname: string): TransformOptions => {
  const {
    targets,
    keepModules,
    addModuleExports,
    addModuleExportsDefaultProperty,
    react,
    flow,
    typescript,
    removeAllUseStrict,
    notStrictDirectiveTriggers,
    notStrictCommentTriggers,
  } = handleOptions(options)

  const presets = [
    [
      require("@babel/preset-env") as typeof import("babel__preset-env"),
      {
        targets,
        modules: keepModules ? false : "commonjs",
      },
    ],
  ] as PluginItem[]

  if (react !== false) {
    const presetReact = require("@babel/preset-react")
    presets.push(typeof react === "object" ? [presetReact, react] : presetReact)
  }

  if (flow !== false) {
    const presetFlow = require("@babel/preset-flow")
    presets.push(typeof flow === "object" ? [presetFlow, flow] : presetFlow)
  }

  if (typescript !== false) {
    const presetTypeScript = require("@babel/preset-typescript")
    presets.push(typeof typescript === "object" ? [presetTypeScript, typescript] : presetTypeScript)
  }

  const plugins = [
    require("@babel/plugin-proposal-function-bind"),

    require("@babel/plugin-proposal-export-default-from"),
    [require("@babel/plugin-proposal-pipeline-operator"), { proposal: "minimal" }],
    require("@babel/plugin-proposal-do-expressions"),

    [require("@babel/plugin-proposal-decorators"), { legacy: true }],
    require("@babel/plugin-proposal-function-sent"),
    require("@babel/plugin-proposal-export-namespace-from"),
    require("@babel/plugin-proposal-numeric-separator"),
    require("@babel/plugin-proposal-throw-expressions"),

    require("@babel/plugin-syntax-import-meta"),
    [require("@babel/plugin-proposal-class-properties"), { loose: true }],
    [require("@babel/plugin-proposal-private-methods"), { loose: true }],
    [require("@babel/plugin-proposal-private-property-in-object"), { loose: true }], // #38
    require("@babel/plugin-proposal-json-strings"),

    // compile time code generation
    require("babel-plugin-codegen"),
    require("babel-plugin-preval"),

    // not strict
    [
      require("babel-plugin-transform-not-strict"),
      {
        removeAll: removeAllUseStrict,
        directiveTriggers: notStrictDirectiveTriggers,
        commentTriggers: notStrictCommentTriggers,
      },
    ],

    // reserved keywords
    require("@babel/plugin-transform-reserved-words"),
  ] as PluginItem[]

  // transform modules (e.g when without Rollup)
  if (!keepModules) {
    plugins.push(
      ...[require("@babel/plugin-transform-modules-commonjs"), require("@babel/plugin-syntax-dynamic-import")]
    )

    if (addModuleExports) {
      plugins.push(
        ...[
          [require("babel-plugin-add-module-exports"), { addDefaultProperty: addModuleExportsDefaultProperty }], // atom needs this
        ]
      )
    }
  }

  return {
    presets,
    plugins,
  }
}
