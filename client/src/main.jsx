import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { MapProvider } from "./context/AppContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MapProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MapProvider>
  </StrictMode>
);
