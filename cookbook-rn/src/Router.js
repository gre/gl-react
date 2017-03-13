//@flow
import {
  createRouter,
} from "@exponent/ex-navigation";
import * as examples from "./examples";
import Home from "./Home";
import About from "./About";
import makeExample from "./makeExample";
export default createRouter(() => {
  const routes = {
    home: () => Home,
    about: () => About,
  };
  const keys = Object.keys(examples);
  keys.map((k, i) => {
    const next = keys.slice(i+1).find(k => examples[k] && examples[k].Example);
    routes[k] = () => makeExample(examples[k], k, next);
  });
  return routes;
});
