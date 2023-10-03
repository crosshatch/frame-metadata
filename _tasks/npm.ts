import { build } from "../deps/dnt.ts"
import * as flags from "../deps/std/flags.ts"
import * as fs from "../deps/std/fs.ts"
import * as path from "../deps/std/path.ts"

const { version } = flags.parse(Deno.args, {
  string: ["version"],
  default: {
    version: "v0.0.0-local",
  },
})

const outDir = path.join(Deno.cwd(), "target/npm")
await fs.emptyDir(outDir)
await build({
  package: {
    name: "frame-metadata",
    version,
    description: "FRAME metadata shapes and utilities",
    license: "Apache-2.0",
    repository: "github:crosshatch/frame-metadata",
    dependencies: {},
    private: false,
  },
  compilerOptions: {
    importHelpers: true,
    sourceMap: true,
    target: "ES2022",
  },
  entryPoints: [
    {
      name: ".",
      path: "mod.ts",
    },
    {
      name: "frame_metadata",
      path: "frame_metadata/mod.ts",
    },
    {
      name: "scale_info",
      path: "scale_info/mod.ts",
    },
  ],
  mappings: {
    "https://deno.land/x/wat_the_crypto@v0.0.3/mod.ts": {
      name: "wat-the-crypto",
      version: "0.0.3",
    },
    "https://deno.land/x/subshape@v0.14.1/mod.ts#=": {
      name: "subshape",
      version: "0.14.0", // TODO: publish latest to NPM?
    },
  },
  outDir,
  shims: {},
  test: false,
  typeCheck: false,
  declaration: "separate",
  scriptModule: false,
})
