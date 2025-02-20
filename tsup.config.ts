import { defineConfig } from "tsup"

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/hclcdp-web.ts"],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  watch: true,
  minify: true,
  terserOptions: {
    compress: {
      drop_console: true, // Removes all console.* calls (good for production)
      drop_debugger: true, // Removes all `debugger` statements      dead_code: true, // Eliminates unreachable code
      passes: 2, // Runs multiple compression passes (can further reduce size)
    },
    mangle: {
      toplevel: true, // Mangles top-level variable and function names for better compression
    },
    output: {
      comments: false, // Removes comments (except license comments if required)
    },
    keep_classnames: false, // Optional: Can help if using class-based libraries
    keep_fnames: false, // Optional: Can help if function names are critical
  },
})
