import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IndexPage } from "./pages";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
