const React = require("react");
const Blur = require("./Blur");
const Mix = require("./Mix");

class Demo extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      blurMapSelected: 0,
      maxBlur: 2,
      mix: 0.2,
      mixMap: "http://i.imgur.com/T7SeRKx.png",
      blurMaps:
      "SzbbUvX,0PkQEk1,z2CQHpg,k9Eview,wh0On3P"
      .split(",").map(id => `http://i.imgur.com/${id}.png`)
    };
  }
  render () {
    const { maxBlur, blurMaps, blurMapSelected, mix, mixMap } = this.state;
    const blurMap = blurMaps[blurMapSelected];

    const w = 1024, h = 483;

    return <div style={{ width: "1024px" }}>

      <Mix width={w} height={h} factor={mix} map={mixMap} color={[ 0, 0, 0 ]}>
        <Blur
          width={w}
          height={h}
          minBlur={0}
          maxBlur={maxBlur}
          blurMap={blurMap}>
          http://i.imgur.com/NjbLHx2.jpg
        </Blur>
      </Mix>

      <div>
        <input type="range"
          style={{ width: "420px", height: "50px" }}
          min={0}
          max={4}
          step={0.01}
          value={maxBlur}
          onChange={e => this.setState({ maxBlur: parseFloat(e.target.value) })}
        />
      </div>
      <div>
      {blurMaps.map((src, i) => {
        return <img key={i}
          src={src}
          onClick={() => this.setState({ blurMapSelected: i })}
          style={{
            width: "100px",
            border: "3px solid",
            borderColor: i===blurMapSelected ? "#f00" : "transparent"
          }}
        />;
      })}
      </div>
      <div>
        <input type="range"
          style={{ width: "420px", height: "50px" }}
          min={0}
          max={1}
          step={0.01}
          value={mix}
          onChange={e => this.setState({ mix: parseFloat(e.target.value) })}
        />
      </div>
      <div>
        <img src={mixMap} style={{ height: "100px", border: "1px solid #f00" }} />
      </div>
    </div>;
  }
}

React.render(<Demo />, document.getElementById("container"));
