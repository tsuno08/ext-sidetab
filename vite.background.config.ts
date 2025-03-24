import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    copyPublicDir: false,
    rollupOptions: {
      input: "./src/background.ts",
      output: {
        entryFileNames: "[name].js",
        format: "es",
      },
    },
  },
});
