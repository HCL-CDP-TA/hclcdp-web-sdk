import { defineConfig } from "tsup"

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/hclcdp-web.ts"],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  watch: true,
})
