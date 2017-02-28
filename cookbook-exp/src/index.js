//@flow
import React from "react";
import {
  NavigationProvider,
  StackNavigation,
} from "@exponent/ex-navigation";
import Router from "./Router";

export default class App extends React.Component {
  render() {
    return (
      <NavigationProvider router={Router}>
        <StackNavigation
          initialRoute={Router.getRoute("home")}
          defaultRouteConfig={{
            navigationBar: {
              backgroundColor: "#e24",
              tintColor: "#fff",
            },
          }}
        />
      </NavigationProvider>
    );
  }
}
