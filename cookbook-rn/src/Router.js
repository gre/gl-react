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
  Object.keys(examples).map(k => {
    routes[k] = () => makeExample(examples[k], k);
  });
  return routes;
});
