//@flow
import {
  createRouter,
} from "@exponent/ex-navigation";
import * as examples from "./examples";
import Home from "./Home";
import makeExample from "./makeExample";
export default createRouter(() => {
  const routes = {
    home: () => Home,
  };
  const keys = Object.keys(examples);
  keys.map((k, i) => {
    routes[k] = () => makeExample(examples[k], k, keys[i+1]);
  });
  return routes;
});
