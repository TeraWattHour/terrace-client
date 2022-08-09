import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import "./styles/icons/style/all.css";

import { borzoiConfig } from "borzoi";
import { API } from "./consts/api";
import App from ".";

borzoiConfig({
  baseUrl: API,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
