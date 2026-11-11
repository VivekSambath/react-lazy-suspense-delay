import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// StrictMode is left off on purpose: it renders twice in development,
// which would blur the timings these samples are meant to show.
createRoot(document.getElementById("root")).render(<App />);
