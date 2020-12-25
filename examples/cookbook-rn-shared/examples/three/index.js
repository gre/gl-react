//@flow
import React, { Component } from "react";
import PropTypes from "prop-types";
import respondToTouchPosition from "../../HOC/respondToTouchPosition";
import makeDemo from "../../HOC/makeDemo";
import demo from "./demo";

const Demo = respondToTouchPosition(makeDemo(demo));

export default class Example extends Component {
  render() {
    const { width } = this.props;
    return <Demo style={{ width, height: width }} {...this.props} />;
  }
  static defaultProps = { fov: 50 };
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    fov: PropTypes.number.isRequired,
  };
}
