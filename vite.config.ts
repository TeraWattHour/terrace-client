import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default ({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return defineConfig({
    plugins: [react()],
    server: {
      port: process.env.PORT || 3000,
    },
    preview: {
      port: process.env.PORT || 3000,
    },
    resolve: {
      alias: {
        "@/": path.resolve(__dirname, "./src"),
      },
    },
  });
};
