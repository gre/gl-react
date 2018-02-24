//@flow
import React from "react";
import { StackNavigator } from "react-navigation";
import routes from "./routes";

export default StackNavigator(routes, {
  navigationOptions: {
    headerStyle: {
      backgroundColor: "#e24"
    },
    headerTintColor: "#fff"
  }
});
