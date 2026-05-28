import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    exclude: ["**/.codex/**", "**/node_modules/**"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
})
