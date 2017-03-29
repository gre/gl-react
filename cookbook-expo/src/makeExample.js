//@flow
import React, {Component} from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { withNavigation } from "@expo/ex-navigation";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center"
  },
  header: {
  },
  description: {
    padding: 10,
  },
  rendering: {
    alignSelf: "center",
    // FIXME might do the background color for showing opacity.
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
  }
});

@withNavigation
class NextButton extends Component {
  props: {
    navigator: *,
    next: string,
  };
  goToNext = () => {
    this.props.navigator.replace(this.props.next);
  };
  render() {
    return (
      <TouchableOpacity style={styles.btn} onPress={this.goToNext}>
        <Text style={styles.btnText}>NEXT</Text>
      </TouchableOpacity>
    );
  }
}

export default ({
  Example,
  title,
  description,
  toolbox,
  ToolboxFooter,
  overrideStyles = {},
}, id, nextId) => class extends React.Component {
  static displayName = id;
  static route = {
    navigationBar: {
      title: id,
      renderRight: () =>
        nextId
        ? <NextButton next={nextId} />
        : null,
      // TODO: also could use renderRight to have bg modes, like in Atom image-viewer // renderRight: (route, props) => ...
    },
  };
  state = {
    ...Example.defaultProps,
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
    return (
      <ScrollView bounces={false} style={styles.root} contentContainerStyle={styles.container} onLayout={this.onLayout}>
        <View style={styles.header}>
          { description ?
            <Text style={styles.description}>
              {description}
            </Text>
            : null }
        </View>
        <View style={styles.rendering}>
          { props.width && props.height ?
            <Example {...props} />
            : null }
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
