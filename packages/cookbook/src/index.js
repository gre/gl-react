import "./index.css";
import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";
import App from "./App";

if (process.env.NODE_ENV !== "production") {
  document.write('<script src="http://localhost:8097"></script>'); // Nuclide React Inspector
}

render(
  <BrowserRouter>
    <Route component={App} />
  </BrowserRouter>,
  document.getElementById("root")
);
