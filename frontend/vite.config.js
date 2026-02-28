import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

// This project contains JSX in many `.js` files.
// Vite/Rollup don't parse JSX in `.js` by default during build, so we transform
// `src/**/*.js` as JSX before import-analysis / Rollup parsing.
function treatJsFilesAsJsx() {
  return {
    name: "treat-js-files-as-jsx",
    async transform(code, id) {
      if (!/src[\\/].*\.js(\?.*)?$/.test(id)) return null;
      return transformWithEsbuild(code, id, {
        loader: "jsx",
        jsx: "automatic",
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [treatJsFilesAsJsx(), react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
});
