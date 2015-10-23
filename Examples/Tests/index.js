const React = require("react");
const ReactDOM = require("react-dom");
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
const GL = require("gl-react-core");
const { Surface: GLSurface } = require("gl-react");
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
      <GLSurface width={600} height={600} preload onLoad={this.onLoad} onProgress={this.onProgress}>
        <Display2>
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
    </GLSurface>
    <GLSurface width={100} height={200}>
      <Display2 vertical>
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
    </GLSurface>


      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <img src="http://i.imgur.com/mp79p5T.png" width={debugSize} height={debugSize} />
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <GLSurface width={debugSize} height={debugSize} opaque={false}>
            <Copy last>
              http://i.imgur.com/mp79p5T.png
            </Copy>
          </GLSurface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <GLSurface width={debugSize} height={debugSize} opaque={false}>
            <Copy last>
              <Copy>
                http://i.imgur.com/mp79p5T.png
              </Copy>
            </Copy>
          </GLSurface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <GLSurface width={debugSize} height={debugSize} opaque={false}>
            <Copy last>
              <Copy>
                <Copy>
                  http://i.imgur.com/mp79p5T.png
                </Copy>
              </Copy>
            </Copy>
          </GLSurface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <GLSurface width={debugSize} height={debugSize} opaque={false}>
            <Copy last>
              <Copy>
                <Copy>
                  <Copy>
                    http://i.imgur.com/mp79p5T.png
                  </Copy>
                </Copy>
              </Copy>
            </Copy>
          </GLSurface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <GLSurface width={debugSize} height={debugSize} opaque={false}>
            <Copy last>
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
          </GLSurface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <NativeLayer>
            <img src="http://i.imgur.com/mp79p5T.png" width={debugSize} height={debugSize} />
            <GLSurface width={debugSize} height={debugSize} opaque={false}>
              <TransparentNonPremultiplied>
                <HelloGL />
              </TransparentNonPremultiplied>
            </GLSurface>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <NativeLayer>
            <img src="http://i.imgur.com/mp79p5T.png" width={debugSize} height={debugSize} />
            <GLSurface width={debugSize} height={debugSize} opaque={false}>
              <TransparentNonPremultiplied>
                <TransparentNonPremultiplied>
                  <HelloGL />
                </TransparentNonPremultiplied>
              </TransparentNonPremultiplied>
            </GLSurface>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <NativeLayer>
            <img src="http://i.imgur.com/mp79p5T.png" width={debugSize} height={debugSize} />
            <GLSurface width={debugSize} height={debugSize} opaque={false}>
              <TransparentNonPremultiplied>
                <Copy>
                  <TransparentNonPremultiplied>
                    <Copy>
                      http://i.imgur.com/S22HNaU.png
                    </Copy>
                  </TransparentNonPremultiplied>
                </Copy>
              </TransparentNonPremultiplied>
            </GLSurface>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <GLSurface width={debugSize} height={debugSize} opaque={false}>
            <Layer>
              http://i.imgur.com/mp79p5T.png
              <TransparentNonPremultiplied>
                <HelloGL />
              </TransparentNonPremultiplied>
            </Layer>
          </GLSurface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <img src="http://i.imgur.com/S22HNaU.png" width={debugSize} height={debugSize} />
          <GLSurface width={debugSize} height={debugSize} opaque={false}>
            <Layer>
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
          </GLSurface>
        </NativeLayer>

      </div>
    </div>;
  }
}

ReactDOM.render(<Demo />, document.getElementById("container"));
