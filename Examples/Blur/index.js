const React = require("react");
const ReactDOM = require("react-dom");
const { Surface } = require("gl-react");
const Blur = require("./Blur");
const Mix = require("./Mix");

function imgurify (slugs) {
  return slugs.split(",").map(id => `http://i.imgur.com/${id}.png`);
}

const styles = {
  canvas: {
    cursor: "move",
    position: "relative"
  },
  dragHelp: {
    position: "absolute",
    left: 10,
    top: 10,
    fontFamily: "Helvetica",
    fontSize: "32px",
    color: "rgba(0, 0, 0, 0.2)",
    zIndex: 2
  },
  toolbar: {
    flexDirection: "row",
    display: "flex"
  },
  tool: {
    flex: 1
  }
};

class Tool extends React.Component {
  render () {
    const { min, max, value, onValueChange, list, selected, onSelect } = this.props;
    return <div style={styles.tool}>
      <div>
        <input type="range"
          style={{ width: "80%", height: "50px" }}
          min={min}
          max={max}
          step={0.01}
          value={value}
          onChange={e => onValueChange(parseFloat(e.target.value))}
        />
      </div>
      <div>
      {list.map((src, i) => {
        return <img key={i}
          src={src}
          onClick={() => onSelect(i)}
          style={{
            height: "80px",
            border: "2px solid",
            borderColor: i===selected ? "#f00" : "transparent"
          }}
        />;
      })}
      </div>
    </div>;
  }
}

const w = 1024, h = 483;

class Demo extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      maxBlur: 2,
      mix: 0.2,
      mixSelected: 0,
      blurMapSelected: 0,
      offset: [0, 0],
      mixMaps: imgurify("T7SeRKx,zwvtoYH,qppttqA"),
      blurMaps: imgurify("SzbbUvX,0PkQEk1,z2CQHpg,k9Eview,wh0On3P")
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.down = null;
  }

  onMouseDown (e) {
    e.preventDefault();
    const { clientX, clientY } = e;
    const { offset } = this.state;
    this.down = {
      clientX,
      clientY,
      offset
    };
  }
  onMouseMove (e) {
    if (!this.down) return;
    e.preventDefault();
    const { clientX, clientY, offset: initialOffset } = this.down;
    const absdelta = [ e.clientX - clientX, e.clientY - clientY ];
    const delta = [ absdelta[0] / w, - absdelta[1] / h ];
    const offset = [ initialOffset[0] - delta[0], initialOffset[1] - delta[1] ];
    this.setState({
      offset
    });
  }
  onMouseUp () {
    this.down = null;
  }
  onMouseLeave () {
    this.down = null;
  }
  render () {
    const { offset, maxBlur, blurMaps, blurMapSelected, mixSelected, mix, mixMaps } = this.state;
    const blurMap = blurMaps[blurMapSelected];
    const mixMap = mixMaps[mixSelected];

    return <div style={{ width: "1024px" }}>

      <div
        style={styles.canvas}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseLeave}>
        { offset[0]===0 && offset[1]===0 && <span style={styles.dragHelp}>Try to drag this area</span>}
        <Surface width={w} height={h}>
          <Mix
            factor={mix}
            map={mixMap}
            color={[ 0, 0, 0 ]}>
            <Blur
              width={w}
              height={h}
              minBlur={0}
              offset={offset}
              maxBlur={maxBlur}
              blurMap={blurMap}>
              http://i.imgur.com/NjbLHx2.jpg
            </Blur>
          </Mix>
        </Surface>
      </div>

      <div style={styles.toolbar}>

        <Tool
          min={0}
          max={3}
          value={maxBlur}
          onValueChange={maxBlur => this.setState({ maxBlur })}
          list={blurMaps}
          selected={blurMapSelected}
          onSelect={blurMapSelected => this.setState({ blurMapSelected })}
        />

        <Tool
          min={0}
          max={1}
          value={mix}
          onValueChange={mix => this.setState({ mix })}
          list={mixMaps}
          selected={mixSelected}
          onSelect={mixSelected => this.setState({ mixSelected })}
        />

      </div>
    </div>;
  }
}

ReactDOM.render(<Demo />, document.getElementById("container"));
