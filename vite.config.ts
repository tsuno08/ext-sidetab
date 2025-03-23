import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        content: "./src/content.tsx",
        background: "./src/background.ts",
      },
      output: {
        entryFileNames: "[name].js",
        format: "es",
        assetFileNames: "[name].css",
      },
    },
    cssCodeSplit: false,
  },
});
