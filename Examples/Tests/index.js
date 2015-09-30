const React = require("react");
const Blur = require("./Blur");
const Add = require("./Add");
const Multiply = require("./Multiply");
const Layer = require("./Layer");
const NativeLayer = require("./NativeLayer");
const HelloGL = require("./HelloGL");
const Display2 = require("./Display2");
const Copy = require("./Copy");
const TransparentNonPremultiplied = require("./TransparentNonPremultiplied");
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
    const debugSize = 200;

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
      <Display2 width={600} height={600} preload onLoad={this.onLoad} onProgress={this.onProgress}>
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


      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <img src="http://i.imgur.com/mp79p5T.png" width={debugSize} height={debugSize} />
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <Copy width={debugSize} height={debugSize} opaque={false} last>
            http://i.imgur.com/mp79p5T.png
          </Copy>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <Copy width={debugSize} height={debugSize} opaque={false} last>
            <Copy>
              http://i.imgur.com/mp79p5T.png
            </Copy>
          </Copy>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <Copy width={debugSize} height={debugSize} opaque={false} last>
            <Copy>
              <Copy>
                http://i.imgur.com/mp79p5T.png
              </Copy>
            </Copy>
          </Copy>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <Copy width={debugSize} height={debugSize} opaque={false} last>
            <Copy>
              <Copy>
                <Copy>
                  http://i.imgur.com/mp79p5T.png
                </Copy>
              </Copy>
            </Copy>
          </Copy>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <Copy width={debugSize} height={debugSize} opaque={false} last>
            <Copy>
              <Copy>
                <Copy>
                  <Copy>
                    http://i.imgur.com/mp79p5T.png
                  </Copy>
                </Copy>
              </Copy>
            </Copy>
          </Copy>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <NativeLayer>
            <img src="http://i.imgur.com/mp79p5T.png" width={debugSize} height={debugSize} />
            <TransparentNonPremultiplied width={debugSize} height={debugSize}>
              <HelloGL />
            </TransparentNonPremultiplied>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <NativeLayer>
            <img src="http://i.imgur.com/mp79p5T.png" width={debugSize} height={debugSize} />
            <TransparentNonPremultiplied width={debugSize} height={debugSize}>
              <TransparentNonPremultiplied>
                <HelloGL />
              </TransparentNonPremultiplied>
            </TransparentNonPremultiplied>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <NativeLayer>
            <img src="http://i.imgur.com/mp79p5T.png" width={debugSize} height={debugSize} />
            <TransparentNonPremultiplied width={debugSize} height={debugSize}>
              <Copy>
                <TransparentNonPremultiplied>
                  <Copy>
                    http://i.imgur.com/S22HNaU.png
                  </Copy>
                </TransparentNonPremultiplied>
              </Copy>
            </TransparentNonPremultiplied>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <Layer width={debugSize} height={debugSize} opaque={false}>
            http://i.imgur.com/mp79p5T.png
            <TransparentNonPremultiplied>
              <HelloGL />
            </TransparentNonPremultiplied>
          </Layer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <Layer width={debugSize} height={debugSize} opaque={false}>
            http://i.imgur.com/mp79p5T.png
            <TransparentNonPremultiplied>
              <Copy>
                <TransparentNonPremultiplied>
                  <Copy>
                    http://i.imgur.com/S22HNaU.png
                  </Copy>
                </TransparentNonPremultiplied>
              </Copy>
            </TransparentNonPremultiplied>
          </Layer>
        </NativeLayer>

      </div>
    </div>;
  }
}

React.render(<Demo />, document.getElementById("container"));
