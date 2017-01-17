//@flow
import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
} from "react-native";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
  },
  header: {

  },
  description: {

  },
  rendering: {
    alignSelf: "center",
    // FIXME might do the background color for showing opacity.
  },
  toolbox: {
    paddingBottom: 10,
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
});

export default ({
  Example,
  title,
  description,
  toolbox,
  ToolboxFooter,
  overrideStyles = {},
}, id) => class extends React.Component {
  static displayName = id;
  static route = {
    navigationBar: {
      title,
      // TODO: use renderRight to have bg modes, like in Atom image-viewer // renderRight: (route, props) => ...
    },
  };
  state = {
    ...Example.defaultProps,
  };
  render() {
    const { state } = this;
    const props = {
      setToolState: this.setState,
      ...state,
    };
    return (
      <ScrollView bounces={false} style={styles.root} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          { description ?
            <Text style={styles.description}>
              {description}
            </Text>
            : null }
        </View>
        <View style={styles.rendering}>
          <Example {...props} />
        </View>
        <View style={[ styles.toolbox, overrideStyles.toolbox ]}>
          { ToolboxFooter
            ? <ToolboxFooter {...props} />
            : null }
          {(toolbox || []).map((field, i) =>
            <View key={i} style={[ styles.field, overrideStyles.field ]}>
            { field.title
              ? <Text style={styles.toolboxTitle}>{
                typeof field.title==="function"
                ? field.title(props[field.prop])
                : field.title
              }</Text>
              : null }
            <View key={i} style={[ styles.fieldValue, overrideStyles.fieldValue ]}>
            { field.Editor
              ? <field.Editor
                  {...field}
                  value={props[field.prop]}
                  onChange={value => {
                    this.setState({
                      [field.prop]: value
                    });
                  }}
                />
              : null }
              </View>
            </View>)}
          </View>
      </ScrollView>
    );
  }
};
