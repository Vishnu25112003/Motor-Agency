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
      // eslint-disable-next-line no-console
      console.debug('[main] __apiClient__ exposed on window for debugging (dev only)');
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.warn('[main] failed to expose apiClient', e);
    });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
