import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./index.css";
import App from "./App";

// Add debugging logs
console.log("Starting app initialization");

// Create root with error boundary
const container = document.getElementById("root");
if (!container) {
  console.error("Failed to find root element!");
} else {
  console.log("Root element found, creating React root");
}

const root = createRoot(container!);

// Debugging for render
try {
  console.log("Attempting to render App component");
  // Direct rendering without lazy loading or Suspense
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log("App rendered successfully");
} catch (error) {
  console.error("Error rendering App:", error);
}
