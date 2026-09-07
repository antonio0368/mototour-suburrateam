import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/ors-api": {
        target:
          "https://api.openrouteservice.org",

        changeOrigin: true,

        secure: true,

        rewrite: (percorso) =>
          percorso.replace(
            /^\/ors-api/,
            ""
          ),
      },
    },
  },
});