const React = require("react");

class NativeLayer extends React.Component {
  render () {
    const { width, height, children, ...rest } = this.props;
    return <div style={{ width, height, position: "relative" }}>
      {React.Children.map(children, child =>
        <div style={{ width, height, position: "absolute", top: 0, left: 0, backgroundColor: "transparent" }}>
          {child}
        </div>
      )}
    </div>;
  }
}

module.exports = NativeLayer;
