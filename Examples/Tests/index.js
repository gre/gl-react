const React = require("react");
const Blur = require("./Blur");
const Add = require("./Add");
const Multiply = require("./Multiply");
const Layer = require("./Layer");
const HelloGL = require("./HelloGL");
const Display2 = require("./Display2");
const { Surface, Text } = require("react-canvas");
const GL = require("gl-react");
const ndarray = require("ndarray");

/* eslint-disable no-console */

GL.Shaders.list().map(id => {
  console.log(`Shader '${GL.Shaders.getName(id)}' -> ${id}`);
});

class Demo extends React.Component {
  constructor (props) {
    super(props);
    window.addEventListener("click", e => {
      e.preventDefault();
      this.forceUpdate();
      console.log("update");
    });
    this.onLoad = this.onLoad.bind(this);
    this.onProgress = this.onProgress.bind(this);
  }
  onLoad () {
    console.log("LOADED");
  }
  onProgress (p) {
    console.log("PROGRESS", p);
  }
  render() {
    const helloGL =
      <HelloGL width={64} height={64} />;

    const txt =
      <Surface width={800} height={800} top={0} left={0}>
        {[0,1,2,3].map(i => <Text style={{
          top: 40+200*i,
          left: 0,
          width: 800,
          height: 200,
          textAlign: "center",
          color: ["#f00", "#0f0", "#00f", "#fff"][i],
          fontSize: 80
        }}>
          Hello World {i}
        </Text>)}
      </Surface>;

    const img =
      "http://i.imgur.com/zJIxPEo.jpg";

    const blurredImage =
      <Blur factor={4} passes={6} width={200} height={200}>
        {img}
      </Blur>;

    const blurredImageOverText =
      <Layer>
        {blurredImage}
        {txt}
      </Layer>;

    return <div>
      <Display2 width={600} height={600} vertical preload onLoad={this.onLoad} onProgress={this.onProgress}>
        <Display2 width={600} height={300}>
        <Add width={300} height={300}>
          {txt}
          {helloGL}
        </Add>
        <Display2 width={300} height={300} vertical>
          <Blur factor={1} passes={4} width={300} height={150}>
            <Multiply>
              {blurredImageOverText}
              {helloGL}
            </Multiply>
          </Blur>
          {blurredImage}
        </Display2>
      </Display2>
      {txt}
    </Display2>
    <Display2 width={100} height={200} vertical>
      <Display2 width={100} height={100} vertical>
      {ndarray(new Float64Array([
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1
      ]), [3, 1, 4])}
      {{
        opts: {
          disableLinearInterpolation: true
        },
        value: ndarray(new Float64Array([
          1, 0, 0, 1,
          0, 1, 0, 1,
          0, 0, 1, 1
        ]), [3, 1, 4])
      }}
    </Display2>
      {require("baboon-image")}
    </Display2>
    </div>;
  }
}

React.render(<Demo />, document.getElementById("container"));
