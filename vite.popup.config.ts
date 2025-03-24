import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    copyPublicDir: false,
    rollupOptions: {
      input: "./src/popup.tsx",
      output: {
        entryFileNames: "[name].js",
        format: "es",
        assetFileNames: "[name].css",
      },
    },
    cssCodeSplit: true,
  },
});
