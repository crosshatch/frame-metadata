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
    description: "FRAME Metadata Codecs and Utilities for TypeScript",
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
    "https://deno.land/x/scale@v0.13.0/mod.ts#=": {
      name: "scale-codec",
      version: "0.13.0",
    },
  },
  outDir,
  shims: {},
  test: false,
  typeCheck: false,
  declaration: "separate",
  scriptModule: false,
})
