//@flow
import React, { Component } from "react";
import { PanResponder, View } from "react-native";
import hoistNonReactStatics from "hoist-non-react-statics";

type Pos = { x: number, y: number };
type State = { touching: boolean, touchPosition: Pos };

export default (
  Comp: ReactClass<*>,
  { initialPosition = { x: 0.5, y: 0.5 } }: { initialPosition: Pos } = {}
) => {
  class TouchPositionResponding extends Component {
    state: State = {
      touching: false,
      touchPosition: initialPosition,
    };
    initialContainerPos: [number, number];
    initialDragPos: [number, number];
    size: [number, number];
    panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        this.initialDragPos = [pageX, pageY];
        this.refs.root.measure((x, y, w, h, initialPageX, initialPageY) => {
          this.initialContainerPos = [initialPageX, initialPageY];
          this.size = [w, h];
          this.setState({
            touching: true,
            touchPosition: {
              x: (pageX - initialPageX) / w,
              y: 1 - (pageY - initialPageY) / h,
            },
          });
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!this.size) return;
        const [pageX, pageY] = this.initialDragPos;
        const [initialPageX, initialPageY] = this.initialContainerPos;
        const { dx, dy } = gestureState;
        const [w, h] = this.size;
        this.setState({
          touchPosition: {
            x: (pageX + dx - initialPageX) / w,
            y: 1 - (pageY + dy - initialPageY) / h,
          },
        });
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: () => this._onEnd(),
      onPanResponderTerminate: () => this._onEnd(),
      onShouldBlockNativeResponder: () => true,
    });
    _onEnd = () => {
      if (this.state.touching) {
        this.setState({
          touching: false,
        });
      }
    };
    render() {
      return (
        <View ref="root" collapsable={false} {...this.panResponder.panHandlers}>
          <Comp {...this.props} {...this.state} />
        </View>
      );
    }
  }

  hoistNonReactStatics(TouchPositionResponding, Comp);

  return TouchPositionResponding;
};
