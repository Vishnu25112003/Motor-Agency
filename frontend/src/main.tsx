// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (import.meta.env.DEV) {
  import("./lib/api")
    .then((mod) => {
      // @ts-ignore - dev-only helper
      window.__apiClient__ = mod.apiClient;
    })
    .catch((e) => {
      // Failed to expose apiClient
    });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
