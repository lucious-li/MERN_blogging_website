import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pluginRewriteAll from "vite-plugin-rewrite-all";
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist', 
  },
  plugins: [react(), pluginRewriteAll()],
});

