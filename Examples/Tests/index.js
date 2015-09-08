const React = require("react");
const Blur = require("./Blur");
const Add = require("./Add");
const Multiply = require("./Multiply");
const Layer = require("./Layer");
const HelloGL = require("./HelloGL");
const Display2 = require("./Display2");
const { Surface, Text } = require("react-canvas");
const GL = require("gl-react");

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

    return <Display2 width={600} height={600} vertical>
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
    </Display2>;


  }
}

React.render(<Demo />, document.getElementById("container"));
