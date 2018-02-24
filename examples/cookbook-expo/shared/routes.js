//@flow
import { StackNavigation } from "react-navigation";
import * as examples from "./examples";
import * as tests from "./tests";
import Home from "./Home";
import About from "./About";
import makeDemo from "./makeDemo";

const routes = {
  home: { screen: Home },
  about: { screen: About }
};
let keys;
keys = Object.keys(examples);
keys.map((k, i) => {
  const next = keys.slice(i + 1).find(k => examples[k] && examples[k].Main);
  routes[k] = { screen: makeDemo(examples[k], k, next) };
});
keys = Object.keys(tests);
keys.map((k, i) => {
  const next = keys.slice(i + 1).find(k => tests[k] && tests[k].Main);
  routes[k] = { screen: makeDemo(tests[k], k, next) };
});
export default routes;
