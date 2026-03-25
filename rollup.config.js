/**
 * budibase-plugin-voice-transcription
 * Auteur : MEMORA solutions, https://memora.solutions ; info@memora.ca
 * Licence : MIT
 */
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import svelte from "rollup-plugin-svelte"
import { terser } from "rollup-plugin-terser"
import postcss from "rollup-plugin-postcss"
import json from "rollup-plugin-json"
import copy from "rollup-plugin-copy2"
import tar from "tar"
import fs from "fs"
import pkg from "./package.json"
import crypto from "crypto"

const ignoredWarnings = [
  "unused-export-let",
  "css-unused-selector",
  "module-script-reactive-declaration",
  "a11y-no-onchange",
]

const clean = () => ({
  buildStart() {
    const dist = "./dist/"
    if (fs.existsSync(dist)) {
      fs.readdirSync(dist).forEach(path => {
        if (path.endsWith(".tar.gz")) {
          fs.unlinkSync(dist + path)
        }
      })
    }
  },
})

const hash = () => ({
  writeBundle() {
    const fileBuffer = fs.readFileSync("dist/plugin.min.js")
    const hashSum = crypto.createHash("sha1")
    hashSum.update(fileBuffer)
    const hex = hashSum.digest("hex")
    const schema = JSON.parse(fs.readFileSync("./dist/schema.json", "utf8"))
    const newSchema = { ...schema, hash: hex, version: pkg.version }
    fs.writeFileSync("./dist/schema.json", JSON.stringify(newSchema, null, 2))
  },
})

const bundle = () => ({
  async writeBundle() {
    const bundleName = `${pkg.name}-${pkg.version}.tar.gz`
    return tar
      .c({ gzip: true, cwd: "dist" }, ["plugin.min.js", "schema.json", "package.json"])
      .pipe(fs.createWriteStream(`dist/${bundleName}`))
  },
})

export default {
  input: "index.js",
  output: {
    sourcemap: false,
    format: "iife",
    file: "dist/plugin.min.js",
    name: "plugin",
    globals: {
      svelte: "svelte",
      "svelte/internal": "svelte_internal",
    },
  },
  external: ["svelte", "svelte/internal"],
  plugins: [
    clean(),
    svelte({
      emitCss: true,
      onwarn: (warning, handler) => {
        if (!ignoredWarnings.includes(warning.code)) {
          handler(warning)
        }
      },
    }),
    postcss(),
    commonjs(),
    resolve({
      preferBuiltins: true,
      browser: true,
      skip: ["svelte", "svelte/internal"],
    }),
    json(),
    terser(),
    copy({
      assets: ["schema.json", "package.json"],
    }),
    hash(),
    bundle(),
  ],
}
