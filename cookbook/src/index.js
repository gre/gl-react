import "./index.css";
import React from "react";
import {render} from "react-dom";
import { Router, Route, IndexRoute, browserHistory } from "react-router";
import App from "./App";
import ExamplePage from "./ExamplePage";
import * as examples from "./examples";
import Docs, {DocToc} from "./Docs";
import Dashboard from "./Dashboard";

if (process.env.NODE_ENV!=="production") {
  window.Perf = require("react-addons-perf");
  document.write('<script src="http://localhost:8097"></script>'); // Nuclide React Inspector
}

render(
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute
        component={Dashboard}
      />
    {Object.keys(examples).map(key =>
      <Route
        {...examples[key]}
        path={key}
        key={key}
        component={ExamplePage}
        isExample
      />)}
      <Route
        path="api"
        component={Docs}
        LeftSidebar={DocToc}
      />
    </Route>
  </Router>,
  document.getElementById("root")
);
