//@flow
import { createRouter } from "@expo/ex-navigation";
import * as examples from "./examples";
import * as tests from "./tests";
import Home from "./Home";
import About from "./About";
import makeDemo from "./makeDemo";
export default createRouter(() => {
  const routes = {
    home: () => Home,
    about: () => About,
  };
  let keys;
  keys = Object.keys(examples);
  keys.map((k, i) => {
    const next = keys.slice(i + 1).find(k => examples[k] && examples[k].Main);
    routes[k] = () => makeDemo(examples[k], k, next);
  });
  keys = Object.keys(tests);
  keys.map((k, i) => {
    const next = keys.slice(i + 1).find(k => tests[k] && tests[k].Main);
    routes[k] = () => makeDemo(tests[k], k, next);
  });
  return routes;
});
