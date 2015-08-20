const React = require("react");

class Slider extends React.Component {
  render () {
    const { minimumValue, maximumValue, value, onValueChange } = this.props;
    return <input
      type="range"
      min={minimumValue}
      max={maximumValue}
      step={(maximumValue-minimumValue)/1000}
      defautValue={value}
      onChange={e => onValueChange(parseFloat(e.target.value))}
    />;
  }
}
Slider.defaultProps = {
  minimumValue: 0,
  maximumValue: 1,
  value: 0
};

module.exports = Slider;
