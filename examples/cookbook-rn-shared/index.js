//@flow
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as examples from "./examples";
import * as tests from "./tests";
import Home from "./Home";
import About from "./About";
import makeDemo, { NextButton } from "./makeDemo";

const routes = {};
let keys;
keys = Object.keys(examples);
keys.map((k, i) => {
  const next = keys[i + 1];
  routes[k] = { screen: makeDemo(examples[k], k), next };
});
keys = Object.keys(tests);
keys.map((k, i) => {
  const next = keys[i + 1];
  routes[k] = { screen: makeDemo(tests[k], k), next };
});

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="home"
        headerMode="screen"
        screenOptions={{
          headerTintColor: "#fff",
          headerStyle: { backgroundColor: "#e24" },
        }}
      >
        <Stack.Screen name="home" component={Home} />
        <Stack.Screen name="about" component={About} />
        {Object.keys(routes).map((key) => {
          const { screen, next } = routes[key];
          return (
            <Stack.Screen
              key={key}
              name={key}
              component={screen}
              options={{
                title: key,
                headerRight: () => (next ? <NextButton next={next} /> : null),
                // TODO: also could use renderRight to have bg modes, like in Atom image-viewer // renderRight: (route, props) => ...
              }}
            />
          );
        })}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
