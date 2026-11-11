import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Built into ../demo so GitHub Pages serves it next to the slides
// (https://<user>.github.io/react-lazy-suspense-delay/demo/).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "../demo",
    emptyOutDir: true,
  },
});
