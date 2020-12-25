//@flow
import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexDirection: "column",
    justifyContent: "center",
  },
  rendering: {
    alignSelf: "center",
  },
  toolbox: {
    flexDirection: "column",
  },
  toolboxTitle: {
    padding: 0,
    marginVertical: 4,
  },
  field: {
    flexDirection: "column",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  fieldValue: {
    flexDirection: "row",
  },
  btn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 12,
  },
});

export function NextButton({ next }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => navigation.replace(next)}
    >
      <Text style={styles.btnText}>NEXT</Text>
    </TouchableOpacity>
  );
}

export default (
  { Main, title, toolbox, noScrollView, ToolboxFooter, overrideStyles = {} },
  id
) =>
  class extends React.Component {
    static displayName = id;
    state = {
      ...Main.defaultProps,
      width: 0,
      height: 0,
    };
    onLayout = (e) => {
      const { width, height } = e.nativeEvent.layout;
      if (this.state.width !== width || this.state.height !== height) {
        this.setState({
          width,
          height,
        });
      }
    };
    render() {
      const { state } = this;
      const props = {
        setToolState: this.setState,
        ...state,
      };
      const { width, height } = props;
      const renderingEl = (
        <View style={styles.rendering}>
          {width && height ? <Main {...props} /> : null}
        </View>
      );
      const toolboxEl = (
        <View style={[styles.toolbox, overrideStyles.toolbox]}>
          {ToolboxFooter ? <ToolboxFooter {...props} /> : null}
          {(toolbox || []).map((field, i) => (
            <View key={i} style={[styles.field, overrideStyles.field]}>
              {field.title ? (
                <Text style={styles.toolboxTitle}>
                  {typeof field.title === "function"
                    ? field.title(props[field.prop])
                    : field.title}
                </Text>
              ) : null}
              <View
                key={i}
                style={[styles.fieldValue, overrideStyles.fieldValue]}
              >
                {field.Editor ? (
                  <field.Editor
                    {...field}
                    value={props[field.prop]}
                    onChange={(value) => {
                      this.setState({
                        [field.prop]: value,
                      });
                    }}
                  />
                ) : null}
              </View>
            </View>
          ))}
        </View>
      );

      if (noScrollView) {
        return (
          <View
            onLayout={this.onLayout}
            style={[styles.root, styles.container]}
          >
            {renderingEl}
            {toolboxEl}
          </View>
        );
      }

      return (
        <ScrollView
          bounces={false}
          style={styles.root}
          contentContainerStyle={styles.container}
          onLayout={this.onLayout}
        >
          {renderingEl}
          {toolboxEl}
        </ScrollView>
      );
    }
  };
